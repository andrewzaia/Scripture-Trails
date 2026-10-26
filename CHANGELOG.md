## 26 October 2026 - Five deep historical city studies

- Introduced a separate Historical City Studies navigation view and direct deep links for Jerusalem, Nazareth, Capernaum, Bethlehem and Jericho.
- Added 40 primary biblical reference entries, 25 broadly dated historical periods and 20 documented archaeological/historical findings with an explicit limitation on every claim.
- Included interactive modern-site orientation diagrams and a candidate-comparison explorer for Cana, Bethsaida and Emmaus; no ancient route or precise Gospel house footprint is invented.
- Linked Wikimedia Commons photos with author/licence attribution and retained original illustrative art as an offline fallback.
- Connected the new city pages to Gospel journey episodes, Bible reading and the Connection Atlas.
- Preserved the prior map and evidence audit; changed the roadmap to mark the implemented city-study milestone Delivered while retaining specialist review and Gospel chronology comparison as future work.

## 2026-10-26 - Gospel geographical and textual evidence screening

- Audited the data structure for all 79 listed episodes and all 35 place dossiers; published review state, corrections and open research issues.
- Corrected lakeshore/Capernaum labelling for Jairus (Mark 5:21) and the paralytic (Mark 2:1); revised Caesarea Philippi as a district (Matthew 16:13; Mark 8:27), Bethphage donkey collection as inferred (Matthew 21:1-3), and John 20 multiple appearances (John 20:19-29).
- Added explicit qualification of the conflicting presentation of childhood, Nazareth synagogue, temple actions, Bethany anointing, the final meal and resurrection appearances.
- Added John 7:53-8:11 manuscript caution and referenced Matthew 15:29-38 for lakeshore context.
- Added public per-episode issue notes, source links, corrections register and research gaps to the map, with no claims of independent scholarly certification.
- Marked first-pass editorial audit delivered on roadmap and planned independent specialist review separately.

# Changelog

## 2026-10-27 - Compact translation status rectangles

- Use compact horizontal rectangles with a small green or red circle before each translation acronym.
- Preserve display-only behaviour, accessible status descriptions and the existing availability logic.

## 2026-10-27 - Simpler translation indicators

- Make the header translation squares display-only, keeping translation changes in the Bible reader selector and ESV as the default.
- Replace visible status labels with green ticks and red crosses, retaining accessible names and hover explanations.
- Start each edition as available, turn red only after an identified reading failure, and restore green after a successful retry.
- Remove the unused configuration endpoint and its page-load request.

## 2026-10-27 - Production domain and translation status

- Set the production address to `https://www.scripturetrails.com/`, with canonical and social sharing metadata and a sitemap.
- Configure Cloudflare DNS, the Pages custom domain and a permanent apex/HTTP redirect to HTTPS `www`, preserving deep links and query strings.
- Give ESV, NASB20, NIV and NKJV independent, responsive status squares in the header, with selection shortcuts to the current passage.
- Distinguish configured keys from successful reading requests, rate limits, unavailable passages and service failures without polling the Scripture providers.
- Test configuration disclosure, provider quota avoidance and status classification.

## 2026-10-27 - Local reference sources and supporting assets

- Verified the uploaded OpenBible archive against all 344,799 official reference pairs and documented snapshot/vote differences.
- Stored the original source archive and provenance, and regenerated all 66 Atlas files locally.
- Removed external reference downloads from the rebuild workflow and made imports deterministic.
- Added source and shard checksum validation to production builds.
- Hosted all five credited city photographs locally as optimised WebP files, preserving source links and licences.
- Recorded the preference for licensed local data in the project instructions. Publisher Bible APIs and required usage reporting remain separate.


## 2026-10-27 - API.Bible translation selection

- Removed unused external edition links from the reader, Atlas, About, map and roadmap.

- Added in-page ESV, NASB20, NIV (2011) and NKJV selection for exact verses, ranges and full chapters.
- Keep the edition in shared links, browser history and the saved reading preference.
- Added server-side API.Bible routing using the encrypted `API_BIBLE_KEY` secret and fixed approved Bible IDs.
- Added publisher copyright, API.Bible attribution, FUMS view reporting and edition-specific error messages.
- Retained ESV keyword search.
- Added routing, security, redirect and upstream failure tests. All 56 tests passed; production verse and chapter retrieval was verified for all three API.Bible editions on 27 October 2026.


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
- Documented approved study editions and official external readers.

## 0.2.0 - 26 October 2026

- Added individual verse Atlas actions, 66-book chapter and verse selector, and a capped ten-hop network.
- Added user-visible provenance labels and reading-context fallbacks.
- Added official study edition links without redistributing additional copyrighted translations.
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

## 26 October 2026 - Historical City Studies photo reliability

- Replaced brittle Wikimedia Commons image redirect endpoints with direct Wikimedia image CDN sources and one fallback URL per city.
- Corrected the Jerusalem image filename to a confirmed Commons image; updated Bethlehem to a licensed Commons courtyard photograph.
- Maintained photo creator and Creative Commons attribution, with an explicit illustrative fallback if the CDN cannot be reached.
- Added regression checks for all five primary and fallback image URLs.

## 27 October 2026 - Focused verse reading

- Verse lookups, search-result selections and study links now request and display only the selected ESV verse or explicit verse range instead of the whole chapter.
- Chapter-only references continue to open the full chapter, and verse/range views display a **Read full chapter** action.
- Preserved the passage-specific deep link, bookmarks, notes and Atlas connections; replaced chapter-only reader caching with exact-reference caching and cancellation-aware requests.
- Kept Crossway ESV text server-side, with chapter headings disabled on verse-specific requests.
- Added explicit reader and proxy tests for verse, range and chapter modes.
