import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { Camera, ImageOff, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import DashboardModal from '../../components/dashboard/DashboardModal'
import { galleryAPI } from '../../services/api'

const gallerySchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  image_url: z.string().url('Provide a valid image URL'),
  category: z.string().min(2, 'Category is required'),
  status: z.enum(['draft', 'published']).default('published'),
})

const defaultValues = {
  title: '',
  description: '',
  image_url: '',
  category: 'general',
  status: 'published',
}

const GalleryManagement = () => {
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
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(gallerySchema),
    defaultValues,
  })

  const loadGallery = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await galleryAPI.getAll()
      setItems(response.data?.data ?? response.data ?? [])
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load gallery')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGallery()
  }, [])

  const openCreateModal = () => {
    setEditingItem(null)
    reset(defaultValues)
    setFormOpen(true)
  }

  const openEditModal = (item) => {
    setEditingItem(item)
    reset({
      title: item.title || '',
      description: item.description || '',
      image_url: item.image_url || '',
      category: item.category || 'general',
      status: item.status || 'published',
    })
    setFormOpen(true)
  }

  const closeModal = () => {
    setFormOpen(false)
    setEditingItem(null)
    reset(defaultValues)
  }

  const onSubmit = async (values) => {
    try {
      setIsSubmitting(true)
      if (editingItem) {
        await galleryAPI.update(editingItem.id, values)
        toast.success('Gallery item updated')
      } else {
        await galleryAPI.create(values)
        toast.success('Gallery item created')
      }
      closeModal()
      await loadGallery()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save gallery item')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Delete this image permanently?')
    if (!confirmed) return

    try {
      await galleryAPI.delete(id)
      toast.success('Gallery item removed')
      await loadGallery()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete gallery item')
    }
  }

  const previewUrl = watch('image_url')

  const statusBadgeClasses = useMemo(
    () => ({
      published: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
      draft: 'bg-amber-50 text-amber-600 border border-amber-200',
    }),
    []
  )

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Gallery Management</h1>
          <p className="text-gray-500">
            Curate uplifting moments from the home and keep your media library organised.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Add gallery item
        </button>
      </header>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">{error}</div>}

      {loading ? (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-gray-500">Loading gallery...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white p-12 text-gray-500">
          <Camera className="h-10 w-10 text-indigo-400" />
          <h2 className="mt-3 text-lg font-medium text-gray-800">No gallery items yet</h2>
          <p className="mt-2 text-sm">Share the smiles and milestones happening every week.</p>
          <button
            type="button"
            onClick={openCreateModal}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Upload first image
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <figure key={item.id} className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.title || 'Gallery item'}
                  className="h-48 w-full object-cover transition group-hover:scale-[1.02]"
                />
              ) : (
                <div className="flex h-48 w-full items-center justify-center bg-gray-100 text-gray-400">
                  <ImageOff className="h-8 w-8" />
                </div>
              )}
              <figcaption className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.title || 'Untitled'}</p>
                    {item.description && <p className="mt-1 text-xs text-gray-500">{item.description}</p>}
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${
                      statusBadgeClasses[item.status || 'published']
                    }`}
                  >
                    {item.status || 'published'}
                  </span>
                </div>
                <footer className="mt-auto flex items-center justify-between pt-4 text-xs text-gray-400">
                  <span>{item.category || 'general'}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-indigo-200 hover:text-indigo-600"
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
                  </div>
                </footer>
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      <DashboardModal
        open={formOpen}
        onClose={closeModal}
        title={editingItem ? 'Edit gallery entry' : 'Add to gallery'}
        description="Link to an uploaded image, add a short story, and choose the category for grouping."
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
              form="gallery-form"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingItem ? 'Save changes' : 'Create entry'}
            </button>
          </>
        }
      >
        <form id="gallery-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              {...register('title')}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              placeholder="e.g. Holi celebrations"
            />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Image URL</label>
            <input
              type="url"
              {...register('image_url')}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              placeholder="https://..."
            />
            {errors.image_url && <p className="mt-1 text-xs text-red-500">{errors.image_url.message}</p>}
          </div>

          {previewUrl && (
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
              <img src={previewUrl} alt="Preview" className="h-48 w-full object-cover" />
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700">Story / caption</label>
            <textarea
              rows={3}
              {...register('description')}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              placeholder="Share the context behind this moment"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Category</label>
              <input
                type="text"
                {...register('category')}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                placeholder="Celebrations, Healthcare, Visitors"
              />
              {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <select
                {...register('status')}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </form>
      </DashboardModal>
    </div>
  )
}

export default GalleryManagement
