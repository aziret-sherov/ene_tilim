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

export default async function LakapatarPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('lakaptar')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5000)

  return <LakapatarClient initialData={data || []} />
}
