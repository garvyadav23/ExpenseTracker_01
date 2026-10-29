export default function Avatar({ name = '', className = '' }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || '?'

  return (
    <span
      aria-label={name || 'User'}
      className={`grid size-9 shrink-0 place-items-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-900 ${className}`}
    >
      {initials}
    </span>
  )
}