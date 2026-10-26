# Changelog

## 0.1.0 - 26 October 2026

- Introduced Scripture reader, curated study paths, bookmarks and notes.
- Added the interactive Scripture connection map and cross-reference importer.
- Implemented Crossway ESV API proxies using server-side credentials.
- Configured private GitHub-based Cloudflare Pages deployment and CI checks.
- Limited Pages Functions routing to `/api/*` to preserve static asset delivery.

Live ESV passages and search require the `ESV_API_KEY` secret in Cloudflare Pages production settings.

## 0.2.0 - Connection atlas expansion

- Enabled book/chapter/verse selection and up to ten reference hops.
- Added bounded depth traversal, progress status and accessible layer-by-layer links.
- Linked each numbered ESV verse directly to the connection atlas.
- Added OpenBible.info community-voted and attributed full-canon verse reference data.
- Added adjacent-verse context fallback, explicitly distinct from a theological connection.
- Documented approved ESV, NASB 2020 and LSB study editions and official external readers.

## 0.2.0 - 26 October 2026

- Added individual verse Atlas actions, 66-book chapter and verse selector, and a capped ten-hop network.
- Added user-visible provenance labels and reading-context fallbacks.
- Added ESV, NASB 2020 and LSB study edition links without redistributing additional copyrighted translations.
- Added a pinned OpenBible.info cross-reference import workflow with validation and attribution.

## Gospel itinerary map - 26 October 2026

- Added a separate Journeys of Jesus view with a self-hosted SVG map, draggable narrative timeline and playback.
- Catalogued 79 Gospel and Acts episodes across 35 known or uncertain locations with 155 primary passage citations.
- Added location filters, phase filters, zoom/pan, repeat-visit history and ESV reader links for each listed passage.
- Marked all approximate geography, uncertain site identification, inferred stops and narrative harmonisation explicitly.
- Preserved the existing Bible reader, Connection Atlas, guided studies, ESV API integration and site theme.

## 26 October 2026 - Place dossiers and transparent roadmap

- Added an archaeology and history study panel to every one of the 35 Gospel map markers.
- Distinguished ancient names, modern localities, OT historical associations, Gospel passages, archaeological source links and site-identification uncertainty.
- Added a separate Project roadmap page with filtering, expandable milestones, verified delivered work and prospective research priorities.
- Kept the 79-event itinerary, private GitHub / Cloudflare setup and existing Bible reader unchanged.
- Added test coverage for cross-source references, geography completeness, roadmap statuses and page navigation.
