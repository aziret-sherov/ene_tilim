import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Макалдар — Кыргызские пословицы',
  description: 'Кыргызские пословицы и поговорки с переводом на русский язык. Мудрость народа в крылатых словах.',
  alternates: { canonical: 'https://ene-tilim.online/makaldar' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
