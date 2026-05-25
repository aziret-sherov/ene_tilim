import type { Metadata } from 'next'
import { Playfair_Display, Nunito } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Navbar } from '@/components/navbar'

const playfairDisplay = Playfair_Display({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-unbounded',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

const nunito = Nunito({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-nunito',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://ene-tilim.online'),
  title: {
    default: 'Эне тилим — Кыргызский язык и культура',
    template: '%s | Эне тилим',
  },
  description: 'Изучай кыргызский язык и культуру: пословицы, загадки, песни, сказки и словарь. Эне тилим — твой проводник в мир кыргызского языка.',
  keywords: [
    'кыргызский язык', 'кыргыз тили', 'kyrgyz language', 'кыргызские пословицы',
    'макалдар', 'лакаптар', 'табышмактар', 'кыргызские загадки', 'кыргызские песни',
    'кыргызский словарь', 'сөздүк', 'кыргызская культура', 'эне тилим',
  ],
  authors: [{ name: 'Эне тилим', url: 'https://ene-tilim.online' }],
  creator: 'Эне тилим',
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    alternateLocale: 'ky_KG',
    url: 'https://ene-tilim.online',
    siteName: 'Эне тилим',
    title: 'Эне тилим — Кыргызский язык и культура',
    description: 'Изучай кыргызский язык и культуру: пословицы, загадки, песни, сказки и словарь.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Эне тилим — Кыргызский язык и культура',
    description: 'Изучай кыргызский язык и культуру: пословицы, загадки, песни, сказки и словарь.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
    },
  },
  alternates: {
    canonical: 'https://ene-tilim.online',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ky" suppressHydrationWarning>
      <body className={`${playfairDisplay.variable} ${nunito.variable} min-h-screen antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
