import { createClient } from '@/lib/supabase/server'
import { createStaticClient } from '@/lib/supabase/static'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const word = decodeURIComponent(slug)
  const supabase = await createClient()
  const { data } = await supabase.from('sozduk').select('word_kg,word_ru,word_en').eq('word_kg', word).single()
  if (!data) return {}
  const translation = data.word_ru || data.word_en || ''
  return {
    title: `${data.word_kg} — ${translation}`,
    description: `${data.word_kg}: ${translation}. Кыргызско-русский словарь на Эне тилим.`,
    alternates: { canonical: `https://ene-tilim.online/sozduk/${slug}` },
    openGraph: { title: `${data.word_kg} — ${translation}`, description: `Кыргызское слово: ${data.word_kg}` },
  }
}

export async function generateStaticParams() {
  const supabase = createStaticClient()
  const { data } = await supabase.from('sozduk').select('word_kg')
  return (data || []).map((w) => ({ slug: encodeURIComponent(w.word_kg) }))
}

export default async function WordPage({ params }: Props) {
  const { slug } = await params
  const word = decodeURIComponent(slug)
  const supabase = await createClient()
  const { data: entry } = await supabase.from('sozduk').select('*').eq('word_kg', word).single()
  if (!entry) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: entry.word_kg,
    inLanguage: 'ky',
    description: entry.word_ru || entry.word_en || undefined,
    inDefinedTermSet: { '@type': 'DefinedTermSet', name: 'Кыргызский словарь', url: 'https://ene-tilim.online/sozduk' },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="px-5 sm:px-7 lg:px-10 py-8 max-w-2xl mx-auto">
        <Link
          href="/sozduk"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
          style={{ fontFamily: 'var(--font-nunito)' }}
        >
          <ArrowLeft className="h-4 w-4" />
          Сөздүккө кайтуу
        </Link>

        <div className="space-y-4">
          <h1
            className="text-4xl sm:text-5xl font-bold text-primary"
            style={{ fontFamily: 'var(--font-unbounded)' }}
          >
            {entry.word_kg}
          </h1>

          <div className="flex flex-wrap items-center gap-3">
            {entry.word_ru && (
              <span className="text-xl text-foreground/80" style={{ fontFamily: 'var(--font-nunito)' }}>
                {entry.word_ru}
              </span>
            )}
            {entry.word_en && (
              <span className="text-xl text-muted-foreground" style={{ fontFamily: 'var(--font-nunito)' }}>
                / {entry.word_en}
              </span>
            )}
            {entry.category && (
              <Badge variant="secondary" className="rounded-lg">{entry.category}</Badge>
            )}
          </div>

          {entry.example_kg && (
            <div className="mt-6 pt-6 border-t border-border space-y-2">
              <p className="text-sm italic text-foreground/65 leading-relaxed" style={{ fontFamily: 'var(--font-nunito)' }}>
                {entry.example_kg}
              </p>
              {entry.example_ru && (
                <p className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-nunito)' }}>
                  {entry.example_ru}
                </p>
              )}
              {entry.example_en && (
                <p className="text-sm text-muted-foreground/60 italic" style={{ fontFamily: 'var(--font-nunito)' }}>
                  {entry.example_en}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
