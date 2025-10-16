import { useEffect, useState } from 'react'
import { volunteerAPI, taskAPI, urgentNeedAPI, eventAPI } from '../../services/api'
import { format } from 'date-fns'

const statsSkeleton = {
  volunteers: { total: 0, pending: 0, active: 0 },
  tasks: { total: 0, open: 0, completed: 0 },
  urgentNeeds: 0,
  upcomingEvents: 0,
}

const AdminDashboard = () => {
  const [stats, setStats] = useState(statsSkeleton)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [recentNeeds, setRecentNeeds] = useState([])

  useEffect(() => {
    let ignore = false

    const loadStats = async () => {
      try {
        setLoading(true)
        setError(null)

        const [volunteerRes, taskRes, urgentNeedsRes, eventsRes] = await Promise.allSettled([
          volunteerAPI.getStats(),
          taskAPI.getStats(),
          urgentNeedAPI.getAll({ limit: 5, sort: 'created_at:desc' }),
          eventAPI.getAll({ limit: 5, sort: 'start_date:asc', upcoming: true }),
        ])

        if (ignore) return

        const nextStats = { ...statsSkeleton }

        if (volunteerRes.status === 'fulfilled') {
          nextStats.volunteers = {
            total: volunteerRes.value.data?.total_volunteers ?? 0,
            pending: volunteerRes.value.data?.pending_applications ?? 0,
            active: volunteerRes.value.data?.active_volunteers ?? 0,
          }
        }

        if (taskRes.status === 'fulfilled') {
          nextStats.tasks = {
            total: taskRes.value.data?.total_tasks ?? 0,
            open: taskRes.value.data?.open_tasks ?? 0,
            completed: taskRes.value.data?.completed_tasks ?? 0,
          }
        }

        if (urgentNeedsRes.status === 'fulfilled') {
          const needs = urgentNeedsRes.value.data?.data ?? []
          nextStats.urgentNeeds = needs.length
          setRecentNeeds(needs)
        }

        if (eventsRes.status === 'fulfilled') {
          const events = eventsRes.value.data?.data ?? []
          nextStats.upcomingEvents = events.length
          setUpcomingEvents(events)
        }

        setStats(nextStats)
      } catch (err) {
        if (!ignore) {
          setError(err.response?.data?.error || 'Failed to load dashboard metrics')
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadStats()

    return () => {
      ignore = true
    }
  }, [])

  const StatCard = ({ title, value, sublabel }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-semibold text-gray-900 mt-2">{value}</p>
      {sublabel && <p className="text-xs text-gray-400 mt-2">{sublabel}</p>}
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500">Monitor key metrics and manage operations.</p>
      </div>

      {loading && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-gray-500">Fetching latest metrics...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Volunteers"
          value={stats.volunteers.total}
          sublabel={`${stats.volunteers.pending} pending approvals`}
        />
        <StatCard
          title="Active Volunteers"
          value={stats.volunteers.active}
          sublabel="Currently contributing"
        />
        <StatCard
          title="Open Tasks"
          value={stats.tasks.open}
          sublabel={`${stats.tasks.completed} completed`}
        />
        <StatCard
          title="Urgent Needs"
          value={stats.urgentNeeds}
          sublabel="Needing attention"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-xl shadow-sm border border-gray-100">
          <header className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-medium text-gray-900">Upcoming Events</h2>
          </header>
          <div className="divide-y divide-gray-100">
            {upcomingEvents.length === 0 && (
              <p className="px-6 py-5 text-sm text-gray-500">No upcoming events scheduled.</p>
            )}
            {upcomingEvents.map((event) => (
              <article key={event.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{event.title}</p>
                  <p className="text-sm text-gray-500">
                    {event.location || 'TBD'} · {event.start_date ? format(new Date(event.start_date), 'PP') : 'Date TBD'}
                  </p>
                </div>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-600">
                  {event.status || 'Scheduled'}
                </span>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-100">
          <header className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-medium text-gray-900">Recent Urgent Needs</h2>
          </header>
          <div className="divide-y divide-gray-100">
            {recentNeeds.length === 0 && (
              <p className="px-6 py-5 text-sm text-gray-500">No urgent needs recorded.</p>
            )}
            {recentNeeds.map((need) => (
              <article key={need.id} className="px-6 py-4">
                <p className="font-medium text-gray-900">{need.title}</p>
                <p className="text-sm text-gray-500 mt-1">{need.description}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-3">
                  <span>Goal: ₹{need.goal_amount ?? 'N/A'}</span>
                  <span>Raised: ₹{need.raised_amount ?? 0}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default AdminDashboard
