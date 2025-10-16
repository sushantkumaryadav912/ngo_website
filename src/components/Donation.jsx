import { useMemo } from 'react'
import { useContentSection } from '../hooks/useContentSection'

const defaultDonationContent = {
  heading: 'How You Can Help',
  subheading: 'Your contribution makes a real difference in the lives of our residents',
  methods: [
    {
      icon: '📱',
      title: 'UPI Payment',
      description: 'Scan QR code or use UPI ID',
      action: 'Pay with UPI',
    },
    {
      icon: '🏦',
      title: 'Bank Transfer',
      description: 'NEFT/IMPS direct transfer',
      action: 'View Bank Details',
    },
    {
      icon: '💳',
      title: 'Online Payment',
      description: 'Credit/Debit card payments',
      action: 'Pay Online',
    },
  ],
  taxBenefit: {
    title: 'Tax Benefits Available',
    description: 'Your donations are eligible for tax deduction under Section 80G of the Income Tax Act',
    badge: '80G Certificate Provided',
  },
}

const Donation = () => {
  const { data, loading } = useContentSection('home-donation', { defaultValue: defaultDonationContent })

  const content = useMemo(() => {
    if (!data) return defaultDonationContent
    const metadata = data.metadata || {}

    return {
      ...defaultDonationContent,
      heading: metadata.heading || data.title || defaultDonationContent.heading,
      subheading: metadata.subheading || data.excerpt || defaultDonationContent.subheading,
      methods: Array.isArray(metadata.methods) && metadata.methods.length ? metadata.methods : defaultDonationContent.methods,
      taxBenefit: {
        ...defaultDonationContent.taxBenefit,
        ...(metadata.taxBenefit || {}),
      },
    }
  }, [data])

  const methods = loading ? defaultDonationContent.methods : content.methods

  return (
    <section className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            {loading ? defaultDonationContent.heading : content.heading}
          </h2>
          <p className="text-lg text-gray-600">
            {loading ? defaultDonationContent.subheading : content.subheading}
          </p>
        </div>

        {/* Donation Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {methods.map((method, index) => (
            <div key={`${method.title}-${index}`} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 text-center">
              <div className="text-4xl mb-4">{method.icon || '💖'}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{method.title}</h3>
              <p className="text-gray-600 mb-4">{method.description}</p>
              {method.action && (
                <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-300">
                  {method.action}
                </button>
              )}
              {method.details && (
                <div className="mt-4 text-sm text-gray-500 whitespace-pre-wrap">
                  {method.details}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Tax Benefits */}
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            {loading ? defaultDonationContent.taxBenefit.title : content.taxBenefit.title}
          </h3>
          <p className="text-gray-600 mb-4">
            {loading ? defaultDonationContent.taxBenefit.description : content.taxBenefit.description}
          </p>
          <div className="inline-block px-6 py-2 bg-green-100 text-green-800 font-semibold rounded-full">
            {loading ? defaultDonationContent.taxBenefit.badge : content.taxBenefit.badge}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Donation
