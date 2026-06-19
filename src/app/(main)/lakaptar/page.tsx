import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { LakapatarClient } from './lakaptar-client'

export const metadata: Metadata = {
  title: 'Лакаптар — Кыргызские поговорки',
  description: 'Коллекция кыргызских поговорок и крылатых выражений (лакаптар) с переводом на русский и английский языки.',
  alternates: { canonical: 'https://ene-tilim.online/lakaptar' },
  openGraph: {
    title: 'Лакаптар — Кыргызские поговорки',
    description: 'Коллекция кыргызских поговорок с переводом.',
    url: 'https://ene-tilim.online/lakaptar',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Лакаптар — Кыргызские поговорки',
  description: 'Коллекция кыргызских поговорок и крылатых выражений (лакаптар) с переводом на русский и английский языки.',
  url: 'https://ene-tilim.online/lakaptar',
  inLanguage: 'ky',
  isPartOf: { '@type': 'WebSite', name: 'Эне тилим', url: 'https://ene-tilim.online' },
}

export default async function LakapatarPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('lakaptar')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5000)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LakapatarClient initialData={data || []} />
    </>
  )
}
