const Donation = () => {
  const donationMethods = [
    {
      title: "UPI Payment",
      icon: "📱",
      description: "Scan QR code or use UPI ID",
      action: "Pay with UPI"
    },
    {
      title: "Bank Transfer",
      icon: "🏦", 
      description: "NEFT/IMPS direct transfer",
      action: "Bank Details"
    },
    {
      title: "Online Payment",
      icon: "💳",
      description: "Credit/Debit card payments",
      action: "Pay Online"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">How You Can Help</h2>
          <p className="text-lg text-gray-600">Your contribution makes a real difference in the lives of our residents</p>
        </div>

        {/* Donation Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {donationMethods.map((method, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 text-center">
              <div className="text-4xl mb-4">{method.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{method.title}</h3>
              <p className="text-gray-600 mb-4">{method.description}</p>
              <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-300">
                {method.action}
              </button>
            </div>
          ))}
        </div>

        {/* Tax Benefits */}
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Tax Benefits Available</h3>
          <p className="text-gray-600 mb-4">
            Your donations are eligible for tax deduction under Section 80G of the Income Tax Act
          </p>
          <div className="inline-block px-6 py-2 bg-green-100 text-green-800 font-semibold rounded-full">
            80G Certificate Provided
          </div>
        </div>
      </div>
    </section>
  );
};

export default Donation;
