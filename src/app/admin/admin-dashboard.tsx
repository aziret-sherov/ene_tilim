'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  LogOut, Plus, Trash2, Users, RefreshCw, X,
  MessageSquare, Smile, HelpCircle, Music2, BookOpen, Book,
  Pencil, AlertTriangle,
} from 'lucide-react'
import {
  logout, getEntries, addEntry, updateEntry, deleteEntry,
  getAdminUsers, createAdminUser, deleteAdminUser,
} from './actions'
import { useRouter } from 'next/navigation'
import type { SessionPayload } from '@/lib/session'

type FieldDef = {
  name: string
  label: string
  type: 'text' | 'textarea' | 'select'
  required?: boolean
  options?: string[]
}

type Section = {
  key: string
  label: string
  labelRu: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any
  fields: FieldDef[]
  displayFull: (r: Record<string, string>) => { primary: string; secondary?: string; badge?: string }
}

const SECTIONS: Section[] = [
  {
    key: 'makaldar', label: 'Макалдар', labelRu: 'Пословицы',
    icon: MessageSquare,
    fields: [
      { name: 'text_kg', label: 'Текст (кырг.)', type: 'textarea', required: true },
      { name: 'text_ru', label: 'Текст (рус.)', type: 'textarea', required: true },
      { name: 'category', label: 'Категория', type: 'select', options: ['мудрость', 'дружба', 'труд', 'семья', 'природа', 'общество', 'образование'] },
    ],
    displayFull: r => ({ primary: r.text_kg, secondary: r.text_ru, badge: r.category }),
  },
  {
    key: 'lakaptar', label: 'Лакаптар', labelRu: 'Поговорки',
    icon: Smile,
    fields: [
      { name: 'text_kg', label: 'Текст (кырг.)', type: 'textarea', required: true },
      { name: 'text_ru', label: 'Текст (рус.)', type: 'textarea', required: true },
      { name: 'category', label: 'Категория', type: 'select', options: ['юмор', 'мудрость', 'поведение', 'щедрость', 'единство'] },
    ],
    displayFull: r => ({ primary: r.text_kg, secondary: r.text_ru, badge: r.category }),
  },
  {
    key: 'tabyshmaktar', label: 'Табышмактар', labelRu: 'Загадки',
    icon: HelpCircle,
    fields: [
      { name: 'question_kg', label: 'Загадка (кырг.)', type: 'textarea', required: true },
      { name: 'answer_kg', label: 'Ответ (кырг.)', type: 'text', required: true },
      { name: 'answer_ru', label: 'Ответ (рус.)', type: 'text', required: true },
      { name: 'category', label: 'Категория', type: 'select', options: ['природа', 'предметы', 'время', 'животные', 'еда'] },
    ],
    displayFull: r => ({ primary: r.question_kg, secondary: `${r.answer_kg} · ${r.answer_ru}`, badge: r.category }),
  },
  {
    key: 'yrlar', label: 'Ырлар', labelRu: 'Песни',
    icon: Music2,
    fields: [
      { name: 'title', label: 'Название', type: 'text', required: true },
      { name: 'lyrics_kg', label: 'Текст (кырг.)', type: 'textarea', required: true },
      { name: 'translation_ru', label: 'Перевод (рус.)', type: 'textarea' },
    ],
    displayFull: r => ({ primary: r.title, secondary: r.lyrics_kg }),
  },
  {
    key: 'akya', label: 'Жомоктор', labelRu: 'Сказки',
    icon: BookOpen,
    fields: [
      { name: 'title', label: 'Название', type: 'text', required: true },
      { name: 'content_kg', label: 'Текст (кырг.)', type: 'textarea', required: true },
      { name: 'summary_ru', label: 'Краткое описание (рус.)', type: 'textarea' },
    ],
    displayFull: r => ({ primary: r.title, secondary: r.summary_ru }),
  },
  {
    key: 'sozduk', label: 'Сөздүк', labelRu: 'Словарь',
    icon: Book,
    fields: [
      { name: 'word_kg', label: 'Слово (кырг.)', type: 'text', required: true },
      { name: 'word_ru', label: 'Слово (рус.)', type: 'text', required: true },
      { name: 'example_kg', label: 'Пример (кырг.)', type: 'textarea' },
      { name: 'example_ru', label: 'Пример (рус.)', type: 'textarea' },
      { name: 'category', label: 'Категория', type: 'select', options: ['природа', 'семья', 'чувства', 'еда', 'время', 'место', 'действие'] },
    ],
    displayFull: r => ({ primary: `${r.word_kg} — ${r.word_ru}`, secondary: r.example_kg, badge: r.category }),
  },
]

// ── Shared input class ────────────────────────────────────────────────────────
const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 transition-all bg-white'

// ── Reusable Modal shell ──────────────────────────────────────────────────────
function Modal({
  title,
  onClose,
  children,
  maxWidth = 'max-w-lg',
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
  maxWidth?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        ref={ref}
        className={`bg-white rounded-2xl border border-zinc-200 shadow-2xl w-full ${maxWidth} max-h-[90vh] flex flex-col`}
        style={{ fontFamily: 'var(--font-nunito)' }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 shrink-0">
          <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  )
}

// ── Delete confirmation modal ─────────────────────────────────────────────────
function DeleteModal({
  label,
  onConfirm,
  onCancel,
  loading,
}: {
  label: string
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
}) {
  return (
    <Modal title="Подтвердите удаление" onClose={onCancel} maxWidth="max-w-sm">
      <div className="px-6 py-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
          <div>
            <p className="text-sm text-zinc-700">Это действие нельзя отменить. Удалить запись?</p>
            {label && (
              <p className="mt-1.5 text-xs text-zinc-400 line-clamp-2">{label}</p>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-zinc-600 hover:bg-zinc-100 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Удаление...' : 'Удалить'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Entry form (used for both add and edit) ───────────────────────────────────
function EntryForm({
  section,
  initialValues,
  onSubmit,
  onCancel,
  saving,
  submitLabel,
}: {
  section: Section
  initialValues: Record<string, string>
  onSubmit: (form: Record<string, string>) => void
  onCancel: () => void
  saving: boolean
  submitLabel: string
}) {
  const [form, setForm] = useState<Record<string, string>>(initialValues)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="px-6 py-5">
        <div className="grid grid-cols-2 gap-3">
          {section.fields.map(field => (
            <div
              key={field.name}
              className={field.type === 'textarea' ? 'col-span-2' : 'col-span-1'}
            >
              <label className="block text-xs font-medium text-zinc-500 mb-1.5">
                {field.label}{field.required && ' *'}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  rows={3}
                  required={field.required}
                  value={form[field.name] ?? ''}
                  onChange={e => setForm(p => ({ ...p, [field.name]: e.target.value }))}
                  className={inputClass + ' resize-none'}
                />
              ) : field.type === 'select' ? (
                <select
                  value={form[field.name] ?? ''}
                  onChange={e => setForm(p => ({ ...p, [field.name]: e.target.value }))}
                  className={inputClass}
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
                  className={inputClass}
                />
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2 px-6 py-4 border-t border-zinc-100 shrink-0">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-zinc-600 hover:bg-zinc-100 transition-colors"
        >
          Отмена
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-[#18181b] text-white rounded-xl text-sm font-semibold hover:bg-zinc-700 transition-colors disabled:opacity-50"
        >
          {saving ? 'Сохранение...' : submitLabel}
        </button>
      </div>
    </form>
  )
}

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ name }: { name: string }) {
  return (
    <div className="h-8 w-8 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-600 shrink-0">
      {name[0]?.toUpperCase()}
    </div>
  )
}

// ── Main dashboard ────────────────────────────────────────────────────────────
export function AdminDashboard({ session }: { session: SessionPayload }) {
  const [activeTab, setActiveTab] = useState('makaldar')
  const [entries, setEntries] = useState<Record<string, string>[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  // Edit modal
  const [editEntry, setEditEntry] = useState<Record<string, string> | null>(null)

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Users tab
  const [users, setUsers] = useState<Record<string, string>[]>([])
  const [userForm, setUserForm] = useState({ email: '', password: '', name: '', role: 'moderator' })

  // Toast
  const [success, setSuccess] = useState('')

  const router = useRouter()

  const showToast = (msg: string) => {
    setSuccess(msg)
    setTimeout(() => setSuccess(''), 3000)
  }

  const loadEntries = useCallback(async () => {
    setLoading(true)
    const data = await getEntries(activeTab)
    setEntries(data as Record<string, string>[])
    setLoading(false)
  }, [activeTab])

  useEffect(() => {
    setShowAddForm(false)
    setEditEntry(null)
    setDeleteTarget(null)
    setSuccess('')
    if (activeTab === 'users') {
      getAdminUsers().then(d => setUsers(d as Record<string, string>[])).catch(() => {})
    } else {
      loadEntries()
    }
  }, [activeTab, loadEntries])

  const section = SECTIONS.find(s => s.key === activeTab)

  const handleAdd = async (form: Record<string, string>) => {
    setSaving(true)
    const result = await addEntry(activeTab, form)
    if (!result.error) {
      setShowAddForm(false)
      showToast('Запись добавлена')
      await loadEntries()
    }
    setSaving(false)
  }

  const handleEdit = async (form: Record<string, string>) => {
    if (!editEntry) return
    setSaving(true)
    const result = await updateEntry(activeTab, editEntry.id, form)
    if (!result.error) {
      setEditEntry(null)
      showToast('Запись обновлена')
      await loadEntries()
    }
    setSaving(false)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    await deleteEntry(activeTab, deleteTarget.id)
    setDeleteTarget(null)
    setDeleting(false)
    await loadEntries()
  }

  const handleLogout = async () => {
    await logout()
    router.refresh()
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await createAdminUser(
      userForm.email, userForm.password,
      userForm.role as 'admin' | 'moderator', userForm.name
    )
    if (!result.error) {
      setUserForm({ email: '', password: '', name: '', role: 'moderator' })
      const data = await getAdminUsers()
      setUsers(data as Record<string, string>[])
      showToast('Пользователь создан')
    }
  }

  const tabs = [
    ...SECTIONS.map(s => ({ key: s.key, label: s.label, labelRu: s.labelRu, icon: s.icon })),
    ...(session.role === 'admin' ? [{ key: 'users', label: 'Команда', labelRu: 'Пользователи', icon: Users }] : []),
  ]

  return (
    <div className="min-h-screen flex bg-zinc-50" style={{ fontFamily: 'var(--font-nunito)' }}>

      {/* ── Modals ── */}
      {deleteTarget && (
        <DeleteModal
          label={deleteTarget.label}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      {editEntry && section && (
        <Modal
          title={`Редактировать · ${section.label}`}
          onClose={() => setEditEntry(null)}
          maxWidth="max-w-xl"
        >
          <EntryForm
            section={section}
            initialValues={editEntry}
            onSubmit={handleEdit}
            onCancel={() => setEditEntry(null)}
            saving={saving}
            submitLabel="Сохранить"
          />
        </Modal>
      )}

      {/* ── Sidebar ── */}
      <aside className="w-60 bg-white border-r border-zinc-100 flex flex-col shrink-0">
        <div className="h-16 flex items-center px-5 border-b border-zinc-100">
          <span
            className="font-black text-[#18181b] text-sm"
            style={{ fontFamily: 'var(--font-unbounded)' }}
          >
            Эне тилим
          </span>
        </div>

        <nav className="flex-1 p-2 py-3 space-y-0.5">
          {tabs.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                  isActive
                    ? 'bg-[#18181b] text-white'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-medium leading-tight">{tab.label}</div>
                  <div className="text-xs leading-tight mt-0.5 text-zinc-400">{tab.labelRu}</div>
                </div>
              </button>
            )
          })}
        </nav>

        <div className="p-2 border-t border-zinc-100">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl">
            <Avatar name={session.name || session.email} />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-zinc-900 truncate">
                {session.name || session.email}
              </div>
              <div className="text-xs text-zinc-400 capitalize">{session.role}</div>
            </div>
            <button
              onClick={handleLogout}
              title="Выйти"
              className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors shrink-0"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-zinc-100 flex items-center justify-between px-8 shrink-0">
          <div>
            <h1
              className="font-bold text-zinc-900 leading-tight"
              style={{ fontFamily: 'var(--font-unbounded)', fontSize: '0.875rem' }}
            >
              {activeTab === 'users' ? 'Команда' : section?.label}
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              {activeTab === 'users'
                ? `${users.length} пользователей`
                : `${section?.labelRu} · ${entries.length} записей`
              }
            </p>
          </div>

          <div className="flex items-center gap-2">
            {success && (
              <span className="text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                ✓ {success}
              </span>
            )}
            {activeTab !== 'users' && (
              <>
                <button
                  onClick={loadEntries}
                  className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors"
                  title="Обновить"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setShowAddForm(v => !v)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    showAddForm
                      ? 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      : 'bg-[#18181b] text-white hover:bg-zinc-700'
                  }`}
                >
                  {showAddForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                  {showAddForm ? 'Закрыть' : 'Добавить'}
                </button>
              </>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-8">
          {activeTab === 'users' ? (
            <div className="max-w-2xl space-y-6">
              <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                <h3 className="text-sm font-semibold text-zinc-900 mb-5">Добавить пользователя</h3>
                <form onSubmit={handleAddUser} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-zinc-500 mb-1.5">Имя</label>
                      <input
                        type="text"
                        value={userForm.name}
                        onChange={e => setUserForm(p => ({ ...p, name: e.target.value }))}
                        className={inputClass}
                        placeholder="Имя"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-500 mb-1.5">Email *</label>
                      <input
                        type="email" required
                        value={userForm.email}
                        onChange={e => setUserForm(p => ({ ...p, email: e.target.value }))}
                        className={inputClass}
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-500 mb-1.5">Пароль *</label>
                      <input
                        type="password" required minLength={6}
                        value={userForm.password}
                        onChange={e => setUserForm(p => ({ ...p, password: e.target.value }))}
                        className={inputClass}
                        placeholder="минимум 6 символов"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-500 mb-1.5">Роль</label>
                      <select
                        value={userForm.role}
                        onChange={e => setUserForm(p => ({ ...p, role: e.target.value }))}
                        className={inputClass}
                      >
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-4 py-2 bg-[#18181b] text-white rounded-xl text-sm font-semibold hover:bg-zinc-700 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" /> Создать
                    </button>
                  </div>
                </form>
              </div>

              <div className="space-y-2">
                {users.map(u => (
                  <div
                    key={u.id}
                    className="bg-white rounded-xl border border-zinc-200 px-4 py-3 flex items-center gap-3"
                  >
                    <Avatar name={u.name || u.email} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-zinc-900 truncate">{u.name || u.email}</p>
                      <p className="text-xs text-zinc-400 truncate">{u.email}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500 capitalize shrink-0">
                      {u.role}
                    </span>
                    {u.id !== session.id && (
                      <button
                        onClick={() => setDeleteTarget({ id: u.id, label: u.name || u.email })}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-zinc-300 hover:text-red-500 transition-colors shrink-0"
                        title="Удалить"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                {users.length === 0 && (
                  <p className="text-sm text-zinc-400 text-center py-8">Нет пользователей</p>
                )}
              </div>
            </div>
          ) : section ? (
            <div className="max-w-3xl space-y-4">
              {/* Inline add form */}
              {showAddForm && (
                <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-zinc-100">
                    <h3 className="text-sm font-semibold text-zinc-900">Новая запись</h3>
                  </div>
                  <EntryForm
                    section={section}
                    initialValues={{}}
                    onSubmit={handleAdd}
                    onCancel={() => setShowAddForm(false)}
                    saving={saving}
                    submitLabel="Добавить"
                  />
                </div>
              )}

              {/* Entries */}
              {loading ? (
                <div className="text-sm text-zinc-400 text-center py-12">Загрузка...</div>
              ) : entries.length === 0 && !showAddForm ? (
                <div className="bg-white rounded-2xl border border-zinc-200 py-16 text-center">
                  <p className="text-sm text-zinc-400">Нет записей</p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="mt-3 text-sm text-zinc-600 font-semibold hover:text-zinc-900 transition-colors"
                  >
                    + Добавить первую запись
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {entries.map(entry => {
                    const { primary, secondary, badge } = section.displayFull(entry)
                    return (
                      <div
                        key={entry.id}
                        className="bg-white rounded-xl border border-zinc-200 px-4 py-3 flex items-start gap-4 group"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-zinc-900 line-clamp-1">{primary}</p>
                          {secondary && (
                            <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">{secondary}</p>
                          )}
                        </div>
                        {badge && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500 shrink-0 mt-0.5">
                            {badge}
                          </span>
                        )}
                        {/* Action buttons — visible on hover */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={() => setEditEntry(entry)}
                            className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors"
                            title="Редактировать"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget({ id: entry.id, label: primary })}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-500 transition-colors"
                            title="Удалить"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ) : null}
        </main>
      </div>
    </div>
  )
}
