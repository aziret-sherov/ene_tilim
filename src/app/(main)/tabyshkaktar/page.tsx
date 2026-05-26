'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { SearchBar } from '@/components/search-bar'
import { HelpCircle, Eye, EyeOff, Filter, ArrowUpDown } from 'lucide-react'
import type { Tabyshmak } from '@/types'

type SortOrder = 'newest' | 'oldest' | 'az' | 'za'

const CATEGORIES = ['Баары', 'природа', 'предметы', 'время', 'животные', 'еда']

export default function TabyshkaktarPage() {
  const [tabyshmaktar, setTabyshmaktar] = useState<Tabyshmak[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('Баары')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [revealed, setRevealed] = useState<Set<number>>(new Set())

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('tabyshmaktar')
      .select('*')
      .limit(5000)
      .then(({ data }) => {
        setTabyshmaktar(data || [])
        setLoading(false)
      })
  }, [])

  const filtered = useMemo(() => {
    let result = tabyshmaktar
    if (activeCategory !== 'Баары') {
      result = result.filter((t) => t.category === activeCategory)
    }
    if (query) {
      const q = query.toLowerCase()
      result = result.filter((t) => t.question_kg.toLowerCase().includes(q))
    }
    return [...result].sort((a, b) => {
      switch (sortOrder) {
        case 'newest': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'oldest': return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'az': return a.question_kg.localeCompare(b.question_kg)
        case 'za': return b.question_kg.localeCompare(a.question_kg)
        default: return 0
      }
    })
  }, [query, activeCategory, sortOrder, tabyshmaktar])

  const toggleReveal = (id: number) => {
    setRevealed((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="px-5 sm:px-7 lg:px-10 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <HelpCircle className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-4xl font-bold text-foreground" style={{ fontFamily: 'var(--font-unbounded)' }}>
            Табышмактар
          </h1>
        </div>
        <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-nunito)' }}>
          Кыргызские загадки — проверь свою смекалку!
        </p>
      </div>

      <div className="flex gap-2 mb-4">
        <div className="flex-1">
          <SearchBar placeholder="Табышмак издөө..." onSearch={setQuery} />
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

      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
            }`}
            style={{ fontFamily: 'var(--font-nunito)' }}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="glass rounded-2xl border-primary/15">
              <CardContent className="p-6">
                <Skeleton className="h-6 w-full mb-4" />
                <Skeleton className="h-10 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <HelpCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-nunito)' }}>Эч нерсе табылган жок</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t) => {
            const isRevealed = revealed.has(t.id)
            return (
              <Card key={t.id} className="glass rounded-2xl border-primary/15 card-hover">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <p
                      className="text-foreground font-medium leading-relaxed text-base"
                      style={{ fontFamily: 'var(--font-nunito)' }}
                    >
                      {t.question_kg}
                    </p>
                    {t.category && (
                      <Badge variant="secondary" className="mt-2 rounded-lg text-xs">{t.category}</Badge>
                    )}
                  </div>
                  <button
                    onClick={() => toggleReveal(t.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      isRevealed
                        ? 'bg-primary/15 text-primary'
                        : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
                    }`}
                    style={{ fontFamily: 'var(--font-nunito)' }}
                  >
                    {isRevealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {isRevealed ? 'Жашыруу' : 'Жоопту көрүү'}
                  </button>
                  {isRevealed && (
                    <div className="mt-4 p-4 bg-primary/10 rounded-xl border border-primary/20">
                      <p
                        className="text-primary font-bold mb-1"
                        style={{ fontFamily: 'var(--font-unbounded)', fontSize: '1rem' }}
                      >
                        {t.answer_kg}
                      </p>
                      <p className="text-muted-foreground text-sm" style={{ fontFamily: 'var(--font-nunito)' }}>
                        {t.answer_ru}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <p className="text-center text-muted-foreground/50 text-sm mt-8" style={{ fontFamily: 'var(--font-nunito)' }}>
        {filtered.length} табышмак табылды
      </p>
    </div>
  )
}
