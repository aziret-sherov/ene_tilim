import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const [,, email, password, name = 'Admin'] = process.argv
if (!email || !password) {
  console.error('Usage: node scripts/create-admin.mjs <email> <password> [name]')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const password_hash = await bcrypt.hash(password, 12)
const { error } = await supabase
  .from('admin_users')
  .insert({ email: email.toLowerCase(), password_hash, role: 'admin', name })

if (error) {
  console.error('Error:', error.message)
} else {
  console.log(`✓ Admin created: ${email}`)
}
