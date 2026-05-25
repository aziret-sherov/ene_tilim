CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'moderator')) NOT NULL DEFAULT 'moderator',
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Only accessible via service role key (no public RLS)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
