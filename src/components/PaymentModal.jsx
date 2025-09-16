import { useState } from 'react'

const PaymentModal = ({ isOpen, onClose }) => {
  const [selectedAmount, setSelectedAmount] = useState('')
  const [customAmount, setCustomAmount] = useState('')
  const [selectedMethod, setSelectedMethod] = useState('upi')
  const [donorInfo, setDonorInfo] = useState({
    name: '',
    email: '',
    phone: ''
  })

  const predefinedAmounts = [500, 1000, 2500, 5000, 10000]

  const handlePayment = () => {
    const amount = customAmount || selectedAmount
    if (!amount || !donorInfo.name || !donorInfo.email) {
      alert('Please fill all required fields')
      return
    }

    switch (selectedMethod) {
      case 'upi':
        handleUPIPayment(amount)
        break
      case 'razorpay':
        handleRazorpayPayment(amount)
        break
      case 'bank':
        handleBankTransfer(amount)
        break
      default:
        break
    }
  }

  const handleUPIPayment = (amount) => {
    const upiId = 'suryoday@paytm' 
    const upiUrl = `upi://pay?pa=${upiId}&pn=Suryoday Old Age Home&am=${amount}&cu=INR&tn=Donation for Suryoday Old Age Home`
    
    if (/Android|iPhone/i.test(navigator.userAgent)) {
      window.location.href = upiUrl
      setTimeout(() => {
        showUPIQR(amount)
      }, 3000)
    } else {
      showUPIQR(amount)
    }
  }

  const handleRazorpayPayment = (amount) => {
    alert(`Redirecting to Razorpay for ₹${amount}...\n\nIn production, this will open Razorpay checkout.`)
    
    // This is where you'd integrate actual Razorpay
    // const options = {
    //   key: "your_razorpay_key",
    //   amount: amount * 100,
    //   currency: "INR",
    //   name: "Suryoday Old Age Home",
    //   description: "Donation",
    //   handler: function (response) {
    //     // Handle successful payment
    //   }
    // }
    // const rzp = new window.Razorpay(options)
    // rzp.open()
    
    setTimeout(() => {
      alert('Payment Successful! Thank you for your donation.')
      onClose()
    }, 2000)
  }

  const handleBankTransfer = (amount) => {
    const bankDetails = `
Bank Details for Transfer:
Account Name: Tejaswi Foundation
Account No: 1234567890
IFSC Code: SBIN0012345
Bank: State Bank of India
Amount: ₹${amount}

Please use your name as reference while transferring.
    `
    alert(bankDetails)
    
    // In production, you might want to:
    // - Copy to clipboard
    // - Send email with bank details
    // - Show a modal with bank details
  }

  const showUPIQR = (amount) => {
    alert(`Please scan the QR code to pay ₹${amount}\n\nIn production, this will show a QR code image.`)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Make a Donation</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Amount Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Select Amount</label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {predefinedAmounts.map(amount => (
                <button
                  key={amount}
                  onClick={() => {
                    setSelectedAmount(amount)
                    setCustomAmount('')
                  }}
                  className={`p-3 rounded-lg border-2 font-semibold transition-all ${
                    selectedAmount === amount
                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  ₹{amount}
                </button>
              ))}
            </div>
            <input
              type="number"
              placeholder="Enter custom amount"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value)
                setSelectedAmount('')
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Donor Information */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Your Information</label>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Full Name *"
                value={donorInfo.name}
                onChange={(e) => setDonorInfo({...donorInfo, name: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                required
              />
              <input
                type="email"
                placeholder="Email Address *"
                value={donorInfo.email}
                onChange={(e) => setDonorInfo({...donorInfo, email: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                required
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={donorInfo.phone}
                onChange={(e) => setDonorInfo({...donorInfo, phone: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
            <div className="space-y-2">
              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  checked={selectedMethod === 'upi'}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="mr-3"
                />
                <div className="flex items-center">
                  <span className="text-2xl mr-3">📱</span>
                  <div>
                    <div className="font-semibold">UPI Payment</div>
                    <div className="text-sm text-gray-600">PhonePe, Paytm, GooglePay, etc.</div>
                  </div>
                </div>
              </label>

              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="razorpay"
                  checked={selectedMethod === 'razorpay'}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="mr-3"
                />
                <div className="flex items-center">
                  <span className="text-2xl mr-3">💳</span>
                  <div>
                    <div className="font-semibold">Credit/Debit Card</div>
                    <div className="text-sm text-gray-600">Secure online payment</div>
                  </div>
                </div>
              </label>

              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bank"
                  checked={selectedMethod === 'bank'}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="mr-3"
                />
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🏦</span>
                  <div>
                    <div className="font-semibold">Bank Transfer</div>
                    <div className="text-sm text-gray-600">NEFT/IMPS transfer</div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Tax Benefit Info */}
          <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-green-600 mr-2">ℹ️</span>
              <span className="text-sm text-green-700">
                Your donation is eligible for 80G tax deduction
              </span>
            </div>
          </div>

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-lg hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-300 shadow-lg"
          >
            Donate ₹{customAmount || selectedAmount || '0'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaymentModal
