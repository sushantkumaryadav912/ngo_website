import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { taskAPI, volunteerHoursAPI, eventAPI } from '../../services/api'
import { format } from 'date-fns'

const initialStats = {
  tasks: { total: 0, pending: 0, in_progress: 0, completed: 0 },
  hours: { total_hours: 0, approved_hours: 0, pending_hours: 0 },
}

const VolunteerDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(initialStats)
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [recentTasks, setRecentTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let ignore = false

    const loadDashboard = async () => {
      if (!user?.id) return
      try {
        setLoading(true)
        setError(null)

        const [taskStatsRes, hoursStatsRes, tasksRes, eventsRes] = await Promise.allSettled([
          taskAPI.getStats(),
          volunteerHoursAPI.getTotal(user.id),
          taskAPI.getAll({ status: 'pending' }),
          eventAPI.getAll({ upcoming: true }),
        ])

        if (ignore) return

  const nextStats = JSON.parse(JSON.stringify(initialStats))

        if (taskStatsRes.status === 'fulfilled') {
          nextStats.tasks = {
            total: taskStatsRes.value.data?.total ?? 0,
            pending: taskStatsRes.value.data?.pending ?? 0,
            in_progress: taskStatsRes.value.data?.in_progress ?? 0,
            completed: taskStatsRes.value.data?.completed ?? 0,
          }
        }

        if (hoursStatsRes.status === 'fulfilled') {
          nextStats.hours = {
            total_hours: hoursStatsRes.value.data?.total_hours ?? 0,
            approved_hours: hoursStatsRes.value.data?.approved_hours ?? 0,
            pending_hours: hoursStatsRes.value.data?.pending_hours ?? 0,
          }
        }

        if (tasksRes.status === 'fulfilled') {
          const tasks = tasksRes.value.data ?? []
          setRecentTasks(tasks.slice(0, 5))
        }

        if (eventsRes.status === 'fulfilled') {
          setUpcomingEvents(eventsRes.value.data ?? [])
        }

        setStats(nextStats)
      } catch (err) {
        if (!ignore) {
          setError(err.response?.data?.error || 'Failed to load dashboard data')
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadDashboard()

    return () => {
      ignore = true
    }
  }, [user])

  const StatCard = ({ label, value, accent, description }) => (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm p-6 border-t-4 ${accent}`}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-semibold text-gray-900 mt-2">{value}</p>
      {description && <p className="text-xs text-gray-400 mt-2">{description}</p>}
    </div>
  )

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">Welcome back, {user?.full_name || user?.name || 'Volunteer'}!</h1>
        <p className="text-gray-500">Here\'s a quick snapshot of your impact this week.</p>
      </header>

      {loading && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-gray-500">Loading your dashboard...</p>
        </div>
      )}

      {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4">{error}</div>}

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Assigned Tasks" value={stats.tasks.total} accent="border-blue-200" description={`${stats.tasks.pending} pending`} />
        <StatCard label="In Progress" value={stats.tasks.in_progress} accent="border-yellow-200" description="Keep it going!" />
        <StatCard label="Completed" value={stats.tasks.completed} accent="border-emerald-200" description="Great work so far" />
        <StatCard label="Approved Hours" value={stats.hours.approved_hours.toFixed(1)} accent="border-purple-200" description={`Pending approval: ${stats.hours.pending_hours.toFixed(1)} hrs`} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <header className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-medium text-gray-900">Your Tasks</h2>
            <p className="text-sm text-gray-500">Top pending tasks needing attention.</p>
          </header>
          <div className="divide-y divide-gray-100">
            {recentTasks.length === 0 && (
              <p className="px-6 py-5 text-sm text-gray-500">No pending tasks at the moment. Enjoy the break!</p>
            )}
            {recentTasks.map((task) => (
              <article key={task.id} className="px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-gray-900">{task.title}</p>
                    <p className="text-sm text-gray-500 mt-1">{task.description || 'No additional details.'}</p>
                    <p className="text-xs text-gray-400 mt-2">Due {task.due_date ? format(new Date(task.due_date), 'PP') : 'TBD'}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    task.priority === 'high'
                      ? 'bg-rose-100 text-rose-600'
                      : task.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {task.priority?.toUpperCase() || 'LOW'}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <header className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-medium text-gray-900">Upcoming Events</h2>
            <p className="text-sm text-gray-500">Stay informed and join the upcoming gatherings.</p>
          </header>
          <div className="divide-y divide-gray-100">
            {upcomingEvents.length === 0 && (
              <p className="px-6 py-5 text-sm text-gray-500">No upcoming events at the moment.</p>
            )}
            {upcomingEvents.map((event) => (
              <article key={event.id} className="px-6 py-4">
                <p className="font-medium text-gray-900">{event.title}</p>
                {event.event_date && (
                  <p className="text-sm text-gray-500 mt-1">{format(new Date(event.event_date), 'PPpp')}</p>
                )}
                {event.location && <p className="text-xs text-gray-400 mt-2">Location: {event.location}</p>}
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default VolunteerDashboard
