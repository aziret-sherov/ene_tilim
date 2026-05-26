import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Кыргызские крылатые слова и выражения — Лакаптар | Эне тилим',
  description: 'Кыргызские крылатые слова, образные выражения и фразеологизмы с переводом на русский язык. Kyrgyz idioms and sayings.',
  alternates: { canonical: 'https://www.ene-tilim.online/lakaptar' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
