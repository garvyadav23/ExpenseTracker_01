import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import Button from '../common/Button.jsx'
import Input from '../common/Input.jsx'
import Modal from '../common/Modal.jsx'
import Select from '../common/Select.jsx'
import Skeleton from '../common/Skeleton.jsx'
import EmptyState from '../common/EmptyState.jsx'
import { useFriends } from '../../hooks/useFriends.js'
import { useCreateGroup } from '../../hooks/useGroups.js'

const groupSchema = z.object({
  name: z.string().trim().min(2, 'Group name must be at least 2 characters.'),
  type: z.enum(['Trip', 'Home', 'Couple', 'Other']),
  memberIds: z.array(z.string()).min(1, 'Select at least one friend.'),
})

export default function CreateGroupModal({ open, onClose }) {
  const friendsQuery = useFriends()
  const createGroup = useCreateGroup()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(groupSchema),
    defaultValues: { name: '', type: 'Trip', memberIds: [] },
  })

  function submit(values) {
    createGroup.mutate({ name: values.name, type: values.type, memberIds: values.memberIds }, {
      onSuccess: () => {
        reset()
        onClose()
      },
    })
  }

  function close() {
    if (createGroup.isPending) return
    reset()
    onClose()
  }

  return (
    <Modal open={open} onClose={close} title="Create group">
      <form className="space-y-5" noValidate onSubmit={handleSubmit(submit)}>
        <Input
          label="Group name"
          placeholder="e.g. Weekend trip"
          autoComplete="off"
          error={errors.name?.message}
          {...register('name')}
        />

        <Select label="Group type" error={errors.type?.message} {...register('type')}>
          <option value="Trip">Trip</option>
          <option value="Home">Home</option>
          <option value="Couple">Couple</option>
          <option value="Other">Other</option>
        </Select>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-slate-700">Choose members</legend>
          {friendsQuery.isLoading ? (
            <div className="space-y-2" aria-label="Loading friends">
              {[0, 1, 2].map((item) => <Skeleton key={item} className="h-10 bg-slate-100" />)}
            </div>
          ) : friendsQuery.isError ? (
            <div>
              <p role="alert" className="text-sm text-rose-700">{friendsQuery.error.message}</p>
              <Button className="mt-3" variant="secondary" size="sm" onClick={() => friendsQuery.refetch()}>Retry</Button>
            </div>
          ) : friendsQuery.data?.length ? (
            <div className="max-h-52 divide-y divide-slate-100 overflow-y-auto rounded-md border border-slate-200">
              {friendsQuery.data.map((friend) => (
                <label key={friend.id} className="flex min-h-11 cursor-pointer items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                  <input
                    type="checkbox"
                    value={friend.id}
                    className="size-4 rounded border-slate-300 text-emerald-800 focus:ring-emerald-700"
                    {...register('memberIds')}
                  />
                  <span>{friend.name}</span>
                </label>
              ))}
            </div>
          ) : (
            <EmptyState title="No friends yet" message="Add a friend before creating a group." />
          )}
          {errors.memberIds?.message && <p className="text-sm text-rose-700">{errors.memberIds.message}</p>}
        </fieldset>

        <p className="text-xs text-slate-500">You will be added to the group automatically.</p>
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button type="button" variant="secondary" onClick={close}>Cancel</Button>
          <Button type="submit" loading={createGroup.isPending}>Create group</Button>
        </div>
      </form>
    </Modal>
  )
}