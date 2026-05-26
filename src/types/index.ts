export interface Makal {
  id: number
  text_kg: string
  text_ru: string
  text_en: string | null
  category: string | null
  created_at: string
}

export interface Lakap {
  id: number
  text_kg: string
  text_ru: string
  text_en: string | null
  category: string | null
  created_at: string
}

export interface Tabyshmak {
  id: number
  question_kg: string
  answer_kg: string
  answer_ru: string
  answer_en: string | null
  category: string | null
  created_at: string
}

export interface Yr {
  id: number
  title: string
  lyrics_kg: string
  translation_ru: string | null
  translation_en: string | null
  created_at: string
}

export interface Akya {
  id: number
  title: string
  content_kg: string
  summary_ru: string | null
  summary_en: string | null
  created_at: string
}

export interface SozdukEntry {
  id: number
  word_kg: string
  word_ru: string | null
  word_en: string | null
  example_kg: string | null
  example_ru: string | null
  example_en: string | null
  category: string | null
  created_at: string
}

export interface WordOfDay {
  id: number
  sozduk_id: number
  date: string
  created_at: string
  sozduk?: SozdukEntry
}
