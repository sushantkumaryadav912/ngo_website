import { useEffect, useState } from 'react'
import { eventAPI } from '../../services/api'
import { format } from 'date-fns'

const VolunteerEvents = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await eventAPI.getAll({ upcoming: true })
      setEvents(response.data ?? [])
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load events')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">Upcoming Events</h1>
        <p className="text-gray-500">Join our upcoming events and make a difference.</p>
      </header>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4">{error}</div>}

      {loading ? (
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <p className="text-gray-500">Loading events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm text-center text-gray-500">
          No upcoming events right now. Check back soon!
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {events.map((event) => (
            <article key={event.id} className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
              <header>
                <h2 className="text-lg font-semibold text-gray-900">{event.title}</h2>
                {event.event_date && (
                  <p className="text-sm text-gray-500 mt-1">{format(new Date(event.event_date), 'PPpp')}</p>
                )}
              </header>
              {event.location && <p className="mt-2 text-sm text-gray-500">Location: {event.location}</p>}
              {event.description && <p className="mt-3 text-sm text-gray-600">{event.description}</p>}
              <footer className="mt-4 text-xs text-gray-400 flex items-center justify-between">
                <span>Category: {event.category || 'General'}</span>
                {event.max_volunteers && <span>Spots: {event.max_volunteers}</span>}
              </footer>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default VolunteerEvents
