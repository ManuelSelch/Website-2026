# Manuel Selch Portfolio — Requirements

## Goal
Continue the existing portfolio into a reliable, English-language replacement for manuelselch.de/2023/, showcasing Manuel's work and making contact straightforward.

## Scope
### In Scope
- English interface, portfolio content, accessibility labels, and metadata.
- Correct contact address: manuel@selch.de.
- Repair the production build and verify local Cockpit integration.
- CMS-backed project overview, detail pages, and featured homepage projects.
- Clear loading, empty, not-found, and service-error states.
- Selected project case studies, navigation, responsive polish, SEO, and launch preparation.

### Out of Scope
- Implementing this plan during the planning task.
- Multilingual support, a contact-form backend, or a new CMS.
- Migrating every historical project automatically.
- A full visual redesign before content and layout direction are approved.

## Requirements
- All visitor-facing interface copy and published portfolio content must be English; document language and social metadata must match.
- Email links must target mailto:manuel@selch.de.
- The production build must pass, including Next.js 15 route-parameter type checks.
- Cockpit requests must authenticate successfully using server-only credentials; API keys must not use NEXT_PUBLIC variables or appear in browser bundles.
- An authenticated empty projects collection must render a helpful English empty state without fabricated projects.
- Authentication and network failures must render a controlled service-error state, not masquerade as an empty collection.
- Published projects must have unique slugs, titles, summaries, and valid content and media fields. Draft projects must not be publicly listed or directly accessible.
- Overview, detail, and featured-project views must use a consistent project schema and asset handling.
- Featured homepage projects must come from the CMS and link to their internal detail pages; an explicit link must lead to the complete project overview.
- Project case studies should explain the problem, Manuel's contribution, approach, and outcome, with relevant screenshots and external links.
- About and Contact navigation must work from every route; project-detail back navigation must lead to the project overview.
- CMS article content must render readably and have an explicit trusted-content or sanitization policy before launch.
- Project grids, navigation, and article media must remain usable on mobile and with keyboard navigation; images must have meaningful alternative text.
- The sitemap must include actual public page routes and published project detail routes, not fragment-only homepage sections.
- Launch preparation must cover favicon/social assets, appropriate legal pages, configuration documentation, verification, and old-URL handling.

## Assumptions
- This is a Manuel-focused portfolio; retaining Marco's profile or shared branding remains an open decision.
- English-only is intended; historical content may be translated selectively rather than migrated wholesale.
- Cockpit has been started locally but has no portfolio content yet, as reported by the user.
- The existing dark visual direction is retained provisionally; layout changes should be previewed and approved before production implementation.
- A read-only check of the configured projects API returned HTTP 412 with "Authentication failed". Backend reachability is established, but authentication and collection setup remain unverified.
- The previous production-build check failed on synchronous project-detail route parameters; this has not been fixed.

## Implementation Plan
### 1. English and Contact Baseline
Description: Translate existing interface text, document language, metadata, loading/not-found labels, and email links. Retain layout and avoid inventing biography details. Verify rendered copy and mailto targets across current routes.

### 2. Production Build Repair
Description: Update route parameters and metadata handling for Next.js 15. Verify with a successful production build and a project-route smoke test; record any independent CMS blockers rather than hiding them.

### 3. Cockpit Authentication and Project Contract
Description: Correct local authentication, move credentials to server-only configuration, and define/create the projects collection with documented fields, publishing rules, slug validation, and a deliberate content format. Align overview/detail response handling with the actual API. Verify authenticated empty-collection access and one temporary sample project, including assets and direct draft exclusion. Do not publish placeholder content as real portfolio work.

### 4. Reliable Project States
Description: Following step 3, handle empty collections, unavailable CMS, unknown slugs, and loading consistently. Make cache/revalidation settings consistent and document expected content-refresh timing. Verify each state separately with integration checks.

### 5. First English Case Studies
Description: Select an initial set of approximately three real projects with the user. Add approved English summaries, role/contribution, approach, results, images, and links in Cockpit. Verify readable detail rendering, image paths, and external links. Agree on the rich-content trust/sanitization policy before publishing.

### 6. Connected Homepage and Navigation
Description: Use CMS featured-project selection on the homepage, add an all-projects link, repair cross-route About/Contact links, and return detail pages to the project overview. Verify navigation from every route and correct homepage behavior with no featured entries.

### 7. Responsive and Accessibility Polish
Description: Check mobile navigation, grids, content typography, contrast, focus states, and image alternative text. Preview and obtain approval for any proposed layout redesign before implementation. Verify narrow and wide viewports and keyboard-only navigation.

### 8. SEO and Launch Readiness
Description: Add real-route sitemap entries, favicon/social assets, appropriate legal pages, setup documentation, and deployment configuration. Decide how existing 2023 URLs will remain reachable or redirect. Verify production build, representative routes, metadata, published-only sitemap contents, and absence of exposed credentials before launch.

## Open Questions
1. Is the new website exclusively Manuel's portfolio, or should Marco and shared projects retain a dedicated presence?
2. Who is the primary audience: potential employers, freelance clients, collaborators, or a general project showcase?
3. Which three projects should become the first English case studies?
4. Should the existing dark visual direction stay, or would you like to explore an alternative through a mockup?
5. Should the 2023 website remain an accessible archive, or should its project URLs eventually redirect to new case studies?
