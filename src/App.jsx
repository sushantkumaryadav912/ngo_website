import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import PublicLayout from './layouts/PublicLayout'
import DashboardLayout from './layouts/DashboardLayout'
import VolunteerPortalLayout from './layouts/VolunteerPortalLayout'
import HomePage from './pages/HomePage'
import DashboardLogin from './pages/DashboardLogin'
import VolunteerLogin from './pages/VolunteerLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import VolunteerManagement from './pages/admin/VolunteerManagement'
import TaskManagement from './pages/admin/TaskManagement'
import EventManagement from './pages/admin/EventManagement'
import ContentManagement from './pages/admin/ContentManagement'
import UrgentNeedsManagement from './pages/admin/UrgentNeedsManagement'
import GalleryManagement from './pages/admin/GalleryManagement'
import UserManagement from './pages/admin/UserManagement'
import VolunteerDashboard from './pages/volunteer/VolunteerDashboard'
import VolunteerTasks from './pages/volunteer/VolunteerTasks'
import VolunteerHours from './pages/volunteer/VolunteerHours'
import VolunteerEvents from './pages/volunteer/VolunteerEvents'
import Profile from './pages/Profile'

function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<HomePage />} />
        </Route>

        {/* Dashboard Login */}
        <Route path="/dashboard" element={<DashboardLogin />} />
        
        {/* Admin Dashboard Routes */}
        <Route path="/dashboard/*" element={<DashboardLayout />}>
          <Route path="home" element={<AdminDashboard />} />
          <Route path="volunteers" element={<VolunteerManagement />} />
          <Route path="tasks" element={<TaskManagement />} />
          <Route path="events" element={<EventManagement />} />
          <Route path="content" element={<ContentManagement />} />
          <Route path="urgent-needs" element={<UrgentNeedsManagement />} />
          <Route path="gallery" element={<GalleryManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Volunteer Portal Login */}
        <Route path="/volunteer-portal" element={<VolunteerLogin />} />

        {/* Volunteer Portal Routes */}
        <Route path="/volunteer-portal/*" element={<VolunteerPortalLayout />}>
          <Route path="home" element={<VolunteerDashboard />} />
          <Route path="tasks" element={<VolunteerTasks />} />
          <Route path="hours" element={<VolunteerHours />} />
          <Route path="events" element={<VolunteerEvents />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
