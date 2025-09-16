const Contact = () => {
  return (
    <section id="contact" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800">Contact Us</h2>
          <p className="mt-4 text-lg text-gray-600">
            Reach out for inquiries, donations, or volunteering opportunities
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Google Map */}
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Our Location</h3>
            <div className="w-full h-64 rounded-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3782.8756147343594!2d73.81153624984516!3d18.438525285693064!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc295de23939edf%3A0x1d28d684b5e22a8!2sSURYODAY%20OLD%20AGE%20HOME!5e0!3m2!1sen!2sin!4v1726502300000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
            <p className="mt-4 text-gray-600 text-sm">
              <strong>SURYODAY OLD AGE HOME</strong><br />
              सुर्योदय वृद्धाश्रम - तेजस्वी फाउंडेशन संचलित<br />
              Pune, Maharashtra, India
            </p>
          </div>

          {/* Contact Form & Details */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="font-semibold text-gray-800 mb-4">Get in Touch</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="text-xl">📧</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Email</h4>
                    <p className="text-gray-600">contact@suryodayhome.org</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-xl">📞</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Phone</h4>
                    <p className="text-gray-600">+91 123 456 7890</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-xl">🏛️</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Trust Registration</h4>
                    <p className="text-gray-600">Registration No: [Your Trust No.]</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Contact Form */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="font-semibold text-gray-800 mb-4">Send a Message</h3>
              <form className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Your Name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
                <input 
                  type="email" 
                  placeholder="Your Email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
                <textarea 
                  placeholder="Your Message"
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                ></textarea>
                <button className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
