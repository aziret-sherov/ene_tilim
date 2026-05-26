import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://ene-tilim.online'
  const now = new Date()

  const supabase = await createClient()

  const [makaldar, lakaptar, tabyshmaktar, yrlar, jomoktor, sozduk] = await Promise.all([
    supabase.from('makaldar').select('id,created_at'),
    supabase.from('lakaptar').select('id,created_at'),
    supabase.from('tabyshmaktar').select('id,created_at'),
    supabase.from('yrlar').select('id,created_at'),
    supabase.from('akya').select('id,created_at'),
    supabase.from('sozduk').select('word_kg,created_at'),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base,                      lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${base}/makaldar`,        lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${base}/lakaptar`,        lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${base}/tabyshkaktar`,    lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${base}/yrlar`,           lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${base}/jomoktor`,        lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${base}/sozduk`,          lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
  ]

  const makalRoutes: MetadataRoute.Sitemap = (makaldar.data || []).map((m) => ({
    url: `${base}/makaldar/${m.id}`,
    lastModified: new Date(m.created_at),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  const lakapRoutes: MetadataRoute.Sitemap = (lakaptar.data || []).map((l) => ({
    url: `${base}/lakaptar/${l.id}`,
    lastModified: new Date(l.created_at),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  const tabyshmakRoutes: MetadataRoute.Sitemap = (tabyshmaktar.data || []).map((t) => ({
    url: `${base}/tabyshkaktar/${t.id}`,
    lastModified: new Date(t.created_at),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  const yrRoutes: MetadataRoute.Sitemap = (yrlar.data || []).map((y) => ({
    url: `${base}/yrlar/${y.id}`,
    lastModified: new Date(y.created_at),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  const jomoktorRoutes: MetadataRoute.Sitemap = (jomoktor.data || []).map((a) => ({
    url: `${base}/jomoktor/${a.id}`,
    lastModified: new Date(a.created_at),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  const sozdukRoutes: MetadataRoute.Sitemap = (sozduk.data || []).map((w) => ({
    url: `${base}/sozduk/${encodeURIComponent(w.word_kg)}`,
    lastModified: new Date(w.created_at),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [
    ...staticRoutes,
    ...makalRoutes,
    ...lakapRoutes,
    ...tabyshmakRoutes,
    ...yrRoutes,
    ...jomoktorRoutes,
    ...sozdukRoutes,
  ]
}
