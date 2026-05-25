-- Makaldar (Proverbs)
CREATE TABLE IF NOT EXISTS makaldar (
  id BIGSERIAL PRIMARY KEY,
  text_kg TEXT NOT NULL,
  text_ru TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lakaptar (Sayings)
CREATE TABLE IF NOT EXISTS lakaptar (
  id BIGSERIAL PRIMARY KEY,
  text_kg TEXT NOT NULL,
  text_ru TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabyshmaktar (Riddles)
CREATE TABLE IF NOT EXISTS tabyshmaktar (
  id BIGSERIAL PRIMARY KEY,
  question_kg TEXT NOT NULL,
  answer_kg TEXT NOT NULL,
  answer_ru TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Yrlar (Songs)
CREATE TABLE IF NOT EXISTS yrlar (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  lyrics_kg TEXT NOT NULL,
  translation_ru TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Akya (Folk Tales)
CREATE TABLE IF NOT EXISTS akya (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content_kg TEXT NOT NULL,
  summary_ru TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sozduk (Dictionary)
CREATE TABLE IF NOT EXISTS sozduk (
  id BIGSERIAL PRIMARY KEY,
  word_kg TEXT NOT NULL,
  word_ru TEXT NOT NULL,
  example_kg TEXT,
  example_ru TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Word of Day
CREATE TABLE IF NOT EXISTS word_of_day (
  id BIGSERIAL PRIMARY KEY,
  sozduk_id BIGINT REFERENCES sozduk(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date)
);

-- Enable Row Level Security (read-only public access)
ALTER TABLE makaldar ENABLE ROW LEVEL SECURITY;
ALTER TABLE lakaptar ENABLE ROW LEVEL SECURITY;
ALTER TABLE tabyshmaktar ENABLE ROW LEVEL SECURITY;
ALTER TABLE yrlar ENABLE ROW LEVEL SECURITY;
ALTER TABLE akya ENABLE ROW LEVEL SECURITY;
ALTER TABLE sozduk ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_of_day ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON makaldar FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON lakaptar FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON tabyshmaktar FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON yrlar FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON akya FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON sozduk FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON word_of_day FOR SELECT USING (true);
