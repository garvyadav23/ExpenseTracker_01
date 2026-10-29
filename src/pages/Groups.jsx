import { useState } from 'react'
import { Plus } from 'lucide-react'
import CreateGroupModal from '../components/group/CreateGroupModal.jsx'
import GroupCard, { GroupCardSkeleton } from '../components/group/GroupCard.jsx'
import Button from '../components/common/Button.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { useFriends } from '../hooks/useFriends.js'
import { useGroups } from '../hooks/useGroups.js'

export default function Groups() {
	const [createOpen, setCreateOpen] = useState(false)
	const groupsQuery = useGroups()
	const friendsQuery = useFriends()
	const { user } = useAuth()
	const isLoading = groupsQuery.isLoading || friendsQuery.isLoading
	const isError = groupsQuery.isError || friendsQuery.isError
	const friendsById = Object.fromEntries((friendsQuery.data ?? []).map((friend) => [friend.id, friend]))
	if (user) friendsById[user.id] = user

	return (
		<div className="mx-auto max-w-6xl">
			<header className="mb-7 flex flex-wrap items-center justify-between gap-4">
				<div>
					<p className="text-sm font-medium text-slate-500">Shared expense spaces</p>
					<h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Groups</h1>
				</div>
				<Button onClick={() => setCreateOpen(true)}>
					<Plus aria-hidden="true" size={17} />
					Create group
				</Button>
			</header>

			{isLoading ? (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{[0, 1, 2].map((item) => <GroupCardSkeleton key={item} />)}
				</div>
			) : isError ? (
				<div className="rounded-md border border-rose-200 bg-rose-50 p-5">
					<p role="alert" className="text-sm text-rose-800">{groupsQuery.error?.message || friendsQuery.error?.message || 'Unable to load groups.'}</p>
					<Button className="mt-4" variant="secondary" onClick={() => Promise.all([groupsQuery.refetch(), friendsQuery.refetch()])}>Retry</Button>
				</div>
			) : groupsQuery.data?.length === 0 ? (
				<div className="rounded-md border border-slate-200 bg-white">
					<EmptyState
						title="No groups yet"
						message="Create a group to keep shared expenses organized."
						action={{ label: 'Create group', onClick: () => setCreateOpen(true) }}
					/>
				</div>
			) : (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{groupsQuery.data.map((group) => {
						const members = group.memberIds
							.map((memberId) => friendsById[memberId] ?? { id: memberId, name: 'Unknown member' })
						return <GroupCard key={group.id} group={group} members={members} />
					})}
				</div>
			)}

			<CreateGroupModal open={createOpen} onClose={() => setCreateOpen(false)} />
		</div>
	)
}
