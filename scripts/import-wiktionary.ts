/**
 * Imports Kyrgyz words from kaikki.org Wiktionary JSONL into sozduk table.
 *
 * Download the data first:
 *   curl -L "https://kaikki.org/dictionary/Kyrgyz/kaikki.org-dictionary-Kyrgyz.jsonl" -o /tmp/kyrgyz_wikt.jsonl
 *
 * Then run:
 *   npx tsx scripts/import-wiktionary.ts
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
const INPUT_FILE = process.argv[2] || '/tmp/kyrgyz_wikt.jsonl'
const BATCH_SIZE = 100

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Parts of speech to include
const VALID_POS = new Set(['noun', 'verb', 'adjective', 'adverb', 'numeral', 'pronoun'])

// Gloss patterns to skip (not real translations)
const SKIP_PATTERNS = [
  /^The .*(letter|script|alphabet)/i,        // alphabet entries
  /^Alternative (form|spelling)/i,           // cross-refs
  /^Romanization of/i,
  /^\d+$/,                                   // numbers only
  /\b(singular|plural|dative|locative|ablative|accusative|genitive|nominative|instrumental|prepositional)\s+(of|form)\b/i,  // inflected forms
  /\bform of\b/i,                            // "form of X"
  /\bcase of\b/i,
]

interface WiktEntry {
  word: string
  pos: string
  senses: Array<{
    glosses?: string[]
    examples?: Array<{ text?: string; translation?: string }>
    tags?: string[]
  }>
}

interface SozdukRow {
  word_kg: string
  word_en: string
  example_kg: string | null
  example_en: string | null
}

function parseEntry(entry: WiktEntry): SozdukRow | null {
  const word = entry.word?.trim()
  if (!word || word.length < 2) return null

  // Only Cyrillic Kyrgyz words
  if (!/^[а-яёөүңА-ЯЁӨҮҢ\s-]+$/u.test(word)) return null

  if (!VALID_POS.has(entry.pos)) return null

  const senses = entry.senses || []
  let word_en: string | null = null
  let example_kg: string | null = null
  let example_en: string | null = null

  for (const sense of senses) {
    // Skip senses tagged as archaic, obsolete, rare
    const tags = sense.tags || []
    if (tags.some(t => ['archaic', 'obsolete', 'rare', 'dialectal'].includes(t))) continue

    const glosses = sense.glosses || []
    for (const gloss of glosses) {
      const g = gloss.trim()
      if (!g || g.length > 120) continue
      if (SKIP_PATTERNS.some(p => p.test(g))) continue
      // Prefer short clean glosses (single word or short phrase)
      word_en = g
      break
    }

    // Try to grab a usage example
    if (!example_kg && sense.examples) {
      for (const ex of sense.examples) {
        if (ex.text && ex.text.length < 150) {
          example_kg = ex.text.trim()
          example_en = ex.translation?.trim() || null
          break
        }
      }
    }

    if (word_en) break
  }

  if (!word_en) return null

  return { word_kg: word, word_en, example_kg: example_kg || null, example_en: example_en || null }
}

async function insertBatch(rows: SozdukRow[]): Promise<number> {
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
  return rows.length
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
      const entry: WiktEntry = JSON.parse(line)
      const row = parseEntry(entry)
      if (!row || seen.has(row.word_kg)) { skipped++; continue }
      seen.add(row.word_kg)
      batch.push(row)
      parsed++

      if (batch.length >= BATCH_SIZE) {
        inserted += await insertBatch([...batch])
        batch.length = 0
        process.stdout.write(`\r  Inserted ${inserted} words...`)
      }
    } catch { skipped++ }
  }

  if (batch.length > 0) {
    inserted += await insertBatch(batch)
  }

  console.log(`\n\nDone.`)
  console.log(`  Parsed:   ${parsed}`)
  console.log(`  Skipped:  ${skipped}`)
  console.log(`  Inserted: ${inserted}`)
}

main().catch(console.error)
