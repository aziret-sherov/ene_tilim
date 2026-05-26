import { createClient } from '@/lib/supabase/server'
import { createStaticClient } from '@/lib/supabase/static'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('lakaptar').select('text_kg,text_ru').eq('id', id).single()
  if (!data) return {}
  return {
    title: data.text_kg,
    description: `${data.text_kg} — ${data.text_ru}. Кыргызские крылатые слова на Эне тилим.`,
    alternates: { canonical: `https://ene-tilim.online/lakaptar/${id}` },
    openGraph: { title: data.text_kg, description: data.text_ru },
  }
}

export async function generateStaticParams() {
  const supabase = createStaticClient()
  const { data } = await supabase.from('lakaptar').select('id')
  return (data || []).map((l) => ({ id: String(l.id) }))
}

export default async function LakapPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: lakap } = await supabase.from('lakaptar').select('*').eq('id', id).single()
  if (!lakap) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Quotation',
    text: lakap.text_kg,
    inLanguage: 'ky',
    description: lakap.text_ru,
    isPartOf: { '@type': 'WebSite', name: 'Эне тилим', url: 'https://ene-tilim.online' },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="px-5 sm:px-7 lg:px-10 py-8 max-w-2xl mx-auto">
        <Link
          href="/lakaptar"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
          style={{ fontFamily: 'var(--font-nunito)' }}
        >
          <ArrowLeft className="h-4 w-4" />
          Лакаптарга кайтуу
        </Link>

        <blockquote className="space-y-4">
          <p
            className="text-2xl sm:text-3xl font-bold text-foreground leading-relaxed"
            style={{ fontFamily: 'var(--font-unbounded)' }}
          >
            {lakap.text_kg}
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed" style={{ fontFamily: 'var(--font-nunito)' }}>
            {lakap.text_ru}
          </p>
          {lakap.text_en && (
            <p className="text-base text-muted-foreground/60 italic" style={{ fontFamily: 'var(--font-nunito)' }}>
              {lakap.text_en}
            </p>
          )}
        </blockquote>

        {lakap.category && (
          <div className="mt-6">
            <Badge variant="secondary" className="rounded-lg">{lakap.category}</Badge>
          </div>
        )}
      </div>
    </>
  )
}
