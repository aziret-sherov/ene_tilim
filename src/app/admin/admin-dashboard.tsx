'use client'

import { useState, useEffect, useCallback } from 'react'
import { LogOut, Plus, Trash2, Users, BookOpen, RefreshCw } from 'lucide-react'
import { logout, getEntries, addEntry, deleteEntry, getAdminUsers, createAdminUser, deleteAdminUser } from './actions'
import { useRouter } from 'next/navigation'
import type { SessionPayload } from '@/lib/session'

const SECTIONS = [
  {
    key: 'makaldar', label: 'Макалдар',
    fields: [
      { name: 'text_kg', label: 'Текст (кырг.)', type: 'textarea', required: true },
      { name: 'text_ru', label: 'Текст (рус.)', type: 'textarea', required: true },
      { name: 'category', label: 'Категория', type: 'select', options: ['мудрость', 'дружба', 'труд', 'семья', 'природа', 'общество', 'образование'] },
    ],
    display: (r: Record<string, string>) => r.text_kg,
  },
  {
    key: 'lakaptar', label: 'Лакаптар',
    fields: [
      { name: 'text_kg', label: 'Текст (кырг.)', type: 'textarea', required: true },
      { name: 'text_ru', label: 'Текст (рус.)', type: 'textarea', required: true },
      { name: 'category', label: 'Категория', type: 'select', options: ['юмор', 'мудрость', 'поведение', 'щедрость', 'единство'] },
    ],
    display: (r: Record<string, string>) => r.text_kg,
  },
  {
    key: 'tabyshmaktar', label: 'Табышмактар',
    fields: [
      { name: 'question_kg', label: 'Загадка (кырг.)', type: 'textarea', required: true },
      { name: 'answer_kg', label: 'Ответ (кырг.)', type: 'text', required: true },
      { name: 'answer_ru', label: 'Ответ (рус.)', type: 'text', required: true },
      { name: 'category', label: 'Категория', type: 'select', options: ['природа', 'предметы', 'время', 'животные', 'еда'] },
    ],
    display: (r: Record<string, string>) => r.question_kg,
  },
  {
    key: 'yrlar', label: 'Ырлар',
    fields: [
      { name: 'title', label: 'Название', type: 'text', required: true },
      { name: 'lyrics_kg', label: 'Текст (кырг.)', type: 'textarea', required: true },
      { name: 'translation_ru', label: 'Перевод (рус.)', type: 'textarea' },
    ],
    display: (r: Record<string, string>) => r.title,
  },
  {
    key: 'akya', label: 'Жомоктор',
    fields: [
      { name: 'title', label: 'Название', type: 'text', required: true },
      { name: 'content_kg', label: 'Текст (кырг.)', type: 'textarea', required: true },
      { name: 'summary_ru', label: 'Краткое описание (рус.)', type: 'textarea' },
    ],
    display: (r: Record<string, string>) => r.title,
  },
  {
    key: 'sozduk', label: 'Сөздүк',
    fields: [
      { name: 'word_kg', label: 'Слово (кырг.)', type: 'text', required: true },
      { name: 'word_ru', label: 'Слово (рус.)', type: 'text', required: true },
      { name: 'example_kg', label: 'Пример (кырг.)', type: 'textarea' },
      { name: 'example_ru', label: 'Пример (рус.)', type: 'textarea' },
      { name: 'category', label: 'Категория', type: 'select', options: ['природа', 'семья', 'чувства', 'еда', 'время', 'место', 'действие'] },
    ],
    display: (r: Record<string, string>) => `${r.word_kg} — ${r.word_ru}`,
  },
]

export function AdminDashboard({ session }: { session: SessionPayload }) {
  const [activeTab, setActiveTab] = useState('makaldar')
  const [entries, setEntries] = useState<Record<string, string>[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [users, setUsers] = useState<Record<string, string>[]>([])
  const [userForm, setUserForm] = useState({ email: '', password: '', name: '', role: 'moderator' })
  const router = useRouter()

  const loadEntries = useCallback(async () => {
    setLoading(true)
    const data = await getEntries(activeTab)
    setEntries(data as Record<string, string>[])
    setLoading(false)
  }, [activeTab])

  useEffect(() => {
    if (activeTab === 'users') {
      getAdminUsers().then(d => setUsers(d as Record<string, string>[])).catch(() => {})
    } else {
      loadEntries()
      setForm({})
    }
  }, [activeTab, loadEntries])

  const section = SECTIONS.find(s => s.key === activeTab)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const result = await addEntry(activeTab, form)
    if (!result.error) {
      setForm({})
      await loadEntries()
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить запись?')) return
    await deleteEntry(activeTab, id)
    await loadEntries()
  }

  const handleLogout = async () => {
    await logout()
    router.refresh()
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await createAdminUser(userForm.email, userForm.password, userForm.role as 'admin' | 'moderator', userForm.name)
    if (!result.error) {
      setUserForm({ email: '', password: '', name: '', role: 'moderator' })
      const data = await getAdminUsers()
      setUsers(data as Record<string, string>[])
    }
  }

  const tabs = [
    ...SECTIONS.map(s => ({ key: s.key, label: s.label })),
    ...(session.role === 'admin' ? [{ key: 'users', label: 'Пользователи' }] : []),
  ]

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="h-14 bg-white border-b border-zinc-200 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <BookOpen className="h-4 w-4 text-zinc-400" />
          <span className="font-black text-[#18181b] text-sm" style={{ fontFamily: 'var(--font-unbounded)' }}>
            Эне тилим
          </span>
          <span className="text-xs text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">
            {session.role === 'admin' ? 'Admin' : 'Moderator'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-400" style={{ fontFamily: 'var(--font-nunito)' }}>
            {session.name || session.email}
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
            style={{ fontFamily: 'var(--font-nunito)' }}
          >
            <LogOut className="h-3.5 w-3.5" />
            Выйти
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-48 bg-white border-r border-zinc-200 flex flex-col py-4 shrink-0">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-left text-sm transition-colors ${
                activeTab === tab.key
                  ? 'bg-zinc-100 text-zinc-900 font-semibold'
                  : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
              style={{ fontFamily: 'var(--font-nunito)' }}
            >
              {tab.key === 'users' && <Users className="h-3.5 w-3.5 inline mr-2 opacity-50" />}
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-auto p-6">
          {activeTab === 'users' ? (
            <div className="max-w-2xl">
              <h2 className="font-bold text-lg mb-6" style={{ fontFamily: 'var(--font-unbounded)', fontSize: '1rem' }}>
                Пользователи
              </h2>

              {/* Add user form */}
              <form onSubmit={handleAddUser} className="bg-white rounded-2xl border border-zinc-200 p-5 mb-6 space-y-3">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">Добавить пользователя</p>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text" placeholder="Имя"
                    value={userForm.name}
                    onChange={e => setUserForm(p => ({ ...p, name: e.target.value }))}
                    className="px-3 py-2 rounded-xl border border-zinc-200 text-sm outline-none focus:border-zinc-400"
                    style={{ fontFamily: 'var(--font-nunito)' }}
                  />
                  <input
                    type="email" placeholder="Email" required
                    value={userForm.email}
                    onChange={e => setUserForm(p => ({ ...p, email: e.target.value }))}
                    className="px-3 py-2 rounded-xl border border-zinc-200 text-sm outline-none focus:border-zinc-400"
                    style={{ fontFamily: 'var(--font-nunito)' }}
                  />
                  <input
                    type="password" placeholder="Пароль" required minLength={6}
                    value={userForm.password}
                    onChange={e => setUserForm(p => ({ ...p, password: e.target.value }))}
                    className="px-3 py-2 rounded-xl border border-zinc-200 text-sm outline-none focus:border-zinc-400"
                    style={{ fontFamily: 'var(--font-nunito)' }}
                  />
                  <select
                    value={userForm.role}
                    onChange={e => setUserForm(p => ({ ...p, role: e.target.value }))}
                    className="px-3 py-2 rounded-xl border border-zinc-200 text-sm outline-none focus:border-zinc-400 bg-white"
                    style={{ fontFamily: 'var(--font-nunito)' }}
                  >
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#18181b] text-white rounded-xl text-xs font-semibold hover:bg-zinc-700 transition-colors"
                  style={{ fontFamily: 'var(--font-nunito)' }}
                >
                  <Plus className="h-3.5 w-3.5" /> Добавить
                </button>
              </form>

              {/* Users list */}
              <div className="space-y-2">
                {users.map(u => (
                  <div key={u.id} className="bg-white rounded-xl border border-zinc-200 px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-zinc-900" style={{ fontFamily: 'var(--font-nunito)' }}>
                        {u.name || u.email}
                      </p>
                      <p className="text-xs text-zinc-400">{u.email} · {u.role}</p>
                    </div>
                    {u.id !== session.id && (
                      <button
                        onClick={async () => {
                          if (!confirm('Удалить пользователя?')) return
                          await deleteAdminUser(u.id)
                          const data = await getAdminUsers()
                          setUsers(data as Record<string, string>[])
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : section ? (
            <div className="max-w-3xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold" style={{ fontFamily: 'var(--font-unbounded)', fontSize: '1rem' }}>
                  {section.label}
                  <span className="ml-2 text-xs font-normal text-zinc-400">({entries.length})</span>
                </h2>
                <button onClick={loadEntries} className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 transition-colors">
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>

              {/* Add form */}
              <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-zinc-200 p-5 mb-6 space-y-3">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Добавить запись</p>
                {section.fields.map(field => (
                  <div key={field.name}>
                    <label className="block text-xs text-zinc-500 mb-1" style={{ fontFamily: 'var(--font-nunito)' }}>
                      {field.label}{field.required && ' *'}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        rows={3}
                        required={field.required}
                        value={form[field.name] ?? ''}
                        onChange={e => setForm(p => ({ ...p, [field.name]: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-sm outline-none focus:border-zinc-400 resize-none"
                        style={{ fontFamily: 'var(--font-nunito)' }}
                      />
                    ) : field.type === 'select' ? (
                      <select
                        value={form[field.name] ?? ''}
                        onChange={e => setForm(p => ({ ...p, [field.name]: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-sm outline-none focus:border-zinc-400 bg-white"
                        style={{ fontFamily: 'var(--font-nunito)' }}
                      >
                        <option value="">— выбрать —</option>
                        {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input
                        type="text"
                        required={field.required}
                        value={form[field.name] ?? ''}
                        onChange={e => setForm(p => ({ ...p, [field.name]: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-sm outline-none focus:border-zinc-400"
                        style={{ fontFamily: 'var(--font-nunito)' }}
                      />
                    )}
                  </div>
                ))}
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#18181b] text-white rounded-xl text-xs font-semibold hover:bg-zinc-700 transition-colors disabled:opacity-50"
                  style={{ fontFamily: 'var(--font-nunito)' }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  {saving ? 'Сохранение...' : 'Добавить'}
                </button>
              </form>

              {/* Entries list */}
              {loading ? (
                <div className="text-sm text-zinc-400 text-center py-8">Загрузка...</div>
              ) : (
                <div className="space-y-2">
                  {entries.map(entry => (
                    <div key={entry.id} className="bg-white rounded-xl border border-zinc-200 px-4 py-3 flex items-center justify-between gap-4">
                      <p className="text-sm text-zinc-700 line-clamp-1 flex-1" style={{ fontFamily: 'var(--font-nunito)' }}>
                        {section.display(entry)}
                      </p>
                      {entry.category && (
                        <span className="text-xs text-zinc-400 shrink-0">{entry.category}</span>
                      )}
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-500 transition-colors shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  {entries.length === 0 && (
                    <p className="text-sm text-zinc-400 text-center py-8">Нет записей</p>
                  )}
                </div>
              )}
            </div>
          ) : null}
        </main>
      </div>
    </div>
  )
}
