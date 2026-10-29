import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import Account from '../pages/Account.jsx'
import Activity from '../pages/Activity.jsx'
import Dashboard from '../pages/Dashboard.jsx'
import Friends from '../pages/Friends.jsx'
import GroupDetail from '../pages/GroupDetail.jsx'
import Groups from '../pages/Groups.jsx'
import Login from '../pages/Login.jsx'
import Register from '../pages/Register.jsx'
import AppLayout from '../components/layout/AppLayout.jsx'
import ProtectedRoute from '../components/layout/ProtectedRoute.jsx'
import Loader from '../components/common/Loader.jsx'

function PublicOnlyRoute() {
	const { user, loading } = useAuth()
	if (loading) return <Loader label="Restoring your session" />
	return user ? <Navigate to="/" replace /> : <Outlet />
}

function NotFound() {
	return (
		<main className="grid min-h-screen place-items-center bg-slate-50 px-6 text-center">
			<div>
				<p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">404</p>
				<h1 className="mt-3 text-3xl font-semibold text-slate-900">Page not found</h1>
				<p className="mt-2 text-slate-600">The page you requested does not exist.</p>
			</div>
		</main>
	)
}

export default function AppRoutes() {
	return (
		<Routes>
			<Route element={<PublicOnlyRoute />}>
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />
			</Route>
			<Route element={<ProtectedRoute />}>
				<Route element={<AppLayout />}>
					<Route path="/" element={<Dashboard />} />
					<Route path="/groups" element={<Groups />} />
					<Route path="/groups/:id" element={<GroupDetail />} />
					<Route path="/friends" element={<Friends />} />
					<Route path="/activity" element={<Activity />} />
					<Route path="/account" element={<Account />} />
				</Route>
			</Route>
			<Route path="*" element={<NotFound />} />
		</Routes>
	)
}
