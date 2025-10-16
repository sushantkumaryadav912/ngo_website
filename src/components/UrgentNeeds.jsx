import { useState, useEffect, useMemo } from 'react'
import PaymentModal from './PaymentModal'
import { urgentNeedAPI } from '../services/api'

const normalizeNeedsResponse = (response) => {
  if (!response) return []
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.data)) return response.data
  if (Array.isArray(response?.data?.data)) return response.data.data
  return []
}

const UrgentNeeds = () => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [urgentNeeds, setUrgentNeeds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchUrgentNeeds()
  }, [])

  const fetchUrgentNeeds = async () => {
    try {
      setError(null)
      const response = await urgentNeedAPI.getAll({ active: true })
      const needs = normalizeNeedsResponse(response).map((need) => ({
        id: need.id,
        title: need.title,
        description: need.description,
        targetAmount: Number(need.target_amount ?? need.targetAmount ?? 0),
        raisedAmount: Number(need.raised_amount ?? need.raisedAmount ?? 0),
        isUrgent: Boolean(need.is_urgent ?? need.isUrgent ?? true),
        category: need.category || 'general',
      }))
      setUrgentNeeds(needs)
    } catch (error) {
      console.error('Error fetching urgent needs:', error)
      setError(error)
    } finally {
      setLoading(false)
    }
  }

  const contentState = useMemo(() => {
    if (loading) {
      return {
        variant: 'loading',
      }
    }

    if (error) {
      return {
        variant: 'error',
        message: 'Failed to load urgent needs. Please try again later.',
      }
    }

    if (!urgentNeeds.length) {
      return {
        variant: 'empty',
      }
    }

    return {
      variant: 'data',
      records: urgentNeeds,
    }
  }, [loading, error, urgentNeeds])

  const calculatePercentage = (raised, target) => {
    if (!target || target <= 0) return 0
    return Math.round((raised / target) * 100)
  }

  if (contentState.variant === 'loading') {
    return (
      <section className="py-20 bg-gradient-to-br from-red-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading urgent needs...</p>
        </div>
      </section>
    )
  }

  if (contentState.variant === 'error') {
    return (
      <section className="py-20 bg-gradient-to-br from-red-50 to-orange-50">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">We are facing a hiccup</h3>
          <p className="text-gray-600">{contentState.message}</p>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="py-20 bg-gradient-to-br from-red-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Urgent Needs</h2>
            <p className="text-lg text-gray-600">Help us meet our immediate requirements</p>
          </div>

          {contentState.variant === 'data' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {contentState.records.map((need) => {
                const percentage = calculatePercentage(need.raisedAmount, need.targetAmount)
                
                return (
                  <div key={need.id} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border-l-4 border-red-500">
                    {need.isUrgent && (
                      <span className="inline-block px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded-full mb-4">
                        URGENT
                      </span>
                    )}
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{need.title}</h3>
                    {need.description && (
                      <p className="text-gray-600 text-sm mb-4">{need.description}</p>
                    )}
                    <div className="text-2xl font-bold text-red-600 mb-4">₹{need.targetAmount.toLocaleString()}</div>
                    
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Raised: ₹{need.raisedAmount.toLocaleString()}</span>
                        <span>{percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-red-500 to-orange-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <button 
                      onClick={() => setIsPaymentModalOpen(true)}
                      className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-lg hover:from-red-600 hover:to-orange-600 transform hover:scale-105 transition-all duration-300"
                    >
                      Donate Now
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {contentState.variant === 'empty' && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-2xl font-semibold text-gray-700 mb-2">All Needs Met!</h3>
              <p className="text-gray-600">Thanks to your generous support, we have no urgent needs at this time.</p>
            </div>
          )}
        </div>
      </section>

      <PaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
      />
    </>
  );
};

export default UrgentNeeds;
