import { useState, useEffect, useCallback } from 'react'
import GoogleTranslate from './GoogleTranslate'

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')

  // Handle scroll effects and active section detection
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setIsScrolled(scrollPosition > 50)

      // Determine active section based on scroll position
  const sections = ['hero', 'about', 'services', 'gallery', 'contact']
      const sectionOffsets = sections.map(section => {
        const element = document.getElementById(section)
        return element ? element.offsetTop - 100 : 0
      })

      for (let i = sections.length - 1; i >= 0; i--) {
        if (scrollPosition >= sectionOffsets[i]) {
          setActiveSection(sections[i])
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Smooth scroll to section
  const scrollToSection = useCallback((sectionId) => {
    const element = document.getElementById(sectionId.toLowerCase())
    if (element) {
      const headerOffset = 80
      const elementPosition = element.offsetTop - headerOffset
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      })
    }
    setIsMobileMenuOpen(false)
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event, sectionId) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      scrollToSection(sectionId)
    }
  }, [scrollToSection])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('nav')) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isMobileMenuOpen])

  const navItems = [
    { name: 'Home', id: 'hero' },
    { name: 'About', id: 'about' },
    { name: 'Services', id: 'services' },
    { name: 'Gallery', id: 'gallery' },
    { name: 'Contact', id: 'contact' }
  ]

  return (
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/20' 
          : 'bg-transparent'
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => scrollToSection('home')}
            onKeyDown={(e) => handleKeyDown(e, 'home')}
            tabIndex={0}
            role="button"
            aria-label="Go to home section"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <span className="text-white font-bold text-xl drop-shadow-sm">S</span>
            </div>
            <div className="group-hover:text-blue-600 transition-colors duration-300">
              <div className="font-bold text-lg text-gray-800 leading-tight">SURYODAY</div>
              <div className="text-sm text-gray-600 leading-tight">Old Age Home</div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                onKeyDown={(e) => handleKeyDown(e, item.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 relative group focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                  activeSection === item.id
                    ? 'text-blue-600 bg-blue-50 shadow-sm'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50/50'
                }`}
                aria-current={activeSection === item.id ? 'page' : undefined}
              >
                {item.name}
                <span 
                  className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 transition-all duration-300 ${
                    activeSection === item.id ? 'w-6' : 'w-0 group-hover:w-6'
                  }`}
                ></span>
              </button>
            ))}
            
            {/* Google Translate Widget */}
            <div className="ml-6 pl-6 border-l border-gray-200">
              <GoogleTranslate className="scale-90 hover:scale-100 transition-transform duration-200" />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-3 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            <div className="w-6 h-6 relative">
              <span className={`absolute h-0.5 w-6 bg-current transform transition-all duration-300 ${
                isMobileMenuOpen ? 'rotate-45 top-3' : 'top-1'
              }`}></span>
              <span className={`absolute h-0.5 w-6 bg-current top-3 transition-all duration-300 ${
                isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
              }`}></span>
              <span className={`absolute h-0.5 w-6 bg-current transform transition-all duration-300 ${
                isMobileMenuOpen ? '-rotate-45 top-3' : 'top-5'
              }`}></span>
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        <div 
          id="mobile-menu"
          className={`md:hidden transition-all duration-300 ${
            isMobileMenuOpen 
              ? 'max-h-96 opacity-100 pb-4' 
              : 'max-h-0 opacity-0 pb-0'
          } overflow-hidden`}
          aria-hidden={!isMobileMenuOpen}
        >
          <div className="space-y-1 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/50 p-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                onKeyDown={(e) => handleKeyDown(e, item.id)}
                className={`w-full text-left px-4 py-3 rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                  activeSection === item.id
                    ? 'text-blue-600 bg-blue-50 shadow-sm font-medium'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50/70'
                }`}
                aria-current={activeSection === item.id ? 'page' : undefined}
              >
                <span className="flex items-center justify-between">
                  {item.name}
                  {activeSection === item.id && (
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  )}
                </span>
              </button>
            ))}
            
            {/* Mobile Google Translate */}
            <div className="px-4 py-3 border-t border-gray-200/50 mt-2">
              <GoogleTranslate />
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
