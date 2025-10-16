import { useMemo } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { Gift, LogOut } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const VolunteerHeader = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const initials = useMemo(() => {
    if (!user?.full_name && !user?.name) return 'VO'
    const source = user.full_name || user.name
    return source
      .split(' ')
      .slice(0, 2)
      .map((segment) => segment[0]?.toUpperCase())
      .join('')
  }, [user])

  const handleLogout = () => {
    logout()
    navigate('/volunteer-portal')
  }

  return (
    <header className="h-16 border-b border-gray-100 bg-white px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Gift className="h-6 w-6 text-emerald-600" aria-hidden="true" />
        <div>
          <p className="text-sm font-medium text-gray-900">Volunteer Portal</p>
          <p className="text-xs text-gray-400">{user?.full_name || user?.name || 'Volunteer'}, happy to have you!</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <NavLink
          to="/volunteer-portal/profile"
          className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
        >
          View Profile
        </NavLink>
        <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
          <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-semibold">
            {initials}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-900">{user?.full_name || user?.name || 'Volunteer'}</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Logout
        </button>
      </div>
    </header>
  )
}

export default VolunteerHeader
