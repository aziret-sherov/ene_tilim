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
  const { data } = await supabase.from('makaldar').select('text_kg,text_ru').eq('id', id).single()
  if (!data) return {}
  return {
    title: data.text_kg,
    description: `${data.text_kg} — ${data.text_ru}. Кыргызские пословицы на Эне тилим.`,
    alternates: { canonical: `https://ene-tilim.online/makaldar/${id}` },
    openGraph: { title: data.text_kg, description: data.text_ru },
  }
}

export async function generateStaticParams() {
  const supabase = createStaticClient()
  const { data } = await supabase.from('makaldar').select('id')
  return (data || []).map((m) => ({ id: String(m.id) }))
}

export default async function MakalPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: makal } = await supabase.from('makaldar').select('*').eq('id', id).single()
  if (!makal) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Quotation',
    text: makal.text_kg,
    inLanguage: 'ky',
    description: makal.text_ru,
    isPartOf: { '@type': 'WebSite', name: 'Эне тилим', url: 'https://ene-tilim.online' },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="px-5 sm:px-7 lg:px-10 py-8 max-w-2xl mx-auto">
        <Link
          href="/makaldar"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
          style={{ fontFamily: 'var(--font-nunito)' }}
        >
          <ArrowLeft className="h-4 w-4" />
          Макалдарга кайтуу
        </Link>

        <blockquote className="space-y-4">
          <p
            className="text-2xl sm:text-3xl font-bold text-foreground leading-relaxed"
            style={{ fontFamily: 'var(--font-unbounded)' }}
          >
            {makal.text_kg}
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed" style={{ fontFamily: 'var(--font-nunito)' }}>
            {makal.text_ru}
          </p>
          {makal.text_en && (
            <p className="text-base text-muted-foreground/60 italic" style={{ fontFamily: 'var(--font-nunito)' }}>
              {makal.text_en}
            </p>
          )}
        </blockquote>

        {makal.category && (
          <div className="mt-6">
            <Badge variant="secondary" className="rounded-lg">{makal.category}</Badge>
          </div>
        )}
      </div>
    </>
  )
}
