'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface SearchBarProps {
  placeholder?: string
  onSearch?: (query: string) => void
  globalSearch?: boolean
}

export function SearchBar({ placeholder = 'Издөө...', onSearch, globalSearch }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (globalSearch && query.trim()) {
      router.push(`/sozduk?q=${encodeURIComponent(query.trim())}`)
    } else if (onSearch) {
      onSearch(query)
    }
  }

  return (
    <form onSubmit={handleSearch} className="relative">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          if (onSearch) onSearch(e.target.value)
        }}
        placeholder={placeholder}
        className="pl-10 rounded-xl border-border bg-input/50 focus:bg-input h-11"
        style={{ fontFamily: 'var(--font-nunito)' }}
      />
    </form>
  )
}
