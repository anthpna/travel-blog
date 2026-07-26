'use client'

import { useLang } from '@/contexts/LanguageContext'

interface LanguageToggleProps {
  hasEnVersion: boolean
}

export default function LanguageToggle({ hasEnVersion }: LanguageToggleProps) {
  const { lang, setLang, t } = useLang()

  if (!hasEnVersion) return null

  return (
    <div className="flex items-center gap-1 text-sm">
      <button
        onClick={() => setLang('vi')}
        className={`px-3 py-1 rounded-full font-medium transition-colors ${
          lang === 'vi'
            ? 'bg-gray-900 text-white'
            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
        }`}
      >
        {t.common.lang.vi}
      </button>
      <button
        onClick={() => setLang('en')}
        className={`px-3 py-1 rounded-full font-medium transition-colors ${
          lang === 'en'
            ? 'bg-gray-900 text-white'
            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
        }`}
      >
        {t.common.lang.en}
      </button>
    </div>
  )
}
