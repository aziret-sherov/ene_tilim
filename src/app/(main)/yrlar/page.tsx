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

export default async function YrlarPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('yrlar')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5000)

  return <YrlarClient initialData={data || []} />
}
