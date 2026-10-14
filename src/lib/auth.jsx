import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase.js'

// Supabase Auth handles accounts and sessions; CRM details (name, role, service area)
// live in public.profiles, created by a DB trigger on signup (see supabase/supabase_auth_setup.sql).
export const SIGNUP_ROLES = ['Sales Manager', 'Technician']

const PERMS = {
  Admin: { analytics: true, addLead: true, editLead: true, assignTech: true, deleteLead: true, exportCsv: true, dragDrop: true, seeAll: true },
  'Sales Manager': { analytics: true, addLead: true, editLead: true, assignTech: true, deleteLead: false, exportCsv: true, dragDrop: true, seeAll: true },
  Technician: { analytics: false, addLead: false, editLead: true, assignTech: false, deleteLead: false, exportCsv: false, dragDrop: true, seeAll: false },
}

const AuthContext = createContext(null)

const toUser = (p) => ({ id: p.id, email: p.email, name: p.full_name, phone: p.phone, role: p.role, tech: p.tech })

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined) // undefined = still checking
  const [profile, setProfile] = useState({ id: null, user: null }) // profile loaded for user id
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    // Keep this callback synchronous: awaiting Supabase calls inside it can deadlock the client.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  const userId = session?.user?.id ?? null
  useEffect(() => {
    if (!userId) return
    let cancelled = false
    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) console.error('Load profile failed:', error)
        if (!data) {
          // Auth account without a CRM profile (e.g. created before the signup trigger existed).
          setAuthError('This account has no CRM profile. Ask an Admin for help.')
          supabase.auth.signOut()
        }
        setProfile({ id: userId, user: data ? toUser(data) : null })
      })
    return () => { cancelled = true }
  }, [userId])

  const loading = session === undefined || (!!userId && profile.id !== userId)
  const user = userId && profile.id === userId ? profile.user : null

  const login = useCallback(async (email, password) => {
    setAuthError('')
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password })
    if (error) {
      const msg = /confirm/i.test(error.message) ? 'Please confirm your email first. Check your inbox.' : 'Invalid email or password.'
      return { ok: false, error: msg }
    }
    return { ok: true }
  }, [])

  // Details go in options.data; the DB trigger copies them into public.profiles.
  const signup = useCallback(async ({ name, email, phone, role, tech, password }) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { full_name: name.trim(), phone: phone.trim(), role, tech: role === 'Technician' ? tech : '' },
        emailRedirectTo: window.location.origin,
      },
    })
    if (error) {
      console.error('Sign up failed:', error)
      return { ok: false, error: error.message || 'Could not create account.' }
    }
    // With "Confirm email" on, Supabase returns a user with no identities for an already-registered email.
    if (data.user && data.user.identities?.length === 0) {
      return { ok: false, error: 'An account with this email already exists.' }
    }
    // No session means Supabase is waiting for the user to confirm their email.
    return { ok: true, needsConfirmation: !data.session }
  }, [])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  const can = useCallback((perm) => !!(user && PERMS[user.role]?.[perm]), [user])

  return <AuthContext.Provider value={{ user, loading, authError, login, signup, logout, can }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
