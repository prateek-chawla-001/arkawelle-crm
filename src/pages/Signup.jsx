import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Loader2, MailCheck, Sun } from 'lucide-react'
import { useAuth } from '../lib/auth.jsx'

const inputCls =
  'w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-3 focus:ring-brand-500/15'

function Field({ label, optional, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-700">{label} {optional && <span className="font-normal text-gray-400">(optional)</span>}</span>
      {children}
    </label>
  )
}

export default function Signup() {
  const { signup } = useAuth()
  const [f, setF] = useState({ companyName: '', contactName: '', email: '', phone: '', city: '', gst: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmSent, setConfirmSent] = useState(false)
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!f.companyName.trim()) return setError('Please enter your company name.')
    if (!f.contactName.trim()) return setError('Please enter the contact person’s name.')
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) return setError('Please enter a valid email address.')
    if (f.phone.replace(/\D/g, '').length < 10) return setError('Please enter a valid phone number.')
    if (!f.city.trim()) return setError('Please enter your city.')
    if (f.password.length < 6) return setError('Password must be at least 6 characters.')
    if (f.password !== f.confirm) return setError('Passwords do not match.')

    setSaving(true)
    const res = await signup(f)
    setSaving(false)
    if (!res.ok) return setError(res.error)
    // Email confirmation OFF: you are signed in and land on the "waiting for approval" screen.
    if (res.needsConfirmation) setConfirmSent(true)
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-brand-500 p-12 text-white lg:flex">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15"><Sun className="h-6 w-6" /></div>
          <span className="text-xl font-semibold">Arkawelle Infra</span>
        </Link>
        <div>
          <h1 className="text-4xl font-semibold leading-tight">Become an Arkawelle<br />solar vendor.</h1>
          <p className="mt-4 max-w-md text-brand-100">Register your company, get approved, and start receiving and managing solar leads in your city.</p>
        </div>
        <p className="text-sm text-brand-100">© Arkawelle Infra Private Limited</p>
      </div>

      <div className="flex items-center justify-center overflow-y-auto bg-white p-8">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"><ArrowLeft className="h-4 w-4" /> Back to home</Link>

          {confirmSent ? (
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-500"><MailCheck className="h-7 w-7" /></div>
              <h2 className="mt-5 text-2xl font-semibold text-gray-900">Check your inbox</h2>
              <p className="mt-2 text-sm text-gray-500">We sent a confirmation link to <span className="font-medium text-gray-800">{f.email}</span>. Confirm it, then sign in. An administrator will approve your account after that.</p>
              <Link to="/signin" className="mt-6 inline-block rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600">Go to sign in</Link>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-gray-900">Register your company</h2>
              <p className="mt-1 text-sm text-gray-500">An administrator reviews every new vendor.</p>

              <form onSubmit={submit} className="mt-6 space-y-4">
                <Field label="Company name"><input className={inputCls} value={f.companyName} onChange={set('companyName')} placeholder="e.g. SunBridge Energy" /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Contact person"><input className={inputCls} value={f.contactName} onChange={set('contactName')} placeholder="Full name" /></Field>
                  <Field label="Phone"><input className={inputCls} type="tel" value={f.phone} onChange={set('phone')} placeholder="+91 98XXXXXXXX" /></Field>
                </div>
                <Field label="Work email"><input className={inputCls} type="email" value={f.email} onChange={set('email')} placeholder="name@company.com" /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="City"><input className={inputCls} value={f.city} onChange={set('city')} placeholder="e.g. Gurugram" /></Field>
                  <Field label="GST number" optional><input className={inputCls} value={f.gst} onChange={set('gst')} placeholder="15 characters" /></Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Password"><input className={inputCls} type="password" value={f.password} onChange={set('password')} placeholder="6+ characters" /></Field>
                  <Field label="Confirm"><input className={inputCls} type="password" value={f.confirm} onChange={set('confirm')} placeholder="Repeat" /></Field>
                </div>
                {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
                <button disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />} {saving ? 'Creating account…' : 'Register as a vendor'}
                </button>
              </form>
              <p className="mt-6 text-center text-sm text-gray-500">Already registered? <Link to="/signin" className="font-medium text-brand-500 hover:underline">Sign in</Link></p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
