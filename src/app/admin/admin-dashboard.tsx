'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import {
  LogOut, Plus, Trash2, Users, RefreshCw, X,
  MessageSquare, Smile, HelpCircle, Music2, BookOpen, Book,
  Pencil, AlertTriangle, Menu, Search, ArrowUpDown, Filter,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import {
  logout, getEntriesPaged, addEntry, updateEntry, deleteEntry,
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
  categories?: string[]
  displayFull: (r: Record<string, string>) => { primary: string; secondary?: string; badge?: string; example?: string; exampleTranslation?: string }
}

const SECTIONS: Section[] = [
  {
    key: 'makaldar', label: 'Макалдар', labelRu: 'Пословицы',
    icon: MessageSquare,
    fields: [
      { name: 'text_kg', label: 'Текст (кырг.)', type: 'textarea', required: true },
      { name: 'text_ru', label: 'Текст (рус.)', type: 'textarea', required: true },
      { name: 'text_en', label: 'Текст (англ.)', type: 'textarea' },
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
      { name: 'text_en', label: 'Текст (англ.)', type: 'textarea' },
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
      { name: 'answer_en', label: 'Ответ (англ.)', type: 'text' },
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
      { name: 'translation_en', label: 'Перевод (англ.)', type: 'textarea' },
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
      { name: 'summary_en', label: 'Краткое описание (англ.)', type: 'textarea' },
    ],
    displayFull: r => ({ primary: r.title, secondary: r.summary_ru }),
  },
  {
    key: 'sozduk', label: 'Сөздүк', labelRu: 'Словарь',
    icon: Book,
    categories: ['природа', 'семья', 'чувства', 'еда', 'время', 'место', 'действие'],
    fields: [
      { name: 'word_kg', label: 'Слово (кырг.)', type: 'text', required: true },
      { name: 'word_ru', label: 'Слово (рус.)', type: 'text' },
      { name: 'word_en', label: 'Слово (англ.)', type: 'text' },
      { name: 'example_kg', label: 'Пример (кырг.)', type: 'textarea' },
      { name: 'example_ru', label: 'Пример (рус.)', type: 'textarea' },
      { name: 'example_en', label: 'Пример (англ.)', type: 'textarea' },
      { name: 'category', label: 'Категория', type: 'select', options: ['природа', 'семья', 'чувства', 'еда', 'время', 'место', 'действие'] },
    ],
    displayFull: r => ({
      primary: r.word_kg,
      secondary: [r.word_ru && `РУ: ${r.word_ru}`, r.word_en && `EN: ${r.word_en}`].filter(Boolean).join(' · ') || undefined,
      badge: r.category,
      example: r.example_kg || undefined,
      exampleTranslation: [r.example_ru && `РУ: ${r.example_ru}`, r.example_en && `EN: ${r.example_en}`].filter(Boolean).join(' · ') || undefined,
    }),
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

// ── Auto-resizing textarea ────────────────────────────────────────────────────
function AutoTextarea({
  value, onChange, required, minRows, className,
}: {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  required?: boolean
  minRows: number
  className?: string
}) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [value])

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={onChange}
      required={required}
      rows={minRows}
      className={className}
      style={{ resize: 'none', overflow: 'hidden' }}
    />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {section.fields.map(field => (
            <div key={field.name} className="sm:col-span-2">
              <label className="block text-xs font-medium text-zinc-500 mb-1.5">
                {field.label}{field.required && ' *'}
              </label>
              {field.type === 'select' ? (
                <select
                  value={form[field.name] ?? ''}
                  onChange={e => setForm(p => ({ ...p, [field.name]: e.target.value }))}
                  className={inputClass}
                >
                  <option value="">— выбрать —</option>
                  {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <AutoTextarea
                  minRows={field.type === 'textarea' ? 3 : 1}
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
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [adminQuery, setAdminQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [adminSort, setAdminSort] = useState<'newest' | 'oldest' | 'az' | 'za'>('newest')
  const [adminCategory, setAdminCategory] = useState('')
  const [adminPage, setAdminPage] = useState(0)
  const ADMIN_PAGE_SIZE = 50

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

  // Debounce search query — UI updates instantly, server call fires after 300 ms idle
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedQuery(adminQuery); setAdminPage(0) }, 300)
    return () => clearTimeout(t)
  }, [adminQuery])

  const loadEntries = useCallback(async () => {
    if (activeTab === 'users') return
    const sec = SECTIONS.find(s => s.key === activeTab)
    if (!sec) return
    setLoading(true)
    const searchFields = sec.fields.filter(f => f.type !== 'select' && f.name !== 'category').map(f => f.name)
    const { data, count } = await getEntriesPaged(activeTab, {
      page: adminPage, pageSize: ADMIN_PAGE_SIZE, query: debouncedQuery,
      sort: adminSort, category: adminCategory, searchFields, sortField: sec.fields[0].name,
    })
    setEntries(data)
    setTotalCount(count)
    setLoading(false)
  }, [activeTab, adminPage, debouncedQuery, adminSort, adminCategory])

  // Reset UI + filters when switching tabs
  useEffect(() => {
    setShowAddForm(false)
    setEditEntry(null)
    setDeleteTarget(null)
    setSuccess('')
    setAdminQuery('')
    setDebouncedQuery('')
    setAdminSort(activeTab === 'sozduk' ? 'az' : 'newest')
    setAdminCategory('')
    setAdminPage(0)
    if (activeTab === 'users') {
      getAdminUsers().then(d => setUsers(d as Record<string, string>[])).catch(() => {})
    }
  }, [activeTab])

  // Fetch whenever debounced query / sort / category / page / tab changes
  useEffect(() => {
    if (activeTab === 'users') return
    const sec = SECTIONS.find(s => s.key === activeTab)
    if (!sec) return
    let cancelled = false
    setLoading(true)
    const searchFields = sec.fields.filter(f => f.type !== 'select' && f.name !== 'category').map(f => f.name)
    getEntriesPaged(activeTab, {
      page: adminPage, pageSize: ADMIN_PAGE_SIZE, query: debouncedQuery,
      sort: adminSort, category: adminCategory, searchFields, sortField: sec.fields[0].name,
    }).then(({ data, count }) => {
      if (!cancelled) { setEntries(data); setTotalCount(count); setLoading(false) }
    })
    return () => { cancelled = true }
  }, [activeTab, adminPage, debouncedQuery, adminSort, adminCategory])

  const section = SECTIONS.find(s => s.key === activeTab)

  const totalAdminPages = Math.ceil(totalCount / ADMIN_PAGE_SIZE)
  const paginatedEntries = entries

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
    <div className="min-h-screen flex items-start bg-zinc-50" style={{ fontFamily: 'var(--font-nunito)' }}>

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
          maxWidth="max-w-3xl"
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

      {showAddForm && section && (
        <Modal
          title={`Добавить · ${section.label}`}
          onClose={() => setShowAddForm(false)}
          maxWidth="max-w-3xl"
        >
          <EntryForm
            section={section}
            initialValues={{}}
            onSubmit={handleAdd}
            onCancel={() => setShowAddForm(false)}
            saving={saving}
            submitLabel="Добавить"
          />
        </Modal>
      )}

      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`w-60 bg-white border-r border-zinc-100 flex flex-col shrink-0 transition-transform duration-200
          sticky top-0 self-start h-screen
          max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-50 max-lg:h-full
          ${sidebarOpen ? 'max-lg:translate-x-0' : 'max-lg:-translate-x-full'}`}
      >
        <div className="h-16 flex items-center justify-between px-5 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Эне тилим" width={28} height={28} className="shrink-0" />
            <span
              className="font-black text-[#18181b] text-sm"
              style={{ fontFamily: 'var(--font-unbounded)' }}
            >
              Эне тилим
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 p-2 py-3 space-y-0.5 overflow-y-auto">
          {tabs.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setSidebarOpen(false) }}
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
      <div className="flex-1 min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-zinc-100 flex items-center justify-between px-4 sm:px-8 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-500 lg:hidden shrink-0"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h1
                className="font-bold text-zinc-900 leading-tight truncate"
                style={{ fontFamily: 'var(--font-unbounded)', fontSize: '0.875rem' }}
              >
                {activeTab === 'users' ? 'Команда' : section?.label}
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5 truncate">
                {activeTab === 'users'
                  ? `${users.length} пользователей`
                  : `${section?.labelRu} · ${totalCount} записей`
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {success && (
              <span className="hidden sm:inline text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
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
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-semibold bg-[#18181b] text-white hover:bg-zinc-700 transition-all"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Добавить</span>
                </button>
              </>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="p-4 sm:p-8">
          {activeTab === 'users' ? (
            <div className="w-full space-y-6">
              <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                <h3 className="text-sm font-semibold text-zinc-900 mb-5">Добавить пользователя</h3>
                <form onSubmit={handleAddUser} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            <div className="w-full space-y-4">
              {/* Search + sort toolbar */}
              {(
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2 px-3 rounded-xl border border-zinc-200 bg-white">
                    <Search className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                    <input
                      type="text"
                      value={adminQuery}
                      onChange={e => setAdminQuery(e.target.value)}
                      placeholder="Поиск..."
                      className="flex-1 py-2.5 text-sm text-zinc-900 outline-none bg-transparent placeholder:text-zinc-400"
                      style={{ fontFamily: 'var(--font-nunito)' }}
                    />
                    {adminQuery && (
                      <button onClick={() => { setAdminQuery(''); setDebouncedQuery('') }} className="text-zinc-300 hover:text-zinc-500">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 px-3 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-500">
                    <ArrowUpDown className="h-3.5 w-3.5 shrink-0" />
                    <select
                      value={adminSort}
                      onChange={e => { setAdminSort(e.target.value as typeof adminSort); setAdminPage(0) }}
                      className="bg-transparent outline-none cursor-pointer py-2.5"
                      style={{ fontFamily: 'var(--font-nunito)' }}
                    >
                      <option value="newest">Новые</option>
                      <option value="oldest">Старые</option>
                      <option value="az">А-Я</option>
                      <option value="za">Я-А</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Category chips */}
              {section.categories && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Filter className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  <button
                    onClick={() => { setAdminCategory(''); setAdminPage(0) }}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      adminCategory === ''
                        ? 'bg-zinc-900 text-white'
                        : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                    }`}
                  >
                    Все
                  </button>
                  {section.categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => { setAdminCategory(adminCategory === cat ? '' : cat); setAdminPage(0) }}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        adminCategory === cat
                          ? 'bg-zinc-900 text-white'
                          : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              {/* Entries */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border border-zinc-200 p-4 space-y-2">
                      <div className="h-4 bg-zinc-100 rounded animate-pulse w-3/4" />
                      <div className="h-3 bg-zinc-100 rounded animate-pulse w-1/2" />
                    </div>
                  ))}
                </div>
              ) : entries.length === 0 ? (
                <div className="bg-white rounded-2xl border border-zinc-200 py-16 text-center">
                  <p className="text-sm text-zinc-400">Нет записей</p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="mt-3 text-sm text-zinc-600 font-semibold hover:text-zinc-900 transition-colors"
                  >
                    + Добавить первую запись
                  </button>
                </div>
              ) : entries.length === 0 ? (
                <div className="bg-white rounded-2xl border border-zinc-200 py-12 text-center">
                  <p className="text-sm text-zinc-400">Ничего не найдено</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {paginatedEntries.map(entry => {
                      const { primary, secondary, badge, example, exampleTranslation } = section.displayFull(entry)
                      return (
                        <div
                          key={entry.id}
                          className="bg-white rounded-xl border border-zinc-200 p-4 flex flex-col gap-2 group hover:border-zinc-300 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-zinc-900 line-clamp-2 leading-snug">{primary}</p>
                            </div>
                            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
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
                          {secondary && (
                            <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{secondary}</p>
                          )}
                          {badge && (
                            <span className="self-start text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500">
                              {badge}
                            </span>
                          )}
                          {example && (
                            <div className="mt-1 pt-2 border-t border-zinc-100">
                              <p className="text-xs italic text-zinc-400 line-clamp-2">{example}</p>
                              {exampleTranslation && (
                                <p className="text-xs text-zinc-400/70 mt-0.5 line-clamp-1">{exampleTranslation}</p>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {totalAdminPages > 1 && (
                    <div className="flex items-center justify-between pt-2" style={{ fontFamily: 'var(--font-nunito)' }}>
                      <p className="text-xs text-zinc-400">
                        {totalCount} записей · стр. {adminPage + 1} / {totalAdminPages}
                      </p>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setAdminPage(p => Math.max(0, p - 1))}
                          disabled={adminPage === 0}
                          className="p-1.5 rounded-lg hover:bg-zinc-100 transition-colors disabled:opacity-30 text-zinc-500"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        {Array.from({ length: totalAdminPages }, (_, i) => i)
                          .filter(i => i === 0 || i === totalAdminPages - 1 || Math.abs(i - adminPage) <= 2)
                          .reduce<(number | '…')[]>((acc, i, idx, arr) => {
                            if (idx > 0 && i - (arr[idx - 1] as number) > 1) acc.push('…')
                            acc.push(i)
                            return acc
                          }, [])
                          .map((item, idx) =>
                            item === '…' ? (
                              <span key={`ellipsis-${idx}`} className="px-1 text-zinc-400 text-xs">…</span>
                            ) : (
                              <button
                                key={item}
                                onClick={() => setAdminPage(item as number)}
                                className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                                  adminPage === item
                                    ? 'bg-zinc-900 text-white'
                                    : 'hover:bg-zinc-100 text-zinc-500'
                                }`}
                              >
                                {(item as number) + 1}
                              </button>
                            )
                          )}
                        <button
                          onClick={() => setAdminPage(p => Math.min(totalAdminPages - 1, p + 1))}
                          disabled={adminPage >= totalAdminPages - 1}
                          className="p-1.5 rounded-lg hover:bg-zinc-100 transition-colors disabled:opacity-30 text-zinc-500"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : null}
        </main>
      </div>
    </div>
  )
}
