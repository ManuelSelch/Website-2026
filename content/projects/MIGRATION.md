# Project migration inventory

Source: http://old.manuelselch.de/2023/ (read-only inspection).
Target CMS: https://cockpit.manuelselch.de. Drafts created, none published.

## Draft batch completed

Twelve entries now exist with native `_state: 0`: Business to Go, Odoo to go, Moodlight, Industrial Robot, Autonomous Delivery Robot — 2022, Intelligenzbolzen, Heating Control, PixelMission, NotesToGo, Flux, Dotfield and Pi Extensions. Their individual JSON files retain the production `_id` for updates. Do not run creates again. These local files are now historical import records, not authoritative content: use the guarded `get` plus `edit-text`/`set-media` workflow in docs/cockpit/README.md for changes.

Eight legacy drafts now have 29 native images uploaded and attached as covers/galleries: Business to Go (3), Odoo to go (5), Moodlight (1), Industrial Robot (2), Delivery Robot 2022 (3), Intelligenzbolzen (3), Heating Control (4), PixelMission (8). NotesToGo, Flux, Dotfield and Pi Extensions remain text-only because suitable published source images were not found. Client/employer work, animation and event/award pages remain on hold as listed below. Existing Pi-Chat and delivery-robot were not modified.

Each save response confirmed `_state: 0`. Anonymous public listings exclude all twelve and direct item-by-ID requests return 404. Cockpit's standard content GET endpoints force published-only results even with our authenticated API key: `find` returning `[]` does NOT mean a draft is absent. Review drafts in Cockpit's editor; retain IDs locally and never recreate based solely on `find`. No separate read-after-write draft-content fidelity check was available through those endpoints.

The source homepage links to 19 project/detail pages. Dates are often generic CMS dates (many 2023-06-10 or 2024-05-20); do not treat them as actual project completion dates. Shared work must use team attribution unless Manuel's individual role is documented. Public source descriptions are not permission to add private client details.

| Old ID | Project | Migration treatment |
| --- | --- | --- |
| 54 | Business to Go | Personal app; source supports TCA, SQLite offline storage, Kimai/Taiga connections; three screenshots; repository https://github.com/ManuelSelch/businessToGo. Ready for English draft. |
| 27 | Odoo to go | App using XML-RPC to browse/edit Odoo modules, search, submenus and iOS contact widget; five images. Kanban was explicitly work in progress, not a completed feature. |
| 31 | Moodlight | Arduino Day workshop led by Manuel at FabLab Bayreuth; Wi-Fi RGB lighting. Source https://github.com/fablab-bayreuth/Moodlight-Workshop. |
| 29 | Industrial Robot | School group project dispensing drinks; Arduino/relay Morse command interface. Source https://github.com/ManuelSelch/Industrieroboter. Preserve group attribution. |
| 26 | Autonomous Delivery Robot 2022 | Earlier team project, regional Jugend forscht winner; Raspberry Pi, traffic-light recognition, Dijkstra routing, app/database connection and simple lane assistance. Distinct from existing 2023 sensor-fusion entry. |
| 25 | Intelligenzbolzen 2021 | Team exercise-sensing buttons and app; Wi-Fi sensors, charts and competitive game. Three images plus public research PDF. Individual roles not specified. |
| 24 | Heating Control | Microcontroller, temperature sensors, relay-controlled hot-water pump and historical temperature graphs in app. Four images. Do not claim safety certification. |
| 21 | PixelMission | First shared pixel-art mobile game, Android/iOS; level editor and multiplayer described; eight images and historic store links. Verify current availability before claiming downloadable today. |
| 61 | Autodeko | Source gives product description/link, not Manuel's implementation contribution. Public client-facing draft only after role clarified. |
| 53 | Sunnyswelt | Website/shop for author Birgit Sonnenblume; one image/link. Confirm Manuel's role and current publication permission. |
| 51 | MCJonazn | Musician website made as a birthday gift; one image/link. Avoid publishing friend's age/private details. |
| 47 | Waenzi Wazuri | Rhodesian Ridgeback website; source is only one sentence and image. Contribution needs clarification. |
| 28 | BlueCatBio | Public source only states C# GUI work controlling BlueWasher. Hold client/employer case study pending explicit approval; no internal architecture, screenshots or customer information. |
| 23 | Marius Angeschrien | Shared pixel-art animation using edited audio from a YouTube channel. Individual role and media reuse rights need clarification. |
| 46 | FLL 2024 | Team regional winner; Manuel also describes judging/junior coaching. An activity/achievement rather than necessarily a standalone software project. |
| 39 | BF/M Bayreuth | Manuel's talk on autonomous driving with 2023 robot project; potential robot milestone rather than separate project. |
| 34 | Bayreuth Innovativ | Helped at FabLab stand; activity rather than standalone project. |
| 32 | TUMMS | One-week mathematics scholarship awarded through Jugend forscht; achievement rather than implementation project. |
| 30 | Autonomous Delivery Robot 2023 | Already published as delivery-robot. Do not duplicate or overwrite edited production content. |

## Newer projects (not on the old site)

Also requested: NotesToGo, Flux, Dotfield and Pi extensions. Gather current repository evidence and relevant images separately. Do not invent launch status or metrics. Pi-Chat already exists and has a manually updated production cover/gallery: avoid applying stale local JSON over it.

## Media handling

Old site images use http://old.manuelselch.de/2023/admin/uploads/<filename>. Source filenames and English alt text are recorded in image-sources.json; downloads are retained locally under /tmp/manuel-project-images (temporary, not a backup). All 29 passed image-format, dimension and size validation, were reviewed in a contact sheet, and are registered as native assets in the production root projects folder. Native receipts are in assets/<slug>/; individual project JSON retains full asset metadata. No HTTP hotlinks are used. Covers use the first source image except Delivery Robot 2022, which uses the real robot photograph. Some covers are historical logos, not newly designed portfolio artwork.

Save responses verified draft state, existing item ID, and media ID/path/folder. **Incident:** the import submitted full local records and overwrote user text edits in Cockpit. The previous 'unchanged text' assertion compared against stale local files, not current CMS text, and was not a valid preservation check. Do not reuse that import script or full-record workflow. Recovery requires existing CMS history/backups; the new addon cannot recover earlier overwritten versions. All 29 uploaded image URLs loaded successfully. The eight updated draft item URLs still return 404 anonymously, and public listings still contain only Pi-Chat and the existing 2023 robot. Uploaded media files themselves are public: draft item privacy does not make assets private.

The source for Delivery Robot 2022 includes a team photo named gruppenbildJuFo2023.jpeg; the caption deliberately describes it only as a team photograph from the original case study, not as an image taken in 2022. Review chronology and team-photo publication preferences before publishing.

## Open decisions

- Confirm specific roles where old source says only 'we', especially illustration/animation work potentially attributable to Marco.
- Confirm client/employer publication scope before creating those case studies.
- Decide whether talks, awards and workshops should all appear as projects or later in an experience/achievement section.
