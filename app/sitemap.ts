import type { MetadataRoute } from 'next'
import { getAllProjectSlugs } from '@/lib/projects'

export const revalidate = 60

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://manuelselch.de'
  const routes = ['', '/projects']
  try {
    routes.push(...(await getAllProjectSlugs()).map(slug => `/projects/${slug}`))
  } catch {
    // Keep the core routes available while Cockpit is unavailable.
  }
  return routes.map(path => ({ url: `${base}${path}` }))
}
