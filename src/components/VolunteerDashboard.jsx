import { useState, useEffect } from 'react'
import { client, volunteersQuery, pendingVolunteersQuery } from '../lib/sanity'

const VolunteerDashboard = () => {
  const [volunteers, setVolunteers] = useState([])
  const [pendingVolunteers, setPendingVolunteers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending')

  useEffect(() => {
    fetchVolunteers()
  }, [])

  const fetchVolunteers = async () => {
    try {
      const [allVolunteers, pending] = await Promise.all([
        client.fetch(volunteersQuery),
        client.fetch(pendingVolunteersQuery)
      ])
      setVolunteers(allVolunteers)
      setPendingVolunteers(pending)
    } catch (error) {
      console.error('Error fetching volunteers:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateVolunteerStatus = async (volunteerId, newStatus) => {
    try {
      await client
        .patch(volunteerId)
        .set({ status: newStatus })
        .commit()
      
      // Refresh data
      fetchVolunteers()
    } catch (error) {
      console.error('Error updating volunteer status:', error)
    }
  }

  const formatSkills = (skills) => {
    if (!skills || skills.length === 0) return 'No skills listed'
    return skills.map(skill => {
      const skillLabels = {
        healthcare: 'Healthcare',
        cooking: 'Cooking',
        entertainment: 'Entertainment',
        gardening: 'Gardening',
        teaching: 'Teaching',
        technology: 'Technology',
        transportation: 'Transportation',
        administrative: 'Administrative',
        events: 'Event Planning',
        fundraising: 'Fundraising'
      }
      return skillLabels[skill] || skill
    }).join(', ')
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      active: 'bg-blue-100 text-blue-800 border-blue-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return colors[status] || colors.pending
  }

  if (loading) {
    return (
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading volunteer data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Volunteer Management</h2>
          <p className="text-lg text-gray-600">Manage volunteer applications and assignments</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-lg">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-2 rounded-md font-semibold transition-all duration-300 ${
                activeTab === 'pending'
                  ? 'bg-yellow-500 text-white'
                  : 'text-gray-600 hover:text-yellow-600'
              }`}
            >
              Pending ({pendingVolunteers.length})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-2 rounded-md font-semibold transition-all duration-300 ${
                activeTab === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              All Volunteers ({volunteers.length})
            </button>
          </div>
        </div>

        {/* Volunteer Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="text-3xl font-bold text-yellow-500">{pendingVolunteers.length}</div>
            <div className="text-gray-600">Pending Review</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="text-3xl font-bold text-green-500">
              {volunteers.filter(v => v.status === 'active').length}
            </div>
            <div className="text-gray-600">Active Volunteers</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="text-3xl font-bold text-blue-500">
              {volunteers.filter(v => v.status === 'approved').length}
            </div>
            <div className="text-gray-600">Approved</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="text-3xl font-bold text-purple-500">{volunteers.length}</div>
            <div className="text-gray-600">Total Applications</div>
          </div>
        </div>

        {/* Volunteer List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 gap-1">
            {(activeTab === 'pending' ? pendingVolunteers : volunteers).map((volunteer) => (
              <div key={volunteer._id} className="p-6 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-semibold text-gray-800 mr-3">{volunteer.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(volunteer.status)}`}>
                        {volunteer.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                      <div>📧 {volunteer.email}</div>
                      <div>📞 {volunteer.phone}</div>
                      <div>🎂 {volunteer.age} years old</div>
                    </div>
                    
                    <div className="mb-2">
                      <strong className="text-gray-700">Skills:</strong>
                      <span className="ml-2 text-gray-600">{formatSkills(volunteer.skills)}</span>
                    </div>
                    
                    <div className="mb-2">
                      <strong className="text-gray-700">Availability:</strong>
                      <span className="ml-2 text-gray-600">
                        {volunteer.availability?.days?.join(', ') || 'Not specified'} - 
                        {volunteer.availability?.timeSlot || 'Not specified'}
                      </span>
                    </div>
                    
                    {volunteer.motivation && (
                      <div className="mb-2">
                        <strong className="text-gray-700">Motivation:</strong>
                        <p className="text-gray-600 mt-1">{volunteer.motivation}</p>
                      </div>
                    )}
                  </div>

                  {volunteer.status === 'pending' && (
                    <div className="flex flex-col sm:flex-row gap-2 mt-4 lg:mt-0">
                      <button
                        onClick={() => updateVolunteerStatus(volunteer._id, 'approved')}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => updateVolunteerStatus(volunteer._id, 'rejected')}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        ✗ Reject
                      </button>
                    </div>
                  )}

                  {volunteer.status === 'approved' && (
                    <button
                      onClick={() => updateVolunteerStatus(volunteer._id, 'active')}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mt-4 lg:mt-0"
                    >
                      Activate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {(activeTab === 'pending' ? pendingVolunteers : volunteers).length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {activeTab === 'pending' ? 'No Pending Applications' : 'No Volunteers Yet'}
              </h3>
              <p className="text-gray-600">
                {activeTab === 'pending' 
                  ? 'All applications have been reviewed.' 
                  : 'Start by promoting your volunteer program to get applications.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default VolunteerDashboard
