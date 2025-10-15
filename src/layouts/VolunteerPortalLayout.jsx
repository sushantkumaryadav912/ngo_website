import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import VolunteerSidebar from '../components/volunteer/VolunteerSidebar'
import VolunteerHeader from '../components/volunteer/VolunteerHeader'

const VolunteerPortalLayout = () => {
  const { isAuthenticated, isVolunteer, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !isVolunteer) {
    return <Navigate to="/volunteer-portal" state={{ from: location }} replace />
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <VolunteerSidebar />
      <div className="flex-1 flex flex-col">
        <VolunteerHeader />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default VolunteerPortalLayout