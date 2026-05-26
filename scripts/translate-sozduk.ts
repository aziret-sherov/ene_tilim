/**
 * Translates sozduk entries missing word_ru and/or word_en using Claude API.
 * Runs in batches of 40 words. Safe to re-run — skips already-translated entries.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-... npx tsx scripts/translate-sozduk.ts
 *
 * Or add ANTHROPIC_API_KEY to .env.local and run:
 *   npx tsx scripts/translate-sozduk.ts
 */

import { readFileSync } from 'fs'
import Anthropic from '@anthropic-ai/sdk'

// Load .env.local
try {
  const env = readFileSync('.env.local', 'utf-8')
  for (const line of env.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (m) process.env[m[1]] = m[2].trim()
  }
} catch { /* no .env.local */ }

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY!

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}
if (!ANTHROPIC_KEY) {
  console.error('Missing ANTHROPIC_API_KEY — set it in .env.local or as an env var')
  process.exit(1)
}

const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY })

const BATCH_SIZE = 40

type Row = { id: number; word_kg: string; word_ru: string | null; word_en: string | null }

async function fetchMissing(): Promise<Row[]> {
  const url = `${SUPABASE_URL}/rest/v1/sozduk?select=id,word_kg,word_ru,word_en&or=(word_ru.is.null,word_en.is.null)&order=word_kg&limit=5000`
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  })
  return res.json()
}

async function translateBatch(words: string[]): Promise<{ ru: string; en: string }[]> {
  const list = words.map((w, i) => `${i + 1}. ${w}`).join('\n')

  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Translate these Kyrgyz words. Reply ONLY with a JSON array — one object per word in the same order — with keys "ru" (Russian translation, 1-3 words) and "en" (English translation, 1-3 words). No extra text.

${list}`,
      },
    ],
  })

  const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
  const match = text.match(/\[[\s\S]*\]/)
  if (!match) throw new Error(`Unexpected response: ${text.slice(0, 200)}`)
  return JSON.parse(match[0])
}

async function upsertBatch(rows: { id: number; word_ru?: string; word_en?: string }[]) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/sozduk`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify(rows),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Upsert failed: ${err}`)
  }
}

async function main() {
  console.log('Fetching untranslated entries...')
  const rows = await fetchMissing()
  console.log(`Found ${rows.length} entries missing at least one translation`)

  let done = 0
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE)
    const words = batch.map(r => r.word_kg)

    let translations: { ru: string; en: string }[]
    try {
      translations = await translateBatch(words)
    } catch (e) {
      console.error(`Batch ${i}–${i + BATCH_SIZE} failed:`, e)
      continue
    }

    const upserts = batch.map((row, idx) => {
      const t = translations[idx]
      const update: { id: number; word_ru?: string; word_en?: string } = { id: row.id }
      if (!row.word_ru && t?.ru) update.word_ru = t.ru
      if (!row.word_en && t?.en) update.word_en = t.en
      return update
    })

    await upsertBatch(upserts)
    done += batch.length
    console.log(`${done} / ${rows.length}`)
  }

  console.log('Done.')
}

main().catch(e => { console.error(e); process.exit(1) })
