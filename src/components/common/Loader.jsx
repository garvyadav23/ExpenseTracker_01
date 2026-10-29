export default function Loader({ label = 'Loading', fullPage = false, className = '' }) {
  const content = (
    <div className={`flex items-center gap-3 text-sm font-medium text-slate-600 ${className}`} role="status" aria-live="polite">
      <span className="size-5 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-700" />
      {label}
    </div>
  )

  if (!fullPage) return content

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50">
      {content}
    </main>
  )
}