import { useMemo, useState } from 'react'
import PaymentModal from './PaymentModal'
import { useContentSection } from '../hooks/useContentSection'

const defaultHeroContent = {
  title: 'SURYODAY',
  subtitle: 'OLD AGE HOME',
  tagline: 'Give the Gift of a Dignified Home to the Elderly',
  description: '[translate:सुर्योदय वृद्धाश्रम - तेजस्वी फाउंडेशन संचलित]',
  stats: [
    { label: 'Residents Cared For', value: '30+', accent: 'text-blue-600' },
    { label: 'Years of Service', value: '5+', accent: 'text-purple-600' },
    { label: 'Care & Support', value: '24/7', accent: 'text-yellow-500' },
  ],
  donateButton: { label: 'Donate Now', prefix: '💝' },
  getInvolvedButton: { label: 'Get Involved', prefix: '🤝', target: 'about' },
  banner: { text: '80G Tax Exemption Available' },
  emergencyContact: { label: 'Emergency Contact', phone: '+91 123 456 7890' },
}

const Hero = () => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const { data, loading } = useContentSection('home-hero', { defaultValue: defaultHeroContent })

  const heroContent = useMemo(() => {
    if (!data) return defaultHeroContent

    const metadata = data.metadata || {}

    return {
      ...defaultHeroContent,
      title: data.title || metadata.title || defaultHeroContent.title,
      subtitle: metadata.subtitle || defaultHeroContent.subtitle,
      tagline: metadata.tagline || defaultHeroContent.tagline,
      description: metadata.description || data.excerpt || defaultHeroContent.description,
      stats: Array.isArray(metadata.stats) && metadata.stats.length > 0 ? metadata.stats : defaultHeroContent.stats,
      donateButton: metadata.donateButton || defaultHeroContent.donateButton,
      getInvolvedButton: metadata.getInvolvedButton || defaultHeroContent.getInvolvedButton,
      banner: metadata.banner || defaultHeroContent.banner,
      emergencyContact: metadata.emergencyContact || defaultHeroContent.emergencyContact,
    }
  }, [data])

  return (
    <>
  <section id="hero" className="relative min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          {/* Main Heading */}
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 mb-4 animate-fade-in-up">
              {loading ? defaultHeroContent.title : heroContent.title}
            </h1>
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-700 mb-2 animate-fade-in-up animation-delay-200">
              {loading ? defaultHeroContent.subtitle : heroContent.subtitle}
            </h2>
            <p className="text-lg text-gray-600 mb-4 animate-fade-in-up animation-delay-300">
              {loading ? defaultHeroContent.description : heroContent.description}
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-6 animate-fade-in-up animation-delay-400"></div>
          </div>

          {/* Tagline */}
          <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed animate-fade-in-up animation-delay-600">
            {loading ? defaultHeroContent.tagline : heroContent.tagline}
          </p>

          {/* Impact Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8 animate-fade-in-up animation-delay-700">
            {(loading ? defaultHeroContent.stats : heroContent.stats).map((stat, index) => (
              <div
                key={`${stat.label}-${index}`}
                className="text-center bg-white bg-opacity-80 backdrop-blur-sm rounded-lg p-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <div className={`text-3xl md:text-4xl font-bold ${stat.accent || 'text-blue-600'}`}>
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-800">
            <button 
              onClick={() => setIsPaymentModalOpen(true)}
              className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-full hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center">
                <span className="mr-2">{(loading ? defaultHeroContent.donateButton : heroContent.donateButton)?.prefix || '💝'}</span>
                {(loading ? defaultHeroContent.donateButton : heroContent.donateButton)?.label || 'Donate Now'}
              </span>
            </button>
            <button 
              onClick={() => {
                const target = (loading ? defaultHeroContent.getInvolvedButton : heroContent.getInvolvedButton)?.target || 'about'
                const element = document.getElementById(target)
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' })
                }
              }}
              className="group px-8 py-4 border-2 border-blue-500 text-blue-500 font-semibold rounded-full hover:bg-blue-500 hover:text-white transform hover:scale-105 transition-all duration-300 relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center">
                <span className="mr-2">{(loading ? defaultHeroContent.getInvolvedButton : heroContent.getInvolvedButton)?.prefix || '🤝'}</span>
                {(loading ? defaultHeroContent.getInvolvedButton : heroContent.getInvolvedButton)?.label || 'Get Involved'}
              </span>
            </button>
          </div>

          {/* Additional Info Banner */}
          <div className="mt-8 animate-fade-in-up animation-delay-1000">
            <div className="inline-block px-6 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold border border-green-200">
              <span className="mr-2">✅</span>
              {(loading ? defaultHeroContent.banner : heroContent.banner)?.text || defaultHeroContent.banner.text}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center cursor-pointer hover:border-blue-500 transition-colors duration-300">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse"></div>
          </div>
          <p className="text-xs text-gray-500 mt-2 hidden sm:block">Scroll Down</p>
        </div>

        {/* Emergency Contact Float */}
        <div className="fixed bottom-6 right-6 z-40">
          <div className="bg-red-500 text-white p-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 cursor-pointer animate-pulse">
            <span className="text-xl">📞</span>
          </div>
          <div className="absolute bottom-16 right-0 bg-white text-gray-800 p-3 rounded-lg shadow-lg opacity-0 hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            <div className="font-semibold">{(loading ? defaultHeroContent.emergencyContact : heroContent.emergencyContact)?.label || 'Emergency Contact'}</div>
            <div className="text-sm">{(loading ? defaultHeroContent.emergencyContact : heroContent.emergencyContact)?.phone || defaultHeroContent.emergencyContact.phone}</div>
          </div>
        </div>
      </section>

      {/* Payment Modal */}
      <PaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
      />
    </>
  )
}

export default Hero
