import { createContext, useContext, useState } from 'react'

const LanguageContext = createContext()

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en')

  const translations = {
    en: {
      // Navigation
      home: 'Home',
      about: 'About',
      services: 'Services', 
      gallery: 'Gallery',
      contact: 'Contact',
      
      // Hero Section
      heroTitle: 'SURYODAY',
      heroSubtitle: 'OLD AGE HOME',
      heroTagline: 'Give the Gift of a Dignified Home to the Elderly',
      donateNow: 'Donate Now',
      getInvolved: 'Get Involved',
      
      // Stats
      residentsCount: 'Residents Cared For',
      yearsService: 'Years of Service',
      careSupport: 'Care & Support',
      
      // Urgent Needs
      urgentNeeds: 'Urgent Needs',
      urgentDesc: 'Help us meet our immediate requirements',
      urgent: 'URGENT',
      raised: 'Raised',
      
      // About
      aboutTitle: 'A Haven of Care and Compassion',
      aboutDesc: 'Our mission is to provide a safe, nurturing, and dignified home for the elderly.',
    },
    
    hi: {
      // Navigation  
      home: 'मुख्य',
      about: 'हमारे बारे में',
      services: 'सेवाएं',
      gallery: 'गैलरी', 
      contact: 'संपर्क',
      
      // Hero Section
      heroTitle: 'सुर्योदय',
      heroSubtitle: 'वृद्धाश्रम',
      heroTagline: 'बुजुर्गों को सम्मानजनक घर का उपहार दें',
      donateNow: 'दान करें',
      getInvolved: 'शामिल हों',
      
      // Stats
      residentsCount: 'निवासियों की देखभाल',
      yearsService: 'सेवा के वर्ष',
      careSupport: 'देखभाल और सहायता',
      
      // Urgent Needs
      urgentNeeds: 'तत्काल आवश्यकताएं',
      urgentDesc: 'हमारी तत्काल आवश्यकताओं को पूरा करने में हमारी सहायता करें',
      urgent: 'तत्काल',
      raised: 'एकत्रित',
      
      // About
      aboutTitle: 'देखभाल और करुणा का आश्रय',
      aboutDesc: 'हमारा मिशन बुजुर्गों के लिए एक सुरक्षित, पोषण और सम्मानजनक घर प्रदान करना है।',
    }
  }

  const t = (key) => translations[language][key] || key

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'hi' : 'en')
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}
