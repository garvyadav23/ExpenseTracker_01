import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useParams } from 'react-router-dom'
import ExpenseCard from '../components/expense/ExpenseCard.jsx'
import ExpenseForm from '../components/expense/ExpenseForm.jsx'
import SettleUpModal from '../components/balance/SettleUpModal.jsx'
import MemberList from '../components/group/MemberList.jsx'
import GroupTypeIcon from '../components/group/GroupTypeIcon.jsx'
import Button from '../components/common/Button.jsx'
import ConfirmDialog from '../components/common/ConfirmDialog.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import NotFoundPage from '../components/common/NotFoundPage.jsx'
import Skeleton from '../components/common/Skeleton.jsx'
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
	const [expenseToEdit, setExpenseToEdit] = useState(null)
	const [expenseFormOpen, setExpenseFormOpen] = useState(false)
	const [settlementDefaults, setSettlementDefaults] = useState(null)
	const isLoading = groupQuery.isLoading || expensesQuery.isLoading || balancesQuery.isLoading || friendsQuery.isLoading
	const isError = groupQuery.isError || expensesQuery.isError || balancesQuery.isError || friendsQuery.isError

	if (groupQuery.isSuccess && !groupQuery.data) {
		return <NotFoundPage embedded />
	}

	if (isLoading) {
		return (
			<div className="mx-auto max-w-6xl space-y-7">
				<Skeleton className="h-10 w-64" />
				<div className="grid gap-6 lg:grid-cols-3">
					<div className="space-y-3 lg:col-span-2">{[0, 1, 2].map((item) => <Skeleton key={item} className="h-28 rounded-md" />)}</div>
					<div className="space-y-4"><Skeleton className="h-52 rounded-md" /><Skeleton className="h-44 rounded-md" /></div>
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
			<div className="mx-auto max-w-4xl rounded-md border border-rose-200 dark:border-red-900 bg-rose-50 dark:bg-red-950/40 p-5">
				<h1 className="text-lg font-semibold text-slate-900 dark:text-gray-100">Unable to load this group</h1>
				<p role="alert" className="mt-2 text-sm text-rose-800 dark:text-red-400">{message}</p>
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
					<span className="grid size-11 shrink-0 place-items-center rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-green-400">
						<GroupTypeIcon type={group.type} size={22} />
					</span>
					<div className="min-w-0">
						<p className="text-xs font-medium text-slate-500 dark:text-gray-400">{group.type ?? 'Other'}</p>
						<h1 className="truncate text-2xl font-semibold tracking-tight text-slate-900 dark:text-gray-100">{group.name}</h1>
					</div>
				</div>
				<div className="flex flex-wrap gap-2">
					<Button onClick={() => setExpenseFormOpen(true)}><Plus aria-hidden="true" size={17} /> Add expense</Button>
					<Button variant="secondary" onClick={() => setSettlementDefaults({})}>Settle up</Button>
				</div>
			</header>

			<div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
				<section className="min-w-0 lg:col-span-2">
					<h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-gray-100">Expenses</h2>
					{expenses.length === 0 ? (
						<div className="rounded-md border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900">
							<EmptyState
								title="No expenses yet"
								message="Expenses added to this group will appear here."
								action={{ label: 'Add expense', onClick: () => setExpenseFormOpen(true) }}
							/>
						</div>
					) : (
						<div className="space-y-3">
							{expenses.map((expense) => (
								<ExpenseCard key={expense.id} expense={expense} usersById={usersById} onEdit={setExpenseToEdit} onDelete={setExpenseToDelete} />
							))}
						</div>
					)}
				</section>

				<aside className="space-y-5">
					<section className="rounded-md border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900">
						<h2 className="border-b border-slate-100 dark:border-gray-800 px-4 py-3 text-base font-semibold text-slate-900 dark:text-gray-100">Balances</h2>
						{sortedMemberBalances.length === 0 ? (
							<EmptyState title="No balances" message="There are no balances to show for this group." />
						) : (
						<ul className="divide-y divide-slate-100 dark:divide-gray-800">
							{sortedMemberBalances.map(({ userId, netBalance }) => {
								const name = membersById[userId]?.name ?? 'Unknown member'
								const balanceMessage = netBalance > 0
									? `${name} gets back ${formatCurrency(netBalance)}`
									: netBalance < 0
										? `${name} owes ${formatCurrency(Math.abs(netBalance))}`
										: `${name} is settled up`
								const color = netBalance > 0 ? 'text-emerald-800 dark:text-green-400' : netBalance < 0 ? 'text-rose-700 dark:text-red-400' : 'text-slate-500 dark:text-gray-400'
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
											className={`min-h-11 w-full px-4 py-3 text-left text-sm font-medium hover:bg-slate-50 dark:hover:bg-gray-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-700 dark:focus-visible:ring-emerald-400 disabled:cursor-default disabled:hover:bg-white dark:disabled:hover:bg-gray-900 ${color}`}
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

					<section className="rounded-md border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900">
						<h2 className="border-b border-slate-100 dark:border-gray-800 px-4 py-3 text-base font-semibold text-slate-900 dark:text-gray-100">Members</h2>
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
			{expenseToEdit && (
				<ExpenseForm members={members} groupId={group.id} initialValues={expenseToEdit} onClose={() => setExpenseToEdit(null)} />
			)}
			{settlementDefaults && (
				<SettleUpModal members={members} groupId={group.id} {...settlementDefaults} onClose={() => setSettlementDefaults(null)} />
			)}
		</div>
	)
}
