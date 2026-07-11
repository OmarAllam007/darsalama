import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { translations } from './translations'

const LanguageContext = createContext(null)

function getInitialLang() {
  const stored = localStorage.getItem('lang')
  return stored === 'ar' || stored === 'en' ? stored : 'en'
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(getInitialLang)

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    localStorage.setItem('lang', lang)
  }, [lang])

  const value = useMemo(() => {
    const dict = translations[lang]
    const t = (path) =>
      path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : path), dict)
    return { lang, toggleLang: () => setLang((l) => (l === 'en' ? 'ar' : 'en')), t }
  }, [lang])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
