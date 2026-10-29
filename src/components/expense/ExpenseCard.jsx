import { format } from 'date-fns'
import { Trash2 } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth.js'
import { formatCurrency } from '../../utils/formatCurrency.js'

export default function ExpenseCard({ expense, usersById = {}, onDelete }) {
  const { user } = useAuth()
  const payer = usersById[expense.paidBy]?.name ?? 'Unknown user'
  const ownSplit = expense.splits.find((split) => split.userId === user?.id)
  let shareMessage = 'Not involved'
  let shareClass = 'text-slate-500'

  if (expense.paidBy === user?.id) {
    const lentAmount = expense.amount - (ownSplit?.owedAmount ?? 0)
    if (lentAmount > 0) {
      shareMessage = `You lent ${formatCurrency(lentAmount)}`
      shareClass = 'text-emerald-800'
    }
  } else if (ownSplit?.owedAmount > 0) {
    shareMessage = `You owe ${formatCurrency(ownSplit.owedAmount)}`
    shareClass = 'text-rose-700'
  }

  return (
    <article className="flex items-start justify-between gap-3 rounded-md border border-slate-200 bg-white p-4 sm:p-5">
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-slate-900">{expense.description}</h3>
        <p className="mt-1 text-xs text-slate-500">
          {format(new Date(expense.date ? `${expense.date}T12:00:00` : expense.createdAt), 'd MMM yyyy')}
        </p>
        <p className="mt-3 text-sm text-slate-600">
          {payer} paid <span className="font-medium text-slate-800">{formatCurrency(expense.amount)}</span>
        </p>
        <p className={`mt-1 text-sm font-medium ${shareClass}`}>{shareMessage}</p>
      </div>
      <button
        type="button"
        aria-label={`Delete ${expense.description}`}
        title="Delete expense"
        onClick={() => onDelete?.(expense)}
        className="grid size-9 shrink-0 place-items-center rounded-md text-slate-500 hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
      >
        <Trash2 size={17} />
      </button>
    </article>
  )
}