'use client'

import { useState } from 'react'
import { login } from './actions'
import { useRouter } from 'next/navigation'
import { BookOpen } from 'lucide-react'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await login(email, password)
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#18181b] rounded-2xl mb-4">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <h1
            className="text-xl font-black text-[#18181b]"
            style={{ fontFamily: 'var(--font-unbounded)' }}
          >
            Эне тилим
          </h1>
          <p className="text-sm text-zinc-400 mt-1" style={{ fontFamily: 'var(--font-nunito)' }}>
            Панель управления
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-7 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider"
                style={{ fontFamily: 'var(--font-nunito)' }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 transition-all"
                style={{ fontFamily: 'var(--font-nunito)' }}
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label
                className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider"
                style={{ fontFamily: 'var(--font-nunito)' }}
              >
                Пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 transition-all"
                style={{ fontFamily: 'var(--font-nunito)' }}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="px-3.5 py-2.5 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-xs text-red-600" style={{ fontFamily: 'var(--font-nunito)' }}>
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#18181b] text-white rounded-xl text-sm font-semibold hover:bg-zinc-700 active:bg-zinc-900 transition-colors disabled:opacity-50 mt-2"
              style={{ fontFamily: 'var(--font-nunito)' }}
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>
        </div>

        <p className="text-center mt-5 text-xs text-zinc-400" style={{ fontFamily: 'var(--font-nunito)' }}>
          <a href="/" className="hover:text-zinc-700 transition-colors">
            ← Вернуться на сайт
          </a>
        </p>
      </div>
    </div>
  )
}
