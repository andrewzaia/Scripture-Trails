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
