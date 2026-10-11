// Public, read-only Cockpit content client. No API key is required or sent.
const COCKPIT_URL =
  process.env.COCKPIT_URL || process.env.NEXT_PUBLIC_COCKPIT_URL || 'http://localhost:8080'

export interface CockpitRequestOptions {
  filter?: Record<string, unknown>
  sort?: Record<string, number>
  limit?: number
  skip?: number
  populate?: number
}

export class CockpitClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
  }

  async collection(name: string, options: CockpitRequestOptions = {}): Promise<unknown> {
    const url = new URL(`${this.baseUrl}/api/content/items/${encodeURIComponent(name)}`)
    for (const [key, value] of Object.entries(options)) {
      if (value !== undefined) {
        url.searchParams.set(key, typeof value === 'object' ? JSON.stringify(value) : String(value))
      }
    }
    const response = await fetch(url.toString(), {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(8000),
    })
    if (!response.ok) throw new Error(`Cockpit API error: ${response.status}`)
    return response.json()
  }

  assetUrl(path: string): string | null {
    if (/^https?:\/\//i.test(path)) return path
    if (/^[a-z][a-z\d+.-]*:/i.test(path) || path.startsWith('//')) return null
    const relative = path.replace(/^\/+/, '')
    if (relative.split('/').includes('..')) return null
    const storagePath = relative.startsWith('storage/uploads/')
      ? relative
      : `storage/uploads/${relative}`
    return `${this.baseUrl}/${storagePath}`
  }
}

export const cockpit = new CockpitClient(COCKPIT_URL)
