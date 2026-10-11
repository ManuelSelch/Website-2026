# Portfolio visual direction

- Revision: 1
- Status: in review; no approval yet.
- Goal: compare warm light and restrained dark treatments of Manuel's personal portfolio, without changing production code.
- Routes: `/portfolio/?theme=light` and `/portfolio/?theme=dark`.
- Same content and layout in both: name/navigation, editorial introduction, featured Pi-Chat project, robot and BusinessToGo cards, About, email contact, old-site link.
- Light: warm off-white, olive accent, serif display typography, thin borders, generous spacing.
- Dark: charcoal rather than blue-black, soft ivory type, sage accent, same editorial character.
- Responsive intent: single-column project cards and contact block on small screens, no hidden navigation; wide screens use a featured split card and two secondary cards.
- Interactions: theme links, section navigation, GitHub/LinkedIn/old robot article links, and mailto:manuel@selch.de. The 2023 footer link is not the future archive index.
- Project imagery is locally drawn illustrative concept art, not actual product screenshots or an accurate technical robot drawing. BusinessToGo copy is explicitly provisional; no functionality or outcomes are claimed.
- Copy is design-study copy and still needs user review. No CMS access, persistence, case-study pages, or backend behavior.
- System fonts only; no remote assets or libraries other than the shared Vite preview dependency. Visible keyboard focus and reduced-motion handling included in source.
- Serving is verified by HTTP only. Appearance, mobile layout, and interactions are for user-led review; browser automation was not requested.
- Open design question: which palette feels most like Manuel? Retain the editorial typography/layout, or explore a different direction?
- Approval evidence: none. Production implementation requires explicit approval of a revision.
