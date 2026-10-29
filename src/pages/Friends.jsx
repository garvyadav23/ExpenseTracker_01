import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserPlus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import Avatar from '../components/common/Avatar.jsx'
import Button from '../components/common/Button.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import Input from '../components/common/Input.jsx'
import Modal from '../components/common/Modal.jsx'
import SettleUpModal from '../components/balance/SettleUpModal.jsx'
import { useAddFriend, useFriends } from '../hooks/useFriends.js'
import { useBalances } from '../hooks/useBalances.js'
import { useAuth } from '../hooks/useAuth.js'
import { formatCurrency } from '../utils/formatCurrency.js'

const addFriendSchema = z.object({ email: z.email('Enter a valid email address.') })

function AddFriendModal({ onClose }) {
	const addFriend = useAddFriend()
	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm({
		resolver: zodResolver(addFriendSchema),
		mode: 'onChange',
		defaultValues: { email: '' },
	})

	const submit = handleSubmit(({ email }) => {
		addFriend.mutate({ email: email.trim() }, { onSuccess: onClose })
	})

	return (
		<Modal open onClose={addFriend.isPending ? () => {} : onClose} title="Add a friend">
			<form className="space-y-5" noValidate onSubmit={submit}>
				<Input label="Email address" type="email" autoComplete="email" placeholder="friend@example.com" error={errors.email?.message} {...register('email')} />
				<div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
					<Button type="button" variant="secondary" onClick={onClose} disabled={addFriend.isPending}>Cancel</Button>
					<Button type="submit" loading={addFriend.isPending} disabled={!isValid}>Add friend</Button>
				</div>
			</form>
		</Modal>
	)
}

function FriendSkeleton() {
	return (
		<li aria-hidden="true" className="flex animate-pulse items-center gap-3 px-4 py-4">
			<span className="size-10 rounded-full bg-slate-200" />
			<span className="flex-1 space-y-2">
				<span className="block h-4 w-32 rounded bg-slate-200" />
				<span className="block h-3 w-44 max-w-full rounded bg-slate-100" />
			</span>
			<span className="h-9 w-20 rounded bg-slate-100" />
		</li>
	)
}

export default function Friends() {
	const [addFriendOpen, setAddFriendOpen] = useState(false)
	const [settlementDefaults, setSettlementDefaults] = useState(null)
	const balancesQuery = useBalances()
	const friendsQuery = useFriends()
	const { user } = useAuth()
	const friends = balancesQuery.data?.perFriend ?? []
	const members = [user, ...(friendsQuery.data ?? [])].filter(Boolean)
	const isLoading = balancesQuery.isLoading || friendsQuery.isLoading
	const isError = balancesQuery.isError || friendsQuery.isError

	function openSettlement(friendBalance) {
		const friendId = friendBalance.userId
		setSettlementDefaults({
			defaultPayerId: friendBalance.netBalance > 0 ? friendId : user?.id,
			defaultReceiverId: friendBalance.netBalance > 0 ? user?.id : friendId,
			defaultAmount: Math.abs(friendBalance.netBalance),
		})
	}

	return (
		<div className="mx-auto max-w-5xl">
			<header className="mb-7 flex flex-wrap items-center justify-between gap-4">
				<div>
					<p className="text-sm font-medium text-slate-500">People you share expenses with</p>
					<h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Friends</h1>
				</div>
				<Button onClick={() => setAddFriendOpen(true)}><UserPlus aria-hidden="true" size={17} /> Add friend</Button>
			</header>

			{isLoading ? (
				<div className="rounded-md border border-slate-200 bg-white">
					<ul className="divide-y divide-slate-100">{[0, 1, 2].map((row) => <FriendSkeleton key={row} />)}</ul>
				</div>
			) : isError ? (
				<div className="rounded-md border border-rose-200 bg-rose-50 p-5">
					<p role="alert" className="text-sm text-rose-800">{balancesQuery.error?.message || friendsQuery.error?.message || 'Unable to load your friends.'}</p>
					<Button className="mt-4" variant="secondary" onClick={() => Promise.all([balancesQuery.refetch(), friendsQuery.refetch()])}>Retry</Button>
				</div>
			) : friends.length === 0 ? (
				<div className="rounded-md border border-slate-200 bg-white">
					<EmptyState title="No friends yet" message="Add a friend to start tracking shared expenses." action={{ label: 'Add friend', onClick: () => setAddFriendOpen(true) }} />
				</div>
			) : (
				<div className="rounded-md border border-slate-200 bg-white">
					<ul className="divide-y divide-slate-100">
						{friends.map(({ user: friend, userId, netBalance }) => {
							const name = friend?.name ?? 'Unknown friend'
							const balanceText = netBalance > 0
								? `Owes you ${formatCurrency(netBalance)}`
								: netBalance < 0
									? `You owe ${formatCurrency(Math.abs(netBalance))}`
									: 'Settled up'
							const balanceClass = netBalance > 0 ? 'text-emerald-800' : netBalance < 0 ? 'text-rose-700' : 'text-slate-500'
							return (
								<li key={userId} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center">
									<div className="flex min-w-0 flex-1 items-center gap-3">
										<Avatar name={name} />
										<div className="min-w-0">
											<p className="truncate text-sm font-semibold text-slate-900">{name}</p>
											<p className="truncate text-sm text-slate-500">{friend?.email || 'No email available'}</p>
											<p className={`mt-1 text-sm font-medium ${balanceClass}`}>{balanceText}</p>
										</div>
									</div>
									{netBalance !== 0 && (
										<Button size="sm" variant="secondary" className="self-start sm:self-auto" onClick={() => openSettlement({ userId, netBalance })}>Settle up</Button>
									)}
								</li>
							)
						})}
					</ul>
				</div>
			)}

			{addFriendOpen && <AddFriendModal onClose={() => setAddFriendOpen(false)} />}
			{settlementDefaults && <SettleUpModal members={members} groupId={null} {...settlementDefaults} onClose={() => setSettlementDefaults(null)} />}
		</div>
	)
}
