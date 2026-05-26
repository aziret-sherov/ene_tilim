'use client'

import { createContext, useContext, useState } from 'react'

export type LangFilter = 'kg-ru' | 'kg-en'

interface LangFilterContextValue {
  langFilter: LangFilter
  setLangFilter: (lf: LangFilter) => void
}

const LangFilterContext = createContext<LangFilterContextValue>({
  langFilter: 'kg-ru',
  setLangFilter: () => {},
})

export function LangFilterProvider({ children }: { children: React.ReactNode }) {
  const [langFilter, setLangFilter] = useState<LangFilter>('kg-ru')
  return (
    <LangFilterContext.Provider value={{ langFilter, setLangFilter }}>
      {children}
    </LangFilterContext.Provider>
  )
}

export function useLangFilter() {
  return useContext(LangFilterContext)
}
