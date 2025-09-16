import { useEffect } from 'react'

const GoogleTranslate = ({ className = "" }) => {
  useEffect(() => {
    if (window.google && window.google.translate) {
      window.googleTranslateElementInit();
    }
  }, [])

  return (
    <div className={`google-translate-wrapper ${className}`}>
      <div id="google_translate_element"></div>
    </div>
  )
}

export default GoogleTranslate
