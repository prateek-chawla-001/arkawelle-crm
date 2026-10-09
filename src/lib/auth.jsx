import { createContext, useCallback, useContext, useState } from 'react'

// DEMO-GRADE LOGIN: users live in the frontend and the session sits in localStorage.
// This is for the prototype only. In Phase 1 swap it for Supabase Auth + RLS policies.
export const DEMO_USERS = [
  { email: 'admin@arkawelle.in', password: 'admin123', name: 'Rohit Verma', role: 'Admin' },
  { email: 'sales@arkawelle.in', password: 'sales123', name: 'Neha Kapoor', role: 'Sales Manager' },
  { email: 'tech@arkawelle.in', password: 'tech123', name: 'Amit Yadav', role: 'Technician', tech: 'Tech A - Gurugram' },
]

const PERMS = {
  Admin: { analytics: true, addLead: true, editLead: true, assignTech: true, deleteLead: true, exportCsv: true, dragDrop: true, seeAll: true },
  'Sales Manager': { analytics: true, addLead: true, editLead: true, assignTech: true, deleteLead: false, exportCsv: true, dragDrop: true, seeAll: true },
  Technician: { analytics: false, addLead: false, editLead: true, assignTech: false, deleteLead: false, exportCsv: false, dragDrop: true, seeAll: false },
}

const KEY = 'arkawelle_session'
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const email = localStorage.getItem(KEY)
      return DEMO_USERS.find((u) => u.email === email) || null
    } catch {
      return null
    }
  })

  const login = useCallback((email, password) => {
    const found = DEMO_USERS.find((u) => u.email === email.trim().toLowerCase() && u.password === password)
    if (!found) return { ok: false, error: 'Invalid email or password.' }
    try { localStorage.setItem(KEY, found.email) } catch { /* ignore */ }
    setUser(found)
    return { ok: true }
  }, [])

  const logout = useCallback(() => {
    try { localStorage.removeItem(KEY) } catch { /* ignore */ }
    setUser(null)
  }, [])

  const can = useCallback((perm) => !!(user && PERMS[user.role]?.[perm]), [user])

  return <AuthContext.Provider value={{ user, login, logout, can }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
