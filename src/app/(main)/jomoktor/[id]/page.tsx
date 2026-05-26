import { createClient } from '@/lib/supabase/server'
import { createStaticClient } from '@/lib/supabase/static'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('akya').select('title,summary_ru').eq('id', id).single()
  if (!data) return {}
  return {
    title: data.title,
    description: data.summary_ru || `${data.title} — кыргызская сказка на Эне тилим.`,
    alternates: { canonical: `https://ene-tilim.online/jomoktor/${id}` },
    openGraph: { title: data.title, description: data.summary_ru || undefined },
  }
}

export async function generateStaticParams() {
  const supabase = createStaticClient()
  const { data } = await supabase.from('akya').select('id')
  return (data || []).map((a) => ({ id: String(a.id) }))
}

export default async function AkyaDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: akya } = await supabase.from('akya').select('*').eq('id', id).single()
  if (!akya) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: akya.title,
    inLanguage: 'ky',
    description: akya.summary_ru || undefined,
    isPartOf: { '@type': 'WebSite', name: 'Эне тилим', url: 'https://ene-tilim.online' },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="px-5 sm:px-7 lg:px-10 py-8 max-w-2xl mx-auto">
        <Link
          href="/jomoktor"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
          style={{ fontFamily: 'var(--font-nunito)' }}
        >
          <ArrowLeft className="h-4 w-4" />
          Жомокторго кайтуу
        </Link>

        <h1
          className="text-2xl sm:text-3xl font-bold text-foreground mb-8"
          style={{ fontFamily: 'var(--font-unbounded)' }}
        >
          {akya.title}
        </h1>

        <div className="grid sm:grid-cols-2 gap-8">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3" style={{ fontFamily: 'var(--font-nunito)' }}>
              Кыргызча
            </p>
            <div
              className="text-foreground leading-relaxed whitespace-pre-wrap"
              style={{ fontFamily: 'var(--font-nunito)' }}
            >
              {akya.content_kg}
            </div>
          </div>

          {akya.summary_ru && (
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3" style={{ fontFamily: 'var(--font-nunito)' }}>
                Краткое содержание
              </p>
              <p
                className="text-muted-foreground leading-relaxed"
                style={{ fontFamily: 'var(--font-nunito)' }}
              >
                {akya.summary_ru}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
