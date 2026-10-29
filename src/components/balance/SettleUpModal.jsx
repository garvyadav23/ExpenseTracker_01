import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useAuth } from '../../hooks/useAuth.js'
import { useCreateSettlement } from '../../hooks/useBalances.js'
import Button from '../common/Button.jsx'
import EmptyState from '../common/EmptyState.jsx'
import Input from '../common/Input.jsx'
import Modal from '../common/Modal.jsx'
import Select from '../common/Select.jsx'

const settlementSchema = z.object({
	paidBy: z.string().min(1, 'Choose who is paying.'),
	receivedBy: z.string().min(1, 'Choose who is receiving.'),
	amount: z.coerce.number()
		.gt(0, 'Amount must be greater than zero.')
		.refine((amount) => Math.abs(amount * 100 - Math.round(amount * 100)) <= 1e-8, 'Amount can have at most two decimal places.'),
	date: z.iso.date(),
	note: z.string().trim(),
}).refine((values) => values.paidBy !== values.receivedBy, {
	message: 'Payer and receiver must be different.',
	path: ['receivedBy'],
})

export default function SettleUpModal({
	members = [],
	groupId = null,
	defaultPayerId,
	defaultReceiverId,
	defaultAmount,
	onClose,
}) {
	const { user } = useAuth()
	const createSettlement = useCreateSettlement()
	const uniqueMembers = members.filter((member, index, list) =>
		member?.id && list.findIndex((candidate) => candidate.id === member.id) === index,
	)
	const payerId = uniqueMembers.some(({ id }) => id === defaultPayerId)
		? defaultPayerId
		: uniqueMembers.find(({ id }) => id === user?.id)?.id ?? uniqueMembers[0]?.id ?? ''
	const receiverId = uniqueMembers.some(({ id }) => id === defaultReceiverId && id !== payerId)
		? defaultReceiverId
		: uniqueMembers.find(({ id }) => id !== payerId)?.id ?? ''
	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm({
		resolver: zodResolver(settlementSchema),
		mode: 'onChange',
		defaultValues: {
			paidBy: payerId,
			receivedBy: receiverId,
			amount: defaultAmount ?? '',
			date: format(new Date(), 'yyyy-MM-dd'),
			note: '',
		},
	})

	const submit = handleSubmit((values) => {
		createSettlement.mutate({
			groupId,
			paidBy: values.paidBy,
			receivedBy: values.receivedBy,
			amount: values.amount,
			date: values.date,
			note: values.note,
		}, { onSuccess: onClose })
	})

	return (
		<Modal open onClose={createSettlement.isPending ? () => {} : onClose} title="Settle up">
			{uniqueMembers.length < 2 ? (
				<EmptyState title="Not enough members" message="At least two members are needed to record a settlement." />
			) : (
				<form className="space-y-5" noValidate onSubmit={submit}>
					<Select label="Who is paying" error={errors.paidBy?.message} {...register('paidBy')}>
						{uniqueMembers.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
					</Select>
					<Select label="Who is receiving" error={errors.receivedBy?.message} {...register('receivedBy')}>
						{uniqueMembers.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
					</Select>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<Input label="Amount" type="number" min="0.01" step="0.01" inputMode="decimal" placeholder="0.00" error={errors.amount?.message} {...register('amount')} />
						<Input label="Date" type="date" error={errors.date?.message} {...register('date')} />
					</div>
					<Input label="Note (optional)" placeholder="Add a note" autoComplete="off" {...register('note')} />
					<div className="flex justify-end gap-2 border-t border-slate-100 dark:border-gray-800 pt-4">
						<Button type="button" variant="secondary" onClick={onClose} disabled={createSettlement.isPending}>Cancel</Button>
						<Button type="submit" loading={createSettlement.isPending} disabled={!isValid}>Record settlement</Button>
					</div>
				</form>
			)}
		</Modal>
	)
}