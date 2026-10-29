const colors = [
  'bg-emerald-100 text-emerald-900',
  'bg-sky-100 text-sky-900',
  'bg-amber-100 text-amber-900',
  'bg-rose-100 text-rose-900',
  'bg-cyan-100 text-cyan-900',
  'bg-lime-100 text-lime-900',
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