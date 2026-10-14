import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../lib/auth.jsx'
import AuthLayout, { inputCls } from '../components/AuthLayout.jsx'

export default function Login() {
  const { login, authError } = useAuth()
  const location = useLocation()
  const [email, setEmail] = useState(location.state?.email || '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const notice = location.state?.notice

  const submit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password) return setError('Enter your email and password.')
    setBusy(true)
    setError('')
    const res = await login(email, password)
    if (!res.ok) {
      setError(res.error)
      setBusy(false)
    }
  }

  return (
    <AuthLayout>
      <h2 className="text-2xl font-semibold text-gray-900">Sign in</h2>
      <p className="mt-1 text-sm text-gray-500">Use your Arkawelle CRM account.</p>

      {notice && <p className="mt-4 rounded-lg bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700 ring-1 ring-inset ring-emerald-200">{notice}</p>}

      <form onSubmit={submit} className="mt-6 space-y-4">
        <input className={inputCls} type="email" autoComplete="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className={inputCls} type="password" autoComplete="current-password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {(error || authError) && <p className="text-sm text-red-600">{error || authError}</p>}
        <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Sign in
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        New to Arkawelle CRM?{' '}
        <Link to="/signup" className="font-medium text-brand-500 hover:text-brand-600">Create an account</Link>
      </p>
    </AuthLayout>
  )
}
