import { Heart, Home, Plane, Users } from 'lucide-react'

const icons = {
  trip: Plane,
  home: Home,
  couple: Heart,
  other: Users,
}

export default function GroupTypeIcon({ type = 'Other', size = 20, className = '' }) {
  const Icon = icons[String(type).toLowerCase()] ?? icons.other
  return <Icon aria-hidden="true" size={size} strokeWidth={1.8} className={className} />
}