import { format } from 'date-fns'
import { Pencil, Trash2 } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth.js'
import { formatCurrency } from '../../utils/formatCurrency.js'

export default function ExpenseCard({ expense, usersById = {}, onDelete, onEdit }) {
  const { user } = useAuth()
  const payer = usersById[expense.paidBy]?.name ?? 'Unknown user'
  const ownSplit = expense.splits.find((split) => split.userId === user?.id)
  let shareMessage = 'Not involved'
  let shareClass = 'text-slate-500 dark:text-gray-400'

  if (expense.paidBy === user?.id) {
    const lentAmount = expense.amount - (ownSplit?.owedAmount ?? 0)
    if (lentAmount > 0) {
      shareMessage = `You lent ${formatCurrency(lentAmount)}`
      shareClass = 'text-emerald-800 dark:text-green-400'
    }
  } else if (ownSplit?.owedAmount > 0) {
    shareMessage = `You owe ${formatCurrency(ownSplit.owedAmount)}`
    shareClass = 'text-rose-700 dark:text-red-400'
  }

  return (
    <article className="flex items-start justify-between gap-3 rounded-md border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-5">
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-gray-100">{expense.description}</h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-gray-400">
          {format(new Date(expense.date ? `${expense.date}T12:00:00` : expense.createdAt), 'd MMM yyyy')}
        </p>
        <p className="mt-3 text-sm text-slate-600 dark:text-gray-400">
          {payer} paid <span className="font-medium text-slate-800 dark:text-gray-200">{formatCurrency(expense.amount)}</span>
        </p>
        <p className={`mt-1 text-sm font-medium ${shareClass}`}>{shareMessage}</p>
      </div>
      <div className="flex shrink-0 gap-1">
        <button
          type="button"
          aria-label={`Edit ${expense.description}`}
          title="Edit expense"
          onClick={() => onEdit?.(expense)}
          className="grid size-10 place-items-center rounded-md text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800 hover:text-slate-900 dark:hover:text-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 dark:focus-visible:ring-emerald-400"
        >
          <Pencil aria-hidden="true" size={17} />
        </button>
        <button
          type="button"
          aria-label={`Delete ${expense.description}`}
          title="Delete expense"
          onClick={() => onDelete?.(expense)}
          className="grid size-10 place-items-center rounded-md text-slate-500 dark:text-gray-400 hover:bg-rose-50 dark:hover:bg-red-950/40 hover:text-rose-700 dark:hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 dark:focus-visible:ring-red-400"
        >
          <Trash2 aria-hidden="true" size={17} />
        </button>
      </div>
    </article>
  )
}