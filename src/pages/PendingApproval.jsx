import { useState } from 'react'
import { Clock, Loader2, LogOut, RefreshCw, XCircle } from 'lucide-react'
import { useAuth } from '../lib/auth.jsx'

export default function PendingApproval() {
  const { user, refreshUser, logout } = useAuth()
  const [busy, setBusy] = useState(false)
  const rejected = user.status === 'Rejected'

  const check = async () => { setBusy(true); await refreshUser(); setBusy(false) }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${rejected ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
          {rejected ? <XCircle className="h-7 w-7" /> : <Clock className="h-7 w-7" />}
        </div>
        <h1 className="mt-5 text-2xl font-semibold text-gray-900">{rejected ? 'Application not approved' : 'Waiting for approval'}</h1>
        <p className="mt-2 text-sm text-gray-500">
          {rejected
            ? 'An administrator did not approve this vendor account. Please contact Arkawelle to find out more.'
            : 'Thanks for registering. An Arkawelle administrator will review your company and approve your account shortly.'}
        </p>
        <div className="mt-6 rounded-xl bg-gray-50 p-4 text-left text-sm">
          <p className="font-medium text-gray-900">{user.company}</p>
          <p className="text-gray-500">{user.name} · {user.email}</p>
          <p className="text-gray-500">{[user.city, user.phone].filter(Boolean).join(' · ')}</p>
        </div>
        <div className="mt-6 flex justify-center gap-3">
          {!rejected && (
            <button onClick={check} disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Check again
            </button>
          )}
          <button onClick={logout} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
