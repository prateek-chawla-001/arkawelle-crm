import { useCallback, useMemo, useState } from 'react'
import { AlertCircle, Check, Loader2, RefreshCw, RotateCcw, Search, X } from 'lucide-react'
import { useVendors } from '../lib/useVendors.js'
import { useLeads } from '../lib/useLeads.js'
import { formatDate } from '../lib/constants.js'
import Toast from '../components/Toast.jsx'

const TABS = ['All', 'Pending', 'Approved', 'Rejected']
const BADGE = {
  Pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  Approved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Rejected: 'bg-red-50 text-red-700 ring-red-200',
}

export default function Vendors() {
  const { vendors, loading, error, refetch, setStatus } = useVendors()
  const { leads } = useLeads()
  const [tab, setTab] = useState('All')
  const [q, setQ] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [toast, setToast] = useState(null)
  const closeToast = useCallback(() => setToast(null), [])

  const counts = useMemo(() => {
    const c = { All: vendors.length }
    TABS.slice(1).forEach((t) => { c[t] = vendors.filter((v) => v.status === t).length })
    return c
  }, [vendors])

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase()
    return vendors.filter((v) => (tab === 'All' || v.status === tab) &&
      (!s || [v.company_name, v.contact_name, v.email, v.city, v.gst_number].some((x) => (x || '').toLowerCase().includes(s))))
  }, [vendors, tab, q])

  const leadCount = (name) => leads.filter((l) => l.assigned_tech === name).length

  const act = async (v, status) => {
    setBusyId(v.id)
    try {
      await setStatus(v, status)
      setToast({ type: 'success', message: `${v.company_name} is now ${status}.` })
    } catch (err) {
      console.error('Vendor update failed:', err)
      setToast({ type: 'error', message: `Could not update: ${err.message || 'unknown error'}` })
    } finally { setBusyId(null) }
  }

  const btn = 'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-50'

  return (
    <div>
      <Toast toast={toast} onClose={closeToast} />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Vendors</h1>
          <p className="mt-1 text-sm text-gray-500">Review sign-ups and control who can receive leads.</p>
        </div>
        <button onClick={refetch} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`rounded-lg px-4 py-2 text-sm font-medium ${tab === t ? 'bg-brand-500 text-white' : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}>
              {t} <span className={tab === t ? 'text-brand-100' : 'text-gray-400'}>{counts[t]}</span>
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search company, contact, city, GST…" className="w-72 rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-3 focus:ring-brand-500/15" />
        </div>
      </div>

      {error && <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertCircle className="h-5 w-5" /> {error}. Did you run supabase_vendor_setup.sql?</div>}

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        {loading && vendors.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-16 text-gray-500"><Loader2 className="h-5 w-5 animate-spin" /> Loading vendors…</div>
        ) : rows.length === 0 ? (
          <p className="py-16 text-center text-sm text-gray-400">No vendors match.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-gray-500">
              <tr>{['Company', 'Contact', 'City', 'GST', 'Leads', 'Joined', 'Status', ''].map((h) => <th key={h} className="px-5 py-3 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4"><p className="font-medium text-gray-900">{v.company_name}</p><p className="text-xs text-gray-500">{v.email}</p></td>
                  <td className="px-5 py-4 text-gray-600"><p>{v.contact_name || '—'}</p><p className="text-xs text-gray-500">{v.phone}</p></td>
                  <td className="px-5 py-4 text-gray-600">{v.city || '—'}</td>
                  <td className="px-5 py-4 text-gray-600">{v.gst_number || '—'}</td>
                  <td className="px-5 py-4 text-gray-600">{leadCount(v.company_name)}</td>
                  <td className="px-5 py-4 text-gray-500">{formatDate(v.created_at)}</td>
                  <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${BADGE[v.status]}`}>{v.status}</span></td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      {v.status !== 'Approved' && (
                        <button disabled={busyId === v.id} onClick={() => act(v, 'Approved')} className={`${btn} bg-emerald-600 text-white hover:bg-emerald-700`}>
                          {v.status === 'Rejected' ? <RotateCcw className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />} {v.status === 'Rejected' ? 'Re-approve' : 'Approve'}
                        </button>
                      )}
                      {v.status === 'Pending' && (
                        <button disabled={busyId === v.id} onClick={() => act(v, 'Rejected')} className={`${btn} border border-gray-300 text-gray-700 hover:bg-gray-50`}><X className="h-3.5 w-3.5" /> Reject</button>
                      )}
                      {v.status === 'Approved' && (
                        <button disabled={busyId === v.id} onClick={() => act(v, 'Rejected')} className={`${btn} border border-red-200 text-red-600 hover:bg-red-50`}>Revoke</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
