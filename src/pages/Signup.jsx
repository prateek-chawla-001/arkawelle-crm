import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { SIGNUP_ROLES, useAuth } from '../lib/auth.jsx'
import { TECHS } from '../lib/constants.js'
import AuthLayout, { inputCls } from '../components/AuthLayout.jsx'

const EMPTY = { name: '', email: '', phone: '', role: 'Sales Manager', tech: '', password: '', confirm: '' }

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  )
}

const validate = (f) => {
  if (f.name.trim().length < 2) return 'Enter your full name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) return 'Enter a valid email address.'
  if (f.phone.trim() && !/^\+?[\d\s-]{10,15}$/.test(f.phone.trim())) return 'Enter a valid phone number.'
  if (!SIGNUP_ROLES.includes(f.role)) return 'Choose a role.'
  if (f.role === 'Technician' && !TECHS.includes(f.tech)) return 'Choose your service area.'
  if (f.password.length < 8) return 'Password must be at least 8 characters.'
  if (f.password !== f.confirm) return 'Passwords do not match.'
  return null
}

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    const problem = validate(form)
    if (problem) return setError(problem)
    setBusy(true)
    setError('')
    const res = await signup(form)
    if (!res.ok) {
      setError(res.error)
      setBusy(false)
      return
    }
    // If email confirmation is off, Supabase signs the user in and App switches to the CRM automatically.
    if (res.needsConfirmation) {
      navigate('/', {
        replace: true,
        state: { email: form.email.trim().toLowerCase(), notice: 'Account created. Check your email to confirm it, then sign in.' },
      })
    }
  }

  return (
    <AuthLayout>
      <h2 className="text-2xl font-semibold text-gray-900">Create account</h2>
      <p className="mt-1 text-sm text-gray-500">Join your team on Arkawelle CRM.</p>

      <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
        <Field label="Full name" required>
          <input className={inputCls} autoComplete="name" placeholder="e.g. Neha Kapoor" value={form.name} onChange={set('name')} />
        </Field>
        <Field label="Work email" required>
          <input className={inputCls} type="email" autoComplete="email" placeholder="you@arkawelle.in" value={form.email} onChange={set('email')} />
        </Field>
        <Field label="Phone">
          <input className={inputCls} type="tel" autoComplete="tel" placeholder="+91 98100 00000" value={form.phone} onChange={set('phone')} />
        </Field>
        <Field label="Role" required>
          <select className={inputCls} value={form.role} onChange={set('role')}>
            {SIGNUP_ROLES.map((r) => <option key={r}>{r}</option>)}
          </select>
        </Field>
        {form.role === 'Technician' && (
          <Field label="Service area" required>
            <select className={inputCls} value={form.tech} onChange={set('tech')}>
              <option value="">Select your area</option>
              {TECHS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
        )}
        <Field label="Password" required>
          <input className={inputCls} type="password" autoComplete="new-password" placeholder="At least 8 characters" value={form.password} onChange={set('password')} />
        </Field>
        <Field label="Confirm password" required>
          <input className={inputCls} type="password" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} />
        </Field>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Create account
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link to="/" className="font-medium text-brand-500 hover:text-brand-600">Sign in</Link>
      </p>
    </AuthLayout>
  )
}
