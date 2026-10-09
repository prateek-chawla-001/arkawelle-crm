const COLS = [
  ['Customer', (r) => r.customer_name], ['Phone', (r) => r.phone], ['Email', (r) => r.email],
  ['City', (r) => r.city], ['Address', (r) => r.address], ['Roof type', (r) => r.roof_type],
  ['Estimated kW', (r) => r.estimated_kw], ['Status', (r) => r.status],
  ['Assigned technician', (r) => r.assigned_tech], ['Created', (r) => r.created_at],
]
const esc = (v) => {
  const s = v == null ? '' : String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function downloadLeadsCsv(rows) {
  const lines = [COLS.map(([h]) => h).join(','), ...rows.map((r) => COLS.map(([, g]) => esc(g(r))).join(','))]
  const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' }) // BOM so Excel reads ₹/UTF-8
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `arkawelle-leads-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}
