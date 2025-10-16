import { useMemo } from 'react'
import { useContentSection } from '../hooks/useContentSection'

const defaultAboutContent = {
  heading: 'A Haven of Care and Compassion',
  subheading: 'Our mission is to provide a safe, nurturing, and dignified home for the elderly.',
  title: 'Welcome to Suryoday',
  paragraphs: [
    'Suryoday Old Age Home is more than just a residence; it is a community built on love, respect, and companionship. We believe in creating an environment where our elders can spend their golden years with joy and peace, surrounded by people who care.',
    'Our dedicated staff provides round-the-clock support, ensuring that every resident receives personalized attention and medical care. We focus on holistic well-being, combining physical health with mental and emotional happiness.',
  ],
  imageUrl: 'https://images.unsplash.com/photo-1599422478953-3c2471b36978?q=80&w=1887',
  stats: [
    { label: 'Happy Residents', value: '50+', accent: 'text-blue-600' },
    { label: 'Years of Service', value: '15+', accent: 'text-purple-600' },
    { label: 'Support', value: '24/7', accent: 'text-yellow-500' },
  ],
}

const About = () => {
  const { data, loading } = useContentSection('home-about', { defaultValue: defaultAboutContent })

  const content = useMemo(() => {
    if (!data) return defaultAboutContent
    const metadata = data.metadata || {}

    return {
      ...defaultAboutContent,
      heading: metadata.heading || data.title || defaultAboutContent.heading,
      subheading: metadata.subheading || data.excerpt || defaultAboutContent.subheading,
      title: metadata.title || metadata.sectionTitle || defaultAboutContent.title,
      paragraphs: Array.isArray(metadata.paragraphs) && metadata.paragraphs.length > 0
        ? metadata.paragraphs
        : defaultAboutContent.paragraphs,
      imageUrl: metadata.imageUrl || data.image_url || defaultAboutContent.imageUrl,
      stats: Array.isArray(metadata.stats) && metadata.stats.length > 0
        ? metadata.stats
        : defaultAboutContent.stats,
    }
  }, [data])

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800">
            {loading ? defaultAboutContent.heading : content.heading}
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            {loading ? defaultAboutContent.subheading : content.subheading}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Image Section */}
          <div className="rounded-lg overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
            <img 
              src={loading ? defaultAboutContent.imageUrl : content.imageUrl}
              alt={content.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          {/* Content Section */}
          <div className="space-y-6">
            <h3 className="text-3xl font-semibold text-gray-700">
              {loading ? defaultAboutContent.title : content.title}
            </h3>
            {(loading ? defaultAboutContent.paragraphs : content.paragraphs).map((paragraph, index) => (
              <p key={index} className="text-gray-600 leading-relaxed">
                {paragraph}
              </p>
            ))}
            <div className="flex justify-around pt-4 border-t border-gray-200">
              {(loading ? defaultAboutContent.stats : content.stats).map((stat, index) => (
                <div key={`${stat.label}-${index}`} className="text-center">
                  <div className={`text-4xl font-bold ${stat.accent || 'text-blue-600'}`}>{stat.value}</div>
                  <div className="text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
