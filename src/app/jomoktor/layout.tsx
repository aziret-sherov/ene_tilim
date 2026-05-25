import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Жомоктор — Кыргызские сказки',
  description: 'Кыргызские народные сказки и легенды на кыргызском языке с переводом на русский.',
  alternates: { canonical: 'https://ene-tilim.online/jomoktor' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
