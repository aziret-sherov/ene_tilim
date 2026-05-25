import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Сөздүк — Кыргызско-русский словарь',
  description: 'Кыргызско-русский словарь с примерами употребления слов. Учи кыргызский язык легко и быстро.',
  alternates: { canonical: 'https://ene-tilim.online/sozduk' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
