# Manuel Selch Portfolio — Requirements

## Goal
Continue the existing portfolio into a reliable, English-language personal project portfolio for Manuel Selch, replacing the current main website while preserving older versions. Showcase his work without tailoring the whole site to a specific audience; potential freelance clients should be able to understand his contributions and contact him.

## Scope
### In Scope
- English interface, portfolio content, accessibility labels, and metadata.
- Correct contact address: manuel@selch.de.
- Repair the production build and verify local Cockpit integration.
- CMS-backed project overview, detail pages, and featured homepage projects.
- Clear loading, empty, not-found, and service-error states.
- Initial case studies: Pi-Chat, Autonomous Delivery Robot (Autonomer Lieferroboter), and BusinessToGo.
- Design exploration through approved mockups, navigation, responsive polish, SEO, and launch preparation.
- Later: an archive index linking to preserved older website versions.

### Out of Scope
- Multilingual support, a contact-form backend, or a new CMS.
- Migrating every historical project automatically.
- A full visual redesign before content and layout direction are approved.

## Requirements
- All visitor-facing interface copy and published portfolio content must be English; document language and social metadata must match.
- Email links must target mailto:manuel@selch.de.
- The production build must pass, including Next.js 15 route-parameter type checks.
- The site is exclusively Manuel's portfolio, not a shared Marco-and-Manuel profile; shared work can appear with accurate attribution.
- Project reads must use Cockpit's public read-only projects endpoint without requiring an API key. Any future privileged credentials must remain server-only and never use NEXT_PUBLIC variables.
- The client must support the actual public API response contract, currently a JSON array rather than an entries wrapper.
- An empty projects collection must render a helpful English empty state without fabricated projects.
- API and network failures must render a controlled service-error state, not masquerade as an empty collection.
- Published projects must have unique slugs, titles, summaries, and valid content and media fields. Draft projects must not be publicly listed or directly accessible.
- Overview, detail, and featured-project views must use a consistent project schema and asset handling.
- Featured homepage projects must come from the CMS and link to their internal detail pages; an explicit link must lead to the complete project overview.
- Project case studies should explain the problem, Manuel's contribution, approach, and outcome, with relevant screenshots and external links.
- About and Contact navigation must work from every route; project-detail back navigation must lead to the project overview.
- CMS article content must render readably and have an explicit trusted-content or sanitization policy before launch.
- Project grids, navigation, and article media must remain usable on mobile and with keyboard navigation; images must have meaningful alternative text.
- The sitemap must include actual public page routes and published project detail routes, not fragment-only homepage sections.
- Launch preparation must cover favicon/social assets, appropriate legal pages, configuration documentation, verification, and preservation of existing old-version URLs.
- Preserve the approved light revision 2 design: neutral off-white, grey-green accents, editorial serif typography, and Mantine (not Tailwind).
- Detail pages use a manual contained-image gallery on the left and content-height cards on the right; mobile order is gallery, details, information. No standalone cover, autoplay, enlargement hint, or zoom; fullscreen keyboard navigation remains.
- Collection covers, titles and Details links must open their project.
- Local Cockpit CLI credentials load internally without printing secrets. Publishing requires --publish; updates require --update and an existing _id. Public verification is read-only and sends no API key.
- A later archive page must list multiple preserved website versions by year/version and link visitors to each original site. Do not replace archived versions with redirects to new case studies.

## Assumptions
- Historical content may be translated selectively rather than migrated wholesale; preserved website versions retain their original content and language.
- Public Cockpit reads return arrays; a legacy entries wrapper is supported. Native _state: 1 is the publication contract. Pizza Delivery Robot and Pi-Chat are published and their galleries have been verified.
- Featured selection requires a Boolean featured field in the CMS model; entries without featured:true must not be substituted on the homepage.
- CMS HTML is trusted owner-authored content, not sanitized; the backend must independently restrict private unpublished content.
- Pi-Chat source: https://github.com/ManuelSelch/pi-chat. Robot source: https://manuelselch.de/2023/blog.php?id=30. BusinessToGo material still needs to be provided or identified.
- The archive is deferred until after the core portfolio; the complete version list and URLs are not yet known.
- Next.js 15 Promise-based params and CSS declarations are implemented; prior production builds, lint and unit/browser checks passed. NEXT_DIST_DIR supports isolated builds alongside development.
- CLI and verification usage lives in docs/cockpit/README.md. Pi-Chat source JSON retains its item ID and five pinned GitHub screenshots.

## Implementation Plan
### 1. English and Contact Baseline
Description: Translate existing interface text, document language, metadata, loading/not-found labels, and email links. Retain layout and avoid inventing biography details. Verify rendered copy and mailto targets across current routes.

### 2. Production Build Repair
Description: Update route parameters and metadata handling for Next.js 15. Verify with a successful production build and a project-route smoke test; record any independent CMS blockers rather than hiding them.

### 3. Public Cockpit Project Contract
Description: Implemented public read-only array/legacy-wrapper normalization, native _state publication filtering, unique slugs, safe links and assets. Real published projects replace temporary examples. Verify frontend draft exclusion through tests; backend public draft confidentiality remains a launch requirement.

### 4. Reliable Project States
Description: Following step 3, handle empty collections, unavailable CMS, unknown slugs, and loading consistently. Make cache/revalidation settings consistent and document expected content-refresh timing. Verify each state separately with integration checks.

### 5. Visual Direction Mockups
Description: Completed light and dark mockups; user approved light revision 2. Preserve mockups/portfolio as reference. No further mockup is required for the implemented detail layout, which the user explicitly authorized directly.

### 6. First English Case Studies
Description: Pizza Delivery Robot and Pi-Chat are published with English content and real galleries. Pi-Chat uses five repository screenshots and its GitHub link; CLI saves retain its item ID. BusinessToGo remains pending source material and permission. Do not invent outcomes or confidential client details. Verify each published entry with the short public verification command.

### 7. Connected Homepage and Navigation
Description: Use CMS featured-project selection on the homepage, add an all-projects link, repair cross-route About/Contact links, and return detail pages to the project overview. Verify navigation from every route and correct homepage behavior with no featured entries.

### 8. Approved Design and Accessibility
Description: Implemented approved Mantine light design, clickable collection covers and responsive detail cards/gallery. Descriptions above 180 words move below the desktop row. Fullscreen supports arrows, Escape and focus return, without zoom or enlargement hint. Verify 1280/390/320px layouts and keyboard interactions.

### 9. SEO and Launch Readiness
Description: Add real-route sitemap entries, favicon/social assets, appropriate legal pages, setup documentation, and deployment configuration. Keep existing 2023 URLs reachable as part of the future archive. Verify production build, representative routes, metadata, published-only sitemap contents, and absence of exposed credentials before launch.

### 10. Website Archive (Later)
Description: After the core portfolio, gather the user's older website versions and their URLs. Add an archive index with year/version labels and optional thumbnails, linking directly to each preserved site rather than redirecting old projects to new case studies. Verify each destination and ensure archive routing does not interfere with the current portfolio.

## Open Questions
1. What source material, screenshots, and contribution details can we use for BusinessToGo, and is anything confidential?
2. Later: which older website versions and URLs should the archive list?
3. What is the production hosting/domain configuration, and which legal-page details should be used?
