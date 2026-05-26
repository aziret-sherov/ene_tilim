import { Navbar } from '@/components/navbar'
import { LangFilterProvider } from '@/contexts/lang-filter-context'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <LangFilterProvider>
      <Navbar />
      <main className="min-h-[calc(100vh-64px)]">
        {children}
      </main>
    </LangFilterProvider>
  )
}
