'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLang } from '@/contexts/LanguageContext'

export default function Footer() {
  const { t } = useLang()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setStatus(res.ok ? 'success' : 'error')
      if (res.ok) setEmail('')
    } catch {
      setStatus('error')
    }
  }

  return (
    <footer className="border-t border-gray-100 bg-gray-50 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <span className="font-bold text-lg text-gray-900">Blog Trip</span>
            <p className="mt-2 text-sm text-gray-500">{t.home.heroSubtitle}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Links</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              {[
                { href: '/posts', label: t.nav.posts },
                { href: '/destinations', label: t.nav.destinations },
                { href: '/series', label: t.nav.series },
                { href: '/about', label: t.nav.about },
                { href: '/submit', label: t.nav.submit },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-gray-900 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">{t.footer.newsletter}</h3>
            {status === 'success' ? (
              <p className="text-sm text-green-600">{t.footer.subscribeSuccess}</p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.footer.newsletterPlaceholder}
                  className="flex-1 text-sm border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  required
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="text-sm font-medium px-3 py-1.5 bg-gray-900 text-white rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  {t.footer.subscribe}
                </button>
              </form>
            )}
            {status === 'error' && (
              <p className="mt-1 text-xs text-red-500">{t.footer.subscribeError}</p>
            )}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
          <span>© {new Date().getFullYear()} Blog Trip. {t.footer.rights}</span>
          <span>{t.footer.madeBy}</span>
        </div>
      </div>
    </footer>
  )
}
