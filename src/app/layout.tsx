import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'
import './globals.css'
import { LanguageProvider } from '@/contexts/LanguageContext'
// Ten site lay tu config chung - doi thuong hieu chi sua src/config/site.ts
import { SITE_NAME, SITE_AUTHOR, SITE_DESCRIPTION } from '@/config/site'
// Vercel Speed Insights: thu thap Core Web Vitals (RUM) tren production Vercel
import { SpeedInsights } from '@vercel/speed-insights/next'

const roboto = Roboto({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? 'http://localhost:3000'),
  title: {
    default: `${SITE_NAME} — ${SITE_AUTHOR}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    alternateLocale: 'en_US',
    siteName: SITE_NAME,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={roboto.variable} suppressHydrationWarning>
      <body className="antialiased bg-white text-gray-900">
        {/* Runs synchronously before React hydrates — sets data-lang on <html> so LanguageProvider
            can read the correct initial language without a useEffect flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var l=localStorage.getItem('lang');if(l==='en')document.documentElement.setAttribute('data-lang','en');}catch(e){}})();`,
          }}
        />
        <LanguageProvider>
          {children}
        </LanguageProvider>
        {/* Speed Insights: chi gui du lieu khi chay tren Vercel production, no-op o local dev */}
        <SpeedInsights />
      </body>
    </html>
  )
}
