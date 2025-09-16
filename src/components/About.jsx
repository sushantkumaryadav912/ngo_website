const About = () => {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800">
            A Haven of Care and Compassion
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Our mission is to provide a safe, nurturing, and dignified home for the elderly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Image Section */}
          <div className="rounded-lg overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
            <img 
              src="https://images.unsplash.com/photo-1599422478953-3c2471b36978?q=80&w=1887" 
              alt="Elderly couple smiling" 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content Section */}
          <div className="space-y-6">
            <h3 className="text-3xl font-semibold text-gray-700">Welcome to Suryoday</h3>
            <p className="text-gray-600 leading-relaxed">
              Suryoday Old Age Home is more than just a residence; it is a community built on love, respect, and companionship. We believe in creating an environment where our elders can spend their golden years with joy and peace, surrounded by people who care.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Our dedicated staff provides round-the-clock support, ensuring that every resident receives personalized attention and medical care. We focus on holistic well-being, combining physical health with mental and emotional happiness.
            </p>
            <div className="flex justify-around pt-4 border-t border-gray-200">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">50+</div>
                <div className="text-gray-500">Happy Residents</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600">15+</div>
                <div className="text-gray-500">Years of Service</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-500">24/7</div>
                <div className="text-gray-500">Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
