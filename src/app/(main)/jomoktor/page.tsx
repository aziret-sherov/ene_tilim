'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { SearchBar } from '@/components/search-bar'
import { BookMarked, ArrowLeft, ArrowUpDown } from 'lucide-react'
import type { Akya } from '@/types'

type SortOrder = 'newest' | 'oldest' | 'az' | 'za'

export default function AkyaPage() {
  const [akyalar, setAkyalar] = useState<Akya[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [selected, setSelected] = useState<Akya | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('akya')
      .select('*')
      .limit(5000)
      .then(({ data }) => {
        setAkyalar(data || [])
        setLoading(false)
      })
  }, [])

  const filtered = useMemo(() => {
    let result = akyalar
    if (query) {
      const q = query.toLowerCase()
      result = result.filter(
        (a) => a.title.toLowerCase().includes(q) || (a.summary_ru || '').toLowerCase().includes(q)
      )
    }
    return [...result].sort((a, b) => {
      switch (sortOrder) {
        case 'newest': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'oldest': return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'az': return a.title.localeCompare(b.title)
        case 'za': return b.title.localeCompare(a.title)
        default: return 0
      }
    })
  }, [query, sortOrder, akyalar])

  if (selected) {
    return (
      <div className="px-5 sm:px-7 lg:px-10 py-8">
        <button
          onClick={() => setSelected(null)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          style={{ fontFamily: 'var(--font-nunito)' }}
        >
          <ArrowLeft className="h-4 w-4" />
          Артка кайтуу
        </button>
        <h1
          className="text-4xl font-bold text-foreground mb-4"
          style={{ fontFamily: 'var(--font-unbounded)' }}
        >
          {selected.title}
        </h1>
        {selected.summary_ru && (
          <p
            className="text-muted-foreground mb-8 p-4 bg-muted rounded-2xl border border-border italic"
            style={{ fontFamily: 'var(--font-nunito)' }}
          >
            {selected.summary_ru}
          </p>
        )}
        <div
          className="prose prose-lg max-w-none text-foreground/85 leading-relaxed"
          style={{ fontFamily: 'var(--font-nunito)', fontSize: '1.05rem', lineHeight: '1.8' }}
        >
          {selected.content_kg.split('\n').map((para, i) => (
            <p key={i} className="mb-4">{para}</p>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="px-5 sm:px-7 lg:px-10 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BookMarked className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-4xl font-bold text-foreground" style={{ fontFamily: 'var(--font-unbounded)' }}>
            Жомоктор
          </h1>
        </div>
        <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-nunito)' }}>
          Кыргызские сказки и легенды
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        <div className="flex-1">
          <SearchBar placeholder="Жомок издөө..." onSearch={setQuery} />
        </div>
        <div className="flex items-center gap-1.5 shrink-0 px-3 rounded-xl border border-border bg-background text-sm text-muted-foreground cursor-pointer">
          <ArrowUpDown className="h-3.5 w-3.5 shrink-0" />
          <select
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value as SortOrder)}
            className="bg-transparent outline-none cursor-pointer py-2"
            style={{ fontFamily: 'var(--font-nunito)' }}
          >
            <option value="newest">Новые</option>
            <option value="oldest">Старые</option>
            <option value="az">А-Я</option>
            <option value="za">Я-А</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="glass rounded-2xl border-primary/15">
              <CardContent className="p-6">
                <Skeleton className="h-7 w-48 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <BookMarked className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-nunito)' }}>Жомок табылган жок</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((akya) => (
            <Card
              key={akya.id}
              className="glass rounded-2xl border-primary/15 card-hover cursor-pointer"
              onClick={() => setSelected(akya)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center shrink-0">
                    <BookMarked className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-bold text-foreground mb-2 truncate"
                      style={{ fontFamily: 'var(--font-unbounded)', fontSize: '0.9rem' }}
                    >
                      {akya.title}
                    </h3>
                    {akya.summary_ru && (
                      <p
                        className="text-muted-foreground text-sm line-clamp-2"
                        style={{ fontFamily: 'var(--font-nunito)' }}
                      >
                        {akya.summary_ru}
                      </p>
                    )}
                    <p
                      className="text-muted-foreground text-xs mt-3 font-medium"
                      style={{ fontFamily: 'var(--font-nunito)' }}
                    >
                      Окуу →
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
