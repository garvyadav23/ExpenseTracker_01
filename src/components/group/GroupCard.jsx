import { Link } from 'react-router-dom'
import Avatar from '../common/Avatar.jsx'
import { useGroupBalances } from '../../hooks/useBalances.js'
import { formatCurrency } from '../../utils/formatCurrency.js'
import Button from '../common/Button.jsx'
import Skeleton from '../common/Skeleton.jsx'
import GroupTypeIcon from './GroupTypeIcon.jsx'

export function GroupCardSkeleton() {
  return (
    <div aria-hidden="true" className="min-h-48 rounded-md border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-md" />
        <Skeleton className="h-5 w-36" />
      </div>
      <div className="mt-6 flex items-center">
        {[0, 1, 2].map((item) => <Skeleton key={item} className="-ml-2 size-8 rounded-full border-2 border-white dark:border-gray-900 bg-slate-100 dark:bg-gray-800 first:ml-0" />)}
      </div>
      <Skeleton className="mt-5 h-4 w-40 bg-slate-100 dark:bg-gray-800" />
    </div>
  )
}

export default function GroupCard({ group, members = [] }) {
  const balanceQuery = useGroupBalances(group.id)
  const balance = balanceQuery.data?.netBalance
  const balanceMessage = balanceQuery.isLoading
    ? 'Loading balance'
    : balanceQuery.isError
      ? 'Balance unavailable'
      : balance > 0
        ? `You are owed ${formatCurrency(balance)}`
        : balance < 0
          ? `You owe ${formatCurrency(Math.abs(balance))}`
          : 'Settled up'
  const balanceClass = balanceQuery.isError
    ? 'text-slate-500 dark:text-gray-400'
    : balance > 0
      ? 'text-emerald-800 dark:text-green-400'
      : balance < 0
        ? 'text-rose-700 dark:text-red-400'
        : 'text-slate-500 dark:text-gray-400'
  const visibleMembers = members.slice(0, 4)

  return (
    <article className="min-h-48 rounded-md border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 transition hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-sm">
      <Link to={`/groups/${group.id}`} aria-label={`Open ${group.name}`} className="block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 dark:focus-visible:ring-emerald-400">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-green-400">
          <GroupTypeIcon type={group.type} size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-semibold text-slate-900 dark:text-gray-100">{group.name}</h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-gray-400">{group.type ?? 'Other'}</p>
        </div>
      </div>

      <div className="mt-5 flex min-h-9 items-center">
        {visibleMembers.map((member, index) => (
          <Avatar
            key={member.id}
            name={member.name}
            size="sm"
            className={index > 0 ? '-ml-2 border-2 border-white dark:border-gray-900' : 'border-2 border-white dark:border-gray-900'}
          />
        ))}
        {members.length > 4 && (
          <span className="-ml-2 grid size-7 place-items-center rounded-full border-2 border-white dark:border-gray-900 bg-slate-100 dark:bg-gray-800 text-[11px] font-semibold text-slate-600 dark:text-gray-400">
            +{members.length - 4}
          </span>
        )}
      </div>
      </Link>

      {balanceQuery.isLoading ? (
        <Skeleton className="mt-4 h-4 w-32" />
      ) : balanceQuery.isError ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p role="alert" className="text-sm text-rose-700 dark:text-red-400">{balanceQuery.error?.message || 'Balance unavailable.'}</p>
          <Button size="sm" variant="secondary" onClick={() => balanceQuery.refetch()}>Retry</Button>
        </div>
      ) : (
        <p className={`mt-4 text-sm font-medium ${balanceClass}`} aria-live="polite">
          {balanceMessage}
        </p>
      )}
    </article>
  )
}