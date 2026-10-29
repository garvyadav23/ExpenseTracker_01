import { Link } from 'react-router-dom'
import Avatar from '../common/Avatar.jsx'
import { useGroupBalances } from '../../hooks/useBalances.js'
import { formatCurrency } from '../../utils/formatCurrency.js'
import GroupTypeIcon from './GroupTypeIcon.jsx'

export function GroupCardSkeleton() {
  return (
    <div aria-hidden="true" className="min-h-48 animate-pulse rounded-md border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <span className="size-10 rounded-md bg-slate-200" />
        <span className="h-5 w-36 rounded bg-slate-200" />
      </div>
      <div className="mt-6 flex items-center">
        {[0, 1, 2].map((item) => <span key={item} className="-ml-2 size-8 rounded-full border-2 border-white bg-slate-100 first:ml-0" />)}
      </div>
      <div className="mt-5 h-4 w-40 rounded bg-slate-100" />
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
    ? 'text-slate-500'
    : balance > 0
      ? 'text-emerald-800'
      : balance < 0
        ? 'text-rose-700'
        : 'text-slate-500'
  const visibleMembers = members.slice(0, 4)

  return (
    <Link
      to={`/groups/${group.id}`}
      aria-label={`Open ${group.name}`}
      className="block min-h-48 rounded-md border border-slate-200 bg-white p-5 transition hover:border-emerald-300 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-md bg-emerald-50 text-emerald-800">
          <GroupTypeIcon type={group.type} size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-semibold text-slate-900">{group.name}</h2>
          <p className="mt-0.5 text-xs text-slate-500">{group.type ?? 'Other'}</p>
        </div>
      </div>

      <div className="mt-5 flex min-h-9 items-center">
        {visibleMembers.map((member, index) => (
          <Avatar
            key={member.id}
            name={member.name}
            size="sm"
            className={index > 0 ? '-ml-2 border-2 border-white' : 'border-2 border-white'}
          />
        ))}
        {members.length > 4 && (
          <span className="-ml-2 grid size-7 place-items-center rounded-full border-2 border-white bg-slate-100 text-[11px] font-semibold text-slate-600">
            +{members.length - 4}
          </span>
        )}
      </div>

      {balanceQuery.isLoading ? (
        <span aria-label="Loading group balance" className="mt-4 block h-4 w-32 animate-pulse rounded bg-slate-200" />
      ) : (
        <p className={`mt-4 text-sm font-medium ${balanceClass}`} aria-live="polite">
          {balanceMessage}
        </p>
      )}
    </Link>
  )
}