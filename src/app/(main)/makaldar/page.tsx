import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { MakaldarClient } from './makaldar-client'

export const metadata: Metadata = {
  title: 'Макалдар — Кыргызские пословицы',
  description: 'Коллекция кыргызских пословиц и поговорок (макалдар) с переводом на русский и английский языки.',
  alternates: { canonical: 'https://ene-tilim.online/makaldar' },
  openGraph: {
    title: 'Макалдар — Кыргызские пословицы',
    description: 'Коллекция кыргызских пословиц и поговорок с переводом.',
    url: 'https://ene-tilim.online/makaldar',
  },
}

export default async function MakaldarPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('makaldar')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5000)

  return <MakaldarClient initialData={data || []} />
}
