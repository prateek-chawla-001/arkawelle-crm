import { AlertCircle, Loader2 } from 'lucide-react'
import { useLeads } from '../lib/useLeads.js'
import { formatDate, STATUS_STYLES } from '../lib/constants.js'
import LiveBadge from '../components/LiveBadge.jsx'

export default function Schedule() {
  const { leads, loading, error, live } = useLeads()
  const rows = leads.filter((l) => l.status === 'Site Survey Scheduled').sort((a, b) => a.created_at.localeCompare(b.created_at))

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-gray-900">Site survey schedule</h1>
          <LiveBadge live={live} />
        </div>
        <p className="mt-1 text-sm text-gray-500">Leads waiting for a vendor site visit.</p>
      </div>

      {error && <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertCircle className="h-5 w-5" /> {error}</div>}

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        {loading && leads.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-16 text-gray-500"><Loader2 className="h-5 w-5 animate-spin" /> Loading schedule…</div>
        ) : rows.length === 0 ? (
          <p className="py-16 text-center text-sm text-gray-400">No surveys scheduled. Move a lead to “Site Survey Scheduled” from the pipeline.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-gray-500">
              <tr>{['Customer', 'City', 'Phone', 'Capacity', 'Vendor', 'Status', 'Added'].map((h) => <th key={h} className="px-5 py-3 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 font-medium text-gray-900">{r.customer_name}</td>
                  <td className="px-5 py-4 text-gray-600">{r.city || '—'}</td>
                  <td className="px-5 py-4 text-gray-600">{r.phone}</td>
                  <td className="px-5 py-4 text-gray-600">{r.estimated_kw ?? '—'} kW</td>
                  <td className="px-5 py-4 text-gray-600">{r.assigned_tech || 'Unassigned'}</td>
                  <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[r.status].badge}`}>{r.status}</span></td>
                  <td className="px-5 py-4 text-gray-500">{formatDate(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
