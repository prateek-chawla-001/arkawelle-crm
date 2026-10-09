import { useCallback, useMemo, useState } from 'react'
import { AlertCircle, Loader2, MapPin, RefreshCw, Search, Wrench, Zap, GripVertical, Lock } from 'lucide-react'
import { useLeads } from '../lib/useLeads.js'
import { useAuth } from '../lib/auth.jsx'
import { STATUSES, STATUS_STYLES, formatDate } from '../lib/constants.js'
import Toast from '../components/Toast.jsx'
import LeadModal from '../components/LeadModal.jsx'
import LiveBadge from '../components/LiveBadge.jsx'

function LeadCard({ lead, draggable, dragging, onOpen, onDragStart, onDragEnd }) {
  return (
    <div
      role="button"
      tabIndex={0}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={() => onOpen(lead)}
      className={`rounded-xl border border-gray-200 bg-white p-4 text-left shadow-xs transition hover:border-brand-500 ${
        draggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
      } ${dragging ? 'opacity-40' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="flex items-center gap-1.5 font-medium text-gray-900">
          {draggable && <GripVertical className="h-4 w-4 text-gray-300" />} {lead.customer_name}
        </p>
        <span className="shrink-0 text-xs text-gray-400">{formatDate(lead.created_at)}</span>
      </div>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500"><MapPin className="h-3.5 w-3.5" /> {lead.city || 'City not set'}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 font-medium text-gray-700"><Zap className="h-3 w-3" /> {lead.estimated_kw ?? '—'} kW</span>
        <span className="rounded-md bg-gray-100 px-2 py-1 font-medium text-gray-700">{lead.roof_type || 'Roof n/a'}</span>
      </div>
      <p className="mt-3 flex items-center gap-1.5 border-t border-gray-100 pt-3 text-xs text-gray-500"><Wrench className="h-3.5 w-3.5" /> {lead.assigned_tech || 'Unassigned'}</p>
    </div>
  )
}

export default function PipelineBoard() {
  const { can } = useAuth()
  const { leads, loading, error, live, refetch, updateLead, deleteLead } = useLeads()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [dragId, setDragId] = useState(null)
  const [overCol, setOverCol] = useState(null)
  const closeToast = useCallback(() => setToast(null), [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return leads
    return leads.filter((l) => [l.customer_name, l.city, l.phone, l.assigned_tech].some((v) => (v || '').toLowerCase().includes(q)))
  }, [leads, query])

  const save = async (lead, patch) => {
    setSaving(true)
    try {
      const data = await updateLead(lead, patch)
      setSelected(null)
      setToast({ type: 'success', message: `${data.customer_name} updated to “${data.status}”.` })
    } catch (err) {
      setToast({ type: 'error', message: `Could not update the lead: ${err.message || 'unknown error'}` })
    } finally {
      setSaving(false)
    }
  }

  const remove = async (lead) => {
    setSaving(true)
    try {
      await deleteLead(lead)
      setSelected(null)
      setToast({ type: 'success', message: `${lead.customer_name} was deleted.` })
    } catch (err) {
      setToast({ type: 'error', message: `Could not delete: ${err.message || 'unknown error'}` })
    } finally {
      setSaving(false)
    }
  }

  const drop = async (status) => {
    const lead = leads.find((l) => l.id === dragId)
    setOverCol(null)
    setDragId(null)
    if (!lead || lead.status === status) return
    try {
      await updateLead(lead, { status })
      setToast({ type: 'success', message: `${lead.customer_name} moved to “${status}”.` })
    } catch (err) {
      setToast({ type: 'error', message: `Move failed and was reverted: ${err.message || 'unknown error'}` })
    }
  }

  return (
    <div>
      <Toast toast={toast} onClose={closeToast} />

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900">Sales pipeline</h1>
            <LiveBadge live={live} />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {can('dragDrop') ? 'Drag a card to another column to change its stage. Click a card for details.' : 'Click a card for details.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, city, phone…"
              className="w-72 rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-3 focus:ring-brand-500/15" />
          </div>
          <button onClick={() => refetch()} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {!can('seeAll') && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <Lock className="h-4 w-4" /> Technician view: you only see leads assigned to you.
        </div>
      )}

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>Could not load leads: {error}. Check your .env keys and that RLS allows reads on the leads table.</p>
        </div>
      )}

      {loading && leads.length === 0 ? (
        <div className="flex items-center justify-center gap-2 py-24 text-gray-500"><Loader2 className="h-5 w-5 animate-spin" /> Loading leads…</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-4">
          {STATUSES.map((status) => {
            const items = filtered.filter((l) => l.status === status)
            return (
              <section
                key={status}
                onDragOver={(e) => { if (dragId) { e.preventDefault(); setOverCol(status) } }}
                onDragLeave={() => setOverCol((c) => (c === status ? null : c))}
                onDrop={(e) => { e.preventDefault(); drop(status) }}
                className={`rounded-2xl border p-3 transition-colors ${overCol === status ? 'border-brand-500 bg-brand-50' : 'border-gray-200 bg-gray-100/70'}`}
              >
                <header className="mb-3 flex items-center justify-between px-1">
                  <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <span className={`h-2.5 w-2.5 rounded-full ${STATUS_STYLES[status].dot}`} /> {status}
                  </h2>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[status].badge}`}>{items.length}</span>
                </header>
                <div className="min-h-24 space-y-3">
                  {items.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-gray-300 py-8 text-center text-sm text-gray-400">No leads in this stage</p>
                  ) : (
                    items.map((lead) => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        draggable={can('dragDrop')}
                        dragging={dragId === lead.id}
                        onOpen={setSelected}
                        onDragStart={(e) => { setDragId(lead.id); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', lead.id) }}
                        onDragEnd={() => { setDragId(null); setOverCol(null) }}
                      />
                    ))
                  )}
                </div>
              </section>
            )
          })}
        </div>
      )}

      {selected && <LeadModal lead={selected} saving={saving} onClose={() => setSelected(null)} onSave={save} onDelete={remove} />}
    </div>
  )
}
