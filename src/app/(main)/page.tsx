'use client'

import Link from 'next/link'
import { WordOfDay } from '@/components/word-of-day'
import { HomeFaq } from './home-faq'
import { useLangFilter } from '@/contexts/lang-filter-context'
import {
  MessageSquare,
  HelpCircle,
  Music,
  BookMarked,
  Search,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react'

const sections = [
  {
    href: '/makaldar',
    title: 'Макалдар',
    subtitleRu: 'Пословицы',
    subtitleEn: 'Proverbs',
    icon: MessageSquare,
  },
  {
    href: '/lakaptar',
    title: 'Лакаптар',
    subtitleRu: 'Образные выражения',
    subtitleEn: 'Idioms',
    icon: Sparkles,
  },
  {
    href: '/tabyshkaktar',
    title: 'Табышмактар',
    subtitleRu: 'Загадки',
    subtitleEn: 'Riddles',
    icon: HelpCircle,
  },
  {
    href: '/yrlar',
    title: 'Ырлар',
    subtitleRu: 'Песни',
    subtitleEn: 'Songs',
    icon: Music,
  },
  {
    href: '/jomoktor',
    title: 'Жомоктор',
    subtitleRu: 'Сказки',
    subtitleEn: 'Tales',
    icon: BookMarked,
  },
  {
    href: '/sozduk',
    title: 'Сөздүк',
    subtitleRu: 'Словарь',
    subtitleEn: 'Dictionary',
    icon: Search,
  },
]

const rows = [
  [sections[0], sections[1]],
  [sections[2], sections[3]],
  [sections[4], sections[5]],
]

export default function HomePage() {
  const { langFilter } = useLangFilter()
  const isRu = langFilter === 'kg-ru'

  const dateStr = new Date().toLocaleDateString(isRu ? 'ru-RU' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <>
    <HomeFaq />
    <div
      className="flex flex-col lg:flex-row gap-4 p-5 sm:p-7 lg:p-10"
      style={{ minHeight: 'calc(100vh - 64px)' }}
    >
      {/* ── LEFT COLUMN ──────────────────────────────────── */}
      <div className="lg:w-[45%] lg:max-w-[680px] shrink-0 flex flex-col gap-4">

        {/* Word of Day tile — dark */}
        <div className="flex-1 bg-[#18181b] rounded-2xl p-8 lg:p-14 flex flex-col justify-between min-h-[420px] lg:min-h-0">
          <div className="flex items-center justify-between mb-4 lg:mb-0">
            <span
              className="text-[10px] uppercase tracking-[0.22em] font-semibold text-white/40"
              style={{ fontFamily: 'var(--font-nunito)' }}
            >
              Күндүн сөзү
            </span>
            <span
              className="text-[10px] text-white/25 hidden sm:block"
              style={{ fontFamily: 'var(--font-nunito)' }}
            >
              {dateStr}
            </span>
          </div>
          <WordOfDay hero />
        </div>

        {/* Search tile */}
        <Link
          href="/sozduk"
          className="h-14 bg-muted rounded-2xl px-5 flex items-center gap-3 shrink-0 hover:bg-muted/70 transition-colors group"
        >
          <Search className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-foreground transition-colors" />
          <span
            className="text-sm text-muted-foreground group-hover:text-foreground transition-colors"
            style={{ fontFamily: 'var(--font-nunito)' }}
          >
            {isRu ? 'Сөз издөө / Поиск слова...' : 'Сөз издөө / Search word...'}
          </span>
        </Link>
      </div>

      {/* ── RIGHT COLUMN — section grid ──────────────────── */}
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
                        {isRu ? section.subtitleRu : section.subtitleEn}
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
