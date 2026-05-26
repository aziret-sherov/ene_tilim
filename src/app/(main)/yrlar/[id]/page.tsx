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
  const { data } = await supabase.from('yrlar').select('title,translation_ru').eq('id', id).single()
  if (!data) return {}
  return {
    title: data.title,
    description: `${data.title} — кыргызская песня с текстом и переводом. Эне тилим.`,
    alternates: { canonical: `https://ene-tilim.online/yrlar/${id}` },
    openGraph: { title: data.title, description: data.translation_ru || undefined },
  }
}

export async function generateStaticParams() {
  const supabase = createStaticClient()
  const { data } = await supabase.from('yrlar').select('id')
  return (data || []).map((y) => ({ id: String(y.id) }))
}

export default async function YrPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: yr } = await supabase.from('yrlar').select('*').eq('id', id).single()
  if (!yr) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MusicComposition',
    name: yr.title,
    inLanguage: 'ky',
    lyrics: { '@type': 'CreativeWork', text: yr.lyrics_kg },
    isPartOf: { '@type': 'WebSite', name: 'Эне тилим', url: 'https://ene-tilim.online' },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="px-5 sm:px-7 lg:px-10 py-8 max-w-2xl mx-auto">
        <Link
          href="/yrlar"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
          style={{ fontFamily: 'var(--font-nunito)' }}
        >
          <ArrowLeft className="h-4 w-4" />
          Ырларга кайтуу
        </Link>

        <h1
          className="text-2xl sm:text-3xl font-bold text-foreground mb-8"
          style={{ fontFamily: 'var(--font-unbounded)' }}
        >
          {yr.title}
        </h1>

        <div className="grid sm:grid-cols-2 gap-8">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3" style={{ fontFamily: 'var(--font-nunito)' }}>
              Кыргызча
            </p>
            <pre
              className="whitespace-pre-wrap text-foreground leading-relaxed font-sans"
              style={{ fontFamily: 'var(--font-nunito)' }}
            >
              {yr.lyrics_kg}
            </pre>
          </div>

          {yr.translation_ru && (
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3" style={{ fontFamily: 'var(--font-nunito)' }}>
                Перевод
              </p>
              <pre
                className="whitespace-pre-wrap text-muted-foreground leading-relaxed italic font-sans"
                style={{ fontFamily: 'var(--font-nunito)' }}
              >
                {yr.translation_ru}
              </pre>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
