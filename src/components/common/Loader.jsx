export default function Loader({ label = 'Loading' }) {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50" role="status" aria-live="polite">
      <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
        <span className="size-5 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-700" />
        {label}
      </div>
    </main>
  )
}