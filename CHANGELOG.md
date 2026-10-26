# Changelog

## 0.1.0 - 26 October 2026

- Introduced Scripture reader, curated study paths, bookmarks and notes.
- Added the interactive Scripture connection map and cross-reference importer.
- Implemented Crossway ESV API proxies using server-side credentials.
- Configured private GitHub-based Cloudflare Pages deployment and CI checks.
- Limited Pages Functions routing to `/api/*` to preserve static asset delivery.

Live ESV passages and search require the `ESV_API_KEY` secret in Cloudflare Pages production settings.
