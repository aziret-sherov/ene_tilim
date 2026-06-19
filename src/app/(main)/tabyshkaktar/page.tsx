import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { TabyshkaktarClient } from './tabyshkaktar-client'

export const metadata: Metadata = {
  title: 'Табышмактар — Кыргызские загадки',
  description: 'Коллекция кыргызских загадок (табышмактар) с ответами и переводом на русский и английский языки.',
  alternates: { canonical: 'https://ene-tilim.online/tabyshkaktar' },
  openGraph: {
    title: 'Табышмактар — Кыргызские загадки',
    description: 'Коллекция кыргызских загадок с ответами и переводом.',
    url: 'https://ene-tilim.online/tabyshkaktar',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Табышмактар — Кыргызские загадки',
  description: 'Коллекция кыргызских загадок (табышмактар) с ответами и переводом на русский и английский языки.',
  url: 'https://ene-tilim.online/tabyshkaktar',
  inLanguage: 'ky',
  isPartOf: { '@type': 'WebSite', name: 'Эне тилим', url: 'https://ene-tilim.online' },
}

export default async function TabyshkaktarPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('tabyshmaktar')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5000)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <TabyshkaktarClient initialData={data || []} />
    </>
  )
}
