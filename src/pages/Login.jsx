import { useState } from 'react'
import { ArrowRight, Sun } from 'lucide-react'
import { DEMO_USERS, useAuth } from '../lib/auth.jsx'

const inputCls =
  'w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-3 focus:ring-brand-500/15'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const res = login(email, password)
    if (!res.ok) setError(res.error)
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-brand-500 p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15"><Sun className="h-6 w-6" /></div>
          <span className="text-xl font-semibold">Arkawelle Infra</span>
        </div>
        <div>
          <h1 className="text-4xl font-semibold leading-tight">Every solar lead,<br />from enquiry to commissioning.</h1>
          <p className="mt-4 max-w-md text-brand-100">One workspace for sales, site surveys and installations, with role-based access for your whole team.</p>
        </div>
        <p className="text-sm text-brand-100">© Arkawelle Infra Private Limited</p>
      </div>

      <div className="flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-semibold text-gray-900">Sign in</h2>
          <p className="mt-1 text-sm text-gray-500">Use your Arkawelle CRM account.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <input className={inputCls} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className={inputCls} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button className="w-full rounded-lg bg-brand-500 py-2.5 text-sm font-medium text-white hover:bg-brand-600">Sign in</button>
          </form>

          <div className="mt-8 border-t border-gray-200 pt-6">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-400">Demo accounts (click to sign in)</p>
            <div className="space-y-2">
              {DEMO_USERS.map((u) => (
                <button
                  key={u.email}
                  onClick={() => login(u.email, u.password)}
                  className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-left hover:border-brand-500 hover:bg-brand-50"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{u.name}</p>
                    <p className="text-xs text-gray-500">{u.role} · {u.email}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
