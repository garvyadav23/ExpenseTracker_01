import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import BalanceSummary from '../components/balance/BalanceSummary.jsx'
import FriendBalanceList from '../components/balance/FriendBalanceList.jsx'
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
	const [selectedFriend, setSelectedFriend] = useState(null)
	const [expenseOpen, setExpenseOpen] = useState(false)
	const friendsQuery = useFriends()
	const firstName = user?.name?.trim().split(/\s+/)[0] || 'there'
	const friends = data?.perFriend ?? []
	const expenseMembers = [user, ...(friendsQuery.data ?? [])]
		.filter(Boolean)
		.filter((member, index, list) => list.findIndex(({ id }) => id === member.id) === index)

	return (
		<div className="mx-auto max-w-5xl">
			<header className="mb-7 flex flex-wrap items-center justify-between gap-4">
				<div>
					<p className="text-sm font-medium text-slate-500">Your shared expenses</p>
					<h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Hi, {firstName}</h1>
				</div>
				<Button onClick={() => setExpenseOpen(true)} disabled={!user}>
					<Plus aria-hidden="true" size={17} />
					Add expense
				</Button>
			</header>

			<BalanceSummary overall={data?.overall} loading={isLoading || isError} />

			<section className="mt-8">
				<div className="mb-3 flex items-center justify-between">
					<h2 className="text-lg font-semibold text-slate-900">Friends</h2>
					{!isLoading && !isError && friends.length > 0 && (
						<Link to="/friends" className="text-sm font-medium text-emerald-800 hover:text-emerald-950">
							View all
						</Link>
					)}
				</div>

				{isLoading ? (
					<div className="rounded-md border border-slate-200 bg-white">
						<FriendBalanceList loading />
					</div>
				) : isError ? (
					<div className="rounded-md border border-rose-200 bg-rose-50 p-5">
						<p role="alert" className="text-sm text-rose-800">
							{error?.message || 'Unable to load your balances.'}
						</p>
						<Button className="mt-4" variant="secondary" onClick={() => refetch()}>
							Retry
						</Button>
					</div>
				) : friends.length === 0 ? (
					<div className="rounded-md border border-slate-200 bg-white">
						<EmptyState
							title="No friends yet"
							message="Add friends to start keeping track of shared expenses."
							action={{ label: 'Add friends', onClick: () => navigate('/friends') }}
						/>
					</div>
				) : (
					<div className="rounded-md border border-slate-200 bg-white">
						<FriendBalanceList friends={friends} onSettle={setSelectedFriend} />
					</div>
				)}

				{selectedFriend && (
					<p className="sr-only" role="status">Selected {selectedFriend.user?.name} to settle up.</p>
				)}
			</section>

				{expenseOpen && (
					<ExpenseForm members={expenseMembers} groupId={null} onClose={() => setExpenseOpen(false)} />
				)}
		</div>
	)
}
