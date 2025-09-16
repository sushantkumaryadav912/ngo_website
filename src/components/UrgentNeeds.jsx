import { useState, useEffect } from 'react'
import PaymentModal from './PaymentModal'
import { client, urgentNeedsQuery } from '../lib/sanity'

const UrgentNeeds = () => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [urgentNeeds, setUrgentNeeds] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUrgentNeeds()
  }, [])

  const fetchUrgentNeeds = async () => {
    try {
      const needs = await client.fetch(urgentNeedsQuery)
      setUrgentNeeds(needs)
    } catch (error) {
      console.error('Error fetching urgent needs:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculatePercentage = (raised, target) => {
    return Math.round((raised / target) * 100)
  }

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-red-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading urgent needs...</p>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {urgentNeeds.map((need) => {
              const percentage = calculatePercentage(need.raisedAmount, need.targetAmount)
              
              return (
                <div key={need._id} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border-l-4 border-red-500">
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

          {urgentNeeds.length === 0 && (
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
