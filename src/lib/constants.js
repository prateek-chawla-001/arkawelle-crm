// Values must match the Supabase ENUMs exactly.
export const STATUSES = ['New Lead', 'Site Survey Scheduled', 'Installation Approved', 'Completed']
export const ROOF_TYPES = ['Concrete', 'Tin Sheet', 'Slanted']
export const TECHS = ['Tech A - Gurugram', 'Tech B - Delhi', 'Tech C - Noida', 'Tech D - Faridabad']

export const STATUS_SHORT = {
  'New Lead': 'New',
  'Site Survey Scheduled': 'Survey',
  'Installation Approved': 'Approved',
  Completed: 'Completed',
}
export const STATUS_HEX = {
  'New Lead': '#3b82f6',
  'Site Survey Scheduled': '#f59e0b',
  'Installation Approved': '#8b5cf6',
  Completed: '#10b981',
}
export const STATUS_STYLES = {
  'New Lead': { badge: 'bg-blue-50 text-blue-700 ring-blue-200', dot: 'bg-blue-500' },
  'Site Survey Scheduled': { badge: 'bg-amber-50 text-amber-700 ring-amber-200', dot: 'bg-amber-500' },
  'Installation Approved': { badge: 'bg-violet-50 text-violet-700 ring-violet-200', dot: 'bg-violet-500' },
  Completed: { badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-500' },
}

// Pricing assumptions (editable) used for pipeline value + quote calculator
export const PRICE_PER_KW = 55000
export const ROOF_COST = { Concrete: 55000, 'Tin Sheet': 60000, Slanted: 58000 }

export const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
export const inr = (n) => '₹' + Math.round(n || 0).toLocaleString('en-IN')
export const inrShort = (n) => {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)} L`
  return inr(n)
}
