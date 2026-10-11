import { cockpit } from './cockpit.ts'
import type { CockpitRequestOptions } from './cockpit.ts'

export type ProjectAsset = {
  path: string
  alt?: string
  caption?: string
  type?: 'image' | 'video'
}
export type ProjectLinks = Partial<
  Record<'website' | 'github' | 'playstore' | 'appstore' | 'article', string>
>
export type Project = {
  _id?: string
  title: string
  slug: string
  summary: string
  content: string // Trusted HTML authored by the portfolio owner in Cockpit.
  date?: string
  tags: string[]
  cover?: ProjectAsset
  gallery: ProjectAsset[]
  links: ProjectLinks
  featured: boolean
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}
function text(value: unknown): string {
  return typeof value === 'string' ? value : ''
}
function asset(value: unknown): ProjectAsset | undefined {
  const item = record(value)
  const path = text(item.path)
  if (!path || !assetUrlFrom(path)) return undefined
  return {
    path,
    alt: text(item.alt ?? item.altText),
    caption: text(item.caption ?? item.description),
    type: item.type === 'video' ? 'video' : 'image',
  }
}
function normalize(value: unknown): Project | null {
  const item = record(value)
  const slug = text(item.slug)
  const title = text(item.title).trim()
  if (item._state !== 1 || !title || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null
  const sourceLinks = { ...item, ...record(item.links) }
  const links: ProjectLinks = {}
  for (const key of ['website', 'github', 'playstore', 'appstore', 'article'] as const) {
    const url = text(sourceLinks[key])
    try {
      if (['http:', 'https:'].includes(new URL(url).protocol)) links[key] = url
    } catch {
      /* Omit missing or unsafe external links. */
    }
  }
  const gallery = item.gallery ?? item.images
  return {
    _id: text(item._id) || undefined,
    slug,
    title,
    summary: text(item.summary ?? item.subtitle),
    content: text(item.content ?? item.body ?? item.html),
    date: text(item.date ?? item.publishedAt) || undefined,
    tags: Array.isArray(item.tags)
      ? item.tags.filter((tag): tag is string => typeof tag === 'string')
      : [],
    cover: asset(item.cover ?? item.hero),
    gallery: Array.isArray(gallery)
      ? gallery.map(asset).filter((image): image is ProjectAsset => !!image)
      : [],
    links,
    featured: item.featured === true,
  }
}

async function fetchProjects(options: CockpitRequestOptions): Promise<Project[]> {
  const response = await cockpit.collection('projects', options)
  const entries = Array.isArray(response) ? response : record(response).entries
  if (!Array.isArray(entries)) throw new Error('Unexpected Cockpit projects response')
  const seen = new Set<string>()
  return entries.map(normalize).filter((project): project is Project => {
    if (!project || seen.has(project.slug)) return false
    seen.add(project.slug)
    return true
  })
}

export function getProjects(limit = 100): Promise<Project[]> {
  return fetchProjects({ filter: { _state: 1 }, sort: { date: -1 }, limit, populate: 1 })
}

export async function getFeaturedProjects(limit = 3): Promise<Project[]> {
  return (await getProjects()).filter(project => project.featured).slice(0, limit)
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null
  const projects = await fetchProjects({ filter: { slug, _state: 1 }, limit: 1, populate: 1 })
  return projects.find(project => project.slug === slug) ?? null
}

export async function getAllProjectSlugs(limit = 100): Promise<string[]> {
  return (await getProjects(limit)).map(project => project.slug)
}

export function assetUrlFrom(path?: string): string | null {
  return path ? cockpit.assetUrl(path) : null
}
