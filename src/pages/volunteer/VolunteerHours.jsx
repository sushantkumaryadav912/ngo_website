import { useEffect, useState } from 'react'
import { volunteerHoursAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'

const initialForm = {
  date: '',
  hours: '',
  activity: '',
  description: '',
}

const VolunteerHours = () => {
  const { user } = useAuth()
  const [entries, setEntries] = useState([])
  const [stats, setStats] = useState({ total_hours: 0, approved_hours: 0, pending_hours: 0, total_logs: 0 })
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const loadHours = async () => {
    try {
      setLoading(true)
      setError(null)
      const [entriesRes, statsRes] = await Promise.all([
        volunteerHoursAPI.getAll(),
        volunteerHoursAPI.getTotal(user.id),
      ])
      setEntries(entriesRes.data ?? [])
      setStats(statsRes.data ?? {})
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load volunteer hours')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user?.id) return
    loadHours()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      setSubmitting(true)
      setError(null)
      setSuccess(null)
      await volunteerHoursAPI.log({ ...form, hours: parseFloat(form.hours) })
      setSuccess('Hours logged successfully and sent for approval')
      setForm(initialForm)
      await loadHours()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to log hours')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">Volunteer Hours</h1>
        <p className="text-gray-500">Log your time and keep track of approved hours.</p>
      </header>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4">{error}</div>}
      {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg p-4">{success}</div>}

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
          <p className="text-xs uppercase text-gray-400">Total Logged</p>
          <p className="text-3xl font-semibold text-gray-900 mt-2">{stats.total_hours?.toFixed?.(1) ?? 0} hrs</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
          <p className="text-xs uppercase text-gray-400">Approved</p>
          <p className="text-3xl font-semibold text-emerald-600 mt-2">{stats.approved_hours?.toFixed?.(1) ?? 0} hrs</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
          <p className="text-xs uppercase text-gray-400">Pending</p>
          <p className="text-3xl font-semibold text-yellow-600 mt-2">{stats.pending_hours?.toFixed?.(1) ?? 0} hrs</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
          <p className="text-xs uppercase text-gray-400">Total Logs</p>
          <p className="text-3xl font-semibold text-gray-900 mt-2">{stats.total_logs ?? 0}</p>
        </div>
      </section>

      <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900">Log New Hours</h2>
        <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label htmlFor="date" className="text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              id="date"
              name="date"
              type="date"
              required
              value={form.date}
              onChange={handleChange}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="hours" className="text-sm font-medium text-gray-700">
              Hours
            </label>
            <input
              id="hours"
              name="hours"
              type="number"
              step="0.5"
              min="0.5"
              max="24"
              required
              value={form.hours}
              onChange={handleChange}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="activity" className="text-sm font-medium text-gray-700">
              Activity
            </label>
            <input
              id="activity"
              name="activity"
              type="text"
              required
              value={form.activity}
              onChange={handleChange}
              placeholder="e.g., Meal preparation, companionship"
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description (optional)
            </label>
            <textarea
              id="description"
              name="description"
              rows="3"
              value={form.description}
              onChange={handleChange}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Add any extra details about your contribution"
            ></textarea>
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60"
            >
              {submitting ? 'Submitting...' : 'Submit Hours'}
            </button>
          </div>
        </form>
      </section>

      <section className="bg-white border border-gray-100 rounded-xl shadow-sm">
        <header className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-900">History</h2>
          <p className="text-sm text-gray-500">Recent volunteer hours you've submitted.</p>
        </header>
        {loading ? (
          <p className="px-6 py-5 text-sm text-gray-500">Loading history...</p>
        ) : entries.length === 0 ? (
          <p className="px-6 py-5 text-sm text-gray-500">No hours logged yet. Share your impact by logging your first entry!</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {entries.map((entry) => (
              <article key={entry.id} className="px-6 py-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {entry.activity} · {new Date(entry.date).toLocaleDateString()}
                  </p>
                  {entry.description && <p className="text-sm text-gray-500">{entry.description}</p>}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span>{entry.hours} hrs</span>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      entry.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-700'
                        : entry.status === 'rejected'
                        ? 'bg-rose-100 text-rose-600'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {entry.status?.toUpperCase()}
                  </span>
                  {entry.admin_notes && <span className="text-xs text-gray-400">Notes: {entry.admin_notes}</span>}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default VolunteerHours
