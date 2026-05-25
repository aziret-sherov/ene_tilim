'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { SearchBar } from '@/components/search-bar'
import { Search, BookOpen, Filter } from 'lucide-react'
import type { SozdukEntry } from '@/types'

const CATEGORIES = ['Баары', 'природа', 'семья', 'чувства', 'еда', 'время', 'место', 'действие']

function SozdukContent() {
  const searchParams = useSearchParams()
  const initialQ = searchParams.get('q') || ''

  const [entries, setEntries] = useState<SozdukEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState(initialQ)
  const [activeCategory, setActiveCategory] = useState('Баары')

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('sozduk')
      .select('*')
      .order('word_kg', { ascending: true })
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
    if (query) {
      const q = query.toLowerCase()
      result = result.filter(
        (e) =>
          e.word_kg.toLowerCase().includes(q) ||
          e.word_ru.toLowerCase().includes(q) ||
          (e.example_kg || '').toLowerCase().includes(q)
      )
    }
    return result
  }, [query, activeCategory, entries])

  return (
    <>
      <div className="mb-6">
        <SearchBar
          placeholder="Сөз издөө / Поиск слова..."
          onSearch={setQuery}
        />
      </div>

      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <Filter className="h-4 w-4 text-muted-foreground" />
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-primary text-white'
                : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
            }`}
            style={{ fontFamily: 'var(--font-nunito)' }}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="glass rounded-2xl border-primary/15">
              <CardContent className="p-5">
                <div className="flex gap-4">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-32" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-nunito)' }}>
            Сөз табылган жок
          </p>
          <p className="text-muted-foreground/60 text-sm mt-1">Слово не найдено</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filtered.map((entry) => (
            <Card key={entry.id} className="glass rounded-2xl border-primary/15 card-hover">
              <CardContent className="p-5">
                <div className="flex flex-wrap items-start gap-x-6 gap-y-2">
                  <span
                    className="text-xl font-bold text-primary"
                    style={{ fontFamily: 'var(--font-unbounded)', fontSize: '1.1rem' }}
                  >
                    {entry.word_kg}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground/40">—</span>
                    <span
                      className="text-lg text-foreground/80"
                      style={{ fontFamily: 'var(--font-nunito)' }}
                    >
                      {entry.word_ru}
                    </span>
                    {entry.category && (
                      <Badge variant="secondary" className="rounded-lg text-xs">
                        {entry.category}
                      </Badge>
                    )}
                  </div>
                </div>

                {entry.example_kg && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p
                      className="text-sm italic text-foreground/65"
                      style={{ fontFamily: 'var(--font-nunito)' }}
                    >
                      {entry.example_kg}
                    </p>
                    {entry.example_ru && (
                      <p
                        className="text-sm text-muted-foreground/70 mt-1"
                        style={{ fontFamily: 'var(--font-nunito)' }}
                      >
                        {entry.example_ru}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p
        className="text-center text-muted-foreground/50 text-sm mt-8"
        style={{ fontFamily: 'var(--font-nunito)' }}
      >
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
          <h1
            className="text-4xl font-bold text-foreground"
            style={{ fontFamily: 'var(--font-unbounded)' }}
          >
            Сөздүк
          </h1>
        </div>
        <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-nunito)' }}>
          Кыргызско-русский словарь
        </p>
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
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
