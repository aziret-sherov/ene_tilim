import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Кыргызские загадки с ответами — Табышмактар | Эне тилим',
  description: 'Кыргызские народные загадки с ответами и переводом на русский язык. Kyrgyz riddles with answers for kids and adults.',
  alternates: { canonical: 'https://www.ene-tilim.online/tabyshkaktar' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
