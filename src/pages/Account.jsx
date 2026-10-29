import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Avatar from '../components/common/Avatar.jsx'
import Button from '../components/common/Button.jsx'
import { useAuth } from '../hooks/useAuth.js'

export default function Account() {
	const { user, logout } = useAuth()
	const navigate = useNavigate()

	function handleLogout() {
		logout()
		navigate('/login', { replace: true })
	}

	return (
		<div className="mx-auto max-w-3xl">
			<header className="mb-7">
				<p className="text-sm font-medium text-slate-500">Your profile</p>
				<h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Account</h1>
			</header>
			<section className="flex flex-col gap-5 rounded-md border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:p-7">
				<Avatar name={user?.name} size="lg" className="size-20 text-xl" />
				<div className="min-w-0 flex-1">
					<h2 className="break-words text-xl font-semibold text-slate-900">{user?.name || 'Your account'}</h2>
					<p className="mt-1 break-all text-sm text-slate-600">{user?.email || 'No email available'}</p>
				</div>
				<Button variant="secondary" className="self-start sm:self-auto" onClick={handleLogout}>
					<LogOut aria-hidden="true" size={17} />
					Log out
				</Button>
			</section>
		</div>
	)
}
