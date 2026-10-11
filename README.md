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

The frontend uses Cockpit's built-in publication state and the following content fields:

| Field | Value |
| --- | --- |
| `title` | Required English project title |
| `slug` | Required unique lowercase words separated by hyphens, e.g. `pi-chat` |
| `_state` | Cockpit's built-in publication state; only `1` (published) is rendered. No custom `published` field is needed. |
| `featured` | Boolean; `true` shows the project on the homepage (up to three) |
| `summary` | Short English description |
| `content` | Owner-authored HTML; see trust policy below |
| `date` | Publication date; descending project order |
| `tags` | Array of English strings |
| `cover` | Preview asset for project cards and social metadata; not displayed separately on the details page |
| `gallery` | Detail-page image/video assets with `path`, `alt` (or Cockpit `altText`), optional `caption` (or Cockpit `description`), and optional `type` |
| `links` | Object with optional `website`, `github`, `playstore`, `appstore`, `article` HTTP(S) URLs |

The API normally returns an array. An `entries` wrapper is also supported. Both listing and direct detail lookup exclude drafts and invalid slugs; unsafe external links are omitted. Cockpit itself must restrict its **public API** to published content if drafts contain private information—the frontend cannot prevent someone reading an unfiltered public endpoint directly.

Projects without cover images get a typographic placeholder, not a simulated product screenshot. Missing featured entries show an honest empty state. API failures are distinguished from empty collections. Unknown projects show an English not-found page with `noindex`; Next.js may retain HTTP 200 for a not-found response after streaming has started.

### Project detail layout

The gallery occupies the left two-thirds on desktop; content-height Project details and Project information cards are stacked on the right. Descriptions longer than 180 words move below the gallery to keep a comfortable reading width. On mobile/tablet the order is gallery, details, information. Empty metadata or descriptions do not produce empty cards.

Only `gallery` assets are visibly displayed on the detail page. There is no standalone cover or gallery cover fallback; social preview metadata still uses `cover`. Images are contained rather than cropped, thumbnails and arrows are manual, and no media auto-advances or autoplays. Image fullscreen viewing keeps the full image contained, with arrow keys, Escape, and focus return; there is no enlargement hint or zoom control. Videos use native playback controls. Missing photos get a simple empty state; a one-item gallery disables its arrows.

### Content trust policy

`content` is rendered as HTML and is trusted **only because the portfolio owner controls it**. Do not give untrusted users write access or paste unreviewed third-party HTML. This does not sanitize HTML. Add a server-side allowlist sanitizer before accepting externally authored content. Use descriptive image alt text and absolute URLs for images inside article HTML.

## Local Cockpit CLI

The assistant prepares JSON; **you run the CLI locally**. The script does not load or display `.env.local`. Node loads that file only when you explicitly use `--env-file`. Keep it gitignored and use a dedicated role-scoped `COCKPIT_WRITE_API_KEY`; never a `NEXT_PUBLIC_` write key. Use HTTPS for non-local CMS connections.

```sh
# Requires Node 22.18+; does not change content or prove write permission:
node --env-file=.env.local scripts/cockpit.mjs check

# Create one draft from a JSON object you have reviewed:
node --env-file=.env.local scripts/cockpit.mjs save content/projects/my-project.json

# Update: include its existing _id, title and slug in the JSON:
node --env-file=.env.local scripts/cockpit.mjs save content/projects/my-project.json --update
```

`content/projects/example.json` is a template, not real project content. Copy and replace it before importing. Fields follow the Cockpit table above; existing asset paths can be referenced in `cover` and `gallery`.

Saves default to `_state: 0` (draft), even updates of published projects. Add **`--publish`** to explicitly save `_state: 1`; use `--update --publish` for a published update. Check for an existing entry first with `node --env-file=.env.local scripts/cockpit.mjs find pi-chat`. The reviewed Pi-Chat entry is in `content/projects/pi-chat.json`; its five screenshots use pinned public GitHub URLs (not uploaded Cockpit assets). Save returns the item ID; retain it in your JSON before updating. Re-running a create without `_id` can create duplicates—there is no automatic upsert by slug. If a request times out or returns an unexpected save response, check Cockpit before retrying.

The CLI has no delete or asset-upload command. `npm run cockpit -- --help` works without credentials; if credentials are already exported in your shell, `npm run cockpit -- check` also works. Tests use fake credentials and mocked requests, never the real environment file.

## Verification

Unit tests use Node's built-in TypeScript support (Node 22.18+ recommended):

```sh
npm test
```

HTTP integration tests are skipped unless a running site is supplied. Test a real published project by supplying its slug, or opt into empty-collection assertions against an empty test collection:

```sh
TEST_BASE_URL=http://localhost:3000 TEST_PROJECT_SLUG=delivery-robot npm test
# Only against an empty collection:
TEST_BASE_URL=http://localhost:3000 TEST_EXPECT_EMPTY=1 npm test
```

The optional `tests/browser-check.mjs` checks desktop/mobile widths, the exact light background, keyboard navigation, and browser errors. It requires Playwright and its Chromium installation; if Playwright is installed outside this project, set `PLAYWRIGHT_MODULE` to its resolved module path:

```sh
TEST_BASE_URL=http://localhost:3000 node tests/browser-check.mjs
```

Detail-gallery interaction checks and isolated empty/single/long/video variants are available with the same Playwright setup:

```sh
TEST_BASE_URL=http://localhost:3000 TEST_PROJECT_SLUG=delivery-robot node tests/project-detail-browser.mjs
node tests/project-detail-variants.mjs
```

The variants script starts and stops its own read-only mock CMS and isolated Next.js server; it does not modify Cockpit. It checks video selection/controls, not actual video playback. To build while a development server is running, use a separate output directory for both build and start:

```sh
NEXT_DIST_DIR=.next-verify npm run build
NEXT_DIST_DIR=.next-verify npm start
```

A production build also runs TypeScript checks. Mantine is pinned to version 8 to retain React 18 compatibility. Tailwind has been removed from the UI and build configuration.

## Still to do

- Write and approve Pi-Chat, Autonomous Delivery Robot, and BusinessToGo case studies; upload real imagery to Cockpit.
- Verify a populated production CMS collection and its public publishing restrictions.
- Add legal pages, favicon/social imagery, and deployment hardening before launch.
- Later, add an archive index linking to preserved historical website versions. The current footer links directly to the 2023 site.
