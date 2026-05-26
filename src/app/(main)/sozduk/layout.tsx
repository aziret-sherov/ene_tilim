import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Кыргызско-русский словарь онлайн — Сөздүк | Эне тилим',
  description: 'Бесплатный кыргызско-русский и кыргызско-английский словарь онлайн. 1000+ слов с примерами. Kyrgyz-Russian-English dictionary.',
  alternates: { canonical: 'https://www.ene-tilim.online/sozduk' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
