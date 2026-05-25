'use server'

import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { createAdminClient } from '@/lib/supabase/admin'
import { signSession, verifySession, type SessionPayload } from '@/lib/session'

// ── Auth ──────────────────────────────────────────────

export async function login(email: string, password: string) {
  const supabase = createAdminClient()
  const { data: user } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .single()

  if (!user) return { error: 'Неверный email или пароль' }

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) return { error: 'Неверный email или пароль' }

  const token = await signSession({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  })

  const jar = await cookies()
  jar.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
    sameSite: 'lax',
  })

  return { success: true }
}

export async function logout() {
  const jar = await cookies()
  jar.delete('admin_token')
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies()
  const token = jar.get('admin_token')?.value
  if (!token) return null
  return verifySession(token)
}

// ── Content CRUD ──────────────────────────────────────

async function requireSession() {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')
  return session
}

export async function getEntries(table: string) {
  await requireSession()
  const supabase = createAdminClient()
  const { data } = await supabase
    .from(table)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)
  return data ?? []
}

export async function addEntry(table: string, data: Record<string, string>) {
  await requireSession()
  const supabase = createAdminClient()
  const cleaned = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v.trim() !== '')
  )
  const { error } = await supabase.from(table).insert(cleaned)
  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteEntry(table: string, id: number | string) {
  await requireSession()
  const supabase = createAdminClient()
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) return { error: error.message }
  return { success: true }
}

// ── User management (admin only) ──────────────────────

export async function getAdminUsers() {
  const session = await requireSession()
  if (session.role !== 'admin') throw new Error('Forbidden')
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('admin_users')
    .select('id, email, role, name, created_at')
    .order('created_at', { ascending: true })
  return data ?? []
}

export async function createAdminUser(
  email: string,
  password: string,
  role: 'admin' | 'moderator',
  name: string
) {
  const session = await requireSession()
  if (session.role !== 'admin') return { error: 'Нет доступа' }

  const supabase = createAdminClient()
  const password_hash = await bcrypt.hash(password, 12)
  const { error } = await supabase
    .from('admin_users')
    .insert({ email: email.toLowerCase().trim(), password_hash, role, name })
  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteAdminUser(id: string) {
  const session = await requireSession()
  if (session.role !== 'admin') return { error: 'Нет доступа' }
  if (session.id === id) return { error: 'Нельзя удалить себя' }

  const supabase = createAdminClient()
  const { error } = await supabase.from('admin_users').delete().eq('id', id)
  if (error) return { error: error.message }
  return { success: true }
}
