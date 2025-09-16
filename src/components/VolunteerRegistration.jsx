import { useState } from 'react'
import { client } from '../lib/sanity'

const VolunteerRegistration = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    skills: [],
    availability: {
      days: [],
      timeSlot: ''
    },
    experience: '',
    motivation: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    }
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState('')

  const skillOptions = [
    { value: 'healthcare', label: 'Healthcare/Medical' },
    { value: 'cooking', label: 'Cooking' },
    { value: 'entertainment', label: 'Entertainment/Music' },
    { value: 'gardening', label: 'Gardening' },
    { value: 'teaching', label: 'Teaching/Education' },
    { value: 'technology', label: 'Technology Support' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'administrative', label: 'Administrative' },
    { value: 'events', label: 'Event Planning' },
    { value: 'fundraising', label: 'Fundraising' }
  ]

  const dayOptions = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ]

  const timeSlotOptions = [
    { value: 'morning', label: 'Morning (9 AM - 12 PM)' },
    { value: 'afternoon', label: 'Afternoon (12 PM - 4 PM)' },
    { value: 'evening', label: 'Evening (4 PM - 8 PM)' },
    { value: 'flexible', label: 'Flexible' }
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSkillChange = (skillValue) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skillValue)
        ? prev.skills.filter(skill => skill !== skillValue)
        : [...prev.skills, skillValue]
    }))
  }

  const handleDayChange = (dayValue) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        days: prev.availability.days.includes(dayValue)
          ? prev.availability.days.filter(day => day !== dayValue)
          : [...prev.availability.days, dayValue]
      }
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('')

    try {
      const volunteerDoc = {
        _type: 'volunteer',
        ...formData,
        age: parseInt(formData.age),
        status: 'pending',
        joinDate: new Date().toISOString()
      }

      await client.create(volunteerDoc)
      setSubmitStatus('success')
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        age: '',
        skills: [],
        availability: { days: [], timeSlot: '' },
        experience: '',
        motivation: '',
        emergencyContact: { name: '', relationship: '', phone: '' }
      })

      setTimeout(() => {
        onClose()
        setSubmitStatus('')
      }, 2000)

    } catch (error) {
      console.error('Error submitting volunteer application:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Volunteer Registration</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {submitStatus === 'success' && (
            <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg">
              <p className="text-green-800 font-semibold">✅ Application submitted successfully!</p>
              <p className="text-green-700 text-sm">We'll review your application and get back to you within 48 hours.</p>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg">
              <p className="text-red-800 font-semibold">❌ Error submitting application</p>
              <p className="text-red-700 text-sm">Please try again or contact us directly.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name *"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address *"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  required
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number *"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  required
                />
                <input
                  type="number"
                  name="age"
                  placeholder="Age *"
                  min="16"
                  max="80"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Skills & Interests */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Skills & Interests</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {skillOptions.map(skill => (
                  <label key={skill.value} className="flex items-center space-x-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.skills.includes(skill.value)}
                      onChange={() => handleSkillChange(skill.value)}
                      className="text-blue-500"
                    />
                    <span className="text-sm">{skill.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Availability</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Available Days</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {dayOptions.map(day => (
                    <label key={day.value} className="flex items-center space-x-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.availability.days.includes(day.value)}
                        onChange={() => handleDayChange(day.value)}
                        className="text-blue-500"
                      />
                      <span className="text-sm">{day.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time Slot</label>
                <select
                  name="availability.timeSlot"
                  value={formData.availability.timeSlot}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  required
                >
                  <option value="">Select time slot</option>
                  {timeSlotOptions.map(slot => (
                    <option key={slot.value} value={slot.value}>{slot.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Experience & Motivation */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Previous Volunteer Experience</label>
                <textarea
                  name="experience"
                  placeholder="Tell us about any previous volunteer work or relevant experience..."
                  value={formData.experience}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Why do you want to volunteer? *</label>
                <textarea
                  name="motivation"
                  placeholder="Share your motivation for volunteering with us..."
                  value={formData.motivation}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  name="emergencyContact.name"
                  placeholder="Contact Name"
                  value={formData.emergencyContact.name}
                  onChange={handleInputChange}
                  className="p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
                <input
                  type="text"
                  name="emergencyContact.relationship"
                  placeholder="Relationship"
                  value={formData.emergencyContact.relationship}
                  onChange={handleInputChange}
                  className="p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
                <input
                  type="tel"
                  name="emergencyContact.phone"
                  placeholder="Contact Phone"
                  value={formData.emergencyContact.phone}
                  onChange={handleInputChange}
                  className="p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold rounded-lg hover:from-green-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default VolunteerRegistration
