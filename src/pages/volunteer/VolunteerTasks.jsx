import { useEffect, useState } from 'react'
import { taskAPI } from '../../services/api'

const STATUS_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
]

const updateOptions = ['pending', 'in_progress', 'completed']

const VolunteerTasks = () => {
  const [tasks, setTasks] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionMessage, setActionMessage] = useState(null)

  const loadTasks = async (status = statusFilter) => {
    try {
      setLoading(true)
      setError(null)
      const params = {}
      if (status !== 'all') {
        params.status = status
      }
      const response = await taskAPI.getAll(params)
      setTasks(response.data ?? [])
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load tasks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTasks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleStatusChange = async (taskId, nextStatus) => {
    try {
      setActionMessage(null)
      await taskAPI.updateStatus(taskId, nextStatus)
      setActionMessage('Task updated successfully')
      await loadTasks()
    } catch (err) {
      setActionMessage(err.response?.data?.error || 'Failed to update task')
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Tasks</h1>
          <p className="text-gray-500">Track progress and update the status of your assignments.</p>
        </div>
        <select
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          value={statusFilter}
          onChange={(event) => {
            const value = event.target.value
            setStatusFilter(value)
            loadTasks(value)
          }}
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </header>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4">{error}</div>}
      {actionMessage && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg p-4">{actionMessage}</div>}

      {loading ? (
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <p className="text-gray-500">Loading tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm text-center text-gray-500">
          No tasks found for this filter.
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <article key={task.id} className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{task.title}</h2>
                  <p className="text-sm text-gray-500 mt-2">{task.description || 'No additional details provided.'}</p>
                  <dl className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-500">
                    <div>
                      <dt className="text-xs uppercase text-gray-400">Priority</dt>
                      <dd className="mt-1 capitalize">{task.priority || 'low'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase text-gray-400">Due Date</dt>
                      <dd className="mt-1">{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'TBD'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase text-gray-400">Status</dt>
                      <dd className="mt-1 capitalize">{(task.status || 'pending').replace('_', ' ')}</dd>
                    </div>
                  </dl>
                </div>
                <div className="w-full md:w-auto flex flex-col items-stretch gap-2">
                  <label className="text-xs font-semibold text-gray-500">Update status</label>
                  <select
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={task.status || 'pending'}
                    onChange={(event) => handleStatusChange(task.id, event.target.value)}
                  >
                    {updateOptions.map((status) => (
                      <option key={status} value={status}>
                        {status.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default VolunteerTasks
