import { useMemo } from 'react'
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns'
import { CircleDollarSign, FolderPlus, ReceiptText, Trash2, UserPlus } from 'lucide-react'
import Button from '../components/common/Button.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import Skeleton from '../components/common/Skeleton.jsx'
import { useActivities } from '../hooks/useActivities.js'

const activityTypes = {
	'expense.created': { icon: ReceiptText, label: 'Expense added', className: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-green-400' },
	'expense.updated': { icon: ReceiptText, label: 'Expense updated', className: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-green-400' },
	'expense.deleted': { icon: Trash2, label: 'Expense deleted', className: 'bg-rose-50 dark:bg-red-950/40 text-rose-700 dark:text-red-400' },
	'settlement.created': { icon: CircleDollarSign, label: 'Settlement', className: 'bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300' },
	'group.created': { icon: FolderPlus, label: 'Group created', className: 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300' },
	'friend.added': { icon: UserPlus, label: 'Friend added', className: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-300' },
}

function dateHeading(date) {
	if (isToday(date)) return 'Today'
	if (isYesterday(date)) return 'Yesterday'
	return format(date, 'd MMM yyyy')
}

function ActivitySkeleton() {
	return (
		<div aria-hidden="true" className="flex gap-4 py-5">
			<Skeleton className="size-10 rounded-full" />
			<span className="flex-1 space-y-2 pt-1">
				<Skeleton className="block h-4 w-3/4" />
				<Skeleton className="block h-3 w-28 bg-slate-100 dark:bg-gray-800" />
			</span>
		</div>
	)
}

export default function Activity() {
	const { data = [], isLoading, isError, error, refetch } = useActivities()
	const groupedActivities = useMemo(() => {
		const sorted = [...data].sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt))
		return sorted.reduce((groups, activity) => {
			const heading = dateHeading(new Date(activity.createdAt))
			groups.set(heading, [...(groups.get(heading) ?? []), activity])
			return groups
		}, new Map())
	}, [data])

	return (
		<div className="mx-auto max-w-4xl">
			<header className="mb-7">
				<p className="text-sm font-medium text-slate-500 dark:text-gray-400">A timeline of shared expenses</p>
				<h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-gray-100">Activity</h1>
			</header>

			{isLoading ? (
				<div className="divide-y divide-slate-100 dark:divide-gray-800 rounded-md border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-5">
					{[0, 1, 2, 3].map((row) => <ActivitySkeleton key={row} />)}
				</div>
			) : isError ? (
				<div className="rounded-md border border-rose-200 dark:border-red-900 bg-rose-50 dark:bg-red-950/40 p-5">
					<p role="alert" className="text-sm text-rose-800 dark:text-red-400">{error?.message || 'Unable to load activity.'}</p>
					<Button className="mt-4" variant="secondary" onClick={() => refetch()}>Retry</Button>
				</div>
			) : groupedActivities.size === 0 ? (
				<div className="rounded-md border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900">
					<EmptyState title="No activity yet" message="Shared expenses, settlements, and new groups will show up here." />
				</div>
			) : (
				<div className="space-y-7">
					{[...groupedActivities].map(([heading, activities]) => (
						<section key={heading}>
							<h2 className="mb-2 text-sm font-semibold text-slate-700 dark:text-gray-300">{heading}</h2>
							<ul className="divide-y divide-slate-100 dark:divide-gray-800 rounded-md border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 sm:px-5">
								{activities.map((activity) => {
									const type = activityTypes[activity.type] ?? activityTypes['expense.created']
									const Icon = type.icon
									return (
										<li key={activity.id} className="flex items-start gap-3 py-4">
											<span className={`grid size-10 shrink-0 place-items-center rounded-full ${type.className}`} title={type.label}>
												<Icon aria-hidden="true" size={18} />
											</span>
											<div className="min-w-0 flex-1">
												<p className="text-sm leading-6 text-slate-800 dark:text-gray-200">{activity.message}</p>
												<p className="mt-1 text-xs text-slate-500 dark:text-gray-400">{formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}</p>
											</div>
										</li>
									)
								})}
							</ul>
						</section>
					))}
				</div>
			)}
		</div>
	)
}
