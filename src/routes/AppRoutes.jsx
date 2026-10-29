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
import NotFoundPage from '../components/common/NotFoundPage.jsx'

function PublicOnlyRoute() {
	const { user, loading } = useAuth()
	if (loading) return <Loader fullPage label="Restoring your session" />
	return user ? <Navigate to="/" replace /> : <Outlet />
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
			<Route path="*" element={<NotFoundPage />} />
		</Routes>
	)
}
