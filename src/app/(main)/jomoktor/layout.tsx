import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Кыргызские сказки и легенды — Жомоктор | Эне тилим',
  description: 'Кыргызские народные сказки, легенды и эпосы на кыргызском языке с переводом на русский. Kyrgyz folk tales and legends.',
  alternates: { canonical: 'https://www.ene-tilim.online/jomoktor' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
