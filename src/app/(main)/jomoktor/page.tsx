import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { JomoktorClient } from './jomoktor-client'

export const metadata: Metadata = {
  title: 'Жомоктор — Кыргызские сказки',
  description: 'Коллекция кыргызских народных сказок (жомоктор) с пересказом на русском и английском языках.',
  alternates: { canonical: 'https://ene-tilim.online/jomoktor' },
  openGraph: {
    title: 'Жомоктор — Кыргызские сказки',
    description: 'Коллекция кыргызских народных сказок.',
    url: 'https://ene-tilim.online/jomoktor',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Жомоктор — Кыргызские сказки',
  description: 'Коллекция кыргызских народных сказок (жомоктор) с пересказом на русском и английском языках.',
  url: 'https://ene-tilim.online/jomoktor',
  inLanguage: 'ky',
  isPartOf: { '@type': 'WebSite', name: 'Эне тилим', url: 'https://ene-tilim.online' },
}

export default async function JomoktorPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('akya')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5000)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <JomoktorClient initialData={data || []} />
    </>
  )
}
