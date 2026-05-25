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
  title: 'Эне тилим — Кыргыз тили жана маданияты',
  description: 'Кыргыз тилин жана маданиятын үйрөн. Макалдар, лакаптар, табышмактар, ырлар жана акыялар.',
  keywords: ['кыргыз тили', 'kyrgyz', 'язык', 'культура'],
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
