# Changelog

## 0.11.1 - 28/10/2026: Clearer People Index icon

- Replaced the People, places & events navigation icon with a head-and-shoulders outline matching the existing style.

## 0.11.0 - 28/10/2026: Paul's missionary journeys

- Explore three missionary journeys in Acts through 61 passage-linked narrative stages, with 33 approximate location markers.
- Use journey filters, a timeline, repeat visits and an accessible stage list, with links to the Bible reader, Atlas and People Index.
- See source-linked geography and clear notes for regional, unnamed, offshore and disputed settings without invented routes or dates.
- Updated the roadmap with the completed missionary journeys and Paul's voyage to Rome as the next geography milestone.

- Retain credited, pinned Pleiades source metadata and public-domain Natural Earth coastal orientation locally.
- Validate canonical Acts citations, marker/source alignment, repeat visits and connector gaps with eight new data tests.
- Extend release cache-key checks to the Pauline map and refreshed roadmap.
- Verification: 132 Node tests passed; desktop and mobile browser checks covered filtering, deep links, keyboard focus, playback, map controls and reader/Atlas/index navigation.

## 0.10.0 - 28/10/2026: Atlas passage preview

- Preview linked verses below the graph without changing its centre.
- A second node click explicitly focuses the Atlas.

## 0.9.4 - 28/10/2026: Clearer one-hop Atlas connections

- Hovering an Atlas verse now softly highlights the directly connected verses and lines, one hop away.
- The brighter shortest route to the centre remains distinct, with both highlight types identified in the legend.

## 0.9.3 - 27/10/2026: Reliable versioned deployments

- Corrected a deployment check that could prevent new website releases from publishing.
- Kept release history, version numbers and update notes consistent across the site.

## 0.9.2 - 27/10/2026: Consistent version history

- Strengthened release checks so every website update receives a new version and public changelog entry.
- Improved consistency between the public release history and the website footer version.

## 0.9.1 - 27/10/2026: Trace the shortest Atlas connections

- Hover over an Atlas verse to illuminate the shortest displayed route back to the centre in green.
- See every verse and connection along the route, with a clearer route legend and unchanged navigation controls.

## 0.9.0 - 27/10/2026: Deep Scripture Connections

- Expanded passage-linked connection explanations to 115 and clarified editorial evidence status.
- Added side-by-side Bible passage comparison with publisher-supplied text and attribution.
- Introduced person-centred Scripture trails for eight major biblical figures.

## 0.8.0 - 27/10/2026: Explain Scripture connections in the Atlas

- Added passage explanations and context for selected quotations, parallels, echoes, typology and themes.
- Made it easy to separate explained links from the wider community-ranked, unclassified reference archive.
- Connected biblical people profiles to relevant Atlas explanations and original passage reading.

## 0.7.0 - 27/10/2026: Find more biblical people and kingdoms

- Expanded the People Index with over 100 further cited biblical figures, including major names from both Testaments.
- Featured Hezekiah, David, Solomon, Moses, Paul and Assyria as directly selectable entries.
- Improved search guidance, retry options and loading consistency across new releases.

## 0.6.0 - 27/10/2026: Explore Old Testament history and biblical kingdoms

- Added biblical people and event profiles from the ancestors of Israel to the Persian era.
- Expanded the index with historical cities, ancient kingdoms, and sources distinguishing biblical narratives from archaeological records.
- Added Hebrew Bible and Gospel filters and improved navigation between related Scripture entries.

## 0.5.0 - 27/10/2026: Explore biblical people, places and events

- Added searchable biblical people profiles with disambiguated names and passage references.
- Connected 35 historical locations and 79 Gospel episodes to an interactive study index.
- Added one-click navigation between the index, Bible reader, Connection Atlas and historical maps.

## 0.4.2 - 27/10/2026: Clarify Atlas evidence and validate Scripture references

- Explained that Atlas votes indicate community-ranked relevance rather than scholarly confidence.
- Improved checks for Scripture citation ranges and made outstanding research-source gaps clearer.

## 0.4.1 - 27/10/2026: Clarify chronology evidence and citations

- Added academic reading links to the public Gospel evidence register for important ordering differences.
- Clarified potentially parallel visits and the difference between narrative order and historical evidence.

## 0.4.0 - 27/10/2026: Compare Gospel narrative sequences

- Added individual Matthew, Mark, Luke and John passage-order views alongside the combined Journeys of Jesus timeline.
- Added source-linked comparisons for disputed parallel accounts, and distinguished textual order from historical dates and travel.

## 0.3.1 - 27 October 2026 - Complete historical release numbering

- Assigned retrospective patch numbers to previously unnumbered historical updates, with v0.1.1 and v0.2.1 through v0.2.14 based on their documented sequence.
- Reordered and aligned public and development changelogs, keeping v0.1.0, v0.2.0 and v0.3.0 as established milestone releases.
- Strengthened release consistency checks so missing, duplicate, out-of-order or skipped patch numbers are rejected.

Historical patch labels were reconstructed from the repository history on 27 October 2026. They do not imply those versions were individually tagged or deployed at the time.

## 0.3.0 - 27 October 2026 - Public release history and version display

- Added a compact, expandable public changelog to the About page, based on documented website changes.
- Displayed the current release version in the footer, and added release commands and automated consistency checks.
- Require an increased semantic version for future website changes when Git parent history is available.

## 0.2.14 - 27 October 2026 - Connection strength bars

- Replaced raw Atlas cross-reference vote labels with up to seven compact strength bars relative to the strongest connection shown.
- Retained precise vote counts on hover and in accessible labels.

## 0.2.13 - 27 October 2026 - Cleaner translation availability indicators

- Use compact horizontal rectangles with a small green or red circle before each translation acronym.
- Preserve display-only behaviour, accessible status descriptions and the existing availability logic.

## 0.2.12 - 27 October 2026 - Translation status made simpler

- Make the header translation squares display-only, keeping translation changes in the Bible reader selector and ESV as the default.
- Replace visible status labels with green ticks and red crosses, retaining accessible names and hover explanations.
- Start each edition as available, turn red only after an identified reading failure, and restore green after a successful retry.
- Remove the unused configuration endpoint and its page-load request.

## 0.2.11 - 27 October 2026 - Official Scripture Trails website

- Set the production address to `https://www.scripturetrails.com/`, with canonical and social sharing metadata and a sitemap.
- Configure Cloudflare DNS, the Pages custom domain and a permanent apex/HTTP redirect to HTTPS `www`, preserving deep links and query strings.
- Give ESV, NASB20, NIV and NKJV independent, responsive status squares in the header, with selection shortcuts to the current passage.
- Distinguish configured keys from successful reading requests, rate limits, unavailable passages and service failures without polling the Scripture providers.
- Test configuration disclosure, provider quota avoidance and status classification.

## 0.2.10 - 27 October 2026 - Faster, locally hosted reference materials

- Verified the uploaded OpenBible archive against all 344,799 official reference pairs and documented snapshot/vote differences.
- Stored the original source archive and provenance, and regenerated all 66 Atlas files locally.
- Removed external reference downloads from the rebuild workflow and made imports deterministic.
- Added source and shard checksum validation to production builds.
- Hosted all five credited city photographs locally as optimised WebP files, preserving source links and licences.
- Recorded the preference for licensed local data in the project instructions. Publisher Bible APIs and required usage reporting remain separate.

## 0.2.9 - 27 October 2026 - Four in-page Bible translations

- Removed unused external edition links from the reader, Atlas, About, map and roadmap.

- Added in-page ESV, NASB20, NIV (2011) and NKJV selection for exact verses, ranges and full chapters.
- Keep the edition in shared links, browser history and the saved reading preference.
- Added server-side API.Bible routing using the encrypted `API_BIBLE_KEY` secret and fixed approved Bible IDs.
- Added publisher copyright, API.Bible attribution, FUMS view reporting and edition-specific error messages.
- Retained ESV keyword search.
- Added routing, security, redirect and upstream failure tests. All 56 tests passed; production verse and chapter retrieval was verified for all three API.Bible editions on 27 October 2026.

## 0.2.8 - 27 October 2026 - Navigation and sidebar refinements

- Collapsed the sidebar chapter jump by default and kept the sidebar independently scrollable to reduce initial clutter.
- Adjusted the Project roadmap heading to match other page layouts.
- Made the Scripture Trails brand in the navigation link back to the homepage.

## 0.2.7 - 27 October 2026 - Focused verse and chapter reading

- Verse lookups, search-result selections and study links now request and display only the selected ESV verse or explicit verse range instead of the whole chapter.
- Chapter-only references continue to open the full chapter, and verse/range views display a **Read full chapter** action.
- Preserved the passage-specific deep link, bookmarks, notes and Atlas connections; replaced chapter-only reader caching with exact-reference caching and cancellation-aware requests.
- Kept Crossway ESV text server-side, with chapter headings disabled on verse-specific requests.
- Added explicit reader and proxy tests for verse, range and chapter modes.

## 0.2.6 - 26 October 2026 - More reliable historical images

- Replaced brittle Wikimedia Commons image redirect endpoints with direct Wikimedia image CDN sources and one fallback URL per city.
- Corrected the Jerusalem image filename to a confirmed Commons image; updated Bethlehem to a licensed Commons courtyard photograph.
- Maintained photo creator and Creative Commons attribution, with an explicit illustrative fallback if the CDN cannot be reached.
- Added regression checks for all five primary and fallback image URLs.

## 0.2.5 - 26 October 2026 - Historical city studies

- Introduced a separate Historical City Studies navigation view and direct deep links for Jerusalem, Nazareth, Capernaum, Bethlehem and Jericho.
- Added 40 primary biblical reference entries, 25 broadly dated historical periods and 20 documented archaeological/historical findings with an explicit limitation on every claim.
- Included interactive modern-site orientation diagrams and a candidate-comparison explorer for Cana, Bethsaida and Emmaus; no ancient route or precise Gospel house footprint is invented.
- Linked Wikimedia Commons photos with author/licence attribution and retained original illustrative art as an offline fallback.
- Connected the new city pages to Gospel journey episodes, Bible reading and the Connection Atlas.
- Preserved the prior map and evidence audit; changed the roadmap to mark the implemented city-study milestone Delivered while retaining specialist review and Gospel chronology comparison as future work.

## 0.2.4 - 26 October 2026 - Evidence review and corrections

- Audited the data structure for all 79 listed episodes and all 35 place dossiers; published review state, corrections and open research issues.
- Corrected lakeshore/Capernaum labelling for Jairus (Mark 5:21) and the paralytic (Mark 2:1); revised Caesarea Philippi as a district (Matthew 16:13; Mark 8:27), Bethphage donkey collection as inferred (Matthew 21:1-3), and John 20 multiple appearances (John 20:19-29).
- Added explicit qualification of the conflicting presentation of childhood, Nazareth synagogue, temple actions, Bethany anointing, the final meal and resurrection appearances.
- Added John 7:53-8:11 manuscript caution and referenced Matthew 15:29-38 for lakeshore context.
- Added public per-episode issue notes, source links, corrections register and research gaps to the map, with no claims of independent scholarly certification.
- Marked first-pass editorial audit delivered on roadmap and planned independent specialist review separately.

## 0.2.3 - 26 October 2026 - Historical place dossiers and project roadmap

- Added an archaeology and history study panel to every one of the 35 Gospel map markers.
- Distinguished ancient names, modern localities, OT historical associations, Gospel passages, archaeological source links and site-identification uncertainty.
- Added a separate Project roadmap page with filtering, expandable milestones, verified delivered work and prospective research priorities.
- Kept the 79-event itinerary, private GitHub / Cloudflare setup and existing Bible reader unchanged.
- Added test coverage for cross-source references, geography completeness, roadmap statuses and page navigation.

## 0.2.2 - 26 October 2026 - Journeys of Jesus map

- Added a separate Journeys of Jesus view with a self-hosted SVG map, draggable narrative timeline and playback.
- Catalogued 79 Gospel and Acts episodes across 35 known or uncertain locations with 155 primary passage citations.
- Added location filters, phase filters, zoom/pan, repeat-visit history and ESV reader links for each listed passage.
- Marked all approximate geography, uncertain site identification, inferred stops and narrative harmonisation explicitly.
- Preserved the existing Bible reader, Connection Atlas, guided studies, ESV API integration and site theme.

## 0.2.1 - 26 October 2026 - Expanded biblical cross-references

- Imported attributed OpenBible.info cross-references for the full Bible and made them available to the Connection Atlas.
- Corrected validation of compact cross-reference records and regenerated indexed reference data.
- Preserved source attribution and separated imported references from editorially curated connections.

## 0.2.0 - 26 October 2026 - Expanded Connection Atlas

- Enabled book, chapter and verse selection and exploration up to ten reference hops.
- Added bounded depth traversal, progress indicators and accessible layer-by-layer reference links.
- Linked numbered ESV verses directly to the Connection Atlas.
- Added neighbouring-verse context as a clearly distinguished fallback, without inventing a theological connection.
- Added the pinned, attributed OpenBible.info import workflow and links to approved study editions.

## 0.1.1 - 26 October 2026 - More reliable Bible reference parsing

- Removed duplicate Bible book alias keys to prevent conflicting Scripture reference lookups.

## 0.1.0 - 26 October 2026 - First Scripture Trails release

- Introduced Scripture reader, curated study paths, bookmarks and notes.
- Added the interactive Scripture connection map and cross-reference importer.
- Implemented Crossway ESV API proxies using server-side credentials.
- Configured private GitHub-based Cloudflare Pages deployment and CI checks.
- Limited Pages Functions routing to `/api/*` to preserve static asset delivery.

Live ESV passages and search require the `ESV_API_KEY` secret in Cloudflare Pages production settings.
