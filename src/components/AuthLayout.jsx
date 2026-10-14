import { Sun } from 'lucide-react'

export const inputCls =
  'w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-3 focus:ring-brand-500/15'

// Shared shell for the sign-in and sign-up screens.
export default function AuthLayout({ children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-brand-500 p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15"><Sun className="h-6 w-6" /></div>
          <span className="text-xl font-semibold">Arkawelle Infra</span>
        </div>
        <div>
          <h1 className="text-4xl font-semibold leading-tight">Every solar lead,<br />from enquiry to commissioning.</h1>
          <p className="mt-4 max-w-md text-brand-100">One workspace for sales, site surveys and installations, with role-based access for your whole team.</p>
        </div>
        <p className="text-sm text-brand-100">© Arkawelle Infra Private Limited</p>
      </div>

      <div className="flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}
