const colors = [
  'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-900 dark:text-green-400',
  'bg-sky-100 dark:bg-sky-950/40 text-sky-900 dark:text-sky-300',
  'bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300',
  'bg-rose-100 dark:bg-red-950/40 text-rose-900 dark:text-red-400',
  'bg-cyan-100 dark:bg-cyan-950/40 text-cyan-900 dark:text-cyan-300',
  'bg-lime-100 dark:bg-lime-950/40 text-lime-900 dark:text-lime-300',
]

const sizes = {
  sm: 'size-7 text-xs',
  md: 'size-9 text-sm',
  lg: 'size-12 text-base',
}

function colorForName(name) {
  let hash = 0
  for (const character of name) hash = (hash * 31 + character.charCodeAt(0)) >>> 0
  return colors[hash % colors.length]
}

export default function Avatar({ name = '', size = 'md', className = '' }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || '?'

  return (
    <span
      aria-label={name || 'User'}
      className={`grid shrink-0 place-items-center rounded-full font-semibold ${sizes[size] ?? sizes.md} ${colorForName(name)} ${className}`}
    >
      {initials}
    </span>
  )
}