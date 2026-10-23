import { Link } from 'react-router-dom'
import {
  ArrowRight, BarChart3, Calculator, CalendarDays, Download, Kanban, Radio, ShieldCheck, Sun, UserPlus,
} from 'lucide-react'

const FEATURES = [
  { icon: UserPlus, title: 'Lead capture', text: 'Add customers in under a minute with validation and instant confirmation.' },
  { icon: Kanban, title: 'Drag-and-drop pipeline', text: 'Move leads across New, Survey, Approved and Completed with one gesture.' },
  { icon: BarChart3, title: 'Analytics dashboard', text: 'Pipeline value, conversion, weekly capacity, cities and roof types at a glance.' },
  { icon: Download, title: 'Search, filter, export', text: 'Sort every column, filter by city or technician, and export to Excel-ready CSV.' },
  { icon: Calculator, title: 'Instant quote calculator', text: 'System size, net cost, monthly savings and payback for any lead.' },
  { icon: ShieldCheck, title: 'Vendor approval and access', text: 'Admins approve vendors, and each vendor sees only the leads assigned to them.' },
  { icon: Radio, title: 'Live updates', text: 'Changes appear on every screen the moment someone saves them.' },
  { icon: CalendarDays, title: 'Survey schedule', text: 'One list of every site survey waiting for a technician visit.' },
]

const STEPS = [
  ['1', 'Register', 'Sign up your company with contact, city and GST details.'],
  ['2', 'Get approved', 'An administrator reviews and approves your vendor account.'],
  ['3', 'Receive and manage leads', 'See assigned leads, update their stage and share quotes.'],
]

const ROLES = [
  ['Vendors', 'Register your company, get approved, then work only on the leads assigned to you.'],
  ['Administrators', 'Approve vendors, assign leads, view all analytics and export reports.'],
  ['One shared workspace', 'Live updates keep vendors and administrators looking at the same pipeline.'],
]

const BOARD = [
  ['bg-blue-500', 'New Lead', ['Neelam Joshi', 'Tyagi Steel Works']],
  ['bg-amber-500', 'Survey', ['Deepak Arora', 'Modern Public School']],
  ['bg-violet-500', 'Approved', ['Meera Iyer', 'Harish Chauhan']],
  ['bg-emerald-500', 'Completed', ['Anil Kapoor', 'Sunita Verma']],
]

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-white"><Sun className="h-5 w-5" /></div>
      <span className="text-base font-semibold text-gray-900">Arkawelle Infra CRM</span>
    </div>
  )
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm font-medium text-gray-600 md:flex">
            <a href="#features" className="hover:text-gray-900">Features</a>
            <a href="#how" className="hover:text-gray-900">How it works</a>
            <a href="#roles" className="hover:text-gray-900">Who it is for</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/signin" className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">Sign in</Link>
            <Link to="/signup" className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">Vendor sign up</Link>
          </div>
        </div>
      </header>

      <section className="border-b border-gray-200 bg-gray-50">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-500">
              <Sun className="h-3.5 w-3.5" /> Built for solar vendors and partners
            </span>
            <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-gray-900 md:text-5xl">
              Run every solar lead from first call to commissioning
            </h1>
            <p className="mt-5 max-w-lg text-lg text-gray-600">
              One workspace for sales, site surveys and installations. See your pipeline, quote customers in seconds and keep your whole team in sync.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/signup" className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-sm font-medium text-white hover:bg-brand-600">
                Register as a vendor <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/signin" className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">Sign in</Link>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-lg">
            <div className="mb-3 flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-300" /><span className="h-2.5 w-2.5 rounded-full bg-amber-300" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
              <span className="ml-3 text-xs text-gray-400">Sales pipeline</span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {BOARD.map(([dot, name, cards]) => (
                <div key={name} className="rounded-xl bg-gray-100 p-2.5">
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-gray-700"><span className={`h-2 w-2 rounded-full ${dot}`} />{name}</p>
                  <div className="space-y-2">
                    {cards.map((c) => (
                      <div key={c} className="rounded-lg border border-gray-200 bg-white p-2 shadow-xs">
                        <p className="truncate text-[11px] font-medium text-gray-800">{c}</p>
                        <p className="mt-1 text-[10px] text-gray-400">Solar rooftop</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-brand-500">Features</p>
          <h2 className="mt-2 text-3xl font-semibold text-gray-900">Everything your solar team needs in one place</h2>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-500"><Icon className="h-5 w-5" /></div>
              <h3 className="text-base font-semibold text-gray-900">{title}</h3>
              <p className="mt-1.5 text-sm text-gray-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="border-y border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-sm font-semibold text-brand-500">How it works</p>
          <h2 className="mt-2 text-3xl font-semibold text-gray-900">Join, get approved, start receiving leads</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map(([n, t, d]) => (
              <div key={n} className="rounded-2xl border border-gray-200 bg-white p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-sm font-semibold text-white">{n}</div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{t}</h3>
                <p className="mt-1.5 text-sm text-gray-600">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="roles" className="mx-auto max-w-6xl px-6 py-20">
        <p className="text-sm font-semibold text-brand-500">Who it is for</p>
        <h2 className="mt-2 text-3xl font-semibold text-gray-900">Built for vendors and administrators</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {ROLES.map(([r, d]) => (
            <div key={r} className="rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900">{r}</h3>
              <p className="mt-2 text-sm text-gray-600">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-6xl rounded-3xl bg-brand-500 px-8 py-14 text-center text-white">
          <h2 className="text-3xl font-semibold">Ready to see your pipeline clearly?</h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-100">Register your company in a minute and start managing leads today.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/signup" className="rounded-lg bg-white px-6 py-3 text-sm font-medium text-brand-600 hover:bg-gray-100">Vendor sign up</Link>
            <Link to="/signin" className="rounded-lg border border-white/40 px-6 py-3 text-sm font-medium text-white hover:bg-white/10">Sign in</Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-6 text-sm text-gray-500">
          <Logo />
          <p>© Arkawelle Infra Private Limited</p>
        </div>
      </footer>
    </div>
  )
}
