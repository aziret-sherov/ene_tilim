import Link from 'next/link'
import { HomeFaq } from './home-faq'
import { HomeWordOfDayTile } from './home-word-of-day-tile'
import { createClient } from '@/lib/supabase/server'
import type { WordData } from '@/components/word-of-day'
import {
  MessageSquare,
  HelpCircle,
  Music,
  BookMarked,
  Search,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react'

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Эне тилим',
  url: 'https://ene-tilim.online',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://ene-tilim.online/sozduk?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
}

const sections = [
  {
    href: '/makaldar',
    title: 'Макалдар',
    subtitle: 'Пословицы / Proverbs',
    icon: MessageSquare,
  },
  {
    href: '/lakaptar',
    title: 'Лакаптар',
    subtitle: 'Поговорки / Idioms',
    icon: Sparkles,
  },
  {
    href: '/tabyshkaktar',
    title: 'Табышмактар',
    subtitle: 'Загадки / Riddles',
    icon: HelpCircle,
  },
  {
    href: '/yrlar',
    title: 'Ырлар',
    subtitle: 'Песни / Songs',
    icon: Music,
  },
  {
    href: '/jomoktor',
    title: 'Жомоктор',
    subtitle: 'Сказки / Tales',
    icon: BookMarked,
  },
  {
    href: '/sozduk',
    title: 'Сөздүк',
    subtitle: 'Словарь / Dictionary',
    icon: Search,
  },
]

const rows = [
  [sections[0], sections[1]],
  [sections[2], sections[3]],
  [sections[4], sections[5]],
]

const WORD_COLS = 'word_kg,word_ru,word_en,example_kg,example_ru,example_en,category'

async function fetchWordOfDay(): Promise<WordData | undefined> {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: wod } = await supabase
    .from('word_of_day')
    .select(`*, sozduk(${WORD_COLS})`)
    .eq('date', today)
    .maybeSingle()

  if (wod?.sozduk) return wod.sozduk as WordData

  const { count } = await supabase
    .from('sozduk')
    .select('id', { count: 'exact', head: true })
  if (!count) return undefined

  const epoch = Math.floor(new Date(today).getTime() / 86400000)
  const { data: daily } = await supabase
    .from('sozduk')
    .select(WORD_COLS)
    .range(epoch % count, epoch % count)
    .single()

  return daily ?? undefined
}

export default async function HomePage() {
  const initialWord = await fetchWordOfDay()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <HomeFaq />
      <div
        className="flex flex-col lg:flex-row gap-4 p-5 sm:p-7 lg:p-10"
        style={{ minHeight: 'calc(100vh - 64px)' }}
      >
        {/* LEFT COLUMN */}
        <div className="lg:w-[45%] lg:max-w-[680px] shrink-0 flex flex-col gap-4">
          <HomeWordOfDayTile initialWord={initialWord} />

          <Link
            href="/sozduk"
            className="h-14 bg-muted rounded-2xl px-5 flex items-center gap-3 shrink-0 hover:bg-muted/70 transition-colors group"
          >
            <Search className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-foreground transition-colors" />
            <span
              className="text-sm text-muted-foreground group-hover:text-foreground transition-colors"
              style={{ fontFamily: 'var(--font-nunito)' }}
            >
              Сөз издөө / Поиск слова / Search word...
            </span>
          </Link>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex-1 flex flex-col gap-4">
          {rows.map((row, rowIdx) => (
            <div key={rowIdx} className="flex gap-4 flex-1 min-h-[110px]">
              {row.map((section, colIdx) => {
                const Icon = section.icon
                const isInverse = rowIdx === 2 && colIdx === 1
                return (
                  <Link key={section.href} href={section.href} className="flex-1">
                    <div
                      className={`h-full rounded-2xl p-5 lg:p-6 flex flex-col justify-between cursor-pointer group transition-all hover:-translate-y-0.5 hover:shadow-sm ${
                        isInverse
                          ? 'bg-[#18181b]'
                          : 'bg-muted border border-transparent hover:border-foreground/10'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <Icon
                          className={`h-5 w-5 transition-colors ${
                            isInverse
                              ? 'text-white'
                              : 'text-muted-foreground group-hover:text-foreground'
                          }`}
                        />
                        <ArrowUpRight
                          className={`h-3.5 w-3.5 opacity-0 group-hover:opacity-30 transition-opacity ${
                            isInverse ? 'text-white' : 'text-foreground'
                          }`}
                        />
                      </div>
                      <div>
                        <h3
                          className={`font-bold text-sm mb-0.5 ${
                            isInverse ? 'text-white' : 'text-foreground'
                          }`}
                          style={{ fontFamily: 'var(--font-unbounded)' }}
                        >
                          {section.title}
                        </h3>
                        <p
                          className={`text-xs ${
                            isInverse ? 'text-white/50' : 'text-muted-foreground'
                          }`}
                          style={{ fontFamily: 'var(--font-nunito)' }}
                        >
                          {section.subtitle}
                        </p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
