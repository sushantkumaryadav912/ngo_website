import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { toast } from 'react-hot-toast'
import { CalendarPlus, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import DashboardModal from '../../components/dashboard/DashboardModal'
import { eventAPI } from '../../services/api'

const STATUSES = [
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'Cancelled', value: 'cancelled' },
]

const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  event_date: z.string().min(1, 'Event date and time is required'),
  location: z.string().optional(),
  image_url: z.string().url('Provide a valid image URL').or(z.literal('')).optional(),
  category: z.string().optional(),
  max_volunteers: z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .transform((value) => {
      if (value === '' || value === null || value === undefined) return null
      const numeric = typeof value === 'string' ? Number(value) : value
      return Number.isFinite(numeric) ? numeric : null
    })
    .optional(),
  status: z.enum(['draft', 'published', 'cancelled']),
})

const defaultValues = {
  title: '',
  description: '',
  event_date: '',
  location: '',
  image_url: '',
  category: 'general',
  max_volunteers: '',
  status: 'published',
}

const EventManagement = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues,
  })

  const loadEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await eventAPI.getAll()
      setEvents(response.data?.data ?? response.data ?? [])
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to fetch events')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [])

  const openCreateModal = () => {
    setEditingEvent(null)
    reset(defaultValues)
    setFormOpen(true)
  }

  const openEditModal = (event) => {
    setEditingEvent(event)
    reset({
      title: event.title || '',
      description: event.description || '',
      event_date: event.event_date ? format(new Date(event.event_date), "yyyy-MM-dd'T'HH:mm") : '',
      location: event.location || '',
      image_url: event.image_url || '',
      category: event.category || 'general',
      max_volunteers: event.max_volunteers ?? '',
      status: event.status || 'published',
    })
    setFormOpen(true)
  }

  const closeModal = () => {
    setFormOpen(false)
    setEditingEvent(null)
    reset(defaultValues)
  }

  const onSubmit = async (values) => {
    const payload = {
      ...values,
      event_date: new Date(values.event_date).toISOString(),
      max_volunteers:
        values.max_volunteers === null || values.max_volunteers === ''
          ? null
          : Number(values.max_volunteers),
      image_url: values.image_url || null,
      category: values.category || 'general',
    }

    try {
      setIsSubmitting(true)
      if (editingEvent) {
        await eventAPI.update(editingEvent.id, payload)
        toast.success('Event updated successfully')
      } else {
        await eventAPI.create(payload)
        toast.success('Event created successfully')
      }
      closeModal()
      await loadEvents()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save event')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Delete this event? This action cannot be undone.')
    if (!confirmed) return

    try {
      await eventAPI.delete(id)
      toast.success('Event deleted successfully')
      await loadEvents()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete event')
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Event Management</h1>
          <p className="text-gray-500">
            Organise upcoming events, share important information, and keep volunteers aligned.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          New Event
        </button>
      </header>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">{error}</div>}

      {loading ? (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-gray-500">Loading events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-10 text-center">
          <CalendarPlus className="mx-auto h-10 w-10 text-indigo-400" />
          <h2 className="mt-3 text-lg font-medium text-gray-800">No events yet</h2>
          <p className="mt-2 text-sm text-gray-500">Create your first event to involve the community.</p>
          <button
            type="button"
            onClick={openCreateModal}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Plan an event
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {events.map((event) => (
            <article key={event.id} className="flex h-full flex-col rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <header className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{event.title}</h2>
                  <p className="mt-1 text-sm text-gray-500">{event.location || 'Location to be confirmed'}</p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                    event.status === 'cancelled'
                      ? 'bg-red-100 text-red-600'
                      : event.status === 'draft'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-indigo-100 text-indigo-600'
                  }`}
                >
                  {(event.status || 'published').replace('_', ' ')}
                </span>
              </header>

              <dl className="mt-4 space-y-2 text-sm text-gray-500">
                <div className="flex justify-between">
                  <dt>Date & Time</dt>
                  <dd>{event.event_date ? format(new Date(event.event_date), 'PPpp') : 'TBD'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Volunteers Needed</dt>
                  <dd>{event.max_volunteers ?? '—'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Category</dt>
                  <dd>{event.category || 'General'}</dd>
                </div>
              </dl>

              {event.description && (
                <p className="mt-4 flex-1 text-sm text-gray-600">{event.description}</p>
              )}

              <footer className="mt-6 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(event)}
                  className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-indigo-200 hover:text-indigo-600"
                >
                  <Pencil className="mr-1 h-4 w-4" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(event.id)}
                  className="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                >
                  <Trash2 className="mr-1 h-4 w-4" /> Delete
                </button>
              </footer>
            </article>
          ))}
        </div>
      )}

      <DashboardModal
        open={formOpen}
        onClose={closeModal}
        title={editingEvent ? 'Edit Event' : 'Create Event'}
        description="Share a warm invitation, provide key logistics, and keep volunteers prepared."
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
              form="event-form"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingEvent ? 'Update Event' : 'Create Event'}
            </button>
          </>
        }
      >
        <form id="event-form" className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              {...register('title')}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              placeholder="e.g. Community Health Camp"
            />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              rows={3}
              {...register('description')}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              placeholder="Tell volunteers what this event is about and how they can help"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Date & Time</label>
              <input
                type="datetime-local"
                {...register('event_date')}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
              {errors.event_date && <p className="mt-1 text-xs text-red-500">{errors.event_date.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                {...register('location')}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                placeholder="e.g. Suryoday Center, Pune"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Cover image URL</label>
              <input
                type="url"
                {...register('image_url')}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                placeholder="https://example.com/event.jpg"
              />
              {errors.image_url && <p className="mt-1 text-xs text-red-500">{errors.image_url.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Category</label>
              <input
                type="text"
                {...register('category')}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                placeholder="e.g. Health, Celebration, Awareness"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Volunteer slots</label>
              <input
                type="number"
                min="0"
                {...register('max_volunteers')}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                placeholder="e.g. 20"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <select
                {...register('status')}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                {STATUSES.map((statusOption) => (
                  <option key={statusOption.value} value={statusOption.value}>
                    {statusOption.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </form>
      </DashboardModal>
    </div>
  )
}

export default EventManagement
