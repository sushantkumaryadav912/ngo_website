import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { authAPI } from '../services/api'

const initialProfile = {
  full_name: '',
  phone: '',
  address: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
}

const Profile = () => {
  const { user, updateUser } = useAuth()
  const [profile, setProfile] = useState(initialProfile)
  const [originalProfile, setOriginalProfile] = useState(initialProfile)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const nextProfile = {
      full_name: user.full_name || user.name || '',
      phone: user.phone || '',
      address: user.address || '',
      emergency_contact_name: user.emergency_contact_name || '',
      emergency_contact_phone: user.emergency_contact_phone || '',
    }

    setProfile(nextProfile)
    setOriginalProfile(nextProfile)
    setLoading(false)
  }, [user])

  const handleChange = (event) => {
    const { name, value } = event.target
    setError(null)
    setSuccess(null)
    setProfile((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      if (!user) {
        setError('You need to be signed in to update your profile.')
        return
      }

      const sanitize = (value) => (value ?? '').trim()

      const payload = {
        full_name: sanitize(profile.full_name),
        phone: sanitize(profile.phone),
        address: sanitize(profile.address),
        emergency_contact_name: sanitize(profile.emergency_contact_name),
        emergency_contact_phone: sanitize(profile.emergency_contact_phone),
      }

      const { data } = await authAPI.updateProfile(payload)

      if (data?.user) {
        updateUser(data.user)
        const normalizedProfile = {
          full_name: data.user.full_name || data.user.name || '',
          phone: data.user.phone || '',
          address: data.user.address || '',
          emergency_contact_name: data.user.emergency_contact_name || '',
          emergency_contact_phone: data.user.emergency_contact_phone || '',
        }

        setProfile(normalizedProfile)
        setOriginalProfile(normalizedProfile)
      }

      setSuccess(data?.message || 'Profile updated successfully')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const isDirty = useMemo(() => JSON.stringify(profile) !== JSON.stringify(originalProfile), [profile, originalProfile])

  if (loading) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
        <p className="text-gray-500">Manage your personal information and emergency contact details.</p>
      </header>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4">{error}</div>}
      {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg p-4">{success}</div>}

      <form className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="full_name" className="text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              value={profile.full_name}
              onChange={handleChange}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="phone" className="text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={profile.phone}
              onChange={handleChange}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., +91 98765 43210"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="address" className="text-sm font-medium text-gray-700">
            Address
          </label>
          <textarea
            id="address"
            name="address"
            rows="3"
            value={profile.address}
            onChange={handleChange}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Street, city, state"
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="emergency_contact_name" className="text-sm font-medium text-gray-700">
              Emergency Contact Name
            </label>
            <input
              id="emergency_contact_name"
              name="emergency_contact_name"
              type="text"
              value={profile.emergency_contact_name}
              onChange={handleChange}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="emergency_contact_phone" className="text-sm font-medium text-gray-700">
              Emergency Contact Phone
            </label>
            <input
              id="emergency_contact_phone"
              name="emergency_contact_phone"
              type="tel"
              value={profile.emergency_contact_phone}
              onChange={handleChange}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Contact number"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              setProfile(originalProfile)
              setError(null)
              setSuccess(null)
            }}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-60"
            disabled={!isDirty || saving}
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={saving || !isDirty}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Profile
