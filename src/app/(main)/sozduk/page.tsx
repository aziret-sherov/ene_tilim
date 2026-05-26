'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { SearchBar } from '@/components/search-bar'
import { Search, BookOpen, Filter, ArrowUpDown } from 'lucide-react'
import type { SozdukEntry } from '@/types'

type SortOrder = 'az' | 'za' | 'newest' | 'oldest'
type LangFilter = 'all' | 'kg-ru' | 'kg-en'

const CATEGORIES = ['Баары', 'природа', 'семья', 'чувства', 'еда', 'время', 'место', 'действие']

function SozdukContent() {
  const searchParams = useSearchParams()
  const initialQ = searchParams.get('q') || ''

  const [entries, setEntries] = useState<SozdukEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState(initialQ)
  const [activeCategory, setActiveCategory] = useState('Баары')
  const [sortOrder, setSortOrder] = useState<SortOrder>('az')
  const [langFilter, setLangFilter] = useState<LangFilter>('all')

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('sozduk')
      .select('*')
      .then(({ data }) => {
        setEntries(data || [])
        setLoading(false)
      })
  }, [])

  const filtered = useMemo(() => {
    let result = entries
    if (activeCategory !== 'Баары') {
      result = result.filter((e) => e.category === activeCategory)
    }
    if (langFilter === 'kg-ru') result = result.filter((e) => e.word_ru)
    if (langFilter === 'kg-en') result = result.filter((e) => e.word_en)
    if (query) {
      const q = query.toLowerCase()
      result = result.filter(
        (e) =>
          e.word_kg.toLowerCase().includes(q) ||
          (e.word_ru || '').toLowerCase().includes(q) ||
          (e.word_en || '').toLowerCase().includes(q) ||
          (e.example_kg || '').toLowerCase().includes(q)
      )
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
  }, [query, activeCategory, sortOrder, langFilter, entries])

  return (
    <>
      <div className="flex gap-2 mb-4">
        <div className="flex-1">
          <SearchBar placeholder="Сөз издөө / Поиск / Search..." onSearch={setQuery} />
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

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
        {(['all', 'kg-ru', 'kg-en'] as LangFilter[]).map((lf) => (
          <button
            key={lf}
            onClick={() => setLangFilter(lf)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              langFilter === lf
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
            }`}
            style={{ fontFamily: 'var(--font-nunito)' }}
          >
            {lf === 'all' ? 'Баары' : lf === 'kg-ru' ? 'КГ → РУ' : 'КГ → EN'}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-6 flex-wrap">
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
                <Skeleton className="h-8 w-48" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-nunito)' }}>Сөз табылган жок</p>
          <p className="text-muted-foreground/60 text-sm mt-1">Слово не найдено / Word not found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((entry) => (
            <Card key={entry.id} className="glass rounded-2xl border-primary/15 card-hover">
              <CardContent className="p-5">
                <div className="mb-2">
                  <span
                    className="font-bold text-primary"
                    style={{ fontFamily: 'var(--font-unbounded)', fontSize: '1.05rem' }}
                  >
                    {entry.word_kg}
                  </span>
                  {entry.category && (
                    <Badge variant="secondary" className="rounded-lg text-xs ml-2">{entry.category}</Badge>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  {entry.word_ru && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground/50 w-6 shrink-0">РУ</span>
                      <span className="text-foreground/80 text-sm" style={{ fontFamily: 'var(--font-nunito)' }}>
                        {entry.word_ru}
                      </span>
                    </div>
                  )}
                  {entry.word_en && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground/50 w-6 shrink-0">EN</span>
                      <span className="text-foreground/80 text-sm" style={{ fontFamily: 'var(--font-nunito)' }}>
                        {entry.word_en}
                      </span>
                    </div>
                  )}
                </div>
                {entry.example_kg && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-sm italic text-foreground/65" style={{ fontFamily: 'var(--font-nunito)' }}>
                      {entry.example_kg}
                    </p>
                    {entry.example_ru && (
                      <p className="text-sm text-muted-foreground/70 mt-1" style={{ fontFamily: 'var(--font-nunito)' }}>
                        {entry.example_ru}
                      </p>
                    )}
                    {entry.example_en && (
                      <p className="text-sm text-muted-foreground/60 mt-1 italic" style={{ fontFamily: 'var(--font-nunito)' }}>
                        {entry.example_en}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="text-center text-muted-foreground/50 text-sm mt-8" style={{ fontFamily: 'var(--font-nunito)' }}>
        {filtered.length} сөз табылды
      </p>
    </>
  )
}

export default function SozdukPage() {
  return (
    <div className="px-5 sm:px-7 lg:px-10 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Search className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-4xl font-bold text-foreground" style={{ fontFamily: 'var(--font-unbounded)' }}>
            Сөздүк
          </h1>
        </div>
        <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-nunito)' }}>
          Кыргызско-русско-английский словарь
        </p>
      </div>
      <Suspense
        fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="glass rounded-2xl border-primary/15">
                <CardContent className="p-5">
                  <Skeleton className="h-8 w-48" />
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
