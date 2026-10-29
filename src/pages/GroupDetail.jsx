import { useState } from 'react'
import { ArrowLeft, Plus } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import ExpenseCard from '../components/expense/ExpenseCard.jsx'
import ExpenseForm from '../components/expense/ExpenseForm.jsx'
import SettleUpModal from '../components/balance/SettleUpModal.jsx'
import MemberList from '../components/group/MemberList.jsx'
import GroupTypeIcon from '../components/group/GroupTypeIcon.jsx'
import Button from '../components/common/Button.jsx'
import ConfirmDialog from '../components/common/ConfirmDialog.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { useGroupBalances } from '../hooks/useBalances.js'
import { useDeleteExpense, useGroupExpenses } from '../hooks/useExpenses.js'
import { useFriends } from '../hooks/useFriends.js'
import { useGroup } from '../hooks/useGroups.js'
import { formatCurrency } from '../utils/formatCurrency.js'

export default function GroupDetail() {
	const { id } = useParams()
	const groupQuery = useGroup(id)
	const expensesQuery = useGroupExpenses(id)
	const balancesQuery = useGroupBalances(id)
	const friendsQuery = useFriends()
	const deleteExpense = useDeleteExpense()
	const { user } = useAuth()
	const [expenseToDelete, setExpenseToDelete] = useState(null)
	const [expenseFormOpen, setExpenseFormOpen] = useState(false)
	const [settlementDefaults, setSettlementDefaults] = useState(null)
	const isLoading = groupQuery.isLoading || expensesQuery.isLoading || balancesQuery.isLoading || friendsQuery.isLoading
	const isError = groupQuery.isError || expensesQuery.isError || balancesQuery.isError || friendsQuery.isError

	if (groupQuery.isSuccess && !groupQuery.data) {
		return (
			<div className="mx-auto grid min-h-[50vh] max-w-4xl place-content-center text-center">
				<p className="text-sm font-semibold uppercase tracking-wide text-emerald-800">404</p>
				<h1 className="mt-2 text-2xl font-semibold text-slate-900">Group not found</h1>
				<p className="mt-2 text-sm text-slate-600">This group may have been removed or the link is incorrect.</p>
				<Link to="/groups" className="mx-auto mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 hover:text-emerald-950">
					<ArrowLeft size={16} /> Back to groups
				</Link>
			</div>
		)
	}

	if (isLoading) {
		return (
			<div className="mx-auto max-w-6xl animate-pulse space-y-7">
				<div className="h-10 w-64 rounded bg-slate-200" />
				<div className="grid gap-6 lg:grid-cols-3">
					<div className="space-y-3 lg:col-span-2">{[0, 1, 2].map((item) => <div key={item} className="h-28 rounded-md bg-slate-200" />)}</div>
					<div className="space-y-4"><div className="h-52 rounded-md bg-slate-200" /><div className="h-44 rounded-md bg-slate-200" /></div>
				</div>
			</div>
		)
	}

	if (isError) {
		const retry = () => Promise.all([
			groupQuery.refetch(),
			expensesQuery.refetch(),
			balancesQuery.refetch(),
			friendsQuery.refetch(),
		])
		const message = groupQuery.error?.message || expensesQuery.error?.message || balancesQuery.error?.message || friendsQuery.error?.message
		return (
			<div className="mx-auto max-w-4xl rounded-md border border-rose-200 bg-rose-50 p-5">
				<h1 className="text-lg font-semibold text-slate-900">Unable to load this group</h1>
				<p role="alert" className="mt-2 text-sm text-rose-800">{message}</p>
				<Button className="mt-4" variant="secondary" onClick={retry}>Retry</Button>
			</div>
		)
	}

	const group = groupQuery.data
	const usersById = Object.fromEntries((friendsQuery.data ?? []).map((friend) => [friend.id, friend]))
	if (user) usersById[user.id] = user
	const members = group.memberIds.map((memberId) => usersById[memberId] ?? { id: memberId, name: 'Unknown member' })
	const membersById = Object.fromEntries(members.map((member) => [member.id, member]))
	const expenses = (expensesQuery.data ?? [])
		.filter((expense) => !expense.deleted)
		.sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt))
	const memberBalances = balancesQuery.data?.memberBalances ?? []
	const sortedMemberBalances = [...memberBalances].sort((first, second) => Math.abs(second.netBalance) - Math.abs(first.netBalance))

	function confirmDelete() {
		if (!expenseToDelete) return
		deleteExpense.mutate(expenseToDelete.id, { onSuccess: () => setExpenseToDelete(null) })
	}

	return (
		<div className="mx-auto max-w-6xl">
			<header className="mb-7 flex flex-wrap items-center justify-between gap-4">
				<div className="flex min-w-0 items-center gap-3">
					<span className="grid size-11 shrink-0 place-items-center rounded-md bg-emerald-50 text-emerald-800">
						<GroupTypeIcon type={group.type} size={22} />
					</span>
					<div className="min-w-0">
						<p className="text-xs font-medium text-slate-500">{group.type ?? 'Other'}</p>
						<h1 className="truncate text-2xl font-semibold tracking-tight text-slate-900">{group.name}</h1>
					</div>
				</div>
				<div className="flex flex-wrap gap-2">
					<Button onClick={() => setExpenseFormOpen(true)}><Plus aria-hidden="true" size={17} /> Add expense</Button>
					<Button variant="secondary" onClick={() => setSettlementDefaults({})}>Settle up</Button>
				</div>
			</header>

			<div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
				<section className="min-w-0 lg:col-span-2">
					<h2 className="mb-3 text-lg font-semibold text-slate-900">Expenses</h2>
					{expenses.length === 0 ? (
						<div className="rounded-md border border-slate-200 bg-white">
							<EmptyState
								title="No expenses yet"
								message="Expenses added to this group will appear here."
								action={{ label: 'Add expense', onClick: () => setExpenseFormOpen(true) }}
							/>
						</div>
					) : (
						<div className="space-y-3">
							{expenses.map((expense) => (
								<ExpenseCard key={expense.id} expense={expense} usersById={usersById} onDelete={setExpenseToDelete} />
							))}
						</div>
					)}
				</section>

				<aside className="space-y-5">
					<section className="rounded-md border border-slate-200 bg-white">
						<h2 className="border-b border-slate-100 px-4 py-3 text-base font-semibold text-slate-900">Balances</h2>
						{sortedMemberBalances.length === 0 ? (
							<p className="px-4 py-5 text-sm text-slate-500">No balances to show.</p>
						) : (
						<ul className="divide-y divide-slate-100">
							{sortedMemberBalances.map(({ userId, netBalance }) => {
								const name = membersById[userId]?.name ?? 'Unknown member'
								const balanceMessage = netBalance > 0
									? `${name} gets back ${formatCurrency(netBalance)}`
									: netBalance < 0
										? `${name} owes ${formatCurrency(Math.abs(netBalance))}`
										: `${name} is settled up`
								const color = netBalance > 0 ? 'text-emerald-800' : netBalance < 0 ? 'text-rose-700' : 'text-slate-500'
								return (
									<li key={userId}>
										<button
											type="button"
											disabled={userId === user?.id || netBalance === 0}
											onClick={() => setSettlementDefaults({
												defaultPayerId: netBalance > 0 ? user?.id : userId,
												defaultReceiverId: netBalance > 0 ? userId : user?.id,
												defaultAmount: Math.abs(netBalance),
											})}
											className={`w-full px-4 py-3 text-left text-sm font-medium hover:bg-slate-50 disabled:cursor-default disabled:hover:bg-white ${color}`}
											aria-label={`Settle ${balanceMessage}`}
										>
											{balanceMessage}
										</button>
									</li>
								)
							})}
						</ul>
						)}
					</section>

					<section className="rounded-md border border-slate-200 bg-white">
						<h2 className="border-b border-slate-100 px-4 py-3 text-base font-semibold text-slate-900">Members</h2>
						<MemberList members={members} currentUserId={user?.id} />
					</section>
				</aside>
			</div>

			<ConfirmDialog
				open={Boolean(expenseToDelete)}
				onClose={() => setExpenseToDelete(null)}
				onConfirm={confirmDelete}
				title="Delete expense?"
				message={expenseToDelete ? `Delete ${expenseToDelete.description}? This action cannot be undone.` : ''}
				confirmText="Delete expense"
				danger
				loading={deleteExpense.isPending}
			/>
			{expenseFormOpen && (
				<ExpenseForm members={members} groupId={group.id} onClose={() => setExpenseFormOpen(false)} />
			)}
			{settlementDefaults && (
				<SettleUpModal members={members} groupId={group.id} {...settlementDefaults} onClose={() => setSettlementDefaults(null)} />
			)}
		</div>
	)
}
