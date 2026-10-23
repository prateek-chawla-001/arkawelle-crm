import { Link } from 'react-router-dom'
import { AlertCircle, ArrowRight, BadgeCheck, Calculator, Hammer, Loader2, MapPin, Phone, Plus, Users, Zap } from 'lucide-react'
import { useLeads } from '../lib/useLeads.js'
import { useAuth } from '../lib/auth.jsx'
import { STATUSES, STATUS_HEX, formatDate } from '../lib/constants.js'
import LiveBadge from '../components/LiveBadge.jsx'

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-500"><Icon className="h-5 w-5" /></div>
      <div><p className="text-sm text-gray-500">{label}</p><p className="text-2xl font-semibold text-gray-900">{value}</p></div>
    </div>
  )
}

export default function VendorHome() {
  const { user, can } = useAuth()
  const { leads, loading, error, live } = useLeads()
  const count = (s) => leads.filter((l) => l.status === s).length
  const totalKw = leads.reduce((s, l) => s + (Number(l.estimated_kw) || 0), 0)
  const fresh = leads.filter((l) => l.status === 'New Lead').slice(0, 5)

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Welcome, {user.role === 'Vendor' ? user.company : user.name}</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-gray-500">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200"><BadgeCheck className="h-3.5 w-3.5" /> {user.role === 'Vendor' ? 'Approved vendor' : user.role}</span>
            {user.city && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {user.city}</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <LiveBadge live={live} />
          {can('addLead') && (
            <Link to="/leads/new" className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"><Plus className="h-4 w-4" /> Add a lead</Link>
          )}
          <Link to="/quote" className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"><Calculator className="h-4 w-4" /> New quote</Link>
        </div>
      </div>

      {error && <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertCircle className="h-5 w-5" /> {error}</div>}

      {loading && leads.length === 0 ? (
        <div className="flex items-center justify-center gap-2 py-24 text-gray-500"><Loader2 className="h-5 w-5 animate-spin" /> Loading your leads…</div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat icon={Users} label="Leads assigned to you" value={leads.length} />
            <Stat icon={Zap} label="Total capacity" value={`${totalKw.toFixed(1)} kW`} />
            <Stat icon={Hammer} label="In progress" value={count('Site Survey Scheduled') + count('Installation Approved')} />
            <Stat icon={BadgeCheck} label="Completed" value={count('Completed')} />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm xl:col-span-3">
              <div className="mb-3 flex items-center justify-between">
                <div><h3 className="text-base font-semibold text-gray-900">Needs your attention</h3><p className="text-sm text-gray-500">New leads waiting for a first contact</p></div>
                <Link to="/pipeline" className="inline-flex items-center gap-1 text-sm font-medium text-brand-500 hover:underline">Open pipeline <ArrowRight className="h-4 w-4" /></Link>
              </div>
              {fresh.length === 0 ? (
                <p className="rounded-xl border border-dashed border-gray-300 py-10 text-center text-sm text-gray-400">You are all caught up. No new leads right now.</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {fresh.map((l) => (
                    <li key={l.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900">{l.customer_name}</p>
                        <p className="text-xs text-gray-500">{l.city || '—'} · {l.estimated_kw ?? '—'} kW · {l.roof_type || 'Roof n/a'} · {formatDate(l.created_at)}</p>
                      </div>
                      {l.phone && <a href={`tel:${l.phone}`} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"><Phone className="h-3.5 w-3.5" /> Call</a>}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm xl:col-span-2">
              <h3 className="text-base font-semibold text-gray-900">Your pipeline</h3>
              <p className="mb-4 text-sm text-gray-500">Where your leads stand</p>
              <div className="space-y-4">
                {STATUSES.map((s) => {
                  const n = count(s)
                  return (
                    <div key={s}>
                      <div className="mb-1 flex justify-between text-sm"><span className="text-gray-700">{s}</span><span className="font-medium text-gray-900">{n}</span></div>
                      <div className="h-2 rounded-full bg-gray-100"><div className="h-2 rounded-full" style={{ width: `${leads.length ? (n / leads.length) * 100 : 0}%`, background: STATUS_HEX[s] }} /></div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
