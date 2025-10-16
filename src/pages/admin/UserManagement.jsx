import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { Loader2, Mail, Plus, ShieldCheck, Trash2, Users } from 'lucide-react'
import DashboardModal from '../../components/dashboard/DashboardModal'
import { userAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'

const roles = ['super_admin', 'admin', 'volunteer']
const statuses = ['active', 'inactive']

const userSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Provide a valid email address'),
  role: z.enum(['super_admin', 'admin', 'volunteer']),
})

const defaultValues = {
  name: '',
  email: '',
  role: 'volunteer',
}

const UserManagement = () => {
  const { user: currentUser, isSuperAdmin } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdCredentials, setCreatedCredentials] = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues,
  })

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await userAPI.getAll()
      setUsers(response.data?.data ?? response.data ?? [])
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleRoleChange = async (userId, role) => {
    try {
      await userAPI.updateRole(userId, role)
      toast.success('Role updated')
      await loadUsers()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update role')
    }
  }

  const handleStatusChange = async (userId, status) => {
    try {
      await userAPI.updateStatus(userId, status)
      toast.success('Status updated')
      await loadUsers()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update status')
    }
  }

  const handleDelete = async (user) => {
    if (!user) return
    const confirmed = window.confirm(`Delete ${user.name || user.full_name || user.email}? This cannot be undone.`)
    if (!confirmed) return

    try {
      await userAPI.delete(user.id)
      toast.success('User deleted')
      await loadUsers()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete user')
    }
  }

  const openCreateModal = () => {
    setFormOpen(true)
    reset(defaultValues)
    setCreatedCredentials(null)
  }

  const closeModal = () => {
    setFormOpen(false)
    reset(defaultValues)
  }

  const onSubmit = async (values) => {
    try {
      setIsSubmitting(true)
      const response = await userAPI.create(values)
      const payload = response.data || response
      toast.success('User invited successfully')
      setCreatedCredentials({
        name: payload.user?.name || values.name,
        email: payload.user?.email || values.email,
        tempPassword: payload.tempPassword,
        role: payload.user?.role || values.role,
      })
      closeModal()
      await loadUsers()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create user')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
          <p className="text-gray-500">
            Invite admins, manage volunteer access, and keep your governance structure healthy.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" /> Invite user
        </button>
      </header>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">{error}</div>}

      {createdCredentials && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-700">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5" />
            <div>
              <p className="font-semibold">Share these temporary credentials with {createdCredentials.name}:</p>
              <ul className="mt-2 space-y-1 text-xs text-indigo-600">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{createdCredentials.email}</span>
                </li>
                {createdCredentials.tempPassword && (
                  <li className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Password: {createdCredentials.tempPassword}</span>
                  </li>
                )}
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Role: {createdCredentials.role}</span>
                </li>
              </ul>
              <p className="mt-3 text-xs text-indigo-500">
                Ask them to log in and change the password immediately. Hide this card once you have shared the details.
              </p>
              <button
                type="button"
                onClick={() => setCreatedCredentials(null)}
                className="mt-4 inline-flex items-center rounded-lg border border-indigo-200 px-3 py-1.5 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100"
              >
                Hide credentials
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <p className="text-gray-500">Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm text-center text-gray-500">
          No users found.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">Name</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">Email</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">Role</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">Status</th>
                <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => {
                const isSelf = currentUser?.id === user.id
                const roleSelectDisabled = isSelf || (!isSuperAdmin && (user.role === 'admin' || user.role === 'super_admin'))
                const statusSelectDisabled = isSelf || (!isSuperAdmin && user.role !== 'volunteer')
                const deleteDisabled = isSelf || user.role === 'super_admin' || (!isSuperAdmin && user.role !== 'volunteer')

                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{user.full_name || user.name}</p>
                      <p className="text-xs text-gray-400">ID: {user.id}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <select
                        className="px-2 py-1 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={user.role || 'volunteer'}
                        onChange={(event) => handleRoleChange(user.id, event.target.value)}
                        disabled={roleSelectDisabled}
                      >
                        {roles.map((role) => {
                          const optionDisabled = !isSuperAdmin && role !== 'volunteer'
                          return (
                            <option key={role} value={role} disabled={optionDisabled && role !== (user.role || 'volunteer')}>
                              {role.replace('_', ' ')}
                            </option>
                          )
                        })}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <select
                        className="px-2 py-1 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={user.status || 'active'}
                        onChange={(event) => handleStatusChange(user.id, event.target.value)}
                        disabled={statusSelectDisabled}
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status.replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-500">
                      <button
                        type="button"
                        onClick={() => handleDelete(user)}
                        disabled={deleteDisabled}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" /> Remove
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <DashboardModal
        open={formOpen}
        onClose={closeModal}
        title="Invite a new user"
        description="Send a welcome email with temporary credentials. Only Super Admins can invite new admins or super admins."
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
              form="user-form"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Invite user
            </button>
          </>
        }
      >
        <form id="user-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Full name</label>
            <input
              type="text"
              {...register('name')}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              placeholder="e.g. Ananya Desai"
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Email address</label>
            <input
              type="email"
              {...register('email')}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              placeholder="name@example.com"
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Role</label>
            <select
              {...register('role')}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role.replace('_', ' ')}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-400">
              Only Super Admins can invite new admins or super admins. Others default to volunteer accounts.
            </p>
          </div>
        </form>
      </DashboardModal>
    </div>
  )
}

export default UserManagement
