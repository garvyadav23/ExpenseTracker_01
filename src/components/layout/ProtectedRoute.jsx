import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import Loader from '../common/Loader.jsx'

export default function ProtectedRoute() {
  const { user, loading } = useAuth()
  if (loading) return <Loader label="Loading your account" />
  return user ? <Outlet /> : <Navigate to="/login" replace />
}