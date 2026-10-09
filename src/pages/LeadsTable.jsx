import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, ArrowUpDown, Download, Loader2, Plus, Search } from 'lucide-react'
import { useLeads } from '../lib/useLeads.js'
import { useAuth } from '../lib/auth.jsx'
import { ROOF_TYPES, STATUSES, STATUS_STYLES, TECHS, formatDate } from '../lib/constants.js'
import { downloadLeadsCsv } from '../lib/csv.js'
import Toast from '../components/Toast.jsx'
import LeadModal from '../components/LeadModal.jsx'
import LiveBadge from '../components/LiveBadge.jsx'

const filterCls = 'rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-3 focus:ring-brand-500/15'
const COLUMNS = [
  { key: 'customer_name', label: 'Customer' },
  { key: 'city', label: 'City' },
  { key: 'estimated_kw', label: 'Capacity' },
  { key: 'roof_type', label: 'Roof' },
  { key: 'status', label: 'Status' },
  { key: 'assigned_tech', label: 'Technician' },
  { key: 'created_at', label: 'Added' },
]

export default function LeadsTable() {
  const { can } = useAuth()
  const { leads, loading, error, live, updateLead, deleteLead } = useLeads()
  const [f, setF] = useState({ q: '', status: '', city: '', tech: '', roof: '' })
  const [sort, setSort] = useState({ key: 'created_at', dir: 'desc' })
  const [selected, setSelected] = useState(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const closeToast = useCallback(() => setToast(null), [])
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))

  const cities = useMemo(() => [...new Set(leads.map((l) => l.city).filter(Boolean))].sort(), [leads])

  const rows = useMemo(() => {
    const q = f.q.trim().toLowerCase()
    const out = leads.filter((l) =>
      (!f.status || l.status === f.status) && (!f.city || l.city === f.city) && (!f.roof || l.roof_type === f.roof) &&
      (!f.tech || (f.tech === '__none' ? !l.assigned_tech : l.assigned_tech === f.tech)) &&
      (!q || [l.customer_name, l.phone, l.email, l.city].some((v) => (v || '').toLowerCase().includes(q)))
    )
    const { key, dir } = sort
    out.sort((a, b) => {
      const x = a[key] ?? '', y = b[key] ?? ''
      const c = key === 'estimated_kw' ? Number(x) - Number(y) : String(x).localeCompare(String(y))
      return dir === 'asc' ? c : -c
    })
    return out
  }, [leads, f, sort])

  const toggleSort = (key) => setSort((s) => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }))

  const save = async (lead, patch) => {
    setSaving(true)
    try {
      const data = await updateLead(lead, patch)
      setSelected(null)
      setToast({ type: 'success', message: `${data.customer_name} updated.` })
    } catch (err) {
      setToast({ type: 'error', message: `Could not update: ${err.message || 'unknown error'}` })
    } finally { setSaving(false) }
  }
  const remove = async (lead) => {
    setSaving(true)
    try {
      await deleteLead(lead)
      setSelected(null)
      setToast({ type: 'success', message: `${lead.customer_name} was deleted.` })
    } catch (err) {
      setToast({ type: 'error', message: `Could not delete: ${err.message || 'unknown error'}` })
    } finally { setSaving(false) }
  }

  return (
    <div>
      <Toast toast={toast} onClose={closeToast} />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900">All leads</h1>
            <LiveBadge live={live} />
          </div>
          <p className="mt-1 text-sm text-gray-500">{rows.length} of {leads.length} leads shown</p>
        </div>
        <div className="flex gap-3">
          {can('exportCsv') && (
            <button onClick={() => downloadLeadsCsv(rows)} disabled={!rows.length} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
              <Download className="h-4 w-4" /> Export CSV
            </button>
          )}
          {can('addLead') && (
            <Link to="/leads/new" className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600">
              <Plus className="h-4 w-4" /> Add lead
            </Link>
          )}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input value={f.q} onChange={set('q')} placeholder="Search name, phone, email, city…" className={`${filterCls} w-72 pl-9`} />
        </div>
        <select className={filterCls} value={f.status} onChange={set('status')}><option value="">All statuses</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
        <select className={filterCls} value={f.city} onChange={set('city')}><option value="">All cities</option>{cities.map((c) => <option key={c}>{c}</option>)}</select>
        <select className={filterCls} value={f.roof} onChange={set('roof')}><option value="">All roof types</option>{ROOF_TYPES.map((r) => <option key={r}>{r}</option>)}</select>
        {can('seeAll') && (
          <select className={filterCls} value={f.tech} onChange={set('tech')}>
            <option value="">All technicians</option><option value="__none">Unassigned</option>{TECHS.map((t) => <option key={t}>{t}</option>)}
          </select>
        )}
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertCircle className="h-5 w-5" /> {error}</div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        {loading && leads.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-16 text-gray-500"><Loader2 className="h-5 w-5 animate-spin" /> Loading leads…</div>
        ) : rows.length === 0 ? (
          <p className="py-16 text-center text-sm text-gray-400">No leads match these filters.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-gray-500">
              <tr>
                {COLUMNS.map((c) => (
                  <th key={c.key} className="px-5 py-3 font-medium">
                    <button onClick={() => toggleSort(c.key)} className="inline-flex items-center gap-1.5 hover:text-gray-900">
                      {c.label} <ArrowUpDown className={`h-3.5 w-3.5 ${sort.key === c.key ? 'text-brand-500' : 'text-gray-300'}`} />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((r) => (
                <tr key={r.id} onClick={() => setSelected(r)} className="cursor-pointer hover:bg-gray-50">
                  <td className="px-5 py-4"><p className="font-medium text-gray-900">{r.customer_name}</p><p className="text-xs text-gray-500">{r.phone}</p></td>
                  <td className="px-5 py-4 text-gray-600">{r.city || '—'}</td>
                  <td className="px-5 py-4 text-gray-600">{r.estimated_kw ?? '—'} kW</td>
                  <td className="px-5 py-4 text-gray-600">{r.roof_type || '—'}</td>
                  <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[r.status].badge}`}>{r.status}</span></td>
                  <td className="px-5 py-4 text-gray-600">{r.assigned_tech || 'Unassigned'}</td>
                  <td className="px-5 py-4 text-gray-500">{formatDate(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && <LeadModal lead={selected} saving={saving} onClose={() => setSelected(null)} onSave={save} onDelete={remove} />}
    </div>
  )
}
