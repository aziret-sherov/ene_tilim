/**
 * Imports Kyrgyz→Russian translations from Russian Wiktionary (kaikki.org) into sozduk.word_ru.
 * Merges with existing rows — word_en is preserved.
 *
 * Download first:
 *   curl -L "https://kaikki.org/ruwiktionary/Киргизский/kaikki.org-dictionary-Киргизский.jsonl" \
 *     -o /tmp/kyrgyz_ruwikt.jsonl
 *
 * Then run:
 *   npx tsx scripts/import-ruwiktionary.ts
 */

import { readFileSync, createReadStream } from 'fs'
import { createInterface } from 'readline'

try {
  const env = readFileSync('.env.local', 'utf-8')
  for (const line of env.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (m) process.env[m[1]] = m[2].trim()
  }
} catch { /* rely on existing env */ }

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const INPUT_FILE = process.argv[2] || '/tmp/kyrgyz_ruwikt.jsonl'
const BATCH_SIZE = 100

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const VALID_POS = new Set(['noun', 'verb', 'adj', 'adv', 'num', 'pron'])

// Patterns to skip entire entries
const KYRILLIC_KG = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюяөүңАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯӨҮҢ'
const SKIP_WORD_PATTERNS = [
  (w: string) => !KYRILLIC_KG.includes(w[0]),  // must start with Kyrgyz Cyrillic
  (w: string) => /\s/.test(w),                  // no multi-word phrases
  (w: string) => w.startsWith('-'),             // no suffixes/prefixes
]

// Clean up Russian gloss text
function cleanGloss(g: string): string | null {
  // Remove "(аналогично русскому слову)" — the translation is the word itself (loanword)
  g = g.replace(/\s*\(аналогично русскому слову\)/g, '').trim()
  // Remove domain labels at start: "лингв.", "муз.", "шахм.", etc.
  g = g.replace(/^[а-яё]{2,6}\.\s*/, '').trim()
  if (!g || g.length < 2 || g.length > 120) return null
  // Skip proper names
  if (/\(имя\)|\(название\)|\(топоним\)/i.test(g)) return null
  return g
}

interface SozdukRow {
  word_kg: string
  word_ru: string
  example_kg: string | null
  example_ru: string | null
}

async function insertBatch(rows: SozdukRow[]): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/sozduk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Prefer': 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(rows),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`HTTP ${res.status}: ${body}`)
  }
}

async function main() {
  console.log(`Reading: ${INPUT_FILE}`)

  const rl = createInterface({ input: createReadStream(INPUT_FILE), crlfDelay: Infinity })

  const batch: SozdukRow[] = []
  let parsed = 0
  let skipped = 0
  let inserted = 0
  const seen = new Set<string>()

  for await (const line of rl) {
    if (!line.trim()) continue
    try {
      const entry = JSON.parse(line)

      const word = entry.word?.trim()
      if (!word || word.length < 2) { skipped++; continue }
      if (SKIP_WORD_PATTERNS.some(fn => fn(word))) { skipped++; continue }
      if (!VALID_POS.has(entry.pos)) { skipped++; continue }
      if (seen.has(word)) { skipped++; continue }

      const senses = entry.senses || []
      let word_ru: string | null = null
      let example_kg: string | null = null
      let example_ru: string | null = null

      for (const sense of senses) {
        const tags = sense.tags || []
        if (tags.some((t: string) => ['archaic', 'obsolete', 'rare', 'dialectal'].includes(t))) continue

        for (const gloss of (sense.glosses || [])) {
          const cleaned = cleanGloss(gloss)
          if (cleaned) { word_ru = cleaned; break }
        }

        if (!example_kg && sense.examples) {
          for (const ex of sense.examples) {
            if (ex.text && ex.text.length < 150) {
              example_kg = ex.text.trim()
              example_ru = ex.translation?.trim() || null
              break
            }
          }
        }

        if (word_ru) break
      }

      if (!word_ru) { skipped++; continue }

      seen.add(word)
      batch.push({ word_kg: word, word_ru, example_kg: example_kg ?? null, example_ru: example_ru ?? null })
      parsed++

      if (batch.length >= BATCH_SIZE) {
        await insertBatch([...batch])
        inserted += batch.length
        batch.length = 0
        process.stdout.write(`\r  Merged ${inserted} words...`)
      }
    } catch { skipped++ }
  }

  if (batch.length > 0) {
    await insertBatch(batch)
    inserted += batch.length
  }

  console.log(`\n\nDone.`)
  console.log(`  Parsed:   ${parsed}`)
  console.log(`  Skipped:  ${skipped}`)
  console.log(`  Merged:   ${inserted}`)
}

main().catch(console.error)
