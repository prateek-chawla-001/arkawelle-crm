import { useMemo } from 'react'
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { AlertCircle, BadgeCheck, IndianRupee, Loader2, Users, Zap } from 'lucide-react'
import { useLeads } from '../lib/useLeads.js'
import { useAuth } from '../lib/auth.jsx'
import { PRICE_PER_KW, ROOF_TYPES, STATUSES, STATUS_HEX, STATUS_SHORT, STATUS_STYLES, formatDate, inrShort } from '../lib/constants.js'
import LiveBadge from '../components/LiveBadge.jsx'

const ROOF_HEX = ['#465fff', '#f59e0b', '#10b981']

function Stat({ icon: Icon, label, value, hint }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-500"><Icon className="h-5 w-5" /></div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        {hint && <p className="text-xs text-gray-400">{hint}</p>}
      </div>
    </div>
  )
}

function ChartCard({ title, subtitle, children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-gray-200 bg-white p-5 shadow-sm ${className}`}>
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      <p className="mb-4 text-sm text-gray-500">{subtitle}</p>
      <div className="h-64">{children}</div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const { leads, loading, error, live } = useLeads()

  const stats = useMemo(() => {
    const totalKw = leads.reduce((s, l) => s + (Number(l.estimated_kw) || 0), 0)
    const completed = leads.filter((l) => l.status === 'Completed').length
    const byStage = STATUSES.map((s) => ({ name: STATUS_SHORT[s], status: s, count: leads.filter((l) => l.status === s).length }))

    const cityMap = {}
    leads.forEach((l) => { const c = l.city || 'Unknown'; cityMap[c] = (cityMap[c] || 0) + 1 })
    const byCity = Object.entries(cityMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 6)

    const byRoof = ROOF_TYPES.map((r) => ({ name: r, value: leads.filter((l) => l.roof_type === r).length })).filter((r) => r.value > 0)

    const WEEK = 7 * 864e5
    const now = Date.now()
    const weekly = Array.from({ length: 8 }, (_, i) => ({
      name: new Date(now - (8 - i) * WEEK).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      kw: 0,
    }))
    leads.forEach((l) => {
      const k = Math.floor((now - new Date(l.created_at).getTime()) / WEEK)
      if (k >= 0 && k < 8) weekly[7 - k].kw += Number(l.estimated_kw) || 0
    })
    weekly.forEach((w) => { w.kw = Math.round(w.kw * 10) / 10 })

    return { totalKw, completed, byStage, byCity, byRoof, weekly }
  }, [leads])

  const conversion = leads.length ? Math.round((stats.completed / leads.length) * 100) : 0

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Welcome back, {user.name.split(' ')[0]}</h1>
          <p className="mt-1 text-sm text-gray-500">Here is how the solar pipeline looks right now.</p>
        </div>
        <LiveBadge live={live} />
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-5 w-5" /> {error}
        </div>
      )}

      {loading && leads.length === 0 ? (
        <div className="flex items-center justify-center gap-2 py-24 text-gray-500"><Loader2 className="h-5 w-5 animate-spin" /> Loading analytics…</div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat icon={Users} label="Total leads" value={leads.length} />
            <Stat icon={Zap} label="Capacity in pipeline" value={`${stats.totalKw.toFixed(1)} kW`} />
            <Stat icon={IndianRupee} label="Est. pipeline value" value={inrShort(stats.totalKw * PRICE_PER_KW)} hint={`at ₹${PRICE_PER_KW.toLocaleString('en-IN')}/kW`} />
            <Stat icon={BadgeCheck} label="Conversion rate" value={`${conversion}%`} hint={`${stats.completed} completed`} />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <ChartCard title="Capacity captured per week" subtitle="Total kW of new leads, last 8 weeks" className="xl:col-span-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.weekly}>
                  <defs>
                    <linearGradient id="kwFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#465fff" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#465fff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} width={36} />
                  <Tooltip formatter={(v) => [`${v} kW`, 'Captured']} />
                  <Area type="monotone" dataKey="kw" stroke="#465fff" strokeWidth={2.5} fill="url(#kwFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Roof types" subtitle="Share of leads by roof">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.byRoof} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                    {stats.byRoof.map((_, i) => <Cell key={i} fill={ROOF_HEX[i % ROOF_HEX.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="-mt-6 flex justify-center gap-4 text-xs text-gray-600">
                {stats.byRoof.map((r, i) => (
                  <span key={r.name} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: ROOF_HEX[i % ROOF_HEX.length] }} />{r.name} ({r.value})</span>
                ))}
              </div>
            </ChartCard>

            <ChartCard title="Leads by stage" subtitle="Where the pipeline stands">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.byStage}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} width={28} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {stats.byStage.map((s) => <Cell key={s.status} fill={STATUS_HEX[s.status]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Top cities" subtitle="Lead count by city">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.byCity} layout="vertical" margin={{ left: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                  <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} fontSize={12} width={80} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#465fff" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="text-base font-semibold text-gray-900">Latest leads</h3>
              <p className="mb-3 text-sm text-gray-500">Most recent enquiries</p>
              <ul className="divide-y divide-gray-100">
                {leads.slice(0, 5).map((l) => (
                  <li key={l.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">{l.customer_name}</p>
                      <p className="text-xs text-gray-500">{l.city || '—'} · {l.estimated_kw ?? '—'} kW · {formatDate(l.created_at)}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[l.status].badge}`}>{STATUS_SHORT[l.status]}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
