# Portfolio visual direction

- Revision: 2 (light palette adjusted; dark unchanged from revision 1).
- Status: light revision 2 approved for implementation; dark is not selected.
- Goal: compare neutral light and restrained dark treatments of Manuel's personal portfolio, without changing production code.
- Routes: `/portfolio/?theme=light` and `/portfolio/?theme=dark`.
- Same content and layout in both: name/navigation, editorial introduction, featured Pi-Chat project, robot and BusinessToGo cards, About, email contact, old-site link.
- Light: cool neutral off-white, grey-green surfaces and accents, serif display typography, thin borders, generous spacing. Warm beige BusinessToGo imagery was replaced with grey-green colours after the user found the light direction too pink.
- Dark: charcoal rather than blue-black, soft ivory type, sage accent, same editorial character.
- Responsive intent: single-column project cards and contact block on small screens, no hidden navigation; wide screens use a featured split card and two secondary cards.
- Interactions: theme links, section navigation, GitHub/LinkedIn/old robot article links, and mailto:manuel@selch.de. The 2023 footer link is not the future archive index.
- Project imagery is locally drawn illustrative concept art, not actual product screenshots or an accurate technical robot drawing. BusinessToGo copy is explicitly provisional; no functionality or outcomes are claimed.
- Copy is design-study copy and still needs user review. No CMS access, persistence, case-study pages, or backend behavior.
- System fonts only; no remote assets or libraries other than the shared Vite preview dependency. Visible keyboard focus and reduced-motion handling included in source.
- Serving is verified by HTTP only. Appearance, mobile layout, and interactions are for user-led review; browser automation was not requested.
- Feedback: the user initially liked dark and found light too pink. After the light palette correction, the user selected light.
- Approval evidence: "light now looks good. use light for the implementation" — applies to light revision 2.
- Handoff: preserve the approved mock source; stop the owned Vite preview before production changes. Use real CMS data and controlled empty/error states, not the illustrative mock data or product visuals.
