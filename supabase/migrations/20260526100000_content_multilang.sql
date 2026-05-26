-- Add English translation columns to all content tables
ALTER TABLE makaldar      ADD COLUMN IF NOT EXISTS text_en TEXT;
ALTER TABLE lakaptar      ADD COLUMN IF NOT EXISTS text_en TEXT;
ALTER TABLE tabyshmaktar  ADD COLUMN IF NOT EXISTS answer_en TEXT;
ALTER TABLE yrlar         ADD COLUMN IF NOT EXISTS translation_en TEXT;
ALTER TABLE akya          ADD COLUMN IF NOT EXISTS summary_en TEXT;
