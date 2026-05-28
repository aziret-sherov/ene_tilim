'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLangFilter } from '@/contexts/lang-filter-context'
import { BookOpen, Star, ArrowUpRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface WordData {
  word_kg: string
  word_ru: string | null
  word_en: string | null
  example_kg: string | null
  example_ru: string | null
  example_en: string | null
  category: string | null
}

export function WordOfDay({ hero }: { hero?: boolean } = {}) {
  const { langFilter } = useLangFilter()
  const [word, setWord] = useState<WordData | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const today = new Date().toISOString().split('T')[0]

      const { data: wod } = await supabase
        .from('word_of_day')
        .select('*, sozduk(word_kg,word_ru,word_en,example_kg,example_ru,example_en,category)')
        .eq('date', today)
        .maybeSingle()

      if (wod?.sozduk) {
        setWord(wod.sozduk as WordData)
        return
      }

      const { data: random } = await supabase
        .from('sozduk')
        .select('word_kg,word_ru,word_en,example_kg,example_ru,example_en,category')
        .limit(1)
        .single()

      if (random) setWord(random as WordData)
    }
    load()
  }, [])

  if (!word) return null

  const translation = langFilter === 'kg-ru' ? word.word_ru : word.word_en
  const example = word.example_kg
  const exampleTranslation = langFilter === 'kg-ru' ? word.example_ru : word.example_en
  const toSozduk = 'Сөздүккө өтүү'

  if (hero) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-8">
          <h3
            className="font-bold text-white leading-[0.9]"
            style={{ fontFamily: 'var(--font-unbounded)', fontSize: 'clamp(4rem, 11vw, 11rem)' }}
          >
            {word.word_kg}
          </h3>
          {translation && (
            <p className="text-3xl text-white/70" style={{ fontFamily: 'var(--font-nunito)' }}>
              {translation}
            </p>
          )}
          {word.category && (
            <div className="inline-flex items-center self-start px-4 py-1.5 rounded-full bg-white/10">
              <span className="text-sm text-white/50" style={{ fontFamily: 'var(--font-nunito)' }}>
                {word.category}
              </span>
            </div>
          )}
        </div>
        {example && (
          <div className="border-t border-white/10 pt-6 flex flex-col gap-3">
            <p className="text-lg italic text-white/45" style={{ fontFamily: 'var(--font-nunito)' }}>
              {example}
            </p>
            {exampleTranslation && (
              <p className="text-lg text-white/30" style={{ fontFamily: 'var(--font-nunito)' }}>
                {exampleTranslation}
              </p>
            )}
          </div>
        )}
        <Link
          href="/sozduk"
          className="inline-flex items-center gap-2 text-base text-white/40 hover:text-white/70 transition-colors self-start"
          style={{ fontFamily: 'var(--font-nunito)' }}
        >
          <BookOpen className="h-4 w-4" />
          {toSozduk}
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    )
  }

  return (
    <Card className="glass rounded-2xl border-primary/20 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Star className="h-4 w-4 text-accent fill-accent" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Күндүн сөзү
          </span>
          {word.category && (
            <Badge variant="secondary" className="ml-auto text-xs rounded-lg">
              {word.category}
            </Badge>
          )}
        </div>

        <div className="space-y-2 mb-4">
          <h3 className="text-5xl font-bold text-primary" style={{ fontFamily: 'var(--font-unbounded)' }}>
            {word.word_kg}
          </h3>
          {translation && (
            <p className="text-xl text-foreground/80" style={{ fontFamily: 'var(--font-nunito)' }}>
              {translation}
            </p>
          )}
        </div>

        {example && (
          <div className="border-t border-border pt-4 space-y-1">
            <p className="text-sm italic text-foreground/70">{example}</p>
            {exampleTranslation && (
              <p className="text-sm text-muted-foreground">{exampleTranslation}</p>
            )}
          </div>
        )}

        <Link
          href="/sozduk"
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary hover:text-accent transition-colors"
        >
          <BookOpen className="h-3.5 w-3.5" />
          {toSozduk}
        </Link>
      </CardContent>
    </Card>
  )
}
