import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'react-hot-toast'
import { FilePlus2, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import DashboardModal from '../../components/dashboard/DashboardModal'
import { contentAPI } from '../../services/api'

const CONTENT_TYPES = [
  { label: 'Announcements', value: 'announcements' },
  { label: 'Resident Stories', value: 'resident-stories' },
  { label: 'Success Stories', value: 'success-stories' },
  { label: 'Blog Posts', value: 'blog-posts' },
]

const STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'Archived', value: 'archived' },
]

const contentSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  excerpt: z.string().max(280, 'Excerpt should be under 280 characters').optional(),
  content: z.string().min(10, 'Full content must be at least 10 characters'),
  image_url: z.string().url('Enter a valid image URL').or(z.literal('')).optional(),
  status: z.enum(['draft', 'published', 'archived']),
})

const defaultValues = {
  title: '',
  excerpt: '',
  content: '',
  image_url: '',
  status: 'draft',
}

const ContentManagement = () => {
  const [type, setType] = useState(CONTENT_TYPES[0].value)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(contentSchema),
    defaultValues,
  })

  const loadContent = async (nextType = type) => {
    try {
      setLoading(true)
      setError(null)
      const response = await contentAPI.getByType(nextType)
      setItems(response.data?.data ?? response.data ?? [])
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load content')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadContent()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleTypeChange = async (nextType) => {
    setType(nextType)
    await loadContent(nextType)
  }

  const openCreateModal = () => {
    setEditingItem(null)
    reset(defaultValues)
    setFormOpen(true)
  }

  const openEditModal = (item) => {
    setEditingItem(item)
    reset({
      title: item.title || '',
      excerpt: item.excerpt || '',
      content: item.content || '',
      image_url: item.image_url || '',
      status: item.status || 'draft',
    })
    setFormOpen(true)
  }

  const closeModal = () => {
    setFormOpen(false)
    setEditingItem(null)
    reset(defaultValues)
  }

  const onSubmit = async (values) => {
    const payload = {
      ...values,
      type,
      image_url: values.image_url || null,
      metadata: {},
    }

    try {
      setIsSubmitting(true)
      if (editingItem) {
        await contentAPI.update(editingItem.id, payload)
        toast.success('Content updated successfully')
      } else {
        await contentAPI.create(payload)
        toast.success('Content created successfully')
      }
      closeModal()
      await loadContent()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save content')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Delete this content item? You can recreate it any time later.')
    if (!confirmed) return

    try {
      await contentAPI.delete(id)
      toast.success('Content deleted successfully')
      await loadContent()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete content')
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Content Management</h1>
          <p className="text-gray-500">
            Celebrate every milestone, story, and announcement from the Suryoday family.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-gray-100 bg-white p-1 shadow-sm">
            {CONTENT_TYPES.map((option) => (
              <button
                key={option.value}
                onClick={() => handleTypeChange(option.value)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition ${
                  type === option.value
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700"
          >
            <Plus className="h-4 w-4" />
            New {CONTENT_TYPES.find((item) => item.value === type)?.label?.slice(0, -1)}
          </button>
        </div>
      </header>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">{error}</div>}

      {loading ? (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-gray-500">Loading content...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-10 text-center">
          <FilePlus2 className="mx-auto h-10 w-10 text-purple-400" />
          <h2 className="mt-3 text-lg font-medium text-gray-800">No stories yet</h2>
          <p className="mt-2 text-sm text-gray-500">
            Create heartfelt updates to keep supporters close to our residents.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700"
          >
            <Plus className="h-4 w-4" />
            Share a story
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <article key={item.id} className="flex h-full flex-col rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <header className="mb-3">
                <h2 className="text-lg font-semibold text-gray-900">{item.title}</h2>
                <p className="text-xs text-gray-400">ID: {item.id}</p>
              </header>
              {item.excerpt && <p className="text-sm text-gray-600">{item.excerpt}</p>}
              <div className="mt-4 flex-1 text-xs text-gray-400">
                <span>Status: {item.status || 'draft'}</span>
              </div>
              <footer className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(item)}
                  className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-purple-200 hover:text-purple-600"
                >
                  <Pencil className="mr-1 h-4 w-4" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
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
        title={editingItem ? 'Edit Content' : 'Create Content'}
        description="Warm, compassionate storytelling helps donors and families feel connected to daily life at Suryoday."
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
              form="content-form"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingItem ? 'Update Content' : 'Publish Content'}
            </button>
          </>
        }
      >
        <form id="content-form" className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              {...register('title')}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
              placeholder="e.g. A day in the life at Suryoday"
            />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Excerpt</label>
            <textarea
              rows={2}
              {...register('excerpt')}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
              placeholder="Short teaser shown on cards and previews (optional)"
            />
            {errors.excerpt && <p className="mt-1 text-xs text-red-500">{errors.excerpt.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Full story</label>
            <textarea
              rows={6}
              {...register('content')}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
              placeholder="Share every detail that matters"
            />
            {errors.content && <p className="mt-1 text-xs text-red-500">{errors.content.message}</p>}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Image URL</label>
              <input
                type="url"
                {...register('image_url')}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                placeholder="https://example.com/story.jpg"
              />
              {errors.image_url && <p className="mt-1 text-xs text-red-500">{errors.image_url.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <select
                {...register('status')}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
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

export default ContentManagement
