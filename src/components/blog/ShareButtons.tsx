'use client'

import { useState } from 'react'
import { useLang } from '@/contexts/LanguageContext'

interface ShareButtonsProps {
  url: string
  title: string
}

export default function ShareButtons({ url, title }: ShareButtonsProps) {
  const { t } = useLang()
  const [copied, setCopied] = useState(false)
  const encoded = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  function copyLink() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-sm font-medium text-gray-500">{t.post.share}:</span>

      {/* Facebook */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1877F2] text-white text-sm font-medium hover:bg-[#166fe5] transition-colors"
      >
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073c0 6.027 4.386 11.02 10.125 11.927v-8.438H7.078v-3.489h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.313 0 2.686.235 2.686.235v2.97h-1.514c-1.491 0-1.956.93-1.956 1.886v2.27h3.328l-.532 3.489h-2.796v8.438C19.614 23.093 24 18.1 24 12.073z"/>
        </svg>
        Facebook
      </a>

      {/* Zalo */}
      <a
        href={`https://zalo.me/share/url?url=${encoded}&title=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0068FF] text-white text-sm font-medium hover:bg-[#0057d4] transition-colors"
      >
        <svg className="w-4 h-4 fill-current" viewBox="0 0 40 40" aria-hidden="true">
          <path d="M20 0C8.954 0 0 8.954 0 20s8.954 20 20 20 20-8.954 20-20S31.046 0 20 0zm9.854 28.16c-.16.427-.64.64-1.067.48-.427-.16-.64-.64-.48-1.067.747-1.92.747-3.84 0-5.76-.16-.427.053-.907.48-1.067.427-.16.907.053 1.067.48.907 2.347.907 4.8 0 6.934zm-3.307-1.6c-.32.32-.8.32-1.12 0-.32-.32-.32-.8 0-1.12.96-.96.96-2.56 0-3.52-.32-.32-.32-.8 0-1.12.32-.32.8-.32 1.12 0 1.6 1.6 1.6 4.16 0 5.76zM20 26.667c-3.68 0-6.667-2.987-6.667-6.667S16.32 13.333 20 13.333 26.667 16.32 26.667 20 23.68 26.667 20 26.667zm0-10.667c-2.213 0-4 1.787-4 4s1.787 4 4 4 4-1.787 4-4-1.787-4-4-4z"/>
        </svg>
        Zalo
      </a>

      {/* Copy link */}
      <button
        onClick={copyLink}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
      >
        {copied ? (
          <>
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {t.post.copied}
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {t.post.copyLink}
          </>
        )}
      </button>
    </div>
  )
}
