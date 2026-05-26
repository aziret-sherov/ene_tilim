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
  const { data } = await supabase.from('tabyshmaktar').select('question_kg,answer_kg,answer_ru').eq('id', id).single()
  if (!data) return {}
  return {
    title: data.question_kg,
    description: `Табышмак: ${data.question_kg} — Жооп: ${data.answer_kg} (${data.answer_ru}). Кыргызские загадки на Эне тилим.`,
    alternates: { canonical: `https://ene-tilim.online/tabyshkaktar/${id}` },
    openGraph: { title: data.question_kg, description: `Жооп: ${data.answer_kg}` },
  }
}

export async function generateStaticParams() {
  const supabase = createStaticClient()
  const { data } = await supabase.from('tabyshmaktar').select('id')
  return (data || []).map((t) => ({ id: String(t.id) }))
}

export default async function TabyshmakPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: t } = await supabase.from('tabyshmaktar').select('*').eq('id', id).single()
  if (!t) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Question',
    name: t.question_kg,
    inLanguage: 'ky',
    acceptedAnswer: {
      '@type': 'Answer',
      text: `${t.answer_kg} — ${t.answer_ru}`,
    },
    isPartOf: { '@type': 'WebSite', name: 'Эне тилим', url: 'https://ene-tilim.online' },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="px-5 sm:px-7 lg:px-10 py-8 max-w-2xl mx-auto">
        <Link
          href="/tabyshkaktar"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
          style={{ fontFamily: 'var(--font-nunito)' }}
        >
          <ArrowLeft className="h-4 w-4" />
          Табышмактарга кайтуу
        </Link>

        <div className="space-y-6">
          <p
            className="text-xl sm:text-2xl font-medium text-foreground leading-relaxed"
            style={{ fontFamily: 'var(--font-nunito)' }}
          >
            {t.question_kg}
          </p>

          {t.category && <Badge variant="secondary" className="rounded-lg">{t.category}</Badge>}

          <div className="p-6 bg-primary/10 rounded-2xl border border-primary/20 space-y-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3" style={{ fontFamily: 'var(--font-nunito)' }}>
              Жооп
            </p>
            <p
              className="text-2xl font-bold text-primary"
              style={{ fontFamily: 'var(--font-unbounded)' }}
            >
              {t.answer_kg}
            </p>
            <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-nunito)' }}>
              {t.answer_ru}
            </p>
            {t.answer_en && (
              <p className="text-muted-foreground/60 italic text-sm" style={{ fontFamily: 'var(--font-nunito)' }}>
                {t.answer_en}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
