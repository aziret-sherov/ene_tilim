'use client'

import { useState } from 'react'
import { login } from './actions'
import { useRouter } from 'next/navigation'

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
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-black text-[#18181b]" style={{ fontFamily: 'var(--font-unbounded)' }}>
            Эне тилим
          </h1>
          <p className="text-sm text-zinc-500 mt-1" style={{ fontFamily: 'var(--font-nunito)' }}>
            Панель управления
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-zinc-200 p-8 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wide">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none focus:border-zinc-400 transition-colors"
              style={{ fontFamily: 'var(--font-nunito)' }}
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wide">
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none focus:border-zinc-400 transition-colors"
              style={{ fontFamily: 'var(--font-nunito)' }}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 text-center" style={{ fontFamily: 'var(--font-nunito)' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#18181b] text-white rounded-xl text-sm font-semibold hover:bg-zinc-700 transition-colors disabled:opacity-50"
            style={{ fontFamily: 'var(--font-nunito)' }}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  )
}
