import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'
import './globals.css'
import { LanguageProvider } from '@/contexts/LanguageContext'

const roboto = Roboto({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? 'http://localhost:3000'),
  title: {
    default: 'Blog Trip — Phan Thanh An',
    template: '%s | Blog Trip',
  },
  description: 'Travel blog song ngữ Việt/Anh — chia sẻ hành trình, cảm xúc và những khoảnh khắc đáng nhớ bởi Phan Thanh An.',
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    alternateLocale: 'en_US',
    siteName: 'Blog Trip',
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
      </body>
    </html>
  )
}
