import { useEffect } from 'react'
import { CheckCircle2, AlertCircle, X } from 'lucide-react'

// toast = { type: 'success' | 'error', message: string } | null
export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [toast, onClose])

  if (!toast) return null
  const ok = toast.type === 'success'

  return (
    <div
      role="status"
      className={`fixed right-6 top-6 z-[60] flex max-w-sm items-start gap-3 rounded-xl border bg-white p-4 shadow-lg ${
        ok ? 'border-emerald-200' : 'border-red-200'
      }`}
    >
      {ok ? (
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
      ) : (
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
      )}
      <p className="text-sm text-gray-700">{toast.message}</p>
      <button onClick={onClose} aria-label="Dismiss" className="text-gray-400 hover:text-gray-600">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
