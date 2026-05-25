import { createClient } from '@/lib/supabase/server'
import { BookOpen, Star, ArrowUpRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export async function WordOfDay({ hero }: { hero?: boolean } = {}) {
  const supabase = await createClient()

  const today = new Date().toISOString().split('T')[0]

  const { data: wod } = await supabase
    .from('word_of_day')
    .select('*, sozduk(*)')
    .eq('date', today)
    .single()

  if (!wod?.sozduk) {
    const { data: randomWord } = await supabase
      .from('sozduk')
      .select('*')
      .limit(1)
      .single()

    if (!randomWord) return null

    return (
      <WordOfDayCard
        word_kg={randomWord.word_kg}
        word_ru={randomWord.word_ru}
        example_kg={randomWord.example_kg}
        example_ru={randomWord.example_ru}
        category={randomWord.category}
        hero={hero}
      />
    )
  }

  const word = wod.sozduk as Record<string, string>
  return (
    <WordOfDayCard
      word_kg={word.word_kg}
      word_ru={word.word_ru}
      example_kg={word.example_kg}
      example_ru={word.example_ru}
      category={word.category}
      hero={hero}
    />
  )
}

interface WordCardProps {
  word_kg: string
  word_ru: string
  example_kg?: string | null
  example_ru?: string | null
  category?: string | null
  hero?: boolean
}

function WordOfDayCard({ word_kg, word_ru, example_kg, example_ru, category, hero }: WordCardProps) {
  if (hero) {
    return (
      <div>
        <h3
          className="font-bold text-white leading-none mb-3"
          style={{
            fontFamily: 'var(--font-unbounded)',
            fontSize: 'clamp(3rem, 8vw, 8rem)',
          }}
        >
          {word_kg}
        </h3>
        <p
          className="text-xl text-white/60 mb-3"
          style={{ fontFamily: 'var(--font-nunito)' }}
        >
          {word_ru}
        </p>
        {category && (
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 mb-3">
            <span className="text-[11px] text-white/50" style={{ fontFamily: 'var(--font-nunito)' }}>
              {category}
            </span>
          </div>
        )}
        {example_kg && (
          <div className="space-y-1 mb-5">
            <p className="text-sm italic text-white/35" style={{ fontFamily: 'var(--font-nunito)' }}>
              {example_kg}
            </p>
            {example_ru && (
              <p className="text-sm text-white/25" style={{ fontFamily: 'var(--font-nunito)' }}>
                {example_ru}
              </p>
            )}
          </div>
        )}
        <Link
          href="/sozduk"
          className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors"
          style={{ fontFamily: 'var(--font-nunito)' }}
        >
          <BookOpen className="h-3.5 w-3.5" />
          Сөздүккө өтүү
          <ArrowUpRight className="h-3 w-3" />
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
          {category && (
            <Badge variant="secondary" className="ml-auto text-xs rounded-lg">
              {category}
            </Badge>
          )}
        </div>

        <div className="space-y-2 mb-4">
          <h3
            className="text-5xl font-bold text-primary"
            style={{ fontFamily: 'var(--font-unbounded)' }}
          >
            {word_kg}
          </h3>
          <p className="text-xl text-foreground/80" style={{ fontFamily: 'var(--font-nunito)' }}>
            {word_ru}
          </p>
        </div>

        {example_kg && (
          <div className="border-t border-border pt-4 space-y-1">
            <p className="text-sm italic text-foreground/70">{example_kg}</p>
            {example_ru && (
              <p className="text-sm text-muted-foreground">{example_ru}</p>
            )}
          </div>
        )}

        <Link
          href="/sozduk"
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary hover:text-accent transition-colors"
        >
          <BookOpen className="h-3.5 w-3.5" />
          Сөздүккө өтүү
        </Link>
      </CardContent>
    </Card>
  )
}
