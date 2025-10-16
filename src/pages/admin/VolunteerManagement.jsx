import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'react-hot-toast'
import { Loader2, Pencil, Trash2 } from 'lucide-react'
import DashboardModal from '../../components/dashboard/DashboardModal'
import { volunteerAPI } from '../../services/api'

const STATUS_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Active', value: 'active' },
  { label: 'Rejected', value: 'rejected' },
]

const VOLUNTEER_STATUSES = ['pending', 'approved', 'active', 'rejected', 'inactive']

const volunteerSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(6, 'Phone number is required'),
  age: z
    .union([z.string(), z.number()])
    .transform((value) => Number(value))
    .pipe(z.number().min(16, 'Minimum age is 16').max(100, 'Age seems too high')),
  skills: z.string().optional(),
  motivation: z.string().optional(),
  availability_days: z.string().optional(),
  availability_time: z.string().optional(),
  emergency_name: z.string().optional(),
  emergency_phone: z.string().optional(),
  status: z.enum(['pending', 'approved', 'active', 'rejected', 'inactive']),
})

const defaultValues = {
  name: '',
  email: '',
  phone: '',
  age: '',
  skills: '',
  motivation: '',
  availability_days: '',
  availability_time: '',
  emergency_name: '',
  emergency_phone: '',
  status: 'pending',
}

const VolunteerManagement = () => {
  const [volunteers, setVolunteers] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingVolunteer, setEditingVolunteer] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(volunteerSchema),
    defaultValues,
  })

  const loadVolunteers = async (status = statusFilter) => {
    try {
      setLoading(true)
      setError(null)
      const params = status === 'all' ? undefined : status
      const response = await volunteerAPI.getAll(params)
      setVolunteers(response.data?.data ?? response.data ?? [])
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load volunteers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVolunteers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleStatusChange = async (status) => {
    setStatusFilter(status)
    await loadVolunteers(status)
  }

  const approveVolunteer = async (id) => {
    try {
      setActionError(null)
      await volunteerAPI.approve(id)
      toast.success('Volunteer approved')
      await loadVolunteers()
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to approve volunteer')
    }
  }

  const rejectVolunteer = async (id) => {
    try {
      setActionError(null)
      const reason = window.prompt('Please provide a rejection reason:')
      if (!reason) return
      await volunteerAPI.reject(id, reason)
      toast.success('Volunteer rejected')
      await loadVolunteers()
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to reject volunteer')
    }
  }

  const openEditModal = (volunteer) => {
    setEditingVolunteer(volunteer)
    reset({
      name: volunteer.name || '',
      email: volunteer.email || '',
      phone: volunteer.phone || '',
      age: volunteer.age || '',
      skills: Array.isArray(volunteer.skills) ? volunteer.skills.join(', ') : volunteer.skills || '',
      motivation: volunteer.motivation || '',
      availability_days: Array.isArray(volunteer.availability?.days)
        ? volunteer.availability.days.join(', ')
        : volunteer.availability?.days || volunteer.availability?.notes || '',
      availability_time: volunteer.availability?.timeSlot || '',
      emergency_name: volunteer.emergency_contact?.name || '',
      emergency_phone: volunteer.emergency_contact?.phone || '',
      status: volunteer.status || 'pending',
    })
    setFormOpen(true)
  }

  const closeModal = () => {
    setFormOpen(false)
    setEditingVolunteer(null)
    reset(defaultValues)
  }

  const onSubmit = async (values) => {
    const payload = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      age: Number(values.age),
      skills: values.skills
        ? values.skills.split(',').map((skill) => skill.trim()).filter(Boolean)
        : [],
      motivation: values.motivation || '',
      availability: {
        days: values.availability_days
          ? values.availability_days.split(',').map((day) => day.trim()).filter(Boolean)
          : [],
        timeSlot: values.availability_time || '',
      },
      emergency_contact: {
        name: values.emergency_name || '',
        phone: values.emergency_phone || '',
      },
      status: values.status,
    }

    try {
      setIsSubmitting(true)
      await volunteerAPI.update(editingVolunteer.id, payload)
      toast.success('Volunteer profile updated')
      closeModal()
      await loadVolunteers()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update volunteer')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Delete this volunteer? This also removes their login access.')
    if (!confirmed) return

    try {
      await volunteerAPI.delete(id)
      toast.success('Volunteer deleted')
      await loadVolunteers()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete volunteer')
    }
  }

  const pendingVolunteers = useMemo(
    () => volunteers.filter((volunteer) => volunteer.status === 'pending'),
    [volunteers]
  )

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Volunteer Management</h1>
          <p className="text-gray-500">
            Welcome new volunteers warmly, keep information updated, and celebrate active champions.
          </p>
        </div>
        <div className="flex gap-2 rounded-full border border-gray-100 bg-white p-1 shadow-sm">
          {STATUS_FILTERS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleStatusChange(option.value)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                statusFilter === option.value
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </header>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">{error}</div>}
      {actionError && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-700">{actionError}</div>
      )}

      {loading ? (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-gray-500">Loading volunteers...</p>
        </div>
      ) : volunteers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-10 text-center text-gray-500">
          No volunteers found for this filter.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Skills
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Availability
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {volunteers.map((volunteer) => (
                <tr key={volunteer.id} className="transition hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-gray-900">{volunteer.name}</p>
                    <p className="text-xs text-gray-400">Age {volunteer.age ?? '—'}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <p>{volunteer.email}</p>
                    <p>{volunteer.phone || '—'}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {Array.isArray(volunteer.skills) && volunteer.skills.length > 0
                      ? volunteer.skills.join(', ')
                      : '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {Array.isArray(volunteer.availability?.days) && volunteer.availability.days.length > 0
                      ? volunteer.availability.days.join(', ')
                      : '—'}
                    {volunteer.availability?.timeSlot && (
                      <span className="block text-xs text-gray-400">{volunteer.availability.timeSlot}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                        volunteer.status === 'approved' || volunteer.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : volunteer.status === 'rejected'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {volunteer.status?.replace('_', ' ') ?? 'pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      {volunteer.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => approveVolunteer(volunteer.id)}
                            className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => rejectVolunteer(volunteer.id)}
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => openEditModal(volunteer)}
                        className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-blue-200 hover:text-blue-600"
                      >
                        <Pencil className="mr-1 h-4 w-4" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(volunteer.id)}
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

      {pendingVolunteers.length > 0 && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <h2 className="text-sm font-semibold text-blue-800">
            Pending approvals: {pendingVolunteers.length}
          </h2>
          <p className="mt-1 text-xs text-blue-700">Respond within 48 hours to keep energy and enthusiasm high.</p>
        </div>
      )}

      <DashboardModal
        open={formOpen}
        onClose={closeModal}
        title="Edit Volunteer"
        description="Keep contact details and preferred availability accurate for smooth coordination."
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
              form="volunteer-form"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Changes
            </button>
          </>
        }
      >
        <form id="volunteer-form" className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Full name</label>
              <input
                type="text"
                {...register('name')}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                {...register('email')}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                {...register('phone')}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Age</label>
              <input
                type="number"
                min="16"
                {...register('age')}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              {errors.age && <p className="mt-1 text-xs text-red-500">{errors.age.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <select
                {...register('status')}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                {VOLUNTEER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Skills (comma separated)</label>
            <input
              type="text"
              {...register('skills')}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Counselling, Music, Physiotherapy"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Motivation (optional)</label>
            <textarea
              rows={3}
              {...register('motivation')}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Availability days</label>
              <input
                type="text"
                {...register('availability_days')}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Mon, Wed, Fri"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Preferred time slot</label>
              <input
                type="text"
                {...register('availability_time')}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Evenings"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Emergency contact name</label>
              <input
                type="text"
                {...register('emergency_name')}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Emergency contact phone</label>
              <input
                type="text"
                {...register('emergency_phone')}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </form>
      </DashboardModal>
    </div>
  )
}

export default VolunteerManagement
