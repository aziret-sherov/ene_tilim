import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Табышмактар — Кыргызские загадки',
  description: 'Кыргызские загадки с ответами. Проверь свою смекалку и выучи новые слова на кыргызском.',
  alternates: { canonical: 'https://ene-tilim.online/tabyshkaktar' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
