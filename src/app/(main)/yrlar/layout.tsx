import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ырлар — Кыргызские песни',
  description: 'Кыргызские народные и современные песни с текстами и переводом на русский язык.',
  alternates: { canonical: 'https://ene-tilim.online/yrlar' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
