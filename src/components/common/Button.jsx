const variants = {
  primary: 'bg-emerald-800 text-white hover:bg-emerald-900 focus-visible:ring-emerald-700',
  secondary: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-500',
  danger: 'bg-rose-700 text-white hover:bg-rose-800 focus-visible:ring-rose-700',
}

const sizes = {
  sm: 'min-h-10 px-3 text-sm',
  md: 'min-h-11 px-4 text-sm',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  children,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant] ?? variants.primary} ${sizes[size] ?? sizes.md} ${className}`}
      {...props}
    >
      {loading && <span className="size-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />}
      {children}
    </button>
  )
}