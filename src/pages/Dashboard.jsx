import { useState } from 'react'
import { Plus, WalletCards } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import BalanceSummary from '../components/balance/BalanceSummary.jsx'
import FriendBalanceList from '../components/balance/FriendBalanceList.jsx'
import SettleUpModal from '../components/balance/SettleUpModal.jsx'
import Button from '../components/common/Button.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import ExpenseForm from '../components/expense/ExpenseForm.jsx'
import { useBalances } from '../hooks/useBalances.js'
import { useAuth } from '../hooks/useAuth.js'
import { useFriends } from '../hooks/useFriends.js'

export default function Dashboard() {
	const { data, isLoading, isError, error, refetch } = useBalances()
	const { user } = useAuth()
	const navigate = useNavigate()
	const [settlementDefaults, setSettlementDefaults] = useState(null)
	const [expenseOpen, setExpenseOpen] = useState(false)
	const friendsQuery = useFriends()
	const pageError = error || friendsQuery.error
	const hasError = isError || friendsQuery.isError
	const firstName = user?.name?.trim().split(/\s+/)[0] || 'there'
	const friends = data?.perFriend ?? []
	const expenseMembers = [user, ...(friendsQuery.data ?? [])]
		.filter(Boolean)
		.filter((member, index, list) => list.findIndex(({ id }) => id === member.id) === index)

	return (
		<div className="mx-auto max-w-5xl">
			<header className="mb-7 flex flex-wrap items-center justify-between gap-4">
				<div>
					<p className="text-sm font-medium text-slate-500 dark:text-gray-400">Your shared expenses</p>
					<h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-gray-100">Hi, {firstName}</h1>
				</div>
				<div className="flex flex-wrap gap-2">
					<Button variant="secondary" onClick={() => setSettlementDefaults({})} disabled={!user}>
						<WalletCards aria-hidden="true" size={17} />
						Settle up
					</Button>
					<Button onClick={() => setExpenseOpen(true)} disabled={!user}>
						<Plus aria-hidden="true" size={17} />
						Add expense
					</Button>
				</div>
			</header>

			<BalanceSummary overall={data?.overall} loading={isLoading || isError} />

			<section className="mt-8">
				<div className="mb-3 flex items-center justify-between">
					<h2 className="text-lg font-semibold text-slate-900 dark:text-gray-100">Friends</h2>
					{!isLoading && !hasError && friends.length > 0 && (
						<Link to="/friends" className="text-sm font-medium text-emerald-800 dark:text-green-400 hover:text-emerald-950 dark:hover:text-green-400">
							View all
						</Link>
					)}
				</div>

				{isLoading || friendsQuery.isLoading ? (
					<div className="rounded-md border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900">
						<FriendBalanceList loading />
					</div>
				) : hasError ? (
					<div className="rounded-md border border-rose-200 dark:border-red-900 bg-rose-50 dark:bg-red-950/40 p-5">
						<p role="alert" className="text-sm text-rose-800 dark:text-red-400">
							{pageError?.message || 'Unable to load your balances.'}
						</p>
						<Button className="mt-4" variant="secondary" onClick={() => Promise.all([refetch(), friendsQuery.refetch()])}>
							Retry
						</Button>
					</div>
				) : friends.length === 0 ? (
					<div className="rounded-md border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900">
						<EmptyState
							title="No friends yet"
							message="Add friends to start keeping track of shared expenses."
							action={{ label: 'Add friends', onClick: () => navigate('/friends') }}
						/>
					</div>
				) : (
					<div className="rounded-md border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900">
						<FriendBalanceList
							friends={friends}
							onSettle={(friendBalance) => {
								const friendId = friendBalance.userId
								setSettlementDefaults({
									defaultPayerId: friendBalance.netBalance > 0 ? friendId : user?.id,
									defaultReceiverId: friendBalance.netBalance > 0 ? user?.id : friendId,
									defaultAmount: Math.abs(friendBalance.netBalance),
								})
							}}
						/>
					</div>
				)}
			</section>

			{settlementDefaults && (
				<SettleUpModal members={expenseMembers} groupId={null} {...settlementDefaults} onClose={() => setSettlementDefaults(null)} />
			)}
			{expenseOpen && <ExpenseForm members={expenseMembers} groupId={null} onClose={() => setExpenseOpen(false)} />}
		</div>
	)
}
