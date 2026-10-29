import Avatar from '../common/Avatar.jsx'
import EmptyState from '../common/EmptyState.jsx'

export default function MemberList({ members = [], currentUserId }) {
  if (members.length === 0) {
    return <EmptyState title="No members" message="There are no members in this group yet." />
  }

  return (
    <ul className="divide-y divide-slate-100">
      {members.map((member) => {
        const isCurrentUser = member.id === currentUserId
        return (
          <li key={member.id} className="flex items-center gap-3 px-4 py-3">
            <Avatar name={member.name} size="sm" />
            <span className="text-sm font-medium text-slate-800">
              {member.name}{isCurrentUser ? ' (You)' : ''}
            </span>
          </li>
        )
      })}
    </ul>
  )
}