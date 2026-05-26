'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { SearchBar } from '@/components/search-bar'
import { Music, ChevronDown, ChevronUp, ArrowUpDown } from 'lucide-react'
import Link from 'next/link'
import type { Yr } from '@/types'
import { useLangFilter } from '@/contexts/lang-filter-context'

type SortOrder = 'newest' | 'oldest' | 'az' | 'za'

export default function YrlarPage() {
  const { langFilter } = useLangFilter()
  const [yrlar, setYrlar] = useState<Yr[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [expanded, setExpanded] = useState<number | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('yrlar')
      .select('*')
      .limit(5000)
      .then(({ data }) => {
        setYrlar(data || [])
        setLoading(false)
      })
  }, [])

  const filtered = useMemo(() => {
    let result = yrlar
    if (query) {
      const q = query.toLowerCase()
      result = result.filter(
        (y) => y.title.toLowerCase().includes(q) || y.lyrics_kg.toLowerCase().includes(q)
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
  }, [query, sortOrder, yrlar])

  const toggleExpand = (id: number) => {
    setExpanded((prev) => (prev === id ? null : id))
  }

  return (
    <div className="px-5 sm:px-7 lg:px-10 py-8">

      <div className="flex gap-2 mb-6">
        <div className="flex-1">
          <SearchBar placeholder="Ыр издөө..." onSearch={setQuery} />
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
                <Skeleton className="h-7 w-48 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Music className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-nunito)' }}>Ыр табылган жок</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((yr) => {
            const isExpanded = expanded === yr.id
            return (
              <Card key={yr.id} className="glass rounded-2xl border-primary/15">
                <CardContent className="p-0">
                  <button
                    onClick={() => toggleExpand(yr.id)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-primary/5 transition-colors rounded-2xl"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                        <Music className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <Link href={`/yrlar/${yr.id}`} onClick={e => e.stopPropagation()} className="hover:text-primary transition-colors">
                        <h3
                          className="font-bold text-foreground truncate"
                          style={{ fontFamily: 'var(--font-unbounded)', fontSize: '0.9rem' }}
                        >
                          {yr.title}
                        </h3>
                        </Link>
                        <p
                          className="text-xs text-muted-foreground mt-0.5 line-clamp-1"
                          style={{ fontFamily: 'var(--font-nunito)' }}
                        >
                          {yr.lyrics_kg.split('\n')[0]}
                        </p>
                      </div>
                    </div>
                    {isExpanded
                      ? <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0 ml-2" />
                      : <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0 ml-2" />}
                  </button>
                  {isExpanded && (
                    <div className="px-6 pb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-border pt-6">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                            Кыргызча
                          </p>
                          <pre
                            className="whitespace-pre-wrap text-foreground/80 text-sm leading-relaxed"
                            style={{ fontFamily: 'var(--font-nunito)' }}
                          >
                            {yr.lyrics_kg}
                          </pre>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                            {langFilter === 'kg-ru' ? 'Перевод' : 'Translation'}
                          </p>
                          {langFilter === 'kg-ru' && yr.translation_ru ? (
                            <pre className="whitespace-pre-wrap text-muted-foreground text-sm leading-relaxed" style={{ fontFamily: 'var(--font-nunito)' }}>
                              {yr.translation_ru}
                            </pre>
                          ) : langFilter === 'kg-en' && yr.translation_en ? (
                            <pre className="whitespace-pre-wrap text-muted-foreground text-sm leading-relaxed" style={{ fontFamily: 'var(--font-nunito)' }}>
                              {yr.translation_en}
                            </pre>
                          ) : (
                            <p className="text-muted-foreground/35 italic text-sm" style={{ fontFamily: 'var(--font-nunito)' }}>
                              {langFilter === 'kg-ru' ? 'котормосу жок' : 'not translated'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
