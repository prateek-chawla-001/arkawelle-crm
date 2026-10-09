import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Clock, IndianRupee, Layers, Leaf, PiggyBank, Sun } from 'lucide-react'
import { useLeads } from '../lib/useLeads.js'
import { ROOF_COST, ROOF_TYPES, inr } from '../lib/constants.js'

const inputCls = 'w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-3 focus:ring-brand-500/15'
const num = (v) => Number(v) || 0

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-gray-400">{hint}</span>}
    </label>
  )
}
function Kpi({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${accent ? 'border-brand-500 bg-brand-500 text-white' : 'border-gray-200 bg-white'}`}>
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${accent ? 'bg-white/15' : 'bg-brand-50 text-brand-500'}`}><Icon className="h-5 w-5" /></div>
      <p className={`text-sm ${accent ? 'text-brand-100' : 'text-gray-500'}`}>{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
      {sub && <p className={`text-xs ${accent ? 'text-brand-100' : 'text-gray-400'}`}>{sub}</p>}
    </div>
  )
}

export default function QuoteCalculator() {
  const [params] = useSearchParams()
  const { leads } = useLeads()
  const [leadId, setLeadId] = useState(params.get('lead') || '')
  const [kw, setKw] = useState('5')
  const [roof, setRoof] = useState('Concrete')
  const [bill, setBill] = useState('8000')
  const [tariff, setTariff] = useState('8')
  const [sun, setSun] = useState('4')
  const [panelW, setPanelW] = useState('540')
  const [costKw, setCostKw] = useState('')
  const [subsidy, setSubsidy] = useState(true)

  // Prefill from a selected lead
  useEffect(() => {
    const l = leads.find((x) => x.id === leadId)
    if (l) { if (l.estimated_kw) setKw(String(l.estimated_kw)); if (l.roof_type) setRoof(l.roof_type) }
  }, [leadId, leads])

  const r = useMemo(() => {
    const k = num(kw)
    const perKw = num(costKw) || ROOF_COST[roof]
    const gross = k * perKw
    // Indicative residential subsidy (PM Surya Ghar style): ₹30k/kW for first 2 kW, ₹18k for the 3rd kW, capped at 3 kW.
    const sub = subsidy ? Math.min(k, 2) * 30000 + Math.max(0, Math.min(k, 3) - 2) * 18000 : 0
    const net = Math.max(gross - sub, 0)
    const monthlyGen = k * num(sun) * 30
    const consumption = num(bill) > 0 && num(tariff) > 0 ? num(bill) / num(tariff) : monthlyGen
    const monthlySave = Math.min(monthlyGen, consumption) * num(tariff)
    const annualSave = monthlySave * 12
    const payback = annualSave > 0 ? net / annualSave : 0
    const co2 = (monthlyGen * 12 * 0.82) / 1000
    return {
      k, perKw, gross, sub, net, monthlyGen, monthlySave, annualSave, payback,
      panels: Math.ceil((k * 1000) / (num(panelW) || 540)), net25: annualSave * 25 - net, co2, trees: Math.round((co2 * 1000) / 21),
    }
  }, [kw, roof, bill, tariff, sun, panelW, costKw, subsidy])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Solar quote calculator</h1>
        <p className="mt-1 text-sm text-gray-500">Instant system size, cost, savings and payback estimate for a customer.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm xl:col-span-2">
          <Field label="Prefill from a lead (optional)">
            <select className={inputCls} value={leadId} onChange={(e) => setLeadId(e.target.value)}>
              <option value="">— Custom quote —</option>
              {leads.map((l) => <option key={l.id} value={l.id}>{l.customer_name} ({l.city || 'n/a'})</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="System size (kW)"><input className={inputCls} type="number" min="0" step="0.5" value={kw} onChange={(e) => setKw(e.target.value)} /></Field>
            <Field label="Roof type"><select className={inputCls} value={roof} onChange={(e) => setRoof(e.target.value)}>{ROOF_TYPES.map((x) => <option key={x}>{x}</option>)}</select></Field>
            <Field label="Monthly bill (₹)"><input className={inputCls} type="number" min="0" value={bill} onChange={(e) => setBill(e.target.value)} /></Field>
            <Field label="Tariff (₹/unit)"><input className={inputCls} type="number" min="0" step="0.5" value={tariff} onChange={(e) => setTariff(e.target.value)} /></Field>
            <Field label="Sun hours / day" hint="Typical NCR: 4 to 5"><input className={inputCls} type="number" min="0" step="0.5" value={sun} onChange={(e) => setSun(e.target.value)} /></Field>
            <Field label="Panel wattage (W)"><input className={inputCls} type="number" min="0" value={panelW} onChange={(e) => setPanelW(e.target.value)} /></Field>
          </div>
          <Field label="Cost per kW (₹)" hint={`Leave blank to use roof default (${inr(ROOF_COST[roof])})`}>
            <input className={inputCls} type="number" min="0" value={costKw} onChange={(e) => setCostKw(e.target.value)} placeholder={String(ROOF_COST[roof])} />
          </Field>
          <label className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
            <input type="checkbox" checked={subsidy} onChange={(e) => setSubsidy(e.target.checked)} className="h-4 w-4 accent-[#465fff]" />
            Include residential subsidy estimate
          </label>
        </div>

        <div className="space-y-4 xl:col-span-3">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <Kpi accent icon={IndianRupee} label="Net system cost" value={inr(r.net)} sub={r.sub ? `after ${inr(r.sub)} subsidy` : 'no subsidy applied'} />
            <Kpi icon={PiggyBank} label="Monthly savings" value={inr(r.monthlySave)} sub={`${inr(r.annualSave)} per year`} />
            <Kpi icon={Clock} label="Payback period" value={r.payback ? `${r.payback.toFixed(1)} yrs` : '—'} sub="simple payback" />
            <Kpi icon={Layers} label="Panels needed" value={`${r.panels}`} sub={`${num(panelW) || 540} W each`} />
            <Kpi icon={Sun} label="Monthly generation" value={`${Math.round(r.monthlyGen)} units`} sub={`${r.k} kW × ${num(sun)} h × 30 d`} />
            <Kpi icon={Leaf} label="CO₂ avoided" value={`${r.co2.toFixed(1)} t/yr`} sub={`≈ ${r.trees} trees per year`} />
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-base font-semibold text-gray-900">Cost breakdown</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-gray-500">System cost ({r.k} kW × {inr(r.perKw)})</dt><dd className="font-medium text-gray-900">{inr(r.gross)}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Subsidy (estimate)</dt><dd className="font-medium text-emerald-600">− {inr(r.sub)}</dd></div>
              <div className="flex justify-between border-t border-gray-200 pt-3"><dt className="font-medium text-gray-900">Net payable</dt><dd className="text-lg font-semibold text-gray-900">{inr(r.net)}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Net savings over 25 years</dt><dd className="font-medium text-emerald-600">{inr(r.net25)}</dd></div>
            </dl>
            <p className="mt-4 text-xs text-gray-400">Indicative estimate only. Actual pricing, subsidy eligibility and generation depend on site survey, equipment and current scheme rules.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
