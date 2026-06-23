import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { TabyshkaktarClient } from './tabyshkaktar-client'
import type { Tabyshmak } from '@/types'

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

  const PAGE_SIZE = 1000
  let allData: Tabyshmak[] = []
  let from = 0

  while (true) {
    const { data } = await supabase
      .from('tabyshmaktar')
      .select('*')
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .range(from, from + PAGE_SIZE - 1)

    if (!data || data.length === 0) break
    allData = [...allData, ...(data as Tabyshmak[])]
    if (data.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <TabyshkaktarClient initialData={allData} />
    </>
  )
}
