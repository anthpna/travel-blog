'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLang } from '@/contexts/LanguageContext'
import { SITE_NAME } from '@/config/site'

export default function Navbar() {
  const { t, lang, setLang } = useLang()
  const pathname = usePathname()

  const links = [
    { href: '/', label: t.nav.home },
    { href: '/posts', label: t.nav.posts },
    { href: '/destinations', label: t.nav.destinations },
    { href: '/series', label: t.nav.series },
    { href: '/about', label: t.nav.about },
    { href: '/submit', label: t.nav.submit },
  ]

  return (
    <header className="sticky top-0 z-40 bg-slate-800 border-b border-slate-700">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="font-bold text-lg tracking-tight text-white shrink-0">
          {SITE_NAME}
        </Link>

        <div className="hidden md:flex items-center gap-1 flex-1">
          {links.map(({ href, label }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? 'bg-slate-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </div>

        <button
          onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
          className="shrink-0 text-xs font-medium px-2.5 py-1 rounded border border-slate-500 text-slate-200 hover:border-white hover:text-white transition-colors"
          aria-label="Switch language"
        >
          {lang === 'vi' ? 'EN' : 'VI'}
        </button>
      </nav>
    </header>
  )
}
