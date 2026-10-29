import { Inbox } from 'lucide-react'
import Button from './Button.jsx'

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  message,
  action,
}) {
  return (
    <div className="flex flex-col items-center px-5 py-12 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-400">
        <Icon aria-hidden="true" size={22} strokeWidth={1.8} />
      </span>
      <h2 className="mt-4 text-base font-semibold text-slate-900 dark:text-gray-100">{title}</h2>
      <p className="mt-1 max-w-sm text-sm leading-6 text-slate-600 dark:text-gray-400">{message}</p>
      {action && (
        <Button className="mt-5" onClick={action.onClick} variant={action.variant ?? 'primary'}>
          {action.label}
        </Button>
      )}
    </div>
  )
}