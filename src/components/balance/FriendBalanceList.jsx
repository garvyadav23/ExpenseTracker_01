import Avatar from '../common/Avatar.jsx'
import Button from '../common/Button.jsx'
import { formatCurrency } from '../../utils/formatCurrency.js'

function FriendBalanceSkeleton() {
  return (
    <div aria-hidden="true" className="flex animate-pulse items-center gap-3 px-4 py-4">
      <span className="size-10 rounded-full bg-slate-200" />
      <span className="flex-1">
        <span className="block h-4 w-28 rounded bg-slate-200" />
        <span className="mt-2 block h-3 w-40 max-w-full rounded bg-slate-100" />
      </span>
      <span className="h-9 w-20 rounded bg-slate-100" />
    </div>
  )
}

export default function FriendBalanceList({ friends = [], onSettle, loading = false }) {
  if (loading) {
    return (
      <div className="divide-y divide-slate-100">
        {[0, 1, 2].map((row) => <FriendBalanceSkeleton key={row} />)}
      </div>
    )
  }

  const sortedFriends = [...friends].sort(
    (first, second) => Math.abs(second.netBalance) - Math.abs(first.netBalance),
  )

  return (
    <ul className="divide-y divide-slate-100">
      {sortedFriends.map((friendBalance) => {
        const { user, userId, netBalance } = friendBalance
        const name = user?.name ?? 'Unknown friend'
        const balanceMessage = netBalance > 0
          ? `${name} owes you ${formatCurrency(netBalance)}`
          : netBalance < 0
            ? `You owe ${name} ${formatCurrency(Math.abs(netBalance))}`
            : 'Settled up'
        const balanceClass = netBalance > 0
          ? 'text-emerald-800'
          : netBalance < 0
            ? 'text-rose-700'
            : 'text-slate-500'

        return (
          <li key={userId} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <Avatar name={name} size="md" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{name}</p>
                <p className={`mt-0.5 text-sm ${balanceClass}`}>{balanceMessage}</p>
              </div>
            </div>
            {netBalance !== 0 && (
              <Button
                size="sm"
                variant="secondary"
                className="self-start sm:self-auto"
                aria-label={`Settle up with ${name}`}
                onClick={() => onSettle?.(friendBalance)}
              >
                Settle up
              </Button>
            )}
          </li>
        )
      })}
    </ul>
  )
}