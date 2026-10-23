import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase.js'
import { STAFF_ACCOUNTS, DEMO_VENDORS } from './accounts.js'

// Staff roles (Admin, Sales Manager, Technician): fixed accounts from src/lib/accounts.js
// Vendor: the only role that can sign up. Uses Supabase Auth and must be approved by an Admin.
const PERMS = {
  Admin: { analytics: true, addLead: true, editLead: true, assignTech: true, deleteLead: true, exportCsv: true, dragDrop: true, seeAll: true, manageVendors: true },
  'Sales Manager': { analytics: true, addLead: true, editLead: true, assignTech: true, deleteLead: false, exportCsv: true, dragDrop: true, seeAll: true, manageVendors: false },
  Technician: { analytics: false, addLead: false, editLead: true, assignTech: false, deleteLead: false, exportCsv: false, dragDrop: true, seeAll: false, manageVendors: false },
  Vendor: { analytics: false, addLead: true, editLead: true, assignTech: false, deleteLead: false, exportCsv: true, dragDrop: true, seeAll: false, manageVendors: false },
}
const KEY = 'arkawelle_session'
const NETWORK_ERR = 'Could not reach the server. Check your connection and .env keys.'
const AuthContext = createContext(null)
const norm = (e) => (e || '').trim().toLowerCase()

const fromStaff = (a) => ({ id: a.email, email: norm(a.email), name: a.name, role: a.role, company: a.assignedTo || null, status: 'Approved', source: 'staff' })
const fromDemoVendor = (v) => ({ id: v.email, email: norm(v.email), name: v.name, role: 'Vendor', company: v.company, city: v.city, phone: v.phone, gst: v.gst, status: 'Approved', source: 'demo' })

function loadLocalUser() {
  try {
    const saved = norm(localStorage.getItem(KEY))
    const account = STAFF_ACCOUNTS.find((x) => norm(x.email) === saved)
    const vendor = DEMO_VENDORS.find((x) => norm(x.email) === saved)
    return account ? fromStaff(account) : vendor ? fromDemoVendor(vendor) : null
  } catch {
    return null
  }
}

async function buildVendor(authUser) {
  let row = null
  try {
    const { data } = await supabase.from('vendors').select('*').eq('auth_id', authUser.id).maybeSingle()
    row = data
  } catch (e) {
    console.error('Vendor load failed:', e)
  }
  const m = authUser.user_metadata || {}
  return {
    id: authUser.id, vendorId: row?.id || null, email: authUser.email,
    name: row?.contact_name || m.contact_name || (authUser.email || 'Vendor').split('@')[0],
    role: 'Vendor', company: row?.company_name || m.company_name || 'Vendor',
    city: row?.city || m.city || '', phone: row?.phone || m.phone || '', gst: row?.gst_number || m.gst_number || '',
    status: row?.status || 'Pending', source: 'supabase',
  }
}

export function AuthProvider({ children }) {
  const [localUser] = useState(loadLocalUser)
  const [user, setUser] = useState(localUser)
  const [loading, setLoading] = useState(!localUser)

  useEffect(() => {
    let active = true
    supabase.auth.getSession()
      .then(async ({ data }) => { if (active && !localUser && data?.session?.user) setUser(await buildVendor(data.session.user)) })
      .catch((e) => console.error('Session check failed:', e))
      .finally(() => active && setLoading(false))

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return
      if (event === 'SIGNED_OUT') setUser((p) => (p?.source === 'supabase' ? null : p))
      else if (session?.user) {
        setTimeout(async () => { // deferred: calling Supabase inside this callback can deadlock
          const u = await buildVendor(session.user)
          if (active) setUser((p) => (p && p.source !== 'supabase' ? p : u))
        }, 0)
      }
    })
    return () => { active = false; sub.subscription.unsubscribe() }
  }, [localUser])

  const login = useCallback(async (email, password) => {
    const e = norm(email)
    const admin = STAFF_ACCOUNTS.find((a) => norm(a.email) === e && a.password === password)
    if (admin) { try { localStorage.setItem(KEY, e) } catch { /* ignore */ } setUser(fromStaff(admin)); return { ok: true } }
    const demo = DEMO_VENDORS.find((v) => norm(v.email) === e && v.password === password)
    if (demo) { try { localStorage.setItem(KEY, e) } catch { /* ignore */ } setUser(fromDemoVendor(demo)); return { ok: true } }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: e, password })
      if (error) {
        const m = error.message || ''
        if (/invalid login/i.test(m)) return { ok: false, error: 'Invalid email or password.' }
        if (/not confirmed/i.test(m)) return { ok: false, error: 'Please confirm your email first, then sign in.' }
        return { ok: false, error: m }
      }
      setUser(await buildVendor(data.user))
      return { ok: true }
    } catch (err) {
      console.error('Sign-in failed:', err)
      return { ok: false, error: NETWORK_ERR }
    }
  }, [])

  const signup = useCallback(async ({ companyName, contactName, email, phone, city, gst, password }) => {
    const e = norm(email)
    if (STAFF_ACCOUNTS.some((a) => norm(a.email) === e)) return { ok: false, error: 'This email is reserved. Please use a different one.' }
    try {
      const { data, error } = await supabase.auth.signUp({
        email: e, password,
        options: { data: { role: 'Vendor', company_name: companyName.trim(), contact_name: contactName.trim(), phone: phone.trim(), city: city.trim(), gst_number: gst.trim() } },
      })
      if (error) return { ok: false, error: error.message }
      if (Array.isArray(data.user?.identities) && data.user.identities.length === 0) return { ok: false, error: 'An account with this email already exists. Try signing in.' }
      return { ok: true, needsConfirmation: !data.session }
    } catch (err) {
      console.error('Sign-up failed:', err)
      return { ok: false, error: NETWORK_ERR }
    }
  }, [])

  // Re-reads the vendor row (used by the "waiting for approval" screen)
  const refreshUser = useCallback(async () => {
    try {
      const { data } = await supabase.auth.getSession()
      if (data?.session?.user) setUser(await buildVendor(data.session.user))
    } catch (e) { console.error('Refresh failed:', e) }
  }, [])

  const logout = useCallback(async () => {
    try { localStorage.removeItem(KEY) } catch { /* ignore */ }
    if (user?.source === 'supabase') { try { await supabase.auth.signOut() } catch (e) { console.error('Sign-out failed:', e) } }
    setUser(null)
  }, [user])

  const can = useCallback((perm) => !!(user && PERMS[user.role]?.[perm]), [user])

  return <AuthContext.Provider value={{ user, loading, login, signup, refreshUser, logout, can }}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
