import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Avatar from '../components/common/Avatar.jsx'
import Button from '../components/common/Button.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { useTheme } from '../hooks/useTheme.js'
import Select from '../components/common/Select.jsx'

export default function Account() {
	const { user, logout } = useAuth()
	const { theme, setTheme } = useTheme()
	const navigate = useNavigate()

	function handleLogout() {
		logout()
		navigate('/login', { replace: true })
	}

	return (
		<div className="mx-auto max-w-3xl">
			<header className="mb-7">
				<p className="text-sm font-medium text-slate-500 dark:text-gray-400">Your profile</p>
				<h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-gray-100">Account</h1>
			</header>
			<section className="flex flex-col gap-5 rounded-md border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 sm:flex-row sm:items-center sm:p-7">
				<Avatar name={user?.name} size="lg" className="size-20 text-xl" />
				<div className="min-w-0 flex-1">
					<h2 className="break-words text-xl font-semibold text-slate-900 dark:text-gray-100">{user?.name || 'Your account'}</h2>
					<p className="mt-1 break-all text-sm text-slate-600 dark:text-gray-400">{user?.email || 'No email available'}</p>
				</div>
				<Button variant="secondary" className="self-start sm:self-auto" onClick={handleLogout}>
					<LogOut aria-hidden="true" size={17} />
					Log out
				</Button>
			</section>
			<section className="mt-5 max-w-sm rounded-md border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
				<Select label="Theme setting" value={theme} onChange={(event) => setTheme(event.target.value)}>
					<option value="light">Light</option>
					<option value="dark">Dark</option>
					<option value="system">System</option>
				</Select>
			</section>
		</div>
	)
}
