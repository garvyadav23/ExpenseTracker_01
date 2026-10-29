import { useState } from 'react'
import { Activity, Home, LogOut, Menu, UsersRound, X } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import Avatar from '../common/Avatar.jsx'
import ThemeToggle from '../common/ThemeToggle.jsx'

const navigation = [
  { label: 'Dashboard', to: '/', icon: Home, end: true },
  { label: 'Groups', to: '/groups', icon: UsersRound },
  { label: 'Friends', to: '/friends', icon: UsersRound },
  { label: 'Activity', to: '/activity', icon: Activity },
]

function SidebarLinks({ onNavigate }) {
  return (
    <nav aria-label="Main navigation" className="space-y-1 px-3">
      {navigation.map(({ label, to, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) => `flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 dark:focus-visible:ring-emerald-400 ${
            isActive
              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-green-400'
              : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800 hover:text-slate-900 dark:hover:text-gray-100'
          }`}
        >
          <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}

export default function AppLayout() {
  const { user, logout } = useAuth()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-gray-100">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="grid size-10 place-items-center rounded-md text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800 md:hidden"
            aria-label="Open navigation"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
          >
            <Menu size={21} />
          </button>
          <NavLink to="/" className="rounded-sm text-base font-bold tracking-tight text-slate-900 dark:text-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 dark:focus-visible:ring-emerald-400">
            Expense<span className="text-emerald-700 dark:text-green-400">Tracker</span>
          </NavLink>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <span className="hidden text-sm font-medium text-slate-700 dark:text-gray-300 sm:block">{user?.name}</span>
          <NavLink to="/account" aria-label="Account settings" className="grid size-10 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 dark:focus-visible:ring-emerald-400">
            <Avatar name={user?.name} />
          </NavLink>
          <button
            type="button"
            title="Log out"
            aria-label="Log out"
            onClick={handleLogout}
            className="grid size-10 place-items-center rounded-md text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800 hover:text-slate-900 dark:hover:text-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 dark:focus-visible:ring-emerald-400"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {drawerOpen && (
        <button
          type="button"
          aria-label="Close navigation overlay"
          className="fixed inset-0 z-40 bg-slate-950/40 dark:bg-black/60 md:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[1600px]">
        <aside className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 pt-4 transition-transform md:sticky md:top-16 md:z-0 md:block md:h-[calc(100vh-4rem)] md:w-60 md:shrink-0 md:translate-x-0 md:pt-6 ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}>
          <div className="mb-7 flex items-center justify-between px-5 md:hidden">
            <span className="text-base font-bold">Navigation</span>
            <button
              type="button"
              className="grid size-10 place-items-center rounded-md text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 dark:focus-visible:ring-emerald-400"
              aria-label="Close navigation"
              onClick={() => setDrawerOpen(false)}
            >
              <X size={20} />
            </button>
          </div>
          <SidebarLinks onNavigate={() => setDrawerOpen(false)} />
        </aside>
        <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 sm:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}