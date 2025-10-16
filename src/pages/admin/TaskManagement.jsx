import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import DashboardModal from '../../components/dashboard/DashboardModal'
import { taskAPI, volunteerAPI } from '../../services/api'

const STATUSES = ['all', 'pending', 'in_progress', 'completed', 'cancelled']
const PRIORITIES = ['low', 'medium', 'high']

const taskSchema = z.object({
  title: z.string().min(3, 'Task title must be at least 3 characters'),
  description: z.string().optional(),
  assigned_to: z.string({ required_error: 'Select a volunteer' }).min(1, 'Volunteer is required'),
  due_date: z.string().min(1, 'Due date is required'),
  priority: z.enum(['low', 'medium', 'high']),
  category: z.string().optional(),
})

const defaultValues = {
  title: '',
  description: '',
  assigned_to: '',
  due_date: '',
  priority: 'medium',
  category: 'general',
}

const TaskManagement = () => {
  const [tasks, setTasks] = useState([])
  const [status, setStatus] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [volunteers, setVolunteers] = useState([])
  const [formOpen, setFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues,
  })

  const loadTasks = async (nextStatus = status) => {
    try {
      setLoading(true)
      setError(null)
      const params = {}
      if (nextStatus !== 'all') params.status = nextStatus
      const response = await taskAPI.getAll(params)
      setTasks(response.data?.data ?? response.data ?? [])
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to fetch tasks')
    } finally {
      setLoading(false)
    }
  }

  const loadVolunteers = async () => {
    try {
      const response = await volunteerAPI.getAll('approved')
      setVolunteers(response.data?.data ?? response.data ?? [])
    } catch (err) {
      console.error('Failed to fetch volunteers', err)
    }
  }

  useEffect(() => {
    loadTasks()
    loadVolunteers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleStatusChange = async (value) => {
    setStatus(value)
    await loadTasks(value)
  }

  const openCreateModal = () => {
    setEditingTask(null)
    reset(defaultValues)
    setFormOpen(true)
  }

  const openEditModal = (task) => {
    setEditingTask(task)
    reset({
      title: task.title || '',
      description: task.description || '',
      assigned_to: task.assigned_to || task.assigned_user?.id || '',
      due_date: task.due_date ? task.due_date.substring(0, 10) : '',
      priority: task.priority || 'medium',
      category: task.category || 'general',
    })
    setFormOpen(true)
  }

  const closeModal = () => {
    setFormOpen(false)
    setEditingTask(null)
    reset(defaultValues)
  }

  const onSubmit = async (values) => {
    try {
      setIsSubmitting(true)
      if (editingTask) {
        await taskAPI.update(editingTask.id, values)
        toast.success('Task updated successfully')
      } else {
        await taskAPI.create(values)
        toast.success('Task created successfully')
      }
      closeModal()
      await loadTasks()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save task')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this task? This action cannot be undone.')
    if (!confirmed) return

    try {
      await taskAPI.delete(id)
      toast.success('Task deleted successfully')
      await loadTasks()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete task')
    }
  }

  const pendingTasks = useMemo(() => tasks.filter((task) => task.status === 'pending'), [tasks])

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Task Management</h1>
          <p className="text-gray-500">Assign tasks, update progress, and support your volunteers.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={status}
            onChange={(event) => handleStatusChange(event.target.value)}
          >
            {STATUSES.map((value) => (
              <option key={value} value={value}>
                {value.replace('_', ' ').replace(/^./, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Task
          </button>
        </div>
      </header>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">{error}</div>}

      {loading ? (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-gray-500">Loading tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-10 text-center">
          <h2 className="text-lg font-medium text-gray-800">No tasks to show yet</h2>
          <p className="mt-2 text-sm text-gray-500">
            Create a task to assign responsibilities and keep volunteers engaged.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Create your first task
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Task</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Due date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Assigned To</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tasks.map((task) => (
                <tr key={task.id} className="transition hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-gray-900">{task.title}</p>
                    {task.description && <p className="mt-1 text-xs text-gray-500">{task.description}</p>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{task.category || 'General'}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                        task.priority === 'high'
                          ? 'bg-red-100 text-red-600'
                          : task.priority === 'medium'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {(task.priority || 'low').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                      {(task.status || 'pending').replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {task.assigned_user?.name || task.assigned_user?.full_name || task.assigned_to_name || 'Unassigned'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(task)}
                        className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-blue-200 hover:text-blue-600"
                      >
                        <Pencil className="mr-1 h-4 w-4" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(task.id)}
                        className="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                      >
                        <Trash2 className="mr-1 h-4 w-4" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pendingTasks.length > 0 && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <h2 className="text-sm font-semibold text-blue-800">Pending tasks: {pendingTasks.length}</h2>
          <p className="mt-1 text-xs text-blue-700">
            Stay connected with volunteers by following up on pending tasks regularly.
          </p>
        </div>
      )}

      <DashboardModal
        open={formOpen}
        onClose={closeModal}
        title={editingTask ? 'Edit Task' : 'Create Task'}
        description="Provide clear details so volunteers understand expectations and deadlines."
        footer={
          <>
            <button
              type="button"
              onClick={closeModal}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="task-form"
              disabled={isSubmitting || volunteers.length === 0}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingTask ? 'Update Task' : 'Create Task'}
            </button>
          </>
        }
      >
        {volunteers.length === 0 ? (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700">
            Approve at least one volunteer to start assigning tasks.
          </div>
        ) : (
          <form id="task-form" className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                {...register('title')}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="e.g. Weekly wellness check call"
              />
              {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows={3}
                {...register('description')}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Share context, objectives, or specific instructions"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-700">Assign to volunteer</label>
                <select
                  {...register('assigned_to')}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select volunteer</option>
                  {volunteers.map((volunteer) => (
                    <option key={volunteer.id} value={volunteer.id}>
                      {volunteer.name} ({volunteer.email})
                    </option>
                  ))}
                </select>
                {errors.assigned_to && <p className="mt-1 text-xs text-red-500">{errors.assigned_to.message}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Due date</label>
                <input
                  type="date"
                  {...register('due_date')}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                {errors.due_date && <p className="mt-1 text-xs text-red-500">{errors.due_date.message}</p>}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Priority</label>
                <div className="mt-2 flex gap-2">
                  {PRIORITIES.map((option) => (
                    <label key={option} className="flex items-center gap-2 text-xs font-medium text-gray-600">
                      <input type="radio" value={option} {...register('priority')} className="text-blue-600" />
                      {option.replace('_', ' ')}
                    </label>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Category</label>
                <input
                  type="text"
                  {...register('category')}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="e.g. Medical, Events, Outreach"
                />
              </div>
            </div>
          </form>
        )}
      </DashboardModal>
    </div>
  )
}

export default TaskManagement
