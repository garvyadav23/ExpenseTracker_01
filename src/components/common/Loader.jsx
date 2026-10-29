import Skeleton from './Skeleton.jsx'

export default function Loader({ label = 'Loading', fullPage = false, className = '' }) {
  const content = (
    <div className={`flex items-center gap-3 text-sm font-medium text-slate-600 ${className}`} role="status" aria-live="polite">
      <span className="size-5 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-700" />
      {label}
    </div>
  )

  if (!fullPage) return content

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-5 py-10">
      <div className="w-full max-w-5xl space-y-8" role="status" aria-live="polite">
        <span className="sr-only">{label}</span>
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="size-10 rounded-full" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((item) => <Skeleton key={item} className="h-32 rounded-md" />)}
        </div>
        <div className="space-y-3">
          {[0, 1, 2].map((item) => <Skeleton key={item} className="h-16 rounded-md" />)}
        </div>
      </div>
    </main>
  )
}