import { cockpit } from './cockpit'

export type Project = {
  _id?: string
  title: string
  slug: string
  summary?: string
  content?: string // HTML or Markdown rendered to HTML on server side
  date?: string
  tags?: string[]
  cover?: { path: string; type?: 'image' | 'video' }
  gallery?: { path: string; type?: 'image' | 'video' }[]
  links?: {
    website?: string
    github?: string
    playstore?: string
    appstore?: string
    article?: string
  }
}

// Fetch project by slug from Cockpit collection 'projects'
export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const res = await cockpit.collection('projects', {
    filter: { slug },
    limit: 1,
    populate: 1,
  }) as { entries?: any[] }

  const entry = res?.entries?.[0]
  if (!entry) return null

  // best-effort normalization
  const project: Project = {
    _id: entry._id,
    title: entry.title ?? slug,
    slug: entry.slug ?? slug,
    summary: entry.summary ?? entry.subtitle ?? '',
    content: entry.content ?? entry.body ?? entry.html ?? '',
    date: entry.date ?? entry.publishedAt ?? entry.created ?? undefined,
    tags: entry.tags ?? [],
    cover: entry.cover ?? entry.hero ?? undefined,
    gallery: entry.gallery ?? entry.images ?? [],
    links: entry.links ?? {
      website: entry.website,
      github: entry.github,
      playstore: entry.playstore,
      appstore: entry.appstore,
      article: entry.article,
    },
  }

  return project
}

export async function getAllProjectSlugs(limit = 100): Promise<string[]> {
  const res = await cockpit.collection('projects', {
    sort: { date: -1 },
    limit,
    populate: 0,
  }) as { entries?: any[] }
  return (res?.entries ?? [])
    .map(e => e.slug)
    .filter(Boolean)
}

export function assetUrlFrom(path?: string) {
  if (!path) return null
  try {
    return cockpit.assetUrl(path)
  } catch {
    return path
  }
}
