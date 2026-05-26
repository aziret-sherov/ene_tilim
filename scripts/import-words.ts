/**
 * Imports words from scripts/words.json into the remote Supabase sozduk table.
 * Usage: npx tsx scripts/import-words.ts
 */

import { readFileSync } from 'fs'

// Load .env.local manually (no dotenv dependency needed)
try {
  const env = readFileSync('.env.local', 'utf-8')
  for (const line of env.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (m) process.env[m[1]] = m[2].trim()
  }
} catch { /* .env.local missing — rely on existing env */ }

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

interface WordEntry {
  word_kg: string
  word_ru: string
  example_kg: string | null
  example_ru: string | null
}

const BATCH_SIZE = 100

async function insertBatch(rows: WordEntry[]): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/sozduk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Prefer': 'resolution=ignore-duplicates',
    },
    body: JSON.stringify(rows),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`HTTP ${res.status}: ${body}`)
  }
}

async function main() {
  const raw = readFileSync('scripts/words.json', 'utf-8')
  const words: WordEntry[] = JSON.parse(raw)
  console.log(`Loaded ${words.length} words from scripts/words.json`)

  let inserted = 0
  for (let i = 0; i < words.length; i += BATCH_SIZE) {
    const batch = words.slice(i, i + BATCH_SIZE)
    await insertBatch(batch)
    inserted += batch.length
    process.stdout.write(`\r  Inserted ${inserted}/${words.length}...`)
  }

  console.log(`\nDone. ${inserted} words inserted into sozduk.`)
}

main().catch(console.error)
