import { useState, useCallback } from 'react'
import { Loader2, UserPlus } from 'lucide-react'
import { supabase } from '../lib/supabase.js'
import { ROOF_TYPES } from '../lib/constants.js'
import { useAuth } from '../lib/auth.jsx'
import { useVendors } from '../lib/useVendors.js'
import Toast from '../components/Toast.jsx'

const EMPTY = {
  customer_name: '',
  phone: '',
  email: '',
  city: '',
  address: '',
  roof_type: 'Concrete',
  estimated_kw: '',
  assigned_tech: '',
}

const inputCls =
  'w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-3 focus:ring-brand-500/15'

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

export default function LeadCaptureForm() {
  const [form, setForm] = useState(EMPTY)
  const { user } = useAuth()
  const { vendors } = useVendors()
  const isVendor = user?.role === 'Vendor'
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const closeToast = useCallback(() => setToast(null), [])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.customer_name.trim() || !form.phone.trim()) {
      setToast({ type: 'error', message: 'Customer name and phone are required.' })
      return
    }

    setSaving(true)
    try {
      const payload = {
        customer_name: form.customer_name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        city: form.city.trim() || null,
        address: form.address.trim() || null,
        roof_type: form.roof_type,
        estimated_kw: form.estimated_kw === '' ? null : Number(form.estimated_kw),
        assigned_tech: isVendor ? user.company : form.assigned_tech || null,
        status: 'New Lead',
      }
      const { error } = await supabase.from('leads').insert([payload])
      if (error) throw error

      setToast({ type: 'success', message: `Lead for ${payload.customer_name} was added to the pipeline.` })
      setForm(EMPTY)
    } catch (err) {
      console.error('Insert lead failed:', err)
      setToast({ type: 'error', message: `Could not save the lead: ${err.message || 'unknown error'}` })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Toast toast={toast} onClose={closeToast} />

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Add a new lead</h1>
        <p className="mt-1 text-sm text-gray-500">
          Capture customer and rooftop details. New leads start in the pipeline as “New Lead”.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-base font-medium text-gray-900">Customer details</h2>
        </div>
        <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
          <Field label="Customer name" required>
            <input className={inputCls} value={form.customer_name} onChange={set('customer_name')} placeholder="e.g. Rakesh Sharma" />
          </Field>
          <Field label="Phone" required>
            <input className={inputCls} type="tel" value={form.phone} onChange={set('phone')} placeholder="+91 98XXXXXXXX" />
          </Field>
          <Field label="Email">
            <input className={inputCls} type="email" value={form.email} onChange={set('email')} placeholder="name@company.com" />
          </Field>
          <Field label="City">
            <input className={inputCls} value={form.city} onChange={set('city')} placeholder="e.g. Gurugram" />
          </Field>
          <div className="md:col-span-2">
            <Field label="Site address">
              <textarea className={inputCls} rows={2} value={form.address} onChange={set('address')} placeholder="Building, street, sector" />
            </Field>
          </div>
        </div>

        <div className="border-y border-gray-200 px-6 py-4">
          <h2 className="text-base font-medium text-gray-900">Installation details</h2>
        </div>
        <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-3">
          <Field label="Roof type">
            <select className={inputCls} value={form.roof_type} onChange={set('roof_type')}>
              {ROOF_TYPES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </Field>
          <Field label="Estimated capacity (kW)">
            <input className={inputCls} type="number" min="0" step="0.1" value={form.estimated_kw} onChange={set('estimated_kw')} placeholder="e.g. 5" />
          </Field>
          {isVendor ? (
            <Field label="Assigned vendor">
              <input className={inputCls} value={user.company} disabled />
            </Field>
          ) : (
            <Field label="Assign vendor">
              <select className={inputCls} value={form.assigned_tech} onChange={set('assigned_tech')}>
                <option value="">Unassigned</option>
                {vendors.filter((v) => v.status === 'Approved').map((v) => (
                  <option key={v.id}>{v.company_name}</option>
                ))}
              </select>
            </Field>
          )}
        </div>

        <div className="flex justify-end gap-3 rounded-b-2xl border-t border-gray-200 bg-gray-50 px-6 py-4">
          <button
            type="button"
            onClick={() => setForm(EMPTY)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear form
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            {saving ? 'Saving…' : 'Save lead'}
          </button>
        </div>
      </form>
    </div>
  )
}
