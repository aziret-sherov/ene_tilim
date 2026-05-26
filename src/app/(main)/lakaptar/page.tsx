'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { SearchBar } from '@/components/search-bar'
import { Share2, Sparkles, Filter, ArrowUpDown } from 'lucide-react'
import Link from 'next/link'
import type { Lakap } from '@/types'
import { useLangFilter } from '@/contexts/lang-filter-context'

type SortOrder = 'newest' | 'oldest' | 'az' | 'za'

const CATEGORIES = ['Баары', 'юмор', 'мудрость', 'поведение', 'щедрость', 'единство']

export default function LakapatarPage() {
  const { langFilter } = useLangFilter()
  const [lakaptar, setLakaptar] = useState<Lakap[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('Баары')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [copied, setCopied] = useState<number | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('lakaptar')
      .select('*')
      .limit(5000)
      .then(({ data }) => {
        setLakaptar(data || [])
        setLoading(false)
      })
  }, [])

  const filtered = useMemo(() => {
    let result = lakaptar
    if (activeCategory !== 'Баары') {
      result = result.filter((l) => l.category === activeCategory)
    }
    if (query) {
      const q = query.toLowerCase()
      result = result.filter(
        (l) => l.text_kg.toLowerCase().includes(q) || l.text_ru.toLowerCase().includes(q)
      )
    }
    return [...result].sort((a, b) => {
      switch (sortOrder) {
        case 'newest': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'oldest': return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'az': return a.text_kg.localeCompare(b.text_kg)
        case 'za': return b.text_kg.localeCompare(a.text_kg)
        default: return 0
      }
    })
  }, [query, activeCategory, sortOrder, lakaptar])

  const handleShare = async (lakap: Lakap) => {
    const text = `${lakap.text_kg}\n\n${lakap.text_ru}\n\n— эне тилим`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(lakap.id)
      setTimeout(() => setCopied(null), 2000)
    } catch { /* ignore */ }
  }

  return (
    <div className="px-5 sm:px-7 lg:px-10 py-8">

      <div className="flex gap-2 mb-4">
        <div className="flex-1">
          <SearchBar placeholder="Лакап издөө..." onSearch={setQuery} />
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
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Sparkles className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-nunito)' }}>Эч нерсе табылган жок</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((lakap) => (
            <Card key={lakap.id} className="glass rounded-2xl border-primary/15 card-hover group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <Link href={`/lakaptar/${lakap.id}`} className="hover:text-primary transition-colors">
                    <p
                      className="font-semibold text-foreground mb-2 leading-relaxed"
                      style={{ fontFamily: 'var(--font-unbounded)', fontSize: '0.95rem' }}
                    >
                      {lakap.text_kg}
                    </p>
                    </Link>
                    {langFilter === 'kg-ru' ? (
                      <p className="text-muted-foreground leading-relaxed" style={{ fontFamily: 'var(--font-nunito)' }}>
                        {lakap.text_ru}
                      </p>
                    ) : lakap.text_en ? (
                      <p className="text-muted-foreground leading-relaxed" style={{ fontFamily: 'var(--font-nunito)' }}>
                        {lakap.text_en}
                      </p>
                    ) : (
                      <p className="text-muted-foreground/35 italic text-xs" style={{ fontFamily: 'var(--font-nunito)' }}>
                        not translated
                      </p>
                    )}
                    {lakap.category && (
                      <Badge variant="secondary" className="mt-3 rounded-lg text-xs">{lakap.category}</Badge>
                    )}
                  </div>
                  <button
                    onClick={() => handleShare(lakap)}
                    className="p-2 rounded-xl hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100"
                  >
                    {copied === lakap.id
                      ? <span className="text-xs text-primary font-medium">✓</span>
                      : <Share2 className="h-4 w-4" />}
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="text-center text-muted-foreground/50 text-sm mt-8" style={{ fontFamily: 'var(--font-nunito)' }}>
        {filtered.length} лакап табылды
      </p>
    </div>
  )
}
