'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from './theme-toggle'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useLangFilter, type LangFilter } from '@/contexts/lang-filter-context'

const navLinks = [
  { href: '/makaldar',     label: 'Макалдар'    },
  { href: '/lakaptar',     label: 'Лакаптар'    },
  { href: '/tabyshkaktar', label: 'Табышмактар' },
  { href: '/yrlar',        label: 'Ырлар'        },
  { href: '/jomoktor',     label: 'Жомоктор'    },
  { href: '/sozduk',       label: 'Сөздүк'      },
]

function LangToggle() {
  const { langFilter, setLangFilter } = useLangFilter()
  return (
    <div className="flex items-center bg-muted rounded-xl p-0.5">
      {(['kg-ru', 'kg-en'] as LangFilter[]).map((lf) => (
        <button
          key={lf}
          onClick={() => setLangFilter(lf)}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
            langFilter === lf
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          style={{ fontFamily: 'var(--font-nunito)' }}
        >
          {lf === 'kg-ru' ? 'KG–RU' : 'KG–EN'}
        </button>
      ))}
    </div>
  )
}

export function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/60">
      <div className="px-5 sm:px-7 lg:px-10">
        <div className="flex items-center justify-between h-16">

          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="Эне тилим"
              width={36}
              height={36}
              className="shrink-0 dark:invert"
              priority
              sizes="36px"
            />
            <span
              className="text-xl font-black tracking-tight text-foreground"
              style={{ fontFamily: 'var(--font-unbounded)' }}
            >
              Эне тилим
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors duration-150 ${
                  pathname === link.href
                    ? 'bg-foreground/8 text-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5 font-medium'
                }`}
                style={{ fontFamily: 'var(--font-nunito)' }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LangToggle />
            <button
              className="md:hidden p-2 rounded-lg hover:bg-foreground/5 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-3 flex flex-col gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 ${
                  pathname === link.href
                    ? 'bg-foreground/8 text-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5 font-medium'
                }`}
                style={{ fontFamily: 'var(--font-nunito)' }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
