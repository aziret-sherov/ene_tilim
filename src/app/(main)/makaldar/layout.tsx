import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Кыргызские пословицы и поговорки — Макалдар | Эне тилим',
  description: 'Кыргызские пословицы и поговорки с переводом на русский и английский язык. Более 500 макалов с категориями. Kyrgyz proverbs online.',
  alternates: { canonical: 'https://www.ene-tilim.online/makaldar' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
