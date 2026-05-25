import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://ene-tilim.online'
  const now = new Date()

  return [
    { url: base,                      lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${base}/makaldar`,        lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${base}/lakaptar`,        lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${base}/tabyshkaktar`,    lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${base}/yrlar`,           lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${base}/jomoktor`,        lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${base}/sozduk`,          lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
  ]
}
