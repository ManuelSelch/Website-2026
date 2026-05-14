// Cockpit CMS Client Utility

const COCKPIT_URL = process.env.NEXT_PUBLIC_COCKPIT_URL || 'http://localhost:8080';
const COCKPIT_API_KEY = process.env.NEXT_PUBLIC_COCKPIT_API_KEY || '';

interface CockpitRequestOptions {
    filter?: Record<string, any>;
    sort?: Record<string, number>;
    limit?: number;
    skip?: number;
    populate?: number;
}

class CockpitClient {
    private baseUrl: string;
    private apiKey: string;

    constructor(baseUrl: string, apiKey: string) {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
    }

    private async request(endpoint: string, options: CockpitRequestOptions = {}) {
        const url = new URL(`${this.baseUrl}${endpoint}`);

        // Add filter if provided
        if (options.filter) {
            url.searchParams.append('filter', JSON.stringify(options.filter));
        }

        // Add sort if provided
        if (options.sort) {
            url.searchParams.append('sort', JSON.stringify(options.sort));
        }

        // Add limit if provided
        if (options.limit) {
            url.searchParams.append('limit', options.limit.toString());
        }

        // Add skip if provided
        if (options.skip) {
            url.searchParams.append('skip', options.skip.toString());
        }

        // Add populate if provided
        if (options.populate !== undefined) {
            url.searchParams.append('populate', options.populate.toString());
        }

        try {
            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': this.apiKey,
                },
                next: {
                    revalidate: 1, // Revalidate every 60 seconds
                },
            });

            if (!response.ok) {
                throw new Error(`Cockpit API error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Cockpit API request failed:', error);
            throw error;
        }
    }

    // Get collection entries
    async collection(name: string, options?: CockpitRequestOptions) {
        return this.request(`/api/content/items/${name}`, options);
    }

    // Get single collection entry
    async collectionEntry(name: string, id: string) {
        return this.request(`/api/content/item/${name}/${id}`);
    }

    // Get singleton
    async singleton(name: string) {
        return this.request(`/api/content/item/${name}`);
    }

    // Get asset URL
    assetUrl(path: string) {
        return `${this.baseUrl}/storage/uploads${path}`;
    }
}

export const cockpit = new CockpitClient(COCKPIT_URL, COCKPIT_API_KEY);

export type Asset = {
    path: string,
    type: "image" | "video"
}