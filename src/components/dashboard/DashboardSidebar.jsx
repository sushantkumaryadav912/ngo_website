import { NavLink } from 'react-router-dom'
import {
  Home,
  Users,
  ClipboardList,
  Megaphone,
  BarChart3,
  BellRing,
  Images,
  UserCog,
} from 'lucide-react'

const navigation = [
  { label: 'Home', to: '/dashboard/home', icon: Home },
  { label: 'Volunteers', to: '/dashboard/volunteers', icon: Users },
  { label: 'Tasks', to: '/dashboard/tasks', icon: ClipboardList },
  { label: 'Events', to: '/dashboard/events', icon: Megaphone },
  { label: 'Content', to: '/dashboard/content', icon: BarChart3 },
  { label: 'Urgent Needs', to: '/dashboard/urgent-needs', icon: BellRing },
  { label: 'Gallery', to: '/dashboard/gallery', icon: Images },
  { label: 'Users', to: '/dashboard/users', icon: UserCog },
]

const DashboardSidebar = () => {
  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-72 bg-white border-r border-gray-100 min-h-screen shadow-sm">
      <div className="px-6 py-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">Suryoday Admin</h2>
        <p className="text-xs text-gray-400 mt-1">Operations Console</p>
      </div>
      <nav className="flex-1 overflow-auto py-6">
        <ul className="space-y-1 px-4">
          {navigation.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
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

export default DashboardSidebar
