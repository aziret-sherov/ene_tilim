import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { MakaldarClient } from './makaldar-client'

export const metadata: Metadata = {
  title: 'Макалдар жана Лакаптар — Кыргызские пословицы и поговорки',
  description: 'Коллекция кыргызских пословиц и поговорок (макалдар, лакаптар) с переводом на русский и английский языки.',
  alternates: { canonical: 'https://ene-tilim.online/makaldar' },
  openGraph: {
    title: 'Макалдар жана Лакаптар — Кыргызские пословицы и поговорки',
    description: 'Коллекция кыргызских пословиц и поговорок с переводом.',
    url: 'https://ene-tilim.online/makaldar',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Макалдар жана Лакаптар — Кыргызские пословицы и поговорки',
  description: 'Коллекция кыргызских пословиц и поговорок (макалдар, лакаптар) с переводом на русский и английский языки.',
  url: 'https://ene-tilim.online/makaldar',
  inLanguage: 'ky',
  isPartOf: { '@type': 'WebSite', name: 'Эне тилим', url: 'https://ene-tilim.online' },
}

export default async function MakaldarPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('makaldar')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5000)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <MakaldarClient initialData={data || []} />
    </>
  )
}
