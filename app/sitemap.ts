import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://manuelselch.de'
  const routes = ['', '/#projects', '/#about', '/#contact']
  const now = new Date()
  return routes.map((p) => ({ url: `${base}${p}`, lastModified: now }))
}
