import { NavLink } from 'react-router-dom'
import { Home, ClipboardCheck, Clock, CalendarHeart, User } from 'lucide-react'

const navigation = [
  { label: 'Dashboard', to: '/volunteer-portal/home', icon: Home },
  { label: 'My Tasks', to: '/volunteer-portal/tasks', icon: ClipboardCheck },
  { label: 'Log Hours', to: '/volunteer-portal/hours', icon: Clock },
  { label: 'Events', to: '/volunteer-portal/events', icon: CalendarHeart },
  { label: 'Profile', to: '/volunteer-portal/profile', icon: User },
]

const VolunteerSidebar = () => {
  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-gray-100 min-h-screen shadow-sm">
      <div className="px-6 py-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">Volunteer Hub</h2>
        <p className="text-xs text-gray-400 mt-1">Welcome &amp; thank you for serving</p>
      </div>
      <nav className="flex-1 overflow-auto py-6">
        <ul className="space-y-1 px-4">
          {navigation.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                  }`
                }
              >
                <item.icon className="h-5 w-5" aria-hidden="true" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

export default VolunteerSidebar
