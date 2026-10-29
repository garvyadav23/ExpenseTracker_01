import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight } from 'lucide-react'
import { formatCurrency } from '../../utils/formatCurrency.js'
import Skeleton from '../common/Skeleton.jsx'

const cards = [
  { key: 'total', label: 'Total balance', icon: ArrowLeftRight },
  { key: 'owing', label: 'You owe', icon: ArrowUpRight },
  { key: 'owed', label: 'You are owed', icon: ArrowDownLeft },
]

function amountClass(key, amount) {
  if (key === 'owing') return 'text-rose-700'
  if (key === 'owed') return 'text-emerald-800'
  if (amount > 0) return 'text-emerald-800'
  if (amount < 0) return 'text-rose-700'
  return 'text-slate-500'
}

export default function BalanceSummary({ overall, loading = false }) {
  return (
    <section aria-label="Balance summary" className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {cards.map(({ key, label, icon: Icon }) => {
        const amount = key === 'total' ? overall?.netBalance : key === 'owing' ? overall?.totalOwing : overall?.totalOwed

        return (
          <article key={key} className="min-h-32 rounded-md border border-slate-200 bg-white p-5">
            {loading ? (
              <div className="space-y-5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-7 w-36" />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <Icon aria-hidden="true" size={17} strokeWidth={1.8} />
                  <span>{label}</span>
                </div>
                <p className={`mt-4 text-2xl font-semibold tracking-tight ${amountClass(key, amount ?? 0)}`}>
                  {formatCurrency(amount ?? 0)}
                </p>
              </>
            )}
          </article>
        )
      })}
    </section>
  )
}