import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'react-hot-toast'
import { AlertTriangle, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import DashboardModal from '../../components/dashboard/DashboardModal'
import { urgentNeedAPI } from '../../services/api'

const needSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  target_amount: z
    .union([z.string(), z.number()])
    .transform((value) => Number(value))
    .pipe(z.number().min(1000, 'Target must be at least ₹1,000')),
  raised_amount: z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .transform((value) => {
      if (value === '' || value === null || value === undefined) return 0
      return Number(value)
    })
    .optional(),
  category: z.string().optional(),
  end_date: z.string().optional(),
  is_urgent: z.boolean().default(true),
  is_active: z.boolean().default(true),
})

const defaultValues = {
  title: '',
  description: '',
  target_amount: '',
  raised_amount: 0,
  category: 'general',
  end_date: '',
  is_urgent: true,
  is_active: true,
}

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString()}`

const calculateProgress = (targetValue, raisedValue) => {
  const target = Number(targetValue) || 0
  const raised = Number(raisedValue) || 0

  if (target <= 0) {
    return 0
  }

  const percentage = Math.round((raised / target) * 100)
  return Math.min(100, Math.max(0, percentage))
}

const UrgentNeedsManagement = () => {
  const [needs, setNeeds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingNeed, setEditingNeed] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(needSchema),
    defaultValues,
  })

  const watchedTarget = watch('target_amount')
  const watchedRaised = watch('raised_amount')

  const projectedProgress = useMemo(
    () => calculateProgress(watchedTarget, watchedRaised),
    [watchedTarget, watchedRaised]
  )

  const loadNeeds = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await urgentNeedAPI.getAll()
      setNeeds(response.data?.data ?? response.data ?? [])
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load urgent needs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNeeds()
  }, [])

  const openCreateModal = () => {
    setEditingNeed(null)
    reset(defaultValues)
    setFormOpen(true)
  }

  const openEditModal = (need) => {
    setEditingNeed(need)
    reset({
      title: need.title || '',
      description: need.description || '',
      target_amount: need.target_amount ?? need.goal_amount ?? '',
      raised_amount: need.raised_amount ?? 0,
      category: need.category || 'general',
      end_date: need.end_date ? need.end_date.substring(0, 10) : '',
      is_urgent: Boolean(need.is_urgent),
      is_active: Boolean(need.is_active),
    })
    setFormOpen(true)
  }

  const closeModal = () => {
    setFormOpen(false)
    setEditingNeed(null)
    reset(defaultValues)
  }

  const onSubmit = async (values) => {
    const payload = {
      title: values.title,
      description: values.description || '',
      target_amount: Number(values.target_amount),
      raised_amount: Number(values.raised_amount) || 0,
      category: values.category || 'general',
      end_date: values.end_date ? new Date(values.end_date).toISOString() : null,
      is_urgent: values.is_urgent,
      is_active: values.is_active,
    }

    try {
      setIsSubmitting(true)
      if (editingNeed) {
        await urgentNeedAPI.update(editingNeed.id, payload)
        toast.success('Urgent need updated')
      } else {
        await urgentNeedAPI.create(payload)
        toast.success('Urgent need created')
      }
      closeModal()
      await loadNeeds()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save urgent need')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Delete this urgent need? This cannot be undone.')
    if (!confirmed) return

    try {
      await urgentNeedAPI.delete(id)
      toast.success('Urgent need deleted')
      await loadNeeds()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete urgent need')
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Urgent Needs</h1>
          <p className="text-gray-500">
            Track funding progress, update totals, and highlight priorities needing immediate care.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700"
        >
          <Plus className="h-4 w-4" />
          Add Urgent Need
        </button>
      </header>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">{error}</div>}

      {loading ? (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-gray-500">Loading urgent needs...</p>
        </div>
      ) : needs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-10 text-center text-gray-500">
          <AlertTriangle className="mx-auto h-10 w-10 text-rose-400" />
          <h2 className="mt-3 text-lg font-medium text-gray-800">No urgent needs yet</h2>
          <p className="mt-2 text-sm text-gray-500">
            When a critical requirement arises, add it here so donors can respond quickly.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700"
          >
            <Plus className="h-4 w-4" />
            Create first urgent need
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {needs.map((need) => {
            const target = need.target_amount ?? need.goal_amount ?? 0
            const raised = need.raised_amount ?? 0
            const progress = calculateProgress(target, raised)
            const badgeClass = need.is_urgent ? 'bg-rose-100 text-rose-600' : 'bg-orange-100 text-orange-600'

            return (
              <article key={need.id} className="flex h-full flex-col rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <header className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{need.title}</h2>
                    {need.description && <p className="mt-2 text-sm text-gray-500">{need.description}</p>}
                  </div>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}>
                    {need.is_urgent ? 'URGENT' : 'Important'}
                  </span>
                </header>

                <dl className="mt-4 space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <dt>Target</dt>
                    <dd>{formatCurrency(target)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Raised</dt>
                    <dd>{formatCurrency(raised)}</dd>
                  </div>
                  {need.end_date && (
                    <div className="flex justify-between">
                      <dt>Ends</dt>
                      <dd>{new Date(need.end_date).toLocaleDateString()}</dd>
                    </div>
                  )}
                </dl>

                <div className="mt-4">
                  <div className="w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-rose-500 to-orange-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-gray-400">
                    <span>{progress}% funded</span>
                    <span>{need.is_active ? 'Active' : 'Archived'}</span>
                  </div>
                </div>

                <footer className="mt-6 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(need)}
                    className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-rose-200 hover:text-rose-600"
                  >
                    <Pencil className="mr-1 h-4 w-4" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(need.id)}
                    className="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                  >
                    <Trash2 className="mr-1 h-4 w-4" /> Delete
                  </button>
                </footer>
              </article>
            )
          })}
        </div>
      )}

      <DashboardModal
        open={formOpen}
        onClose={closeModal}
        title={editingNeed ? 'Edit Urgent Need' : 'Create Urgent Need'}
        description="Highlight critical requirements with accurate targets and timelines so donors can respond quickly."
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
              form="urgent-need-form"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingNeed ? 'Save Changes' : 'Create Need'}
            </button>
          </>
        }
      >
        <form id="urgent-need-form" className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              {...register('title')}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-100"
              placeholder="e.g. Medical supplies for winter"
            />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              rows={3}
              {...register('description')}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-100"
              placeholder="Explain how the funds will be used"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Target amount (₹)</label>
              <input
                type="number"
                min="0"
                {...register('target_amount')}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-100"
              />
              {errors.target_amount && <p className="mt-1 text-xs text-red-500">{errors.target_amount.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Raised so far (₹)</label>
              <input
                type="number"
                min="0"
                {...register('raised_amount')}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-100"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Category</label>
              <input
                type="text"
                {...register('category')}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-100"
                placeholder="Healthcare, Nutrition, Infrastructure"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Due date</label>
              <input
                type="date"
                {...register('end_date')}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-100"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                {...register('is_urgent')}
                className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
              />
              Mark as urgent
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                {...register('is_active')}
                className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
              />
              Keep active on site
            </label>
            <div className="text-sm text-gray-500">Projected funding: {projectedProgress}%</div>
          </div>
        </form>
      </DashboardModal>
    </div>
  )
}

export default UrgentNeedsManagement
