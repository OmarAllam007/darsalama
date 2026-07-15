import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { translations } from './translations'

/** @type {import('react').Context<any>} */
const LanguageContext = createContext(null)

export const LANGUAGES = [
  { code: 'en', label: 'English', dir: 'ltr' },
  { code: 'ar', label: 'العربية', dir: 'rtl' },
  { code: 'ur', label: 'اردو', dir: 'rtl' },
  { code: 'tl', label: 'Filipino', dir: 'ltr' },
]

const RTL_LANGS = ['ar', 'ur']
const VALID = LANGUAGES.map((l) => l.code)

function getInitialLang() {
  const stored = localStorage.getItem('lang')
  return VALID.includes(stored) ? stored : 'en'
}

function resolve(dict, path) {
  return path
    .split('.')
    .reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), dict)
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(getInitialLang)

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = RTL_LANGS.includes(lang) ? 'rtl' : 'ltr'
    localStorage.setItem('lang', lang)
  }, [lang])

  const value = useMemo(() => {
    const isRtl = RTL_LANGS.includes(lang)
    // Resolve against the active language, falling back to English so partially
    // translated languages (ur/tl) still render meaningful copy.
    const t = (path) => {
      const active = resolve(translations[lang], path)
      if (active !== undefined) return active
      const fallback = resolve(translations.en, path)
      return fallback !== undefined ? fallback : path
    }

    return {
      lang,
      setLang,
      toggleLang: () => setLang((l) => (l === 'en' ? 'ar' : 'en')),
      languages: LANGUAGES,
      isRtl,
      dir: isRtl ? 'rtl' : 'ltr',
      t,
    }
  }, [lang])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
