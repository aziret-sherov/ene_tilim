'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from './theme-toggle'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

const navLinks = [
  { href: '/makaldar',     label: 'Макалдар'    },
  { href: '/lakaptar',     label: 'Лакаптар'    },
  { href: '/tabyshkaktar', label: 'Табышмактар' },
  { href: '/yrlar',        label: 'Ырлар'        },
  { href: '/jomoktor',     label: 'Жомоктор'    },
  { href: '/sozduk',       label: 'Сөздүк'      },
]

export function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/60">
      <div className="px-5 sm:px-7 lg:px-10">
        <div className="flex items-center justify-between h-16">

          <Link href="/" className="flex items-center">
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
