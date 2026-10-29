import { useCallback, useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import Button from '../common/Button.jsx'
import EmptyState from '../common/EmptyState.jsx'
import Input from '../common/Input.jsx'
import Modal from '../common/Modal.jsx'
import Select from '../common/Select.jsx'
import { useCreateExpense, useUpdateExpense } from '../../hooks/useExpenses.js'
import SplitSelector from './SplitSelector.jsx'

const expenseSchema = z.object({
  description: z.string().trim().min(1, 'Description is required.'),
  amount: z.coerce.number()
    .gt(0, 'Amount must be greater than zero.')
    .refine((amount) => {
      const paise = amount * 100
      return Number.isSafeInteger(Math.round(paise)) && Math.abs(paise - Math.round(paise)) <= 1e-8
    }, 'Amount can have at most two decimal places.'),
  date: z.iso.date().refine((date) => date <= format(new Date(), 'yyyy-MM-dd'), 'Date cannot be in the future.'),
  paidBy: z.string().min(1, 'Choose who paid.'),
  participantIds: z.array(z.string()).min(1, 'Choose at least one participant.'),
})

function defaultDate() {
  return format(new Date(), 'yyyy-MM-dd')
}

export default function ExpenseForm({ members = [], groupId = null, onClose, initialValues }) {
  const createExpense = useCreateExpense()
  const updateExpense = useUpdateExpense()
  const mutation = initialValues?.id ? updateExpense : createExpense
  const defaults = {
    description: initialValues?.description ?? '',
    amount: initialValues?.amount ?? '',
    date: initialValues?.date ?? (initialValues?.createdAt ? format(new Date(initialValues.createdAt), 'yyyy-MM-dd') : defaultDate()),
    paidBy: initialValues?.paidBy ?? members[0]?.id ?? '',
    participantIds: initialValues?.splits?.map(({ userId }) => userId) ?? members.map(({ id }) => id),
  }
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(expenseSchema),
    mode: 'onChange',
    defaultValues: defaults,
  })
  const [splitResult, setSplitResult] = useState({ valid: false, splits: [], error: 'Choose a split method.' })
  const participantIds = useWatch({ control, name: 'participantIds' })
  const amount = Number(useWatch({ control, name: 'amount' })) || 0
  const participants = useMemo(
    () => members.filter((member) => (participantIds ?? []).includes(member.id)),
    [members, participantIds],
  )
  const today = defaultDate()

  const handleSplitChange = useCallback((result) => setSplitResult(result), [])

  const submit = handleSubmit((values) => {
    if (!splitResult.valid) return
    const input = {
      groupId,
      description: values.description.trim(),
      amount: values.amount,
      date: values.date,
      paidBy: values.paidBy,
      splitType: splitResult.splitType,
      splits: splitResult.splits,
    }
    if (initialValues?.id) {
      updateExpense.mutate({ id: initialValues.id, input }, { onSuccess: onClose })
    } else {
      createExpense.mutate(input, { onSuccess: onClose })
    }
  })

  return (
    <Modal open onClose={mutation.isPending ? () => {} : onClose} title={initialValues ? 'Edit expense' : 'Add expense'} className="sm:max-w-2xl">
      <form className="space-y-5" noValidate onSubmit={submit}>
        <Input
          label="Description"
          placeholder="What was this expense for?"
          autoComplete="off"
          error={errors.description?.message}
          {...register('description')}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Amount"
            type="number"
            min="0.01"
            step="0.01"
            inputMode="decimal"
            placeholder="0.00"
            error={errors.amount?.message}
            {...register('amount')}
          />
          <Input
            label="Date"
            type="date"
            max={today}
            error={errors.date?.message}
            {...register('date')}
          />
        </div>

        <Select label="Paid by" error={errors.paidBy?.message} {...register('paidBy')}>
          <option value="">Choose a member</option>
          {members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
        </Select>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-slate-700 dark:text-gray-300">Participants</legend>
          {members.length === 0 ? <EmptyState title="No participants" message="Add members before creating an expense." /> : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {members.map((member) => (
              <label key={member.id} className="flex min-h-10 cursor-pointer items-center gap-3 rounded-md border border-slate-200 dark:border-gray-800 px-3 py-2 text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-950">
                <input
                  type="checkbox"
                  value={member.id}
                  className="size-4 rounded border-slate-300 dark:border-gray-700 text-emerald-800 dark:text-green-400 focus:ring-emerald-700 dark:focus:ring-emerald-400"
                  {...register('participantIds')}
                />
                {member.name}
              </label>
            ))}
          </div>
          )}
          {errors.participantIds?.message && <p className="text-sm text-rose-700 dark:text-red-400">{errors.participantIds.message}</p>}
        </fieldset>

        <SplitSelector
          totalAmount={amount}
          participants={participants}
          initialSplitType={initialValues?.splitType}
          initialSplits={initialValues?.splits}
          onChange={handleSplitChange}
        />

        <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-gray-800 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={mutation.isPending}>Cancel</Button>
          <Button type="submit" loading={mutation.isPending} disabled={!isValid || !splitResult.valid || participants.length === 0}>
            {initialValues ? 'Save changes' : 'Save expense'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}