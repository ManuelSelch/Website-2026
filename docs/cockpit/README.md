# Cockpit CLI and project verification

Run these commands from the project root.

## Local Cockpit CLI

The CLI loads `.env.local` internally without displaying its contents; exported environment variables take precedence. Keep it gitignored and use a dedicated role-scoped `COCKPIT_WRITE_API_KEY`; never a `NEXT_PUBLIC_` write key. Use HTTPS for non-local CMS connections.

```sh
# Requires Node 22.18+; does not change content or prove write permission:
npm run cockpit -- check

# Create one draft from a JSON object you have reviewed:
npm run cockpit -- save content/projects/my-project.json

# Update: include its existing _id, title and slug in the JSON:
npm run cockpit -- save content/projects/my-project.json --update
```

`content/projects/example.json` is a template, not real project content. Copy and replace it before importing. Fields follow the [Cockpit project fields table](../../README.md#cockpit-project-fields); existing asset paths can be referenced in `cover` and `gallery`.

Saves default to `_state: 0` (draft), even updates of published projects. Add **`--publish`** to explicitly save `_state: 1`; use `--update --publish` for a published update. Check for an existing entry first with `npm run cockpit -- find pi-chat`. The reviewed Pi-Chat entry is in `content/projects/pi-chat.json`; its five screenshots use pinned public GitHub URLs (not uploaded Cockpit assets). Save returns the item ID; retain it in your JSON before updating. Re-running a create without `_id` can create duplicates—there is no automatic upsert by slug. If a request times out or returns an unexpected save response, check Cockpit before retrying.

The CLI has no delete or asset-upload command. `npm run cockpit -- --help` works without loading credentials. Tests use fake credentials and mocked requests, never the real environment file.

## Quick published-project verification

```sh
npm run verify:project -- pi-chat
# Against another running frontend:
TEST_BASE_URL=http://127.0.0.1:3016 npm run verify:project -- pi-chat
```

Requires a running website (defaults to port 3000), a matching `content/projects/<slug>.json`, and Playwright/Chromium. Resolves Playwright from the project, `PLAYWRIGHT_MODULE`, or the existing pi-browser-debug installation. Uses `.env.local` for the CMS URL but **never sends an API key**. Checks unique public publication, content/links/gallery/cover/featured fidelity, image loading, collection-cover navigation, fullscreen open/close, mobile overflow, browser errors and featured homepage placement. Retries up to six times at ten-second intervals for revalidation; each browser/request check has its own timeout. Prints PASS/FAIL and exits nonzero on failure, without writing to Cockpit.

Pi-Chat currently fails the featured-field check because Cockpit did not retain `featured: true`; configure that field in the CMS before expecting a full pass. This script intentionally reports that mismatch rather than silently skipping it.
