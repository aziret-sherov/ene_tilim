import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Лакаптар — Кыргызские образные выражения',
  description: 'Кыргызские образные выражения и крылатые слова с переводом на русский язык.',
  alternates: { canonical: 'https://ene-tilim.online/lakaptar' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
