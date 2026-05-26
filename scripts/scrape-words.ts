/**
 * Scrapes Kyrgyz–Russian word entries from tamgasoft.kg/dict
 * Output: scripts/words.json
 *
 * Usage: npx tsx scripts/scrape-words.ts
 */

import { writeFileSync } from 'fs'

const BASE = 'https://tamgasoft.kg/dict/index.php'
const DELAY_MS = 400

interface WordEntry {
  word_kg: string
  word_ru: string
  example_kg: string | null
  example_ru: string | null
}

const KG_ALPHABET = [
  'а','б','в','г','д','е','ж','з','и','й',
  'к','л','м','н','ң','о','ө','п','р','с',
  'т','у','ү','ф','х','ч','ш','э','ю','я',
]

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

async function get(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (research/educational use)' },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`)
  return res.text()
}

/** Extract word links from the autocomplete/list sidebar */
function parseWordList(html: string): string[] {
  const words = new Set<string>()
  // Links look like: href="...word=апа..."  or word=%D0%B0%D0%BF%D0%B0
  const re = /[?&]word=([^"&\s]+)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) {
    const decoded = decodeURIComponent(m[1]).toLowerCase().trim()
    // Keep only Kyrgyz words (Cyrillic, 2+ chars, no spaces)
    if (decoded.length >= 2 && /^[а-яёөүң-]+$/i.test(decoded)) {
      words.add(decoded)
    }
  }
  return [...words]
}

/** Extract translation from the <meta name="description"> tag.
 *  Formats seen on tamgasoft.kg:
 *   "WORD - [WORD I] 1. TRANSLATION;"          (numbered polysemic)
 *   "WORD - [WORD I] ар. TRANSLATION;"          (etymology prefix)
 *   "WORD - TRANSLATION; example ..."           (simple one-sense)
 *  The definition content is rendered by JS; the meta tag is server-rendered. */
function parseDefinition(html: string, word: string): WordEntry | null {
  const metaMatch = html.match(/<meta name="description" content="([^"]+)"/)
  if (!metaMatch) return null

  const desc = metaMatch[1]

  // Generic pages have no translation (e.g. "Быстрый перевод слова...")
  if (!desc.toLowerCase().startsWith(word)) return null

  // Remove "WORD - " prefix
  const dashIdx = desc.indexOf(' - ')
  if (dashIdx === -1) return null
  let rest = desc.slice(dashIdx + 3).trim()

  // Take only up to first semicolon
  rest = rest.split(';')[0].trim()

  // Case 1: numbered definition "... 1. TRANSLATION"
  const numMatch = rest.match(/\b1\.\s+(.+)/)
  if (numMatch) {
    rest = numMatch[1].trim()
  } else {
    // Case 2: strip repeated word form at start (e.g. "адам I ар. (note) translation")
    rest = rest.replace(new RegExp(`^${word}\\s+`, 'i'), '') // remove word re-mention
    rest = rest.replace(/^[IVX]+\s+/i, '')                   // remove roman numeral
    rest = rest.replace(/^[а-яёa-z]{2,5}\.\s+/i, '')         // remove etymology (ар. ир. etc.)
  }

  // Strip leading parenthetical context: (ср. ...) or (о масти лошади)
  rest = rest.replace(/^\([^)]{0,80}\)\s*/, '')

  let word_ru = rest.trim()
  if (!word_ru || word_ru.length < 2 || word_ru.length > 180) return null

  // If translation contains Kyrgyz-specific chars it's a KG translation, not RU — skip
  if (/[ңөүқ]/.test(word_ru)) return null

  // Skip generic page descriptions that leaked in
  if (word_ru.includes('Быстрый перевод')) return null

  // Trim trailing generic text if present (e.g. "то же, что аалым. Быстрый перевод...")
  const genericIdx = word_ru.indexOf('Быстрый')
  if (genericIdx !== -1) word_ru = word_ru.slice(0, genericIdx).replace(/\.\s*$/, '').trim()

  // Skip pure cross-references ("то же, что X")
  if (/^то же, что/i.test(word_ru)) return null

  // Skip word stems (word_kg ends with "-")
  if (word.endsWith('-')) return null

  if (!word_ru || word_ru.length < 2) return null

  return {
    word_kg: word,
    word_ru,
    example_kg: null,
    example_ru: null,
  }
}

async function scrapeWordsForLetter(letter: string): Promise<string[]> {
  const url = `${BASE}?lfrom=kg&lto=ru&lang=ru&word=${encodeURIComponent(letter)}`
  const html = await get(url)
  return parseWordList(html)
}

async function scrapeWordDefinition(word: string): Promise<WordEntry | null> {
  const url = `${BASE}?lfrom=kg&lto=ru&lang=ru&word=${encodeURIComponent(word)}`
  const html = await get(url)
  return parseDefinition(html, word)
}

async function main() {
  const allWords = new Set<string>()
  const results: WordEntry[] = []

  console.log('Step 1: Collecting word list per letter...')
  for (const letter of KG_ALPHABET) {
    try {
      const words = await scrapeWordsForLetter(letter)
      words.forEach(w => allWords.add(w))
      console.log(`  ${letter} → ${words.length} words`)
    } catch (e) {
      console.warn(`  ${letter} → ERROR: ${e}`)
    }
    await sleep(DELAY_MS)
  }

  const wordList = [...allWords]
  console.log(`\nTotal unique words collected: ${wordList.length}`)

  console.log('\nStep 2: Fetching definitions...')
  let done = 0
  for (const word of wordList) {
    try {
      const entry = await scrapeWordDefinition(word)
      if (entry) {
        results.push(entry)
        process.stdout.write(`\r  ${++done}/${wordList.length} — ${word}          `)
      }
    } catch (e) {
      console.warn(`\n  SKIP ${word}: ${e}`)
    }
    await sleep(DELAY_MS)
  }

  console.log(`\n\nDone. ${results.length} entries saved.`)
  writeFileSync('scripts/words.json', JSON.stringify(results, null, 2))
  console.log('Output: scripts/words.json')
}

main().catch(console.error)
