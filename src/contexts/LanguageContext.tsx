'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import vi from '@/i18n/vi'
import en from '@/i18n/en'
import type { Translations } from '@/i18n/vi'

type Lang = 'vi' | 'en'

interface LanguageContextValue {
  lang: Lang
  t: Translations
  setLang: (lang: Lang) => void
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'vi',
  t: vi,
  setLang: () => {},
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Always initialize with 'vi' to match server render — avoids hydration mismatch.
  // The inline script in layout.tsx has already set data-lang before React mounts,
  // so syncing here via useEffect causes no visible flash.
  const [lang, setLangState] = useState<Lang>('vi')

  useEffect(() => {
    const preferred = document.documentElement.getAttribute('data-lang') === 'en' ? 'en' : 'vi'
    if (preferred !== 'vi') setLangState(preferred)
  }, [])

  const setLang = (newLang: Lang) => {
    setLangState(newLang)
    document.documentElement.setAttribute('data-lang', newLang)
    try {
      localStorage.setItem('lang', newLang)
    } catch {}
  }

  return (
    <LanguageContext.Provider value={{ lang, t: lang === 'en' ? en : vi, setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLang = () => useContext(LanguageContext)
