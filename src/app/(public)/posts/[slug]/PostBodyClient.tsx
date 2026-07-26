'use client'

import { useState, useEffect } from 'react'
import { useLang } from '@/contexts/LanguageContext'
import PostBody from '@/components/blog/PostBody'

interface Props {
  contentHtmlVi: string
  contentHtmlEn?: string | null
  originalLang: 'vi' | 'en'
}

export default function PostBodyClient({ contentHtmlVi, contentHtmlEn, originalLang }: Props) {
  const { lang, t } = useLang()
  const [showOriginal, setShowOriginal] = useState(false)

  useEffect(() => { setShowOriginal(false) }, [lang])

  const effectiveLang = showOriginal ? originalLang : lang
  const html = effectiveLang === 'en' && contentHtmlEn ? contentHtmlEn : contentHtmlVi

  const canToggle = !!contentHtmlEn && originalLang !== lang

  return (
    <div>
      {canToggle && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => setShowOriginal((v) => !v)}
            className="text-xs text-gray-500 border border-gray-200 rounded px-3 py-1.5 hover:border-gray-400 transition-colors"
          >
            {showOriginal ? t.post.viewTranslation : t.post.viewOriginal}
          </button>
        </div>
      )}
      <PostBody html={html} />
    </div>
  )
}
