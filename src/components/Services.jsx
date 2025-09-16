const services = [
  {
    icon: '❤️',
    title: '24/7 Medical Care',
    description: 'Round-the-clock medical supervision and emergency support from qualified professionals.',
  },
  {
    icon: '🍽️',
    title: 'Nutritious Meals',
    description: 'Wholesome, home-cooked meals tailored to the dietary needs and preferences of each resident.',
  },
  {
    icon: '🧘',
    title: 'Recreational Activities',
    description: 'Engaging activities like yoga, board games, and gardening to keep the mind and body active.',
  },
  {
    icon: '🏠',
    title: 'Comfortable Living',
    description: 'Clean, safe, and comfortable living spaces designed to feel just like home.',
  },
];

const Services = () => {
  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800">Our Comprehensive Care</h2>
          <p className="mt-4 text-lg text-gray-600">
            We provide holistic support to ensure the well-being of our residents.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div 
              key={index}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border-t-4 border-blue-500 hover:border-purple-500"
            >
              <div className="text-5xl mb-4">{service.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{service.title}</h3>
              <p className="text-gray-600">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
