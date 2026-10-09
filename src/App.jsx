import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { Calculator, CalendarDays, Kanban, LayoutDashboard, LogOut, Sun, Table2, UserPlus } from 'lucide-react'
import { useAuth } from './lib/auth.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import PipelineBoard from './pages/PipelineBoard.jsx'
import LeadsTable from './pages/LeadsTable.jsx'
import LeadCaptureForm from './pages/LeadCaptureForm.jsx'
import Schedule from './pages/Schedule.jsx'
import QuoteCalculator from './pages/QuoteCalculator.jsx'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true, perm: 'analytics' },
  { to: '/pipeline', label: 'Pipeline', icon: Kanban },
  { to: '/leads', label: 'Leads', icon: Table2, end: true },
  { to: '/leads/new', label: 'Add lead', icon: UserPlus, perm: 'addLead' },
  { to: '/schedule', label: 'Schedule', icon: CalendarDays },
  { to: '/quote', label: 'Quote calculator', icon: Calculator },
]

const ROLE_BADGE = {
  Admin: 'bg-violet-50 text-violet-700 ring-violet-200',
  'Sales Manager': 'bg-blue-50 text-blue-700 ring-blue-200',
  Technician: 'bg-amber-50 text-amber-700 ring-amber-200',
}

function Guard({ perm, children }) {
  const { can } = useAuth()
  return can(perm) ? children : <Navigate to="/pipeline" replace />
}

export default function App() {
  const { user, logout, can } = useAuth()
  if (!user) return <Login />

  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-gray-200 bg-white">
        <div className="flex h-16 items-center gap-3 border-b border-gray-200 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-white"><Sun className="h-5 w-5" /></div>
          <div className="leading-tight">
            <p className="text-base font-semibold text-gray-900">Arkawelle</p>
            <p className="text-xs text-gray-500">Infra CRM</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          <p className="px-3 pb-2 text-xs font-medium text-gray-400">Menu</p>
          {NAV.filter((n) => !n.perm || can(n.perm)).map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-brand-50 text-brand-500' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <Icon className="h-5 w-5" /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gray-200 p-4">
          <div className="rounded-lg bg-gray-50 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-sm font-semibold text-white">
                {user.name.split(' ').map((p) => p[0]).join('')}
              </div>
              <div className="min-w-0 leading-tight">
                <p className="truncate text-sm font-medium text-gray-900">{user.name}</p>
                <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${ROLE_BADGE[user.role]}`}>{user.role}</span>
              </div>
            </div>
            <button onClick={logout} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      </aside>

      <main className="ml-64 min-h-screen p-8">
        <Routes>
          <Route path="/" element={<Guard perm="analytics"><Dashboard /></Guard>} />
          <Route path="/pipeline" element={<PipelineBoard />} />
          <Route path="/leads" element={<LeadsTable />} />
          <Route path="/leads/new" element={<Guard perm="addLead"><LeadCaptureForm /></Guard>} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/quote" element={<QuoteCalculator />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
