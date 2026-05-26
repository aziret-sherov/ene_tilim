'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { SearchBar } from '@/components/search-bar'
import { Search, BookOpen, Filter, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import type { SozdukEntry } from '@/types'
import { useLangFilter } from '@/contexts/lang-filter-context'

type SortOrder = 'az' | 'za' | 'newest' | 'oldest'

const CATEGORIES = ['Баары', 'природа', 'семья', 'чувства', 'еда', 'время', 'место', 'действие']
const PAGE_SIZE = 60

function SozdukContent() {
  const searchParams = useSearchParams()
  const initialQ = searchParams.get('q') || ''
  const { langFilter } = useLangFilter()

  const [entries, setEntries] = useState<SozdukEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState(initialQ)
  const [activeCategory, setActiveCategory] = useState('Баары')
  const [sortOrder, setSortOrder] = useState<SortOrder>('az')
  const [page, setPage] = useState(0)

  useEffect(() => {
    const supabase = createClient()
    const cols = langFilter === 'kg-ru'
      ? 'id,word_kg,word_ru,example_kg,example_ru,category,created_at'
      : 'id,word_kg,word_en,example_kg,example_en,category,created_at'

    async function fetchAll() {
      const PAGE = 1000
      let page = 0
      const all: typeof entries = []
      while (true) {
        const { data } = await supabase
          .from('sozduk')
          .select(cols)
          .range(page * PAGE, (page + 1) * PAGE - 1)
          .order('word_kg')
        if (!data || data.length === 0) break
        all.push(...(data as SozdukEntry[]))
        if (data.length < PAGE) break
        page++
      }
      setEntries(all)
      setLoading(false)
    }

    setLoading(true)
    setEntries([])
    fetchAll()
  }, [langFilter])

  const filtered = useMemo(() => {
    let result = entries
    if (activeCategory !== 'Баары') {
      result = result.filter((e) => e.category === activeCategory)
    }
    if (query) {
      const q = query.toLowerCase()
      result = result.filter(
        (e) =>
          e.word_kg.toLowerCase().includes(q) ||
          (e.word_ru || '').toLowerCase().includes(q) ||
          (e.word_en || '').toLowerCase().includes(q) ||
          (e.example_kg || '').toLowerCase().includes(q)
      )

      // Relevance rank: exact > starts-with > translation-starts-with > contains
      const rank = (e: SozdukEntry) => {
        const kg = e.word_kg.toLowerCase()
        const tr = langFilter === 'kg-ru' ? (e.word_ru || '').toLowerCase() : (e.word_en || '').toLowerCase()
        if (kg === q) return 0
        if (kg.startsWith(q)) return 1
        if (tr.startsWith(q)) return 2
        if (kg.includes(q)) return 3
        return 4
      }
      return [...result].sort((a, b) => rank(a) - rank(b))
    }
    return [...result].sort((a, b) => {
      switch (sortOrder) {
        case 'az': return a.word_kg.localeCompare(b.word_kg)
        case 'za': return b.word_kg.localeCompare(a.word_kg)
        case 'newest': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'oldest': return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        default: return 0
      }
    })
  }, [query, activeCategory, sortOrder, entries, langFilter])

  // reset to page 0 whenever filters/sort change
  useEffect(() => { setPage(0) }, [query, activeCategory, sortOrder, langFilter])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const translation = (entry: SozdukEntry): string | null =>
    langFilter === 'kg-ru' ? (entry.word_ru ?? null) : (entry.word_en ?? null)

  const exampleTranslation = (entry: SozdukEntry) =>
    langFilter === 'kg-ru' ? entry.example_ru : entry.example_en

  const noTranslationLabel = langFilter === 'kg-ru' ? 'котормосу жок' : 'not translated'

  return (
    <>
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md -mx-5 sm:-mx-7 lg:-mx-10 px-5 sm:px-7 lg:px-10 py-3 mb-2">
      <div className="flex gap-2">
        <div className="flex-1">
          <SearchBar
            placeholder={langFilter === 'kg-ru' ? 'Сөз издөө / Поиск слова...' : 'Сөз издөө / Search word...'}
            onSearch={setQuery}
          />
        </div>
        <div className="flex items-center gap-1.5 shrink-0 px-3 rounded-xl border border-border bg-background text-sm text-muted-foreground cursor-pointer">
          <ArrowUpDown className="h-3.5 w-3.5 shrink-0" />
          <select
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value as SortOrder)}
            className="bg-transparent outline-none cursor-pointer py-2"
            style={{ fontFamily: 'var(--font-nunito)' }}
          >
            <option value="az">А-Я</option>
            <option value="za">Я-А</option>
            <option value="newest">Новые</option>
            <option value="oldest">Старые</option>
          </select>
        </div>
      </div>
      </div>

      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-secondary text-secondary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-secondary/20 hover:text-secondary-foreground'
            }`}
            style={{ fontFamily: 'var(--font-nunito)' }}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="glass rounded-2xl border-primary/15">
              <CardContent className="p-5">
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-nunito)' }}>Сөз табылган жок</p>
          <p className="text-muted-foreground/60 text-sm mt-1">
            {langFilter === 'kg-ru' ? 'Слово не найдено' : 'Word not found'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {paginated.map((entry) => {
              const tr = translation(entry)
              return (
                <Card key={entry.id} className="glass rounded-2xl border-primary/15 card-hover">
                  <CardContent className="p-5">
                    <div className="flex flex-wrap items-start gap-x-3 gap-y-1">
                      <Link href={`/sozduk/${encodeURIComponent(entry.word_kg)}`} className="hover:opacity-80 transition-opacity">
                      <span
                        className="font-bold text-primary"
                        style={{ fontFamily: 'var(--font-unbounded)', fontSize: '1.05rem' }}
                      >
                        {entry.word_kg}
                      </span>
                      </Link>
                      <div className="flex items-center gap-2 flex-wrap">
                        {tr ? (
                          <>
                            <span className="text-muted-foreground/40">—</span>
                            <span className="text-foreground/80 text-sm" style={{ fontFamily: 'var(--font-nunito)' }}>
                              {tr}
                            </span>
                          </>
                        ) : (
                          <span className="text-muted-foreground/35 italic text-xs" style={{ fontFamily: 'var(--font-nunito)' }}>
                            {noTranslationLabel}
                          </span>
                        )}
                        {entry.category && (
                          <Badge variant="secondary" className="rounded-lg text-xs">{entry.category}</Badge>
                        )}
                      </div>
                    </div>
                    {entry.example_kg && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-sm italic text-foreground/65" style={{ fontFamily: 'var(--font-nunito)' }}>
                          {entry.example_kg}
                        </p>
                        {exampleTranslation(entry) && (
                          <p className="text-sm text-muted-foreground/70 mt-1" style={{ fontFamily: 'var(--font-nunito)' }}>
                            {exampleTranslation(entry)}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-8" style={{ fontFamily: 'var(--font-nunito)' }}>
            <p className="text-muted-foreground/50 text-sm">
              {filtered.length} сөз · {page + 1} / {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-2 rounded-xl hover:bg-muted transition-colors disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i)
                .filter(i => i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 2)
                .reduce<(number | '…')[]>((acc, i, idx, arr) => {
                  if (idx > 0 && i - (arr[idx - 1] as number) > 1) acc.push('…')
                  acc.push(i)
                  return acc
                }, [])
                .map((item, idx) =>
                  item === '…' ? (
                    <span key={`ellipsis-${idx}`} className="px-1 text-muted-foreground/40 text-sm">…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item as number)}
                      className={`w-8 h-8 rounded-xl text-sm font-medium transition-colors ${
                        page === item
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted text-muted-foreground'
                      }`}
                    >
                      {(item as number) + 1}
                    </button>
                  )
                )}
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-2 rounded-xl hover:bg-muted transition-colors disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default function SozdukPage() {
  return (
    <div className="px-5 sm:px-7 lg:px-10 py-8">
      <Suspense
        fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="glass rounded-2xl border-primary/15">
                <CardContent className="p-5">
                  <Skeleton className="h-8 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        }
      >
        <SozdukContent />
      </Suspense>
    </div>
  )
}
