import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Кыргызские песни с текстом и переводом — Ырлар | Эне тилим',
  description: 'Тексты кыргызских народных и современных песен с переводом на русский язык. Kyrgyz songs with lyrics and translation.',
  alternates: { canonical: 'https://www.ene-tilim.online/yrlar' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
