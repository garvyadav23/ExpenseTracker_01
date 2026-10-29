import { useCallback, useEffect, useRef, useState } from 'react'
import { CheckCircle2, X, XCircle } from 'lucide-react'
import { ToastContext } from './toastContext.js'

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())

  const dismiss = useCallback((id) => {
    const timer = timers.current.get(id)
    if (timer) clearTimeout(timer)
    timers.current.delete(id)
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const addToast = useCallback((type, message) => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts((current) => [...current, { id, type, message }])
    timers.current.set(id, setTimeout(() => dismiss(id), 3000))
  }, [dismiss])

  useEffect(() => () => {
    for (const timer of timers.current.values()) clearTimeout(timer)
    timers.current.clear()
  }, [])

  return (
    <ToastContext.Provider value={{
      success: (message) => addToast('success', message),
      error: (message) => addToast('error', message),
    }}>
      {children}
      <div className="pointer-events-none fixed right-0 top-0 z-[90] flex w-full flex-col gap-2 p-3 sm:right-5 sm:top-5 sm:w-96 sm:p-0" aria-live="polite" aria-relevant="additions">
        {toasts.map((toast) => {
          const Icon = toast.type === 'success' ? CheckCircle2 : XCircle
          const color = toast.type === 'success'
            ? 'border-emerald-200 bg-white text-emerald-900'
            : 'border-rose-200 bg-white text-rose-900'
          return (
            <div key={toast.id} className={`pointer-events-auto flex items-start gap-3 rounded-md border px-4 py-3 shadow-lg ${color}`} role="status">
              <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
              <p className="min-w-0 flex-1 text-sm font-medium leading-5">{toast.message}</p>
              <button
                type="button"
                aria-label="Dismiss notification"
                onClick={() => dismiss(toast.id)}
                className="-mr-1 -mt-1 grid size-10 shrink-0 place-items-center rounded text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
              >
                <X size={17} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}