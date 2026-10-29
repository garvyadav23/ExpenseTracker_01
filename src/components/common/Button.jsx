const variants = {
  primary: 'bg-emerald-800 dark:bg-emerald-700 text-white hover:bg-emerald-900 dark:hover:bg-emerald-800 focus-visible:ring-emerald-700 dark:focus-visible:ring-emerald-400',
  secondary: 'border border-slate-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-950 focus-visible:ring-slate-500 dark:focus-visible:ring-gray-500',
  danger: 'bg-rose-700 dark:bg-red-900 text-white hover:bg-rose-800 dark:hover:bg-red-900 focus-visible:ring-rose-700 dark:focus-visible:ring-red-400',
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