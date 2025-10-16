import { useMemo } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { Bell, LogOut, Shield } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const DashboardHeader = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const initials = useMemo(() => {
    if (!user?.full_name && !user?.name) return 'SA'
    const source = user.full_name || user.name
    return source
      .split(' ')
      .slice(0, 2)
      .map((segment) => segment[0]?.toUpperCase())
      .join('')
  }, [user])

  const handleLogout = () => {
    logout()
    navigate('/dashboard')
  }

  return (
    <header className="h-16 border-b border-gray-100 bg-white px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-blue-600" aria-hidden="true" />
        <div>
          <p className="text-sm font-medium text-gray-900">Admin Console</p>
          <p className="text-xs text-gray-400">Welcome back, {user?.full_name || user?.name || 'Administrator'}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <NavLink
          to="/dashboard/profile"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Edit Profile
        </NavLink>
        <button
          type="button"
          className="relative text-gray-500 hover:text-gray-700"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-blue-500"></span>
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
          <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-semibold">
            {initials}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-900">{user?.full_name || user?.name || 'Super Admin'}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role || 'super admin'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Logout
        </button>
      </div>
    </header>
  )
}

export default DashboardHeader
