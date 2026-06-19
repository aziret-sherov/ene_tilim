'use client'

import { useState } from 'react'
import { WordOfDay, type WordData } from '@/components/word-of-day'
import { useLangFilter } from '@/contexts/lang-filter-context'
import { RefreshCw } from 'lucide-react'

export function HomeWordOfDayTile({ initialWord }: { initialWord?: WordData }) {
  const { langFilter } = useLangFilter()
  const [refreshCount, setRefreshCount] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = () => {
    setRefreshing(true)
    setRefreshCount(c => c + 1)
    setTimeout(() => setRefreshing(false), 600)
  }

  const locale = langFilter === 'kg-ru' ? 'ru-RU' : 'en-US'
  const dateStr = new Date().toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="flex-1 bg-[#18181b] rounded-2xl p-8 lg:p-14 flex flex-col justify-between min-h-[420px] lg:min-h-0">
      <div className="flex items-center justify-between mb-4 lg:mb-0">
        <span
          className="text-[10px] uppercase tracking-[0.22em] font-semibold text-white/40"
          style={{ fontFamily: 'var(--font-nunito)' }}
        >
          Күндүн сөзү
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all"
            aria-label="Random word"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <span
            className="text-[10px] text-white/25 hidden sm:block"
            style={{ fontFamily: 'var(--font-nunito)' }}
          >
            {dateStr}
          </span>
        </div>
      </div>
      <WordOfDay hero refreshCount={refreshCount} initialWord={initialWord} />
    </div>
  )
}
