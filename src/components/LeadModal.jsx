import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Calculator, Loader2, Mail, MapPin, Phone, Trash2, X } from 'lucide-react'
import { STATUSES } from '../lib/constants.js'
import { useVendors } from '../lib/useVendors.js'
import { useAuth } from '../lib/auth.jsx'

const selectCls =
  'w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-3 focus:ring-brand-500/15 disabled:bg-gray-100 disabled:text-gray-500'

export default function LeadModal({ lead, saving, onClose, onSave, onDelete }) {
  const { can } = useAuth()
  const { vendors } = useVendors()
  const vendorNames = [...new Set([...vendors.filter((v) => v.status === 'Approved').map((v) => v.company_name), ...(lead.assigned_tech ? [lead.assigned_tech] : [])])]
  const [status, setStatus] = useState(lead.status)
  const [tech, setTech] = useState(lead.assigned_tech || '')
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between border-b border-gray-200 p-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{lead.customer_name}</h2>
            <p className="mt-0.5 text-sm text-gray-500">
              {lead.city || 'City not set'} · {lead.estimated_kw ?? '—'} kW · {lead.roof_type || 'Roof n/a'}
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="grid grid-cols-1 gap-3 rounded-xl bg-gray-50 p-4 text-sm text-gray-600 sm:grid-cols-2">
            <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-gray-400" /> {lead.phone || '—'}</p>
            <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-gray-400" /> {lead.email || '—'}</p>
            <p className="flex items-start gap-2 sm:col-span-2"><MapPin className="mt-0.5 h-4 w-4 text-gray-400" /> {lead.address || 'No address on file'}</p>
          </div>

          <div className="flex gap-2">
            {lead.phone && (
              <>
                <a href={`tel:${lead.phone}`} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <Phone className="h-4 w-4" /> Call
                </a>
                <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100">
                  WhatsApp
                </a>
              </>
            )}
            <Link to={`/quote?lead=${lead.id}`} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-brand-100 bg-brand-50 py-2 text-sm font-medium text-brand-500 hover:bg-brand-100">
              <Calculator className="h-4 w-4" /> Quote
            </Link>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Status</span>
            <select className={selectCls} value={status} disabled={!can('editLead')} onChange={(e) => setStatus(e.target.value)}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">
              Assigned vendor {!can('assignTech') && <span className="font-normal text-gray-400">(staff only)</span>}
            </span>
            <select className={selectCls} value={tech} disabled={!can('assignTech')} onChange={(e) => setTech(e.target.value)}>
              <option value="">Unassigned</option>
              {vendorNames.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-b-2xl border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div>
            {can('deleteLead') && (
              <button
                onClick={() => (confirmDelete ? onDelete(lead) : setConfirmDelete(true))}
                disabled={saving}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium ${
                  confirmDelete ? 'bg-red-600 text-white hover:bg-red-700' : 'text-red-600 hover:bg-red-50'
                }`}
              >
                <Trash2 className="h-4 w-4" /> {confirmDelete ? 'Click again to confirm' : 'Delete'}
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            {can('editLead') && (
              <button
                disabled={saving}
                onClick={() => onSave(lead, { status, assigned_tech: tech || null })}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
