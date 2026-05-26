-- Add English translation columns and make word_ru optional
-- (sozduk now supports KG ↔ EN ↔ RU)
ALTER TABLE sozduk ADD COLUMN IF NOT EXISTS word_en TEXT;
ALTER TABLE sozduk ADD COLUMN IF NOT EXISTS example_en TEXT;
ALTER TABLE sozduk ALTER COLUMN word_ru DROP NOT NULL;
