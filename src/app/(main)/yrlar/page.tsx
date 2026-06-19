import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { YrlarClient } from './yrlar-client'

export const metadata: Metadata = {
  title: 'Ырлар — Кыргызские песни',
  description: 'Коллекция кыргызских народных песен (ырлар) с текстами и переводом на русский и английский языки.',
  alternates: { canonical: 'https://ene-tilim.online/yrlar' },
  openGraph: {
    title: 'Ырлар — Кыргызские песни',
    description: 'Коллекция кыргызских народных песен с текстами и переводом.',
    url: 'https://ene-tilim.online/yrlar',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Ырлар — Кыргызские песни',
  description: 'Коллекция кыргызских народных песен (ырлар) с текстами и переводом на русский и английский языки.',
  url: 'https://ene-tilim.online/yrlar',
  inLanguage: 'ky',
  isPartOf: { '@type': 'WebSite', name: 'Эне тилим', url: 'https://ene-tilim.online' },
}

export default async function YrlarPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('yrlar')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5000)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <YrlarClient initialData={data || []} />
    </>
  )
}
