import { useEffect, useMemo, useState } from 'react'
import { galleryAPI } from '../services/api'

const skeletonImages = new Array(6).fill(null)

const Gallery = () => {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadImages = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await galleryAPI.getAll()
        const records = Array.isArray(response?.data?.data)
          ? response.data.data
          : Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response)
              ? response
              : []

        const parsed = records
          .filter((item) => item.status !== 'archived')
          .map((item, index) => ({
            id: item.id || `gallery-${index}`,
            title: item.title || `Gallery image ${index + 1}`,
            description: item.description || '',
            imageUrl: item.image_url || item.imageUrl,
            category: item.category || 'general',
          }))
          .filter((item) => Boolean(item.imageUrl))

        setImages(parsed)
      } catch (err) {
        console.error('Error loading gallery images:', err)
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    loadImages()
  }, [])

  const contentHeading = useMemo(() => ({
    title: 'Moments of Joy',
    subtitle: 'A glimpse into the happy and vibrant life at Suryoday.',
  }), [])

  return (
    <section id="gallery" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800">{contentHeading.title}</h2>
          <p className="mt-4 text-lg text-gray-600">{contentHeading.subtitle}</p>
        </div>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-600">
            Unable to load gallery at the moment. Please check back soon.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {(loading ? skeletonImages : images).map((item, index) => {
              const isSkeleton = loading || !item
              return (
                <div
                  key={item?.id ?? `skeleton-${index}`}
                  className={`overflow-hidden rounded-lg shadow-lg group h-48 ${
                    isSkeleton ? 'bg-gray-100 animate-pulse' : 'bg-white'
                  }`}
                >
                  {isSkeleton ? (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
                  ) : (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 cursor-pointer"
                      loading="lazy"
                    />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

export default Gallery

