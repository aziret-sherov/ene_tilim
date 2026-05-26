-- Add English translation columns and make word_ru optional
-- (sozduk now supports KG ↔ EN ↔ RU, one row per Kyrgyz word)
ALTER TABLE sozduk ADD COLUMN IF NOT EXISTS word_en TEXT;
ALTER TABLE sozduk ADD COLUMN IF NOT EXISTS example_en TEXT;
ALTER TABLE sozduk ALTER COLUMN word_ru DROP NOT NULL;
ALTER TABLE sozduk ADD CONSTRAINT sozduk_word_kg_unique UNIQUE (word_kg);
