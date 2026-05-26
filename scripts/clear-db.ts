/**
 * Deletes all rows from every content table in the remote Supabase database.
 * Usage: npx tsx scripts/clear-db.ts
 */

import { readFileSync } from 'fs'

try {
  const env = readFileSync('.env.local', 'utf-8')
  for (const line of env.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (m) process.env[m[1]] = m[2].trim()
  }
} catch { /* rely on existing env */ }

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!URL || !KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const TABLES = ['sozduk', 'akya', 'makaldar', 'lakaptar', 'tabyshmaktar', 'yrlar']

async function clearTable(table: string) {
  const res = await fetch(`${URL}/rest/v1/${table}?id=gte.0`, {
    method: 'DELETE',
    headers: {
      'apikey': KEY,
      'Authorization': `Bearer ${KEY}`,
    },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`HTTP ${res.status}: ${body}`)
  }
}

async function main() {
  for (const table of TABLES) {
    try {
      await clearTable(table)
      console.log(`✓ ${table} cleared`)
    } catch (e) {
      console.error(`✗ ${table}: ${e}`)
    }
  }
  console.log('Done.')
}

main().catch(console.error)
