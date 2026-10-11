# Manuel Selch — Portfolio

English personal portfolio built with Next.js 15, React 18, TypeScript, and Mantine 8. The approved visual direction is **light mockup revision 2** in `mockups/portfolio/`: neutral off-white, grey-green accents, editorial serif headings. Production has no theme switch or mock illustrations.

## Run

```sh
npm install
npm run dev
npm run build
npm start
```

Configure `COCKPIT_URL` in `.env.local` (for example `http://localhost:8080`). The existing `NEXT_PUBLIC_COCKPIT_URL` is supported as a fallback. The `/api/content/items/projects` endpoint must have public **read-only** access. No API key is sent; the old `NEXT_PUBLIC_COCKPIT_API_KEY` setting is unused and can be removed. Do not store privileged credentials in public variables or tracked files.

Project reads and page regeneration use a 60-second revalidation interval. A new project may take up to one interval plus regeneration to appear. Restart development if configuration changes.

## Cockpit project fields

The collection is currently empty. The frontend uses this contract; align the collection fields before adding content:

| Field | Value |
| --- | --- |
| `title` | Required English project title |
| `slug` | Required unique lowercase words separated by hyphens, e.g. `pi-chat` |
| `published` | Boolean; only explicit `true` is rendered |
| `featured` | Boolean; `true` shows the project on the homepage (up to three) |
| `summary` | Short English description |
| `content` | Owner-authored HTML; see trust policy below |
| `date` | Publication date; descending project order |
| `tags` | Array of English strings |
| `cover` | Asset object with `path`, descriptive `alt`, and optional `type` (`image` or `video`) |
| `gallery` | Array of asset objects |
| `links` | Object with optional `website`, `github`, `playstore`, `appstore`, `article` HTTP(S) URLs |

The API normally returns an array. An `entries` wrapper is also supported. Both listing and direct detail lookup exclude drafts and invalid slugs; unsafe external links are omitted. Cockpit itself must restrict its **public API** to published content if drafts contain private information—the frontend cannot prevent someone reading an unfiltered public endpoint directly.

Projects without cover images get a typographic placeholder, not a simulated product screenshot. Missing featured entries show an honest empty state. API failures are distinguished from empty collections. Unknown projects show an English not-found page with `noindex`; Next.js may retain HTTP 200 for a not-found response after streaming has started.

### Content trust policy

`content` is rendered as HTML and is trusted **only because the portfolio owner controls it**. Do not give untrusted users write access or paste unreviewed third-party HTML. This does not sanitize HTML. Add a server-side allowlist sanitizer before accepting externally authored content. Use descriptive image alt text and absolute URLs for images inside article HTML.

## Verification

Unit tests use Node's built-in TypeScript support (Node 22.18+ recommended):

```sh
npm test
```

HTTP integration tests are skipped unless a running site is supplied. The baseline suite expects an empty Cockpit collection:

```sh
TEST_BASE_URL=http://localhost:3000 npm test
```

The optional `tests/browser-check.mjs` checks desktop/mobile widths, the exact light background, keyboard navigation, and browser errors. It requires Playwright and its Chromium installation; if Playwright is installed outside this project, set `PLAYWRIGHT_MODULE` to its resolved module path:

```sh
TEST_BASE_URL=http://localhost:3000 node tests/browser-check.mjs
```

A production build also runs TypeScript checks. Mantine is pinned to version 8 to retain React 18 compatibility. Tailwind has been removed from the UI and build configuration.

## Still to do

- Write and approve Pi-Chat, Autonomous Delivery Robot, and BusinessToGo case studies; upload real imagery to Cockpit.
- Verify a populated production CMS collection and its public publishing restrictions.
- Add legal pages, favicon/social imagery, and deployment hardening before launch.
- Later, add an archive index linking to preserved historical website versions. The current footer links directly to the 2023 site.
