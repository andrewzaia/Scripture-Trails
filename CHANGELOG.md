# Changelog

## 0.44.23 - 02/11/2026: Publisher rights acceptance and Safari verification

- Record the project owner's qualified non-commercial publisher-rights acceptance and ongoing licence obligations.
- Document native Safari desktop reflow checks while retaining physical-device and native Safari zoom acceptance as open.

## 0.44.22 - 01/11/2026: Accessible navigation between study sections

- Move keyboard and screen-reader focus to the active section heading when navigating across study pages.
- Preserve initial page focus, Skip to content, passage navigation and mobile navigation behaviour.

## 0.44.21 - 01/11/2026: Publisher view reporting and recovery readiness

- Report API.Bible Scripture views when returning to a cached passage.
- Document successful live production rollback and restoration in the v1.0 readiness roadmap.

## 0.44.20 - 01/11/2026: Owner-led scholarly review and verified launch readiness

- Record the project owner's scholarly and editorial approval of published Scripture study content, without requiring a second professor or external specialist.
- Recognise independently evidenced live production checks for the four Bible editions, Atlas, notebook and publisher usage reports, while retaining the final-candidate recheck.
- Update the v1.0 readiness roadmap, evidence records and tests to show twelve of seventeen acceptance criteria met, leaving rights, physical accessibility, rollback and final approval open.

## 0.44.19 - 01/11/2026: Reliable Bible publisher usage reporting

- Use the API.Bible-documented reporting pixel when displaying licensed translations, replacing browser requests that failed to reach the publisher.
- Permit only the publisher's FUMS image endpoint in the restrictive image security policy, without adding external JavaScript or exposing private notebook data.
- Prevent cached reporting images from suppressing repeated Scripture-view reports, with anonymous per-view nonces and cross-browser tests using synthetic Bible content.

## 0.44.18 - 01/11/2026: Accessible Scripture reader publisher links

- Remove invisible unnamed anchors returned in publisher Scripture markup, avoiding an unnecessary keyboard focus stop in the Bible reader.
- Preserve accessible names on intentionally labelled links and retain trusted publisher destinations, existing passages and attribution.
- Add cross-browser regression coverage using synthetic text, without copying copyrighted Scripture into tests.

## 0.44.17 - 01/11/2026: Accurate people readings and efficient release verification

- Expand Moses' departure and Solomon's ark-entry readings to include the narrated actions, preserving all stable people trails.
- Keep Chromium, Firefox and WebKit mandatory for pull requests while eliminating redundant browser installations after strictly checked main merges.
- Add regression tests for canonical reading ranges and fail-closed release gates under permitted and rejected GitHub event states.

## 0.44.16 - 01/11/2026: Clearer chronology and passage boundaries in Gospel journeys

- Clarify that two Nazareth hometown-rejection study stages present Gospel narratives, not a historically proven second visit.
- Keep crucifixion summaries within their cited Scripture ranges, leaving subsequent burial arrangements in the existing burial study stage.
- Add targeted regression tests to protect passage accuracy, stable event references and the required research qualifications.

## 0.44.15 - 01/11/2026: More accurate Gospel geography source references

- Correct Nain's archaeological report date to its official 2022 journal citation and add precise bibliographic details.
- Use the original excavation director's institutional Sidon study to improve provenance and replace an intermittently inaccessible project link.
- Preserve existing Scripture references and location uncertainty while adding regression tests for the cited research.

## 0.44.14 - 01/11/2026: More precise Nazareth Annunciation evidence

- Link the specific archaeological chapter and sacred-site history behind Nazareth's Annunciation study, with transparent source attribution.
- Clarify the difference between commemorative tradition, excavation records and an independently confirmed biblical event location.
- Add regression tests that validate study citations across the city findings, chronology and detailed interpretation.

## 0.44.13 - 01/11/2026: Contextual readings for journals and people trails

- Add five missing biblical context readings to guided journals, retaining previous progress entries and approximate study times.
- Extend Abraham, David and Paul person trails to include their narrated events, and clarify the Abrahamic covenant sign.
- Add source-qualified regression tests for canonical ranges, saved progress, and editorial review labels; keep full v1 scholarly review open.

## 0.44.12 - 01/11/2026: Consistent sources for disputed Gospel locations

- Add named et-Tell, el-Araj and Emmaus archaeological and textual research links to the Gospel audit, using references already verified in the historical-city studies.
- Cross-check both source registries and require complete descriptive link labels; preserve unresolved identifications and independent review requirements.
- Protect source provenance and rendered audit links through content and browser regression tests.

## 0.44.11 - 01/11/2026: Better evidenced Last Supper chronology

- Correct an indirect Gospel audit citation to cite primary Gospel Passover distinctions and three directly relevant peer-reviewed historical chronology analyses.
- Display descriptive named links for academic audit sources, retaining the open historical interpretation and independent-specialist review requirement.
- Reconcile four older people-trail reference findings confirmed resolved in v0.44.4, with browser and data regression coverage.

## 0.44.10 - 01/11/2026: Emmaus evidence and v1 launch acceptance tooling

- Clarify the competing Luke 24 Emmaus distances, historical Josephus readings and location uncertainty with traceable academic and Bible commentary references.
- Add a read-only versioned production HTML, roadmap, changelog and asset verification command and focused offline regression tests without copying publisher Bible text.
- Publish an honest eight-blocker v1 launch evidence ledger and Cloudflare rollback procedure, retaining all mandatory acceptance gates and source/browser CI checks.

## 0.44.9 - 01/11/2026: Balanced archaeological evidence for Bethsaida

- Provide candidate-specific excavation citations for et-Tell and el-Araj, including 2025 Roman-period field reports, while explicitly retaining the disputed Gospel identification.
- Protect source integrity and interactive selection with unit and browser tests, distinguishing excavated material from excavation-team interpretations.
- Run the full browser matrix only after successful source and build checks, retaining complete coverage and the required release gate.

- Pre-parse Playwright test files in the inexpensive source/build job so malformed tests fail before the browser runners start.

## 0.44.8 - 31/10/2026: Site-specific archaeology for Cana candidates

- Add separately attributed archaeological sources for Kafr Kanna and Khirbet Qana, keeping the uncertain identification of Cana and the limits of archaeology explicit.
- Update the historical-city comparison to display sources for the highlighted proposal, while retaining the general geographical index and validating candidate citations.
- Add source-integrity and browser navigation regression tests for the proposed locations.
- Report the source/build and browser-matrix results explicitly in the GitHub release gate, retaining its fail-closed behaviour and regression coverage.

- Cancel superseded pull-request validation runs automatically, retaining all required browser and source checks for the final PR commit.

## 0.44.7 - 31/10/2026: Clearer archaeological chronology for Jericho

- Qualify the 1995 Tell es-Sultan radiocarbon calibration as provisional, distinguish cereal and charcoal results, and avoid attributing the dated destruction to the events or actors narrated in Joshua 6.
- Link to the original Radiocarbon publisher record and DOI, retaining source rights and the distinction between Bronze Age and Gospel-era Jericho.
- Add regression coverage protecting the archaeological dating caveats.

## 0.44.6 - 31/10/2026: Maintainable GitHub Actions and safer Atlas rebuilds

- Move CI to Node 24-compatible action versions and pin Ubuntu 24.04 during the Ubuntu 26.04 transition, retaining full Chromium, Firefox and WebKit validation.
- Prevent direct unversioned Atlas reference changes from being pushed to main; require the normal versioned pull-request checks.
- Add workflow regression tests for action versions, supported runners and release safeguards.

## 0.44.5 - 31/10/2026: Clearer source passages for biblical people

- Widen Abraham's call to include the promise in Genesis 12, Hezekiah's letter to include his prayer in 2 Kings 19, and Paul's Rome account to include Acts 28:31.
- Protect the nine corrected passage ranges with regression tests while retaining existing study text and source qualifications.

## 0.44.4 - 31/10/2026: More precise Scripture passages in people trails

- Expand six study references for Abraham, Moses, David and Hezekiah to include the verses that support their full stage descriptions.
- Preserve the existing study notes, reading pathways and editorial qualifications.
- Isolate Chromium, Firefox and WebKit browser tests in separate CI runners, using single-worker test execution to reduce resource contention without dropping accessibility assertions.

## 0.44.3 - 31/10/2026: Cross-browser accessibility verification

- Expand automated regression testing to Chromium, Firefox and WebKit across desktop and mobile device profiles.
- Improve light-theme contrast of Historical Cities controls and wait for stable theme transitions during accessibility audits.
- Allow Firefox accessibility scans to complete without suppressing any WCAG checks.

## 0.44.2 - 31/10/2026: Bible publisher permissions and source-rights transparency

- Expand the About attribution section with direct publisher terms and clear statements distinguishing functioning translation APIs from independent licence approval.
- Review ESV, NASB20, NIV and NKJV conditions, including NIV eligibility and NKJV audience limits, and record source-linked rights questions that still require verified publisher agreements.
- Audit local OpenBible cross-reference provenance and credits for five hosted historical-city photographs with a repeatable source-rights evidence register.
- Add direct publisher attribution links to both Atlas comparison columns and clarify Scripture Trails' non-commercial academic purpose.

## 0.44.1 - 31/10/2026: Security and privacy: safer Scripture access

- Remove executable API.Bible usage-tracker scripts, replacing them with the documented privacy-conscious FUMS v3 GET while preserving required publisher usage reporting.
- Harden Crossway search redirects, stalled requests, excessive responses and malformed results, and tighten site CSP and referrer protections.
- Add scoped Cloudflare rate limiting for public Scripture APIs, security regression coverage and a transparent documented threat model with outstanding privacy and publisher-rights qualifications.

## 0.44.0 - 31/10/2026: Notebook recovery: protect personal study data

- Detect unreadable browser notebook storage and show accessible recovery guidance instead of silently treating stored notes as missing.
- Allow private download of original damaged data and explicitly confirmed restoration from a validated backup, without deleting original storage before a successful replacement.
- Expand multi-tab, quota and corrupt-data regression tests and document the limits of locally stored notes that have never been backed up.

## 0.43.1 - 31/10/2026: Bible reader: verified four editions and safer provider failures

- Verify live ESV, NASB20, NIV and NKJV passage delivery, visible publisher notices and safe failure-and-recovery paths with reproducible no-text logging checks.
- Harden the Crossway integration against redirects, excessive responses, malformed payloads and network timeouts, matching existing API.Bible protections.
- Close two evidence-backed v1 reader provider criteria while preserving separate open publisher permissions, wider security, accessibility and launch verification requirements.

## 0.43.0 - 31/10/2026: Study journeys: shareable pathways and reliable navigation

- Keep guided study journal choices in validated, reload-safe URLs, with browser Back and Forward returning to the same pathway.
- Preserve the previous history entry when following a person trail and retain saved reading progress when moving between journeys and the reader.
- Expand automated navigation checks across all six study journals, twenty person trails, 79 Gospel stages, 83 Pauline stages and historical city links.

## 0.42.0 - 31/10/2026: Gospel geography: candidate sites and evidence clarity

- Compare competing archaeological identifications for Bethsaida, Emmaus, Magadan and Sychar, with a separate evidence-limits assessment of Gethsemane tradition.
- Add five named academic references and source-specific claim, evidence and uncertainty notes visible in historical place dossiers.
- Preserve twelve regional placeholders without invented site citations and leave independent specialist verification and v1.0 launch checks open.

## 0.41.0 - 31/10/2026: Gospel journeys: substantive Scripture study for every event

- Add 79 original Gospel episode study contexts and 156 connected canonical reading references across the entire journey.
- Document the disputed census and Herod-era dating, Mark's transmitted ending and Luke-Acts ascension variants using bounded publisher and academic sources.
- Preserve the Gospel geography and chronology warnings while leaving independent specialist review and remaining v1.0 acceptance criteria open.

## 0.40.0 - 31/10/2026: All Pauline journeys: complete Scripture study depth

- Add original Acts-based context and connected reading passages to the remaining 44 third-journey and Rome-voyage stages, completing all 83 Pauline studies.
- Explain Spirit-related Jerusalem warnings and preserve distinctions between reached harbours, offshore passages, planned ports and unknown wreck sites.
- Add scoped academic and commentary sources while leaving independent specialist review and the remaining v1.0 acceptance criteria open.

## 0.39.0 - 31/10/2026: Paul's first and second journeys: deeper Scripture study

- Add original biblical reading context and relevant Scripture links to all 39 stages of Paul's first two missionary journeys.
- Clarify the uncertain Berea-to-Athens route with a source-linked academic geographic assessment and preserve location cautions.
- Keep the 44 later Pauline stages and remaining v1.0 editorial acceptance checks explicitly open.

## 0.38.0 - 31/10/2026: Biblical journey evidence and route clarity

- Clarify the Bethsaida and Gennesaret crossing with a named academic source and directly linked Gospel passages.
- Distinguish named locations from inferred routes in the Jericho, ascension and Pauline itinerary notes.
- Expand Scripture-linked research cautions for Paul's island crossings, planned harbour, storm drift and Malta arrival.

## 0.37.0 - 31/10/2026: Deeper people trails and guided Scripture journals

- Expand all 20 people trails with substantial literary context, comparison readings, reflection questions and explicit evidence limitations.
- Add sixty validated follow-up Bible references linking directly to the Reader and Atlas, while preserving all 88 established stages.
- Introduce six extended reading guides for creation, Messiah, shepherd imagery, covenant, faith and works, and biblical hope, preserving 36 journal stages, reading progress and approximate study times.
- Add bounded academic source references for historical claims about Esther and Daniel and automated/browser checks for content quality and continuity.
- Record this flagship-content audit batch without prematurely closing the wider v1.0 content and independent specialist verification gates.

## 0.36.0 - 31/10/2026: Deeper Scripture and history in five flagship city studies

- Add fifteen substantive Scripture-first historical readings for Jerusalem, Nazareth, Capernaum, Bethlehem and Jericho, each with primary passage links, historical context and documented evidence boundaries.
- Correct the Nazareth excavation report's publication year from 2025 to 2020 and distinguish later pilgrimage traditions, dated ruins and archaeological contexts from specific Gospel event locations.
- Add desktop/mobile and data-integrity regression coverage for all five city essays, including precise source citations and preservation of previously supported navigation.
- Record the scoped city-content v1.0 audit and keep the wider people, journey, security and academic-review gates open until genuinely verified.

## 0.35.0 - 31/10/2026: Complete source assessments for 161 Atlas explanations

- Assess the final 34 previously unreviewed Atlas passage connections in two dated Scripture-context batches, with named sources and specific interpretation limits.
- Document original contexts, composite quotations and Hebrew or Greek textual issues for typological and prophetic connections, including Hosea, Amos, Daniel and the Passover narratives.
- Complete scoped internal editorial source-review coverage for all 161 written Atlas explanations, while preserving all 115 historical reviews and keeping independent academic signoff separate.
- Update the public About evidence meter, version 1.0 readiness dashboard and regression checks to distinguish reviewed explanations from the much larger unclassified Atlas corpus.

## 0.34.0 - 31/10/2026: Twelve source-assessed Atlas quotation connections

- Assess twelve additional biblical quotation connections with paired Scripture contexts, named scholarly commentary and explicit textual or interpretive limits.
- Increase the Atlas citation review register from 115 to 127 explained pairs while retaining all earlier source assessments and historical notes.
- Display 34 newer explanations still awaiting assessment in the About source register, Atlas evidence labels and roadmap to version 1.0.
- Clarify that routine verification is handled through available automated and connected tools, while physical-device and independent specialist evidence are never asserted without actual access.

## 0.33.0 - 30/10/2026: Version 1.0 readiness roadmap and release gates

- Introduce a dedicated Road to v1.0 section with five public acceptance gates and 17 measurable requirements covering evidence, content, accessibility, privacy and launch verification.
- Publish a transparent baseline of four scoped automated criteria met and 13 outstanding criteria, with actionable next steps and a proposed release sequence.
- Prevent a v1.0 launch while required conditions remain open, and validate editorial citation gaps, evidence records and release-readiness consistency in website builds.
- Improve cache versioning for the public roadmap stylesheet, and add automated and browser regression coverage for readiness reporting.

## 0.32.0 - 30/10/2026: Deeper Atlas Scripture connections and transparent coverage

- Explain 46 additional Bible-to-Bible connections with passage-specific reasoning, source context, relationship types and interpretive cautions; expand the annotated Atlas from 115 to 161 pairs.
- Strengthen two previously generic explanations about Genesis 3:15 / Romans 16:20 and Genesis 12:3 / Galatians 3:8 without overstating quotation or authorial intent.
- Show distinct Atlas pair coverage on the About dashboard: 301,553 total pairs, 161 explained and 301,392 without explanations, separately from 603,076 directional navigation links.
- Preserve all 115 dated historical citation reviews and clearly distinguish the 46 newly added editorial reading aids that still need separate source review.

## 0.31.1 - 29/10/2026: Study journey time estimates restored

- Restore approximate study-duration ranges to all six expanded study journeys, visible on journey cards and inside the detailed journals.
- Base the estimates on the current six-stage reading pathways rather than outdated short-study durations, with a clear reminder that each journal is self-paced.

## 0.31.0 - 29/10/2026: Expanded Scripture study journals and guided reading pathways

- Expand all six study journals to 36 contextual stages with more than 200 curated reading entries and direct links into the Bible reader and connection map.
- Add stage-by-stage reading rationale, textual connections, contextual interpretation cautions and focused reflection questions.
- Keep original study anchors and locally saved reading progress compatible while making the full reading checklist expandable.

## 0.30.0 - 29/10/2026: Commentary follow-ups for all explained connections

- Read dated, attributed commentary follow-ups for the 32 previously passage-based assessments, with exact source locators and access limits.
- See scoped secondary citations for all 115 explained pairs in About and the Atlas, alongside the preserved earlier assessments and cautions.
- Keep competing interpretations, indexed-only and handbook-excerpt limits, fuller literature and independent specialist review visible.

## 0.29.1 - 29/10/2026: Keyboard and mobile accessibility repairs

- Keep keyboard focus in the visible destination when opening passages, searching Scripture and using browser history, with clear current-navigation and section labels.
- Use a mobile navigation drawer with an accessible close button, contained keyboard focus, background interaction control and reliable close and resize behaviour.
- Read enlarged city-study text without page overflow, supported by expanded browser accessibility checks and a roadmap that keeps human screen-reader and device review open.

## 0.29.0 - 29/10/2026: All 115 explained connections assessed

- Read the final seven royal, siege and returnee-list comparisons with paired passage contexts and scoped named commentary.
- See all 115 explained connections covered by dated editorial assessments on the About dashboard and roadmap, with 83 supported by commentary or limited publisher summaries and 32 based on passage checks.
- Keep differing accounts, dates and list figures visible, with fuller source work and independent specialist review still open.

## 0.28.0 - 29/10/2026: Twenty prayer, faith, hope and Hezekiah reviews

- Read twenty more explained connections with paired passage contexts and scoped commentary from seventeen works by sixteen named authors.
- Keep prayer forms, Acts retellings and Hezekiah narratives distinct, and identify the Revelation anchors as parts of one vision.
- See 108 of 115 explained connections assessed on the About dashboard and roadmap, with seven remaining and independent review still open.
- Keep the optional analytics asset refreshed automatically with each website release.

## 0.27.1 - 29/10/2026: Persistent production analytics configuration

- Activate the dedicated Scripture Trails GA4 measurement destination in Cloudflare Pages production configuration.
- Keep the public measurement ID in the deployment's Wrangler source of truth so rebuilds cannot silently remove it.
- Preserve production-only domain restrictions, visitor consent, and existing licensed Bible provider credentials.

## 0.27.0 - 29/10/2026: Privacy-conscious website analytics

- Prepare an optional Google Analytics 4 integration exclusively for the official Scripture Trails domain, with a separate owner-configured measurement ID.
- Keep study activity private: analytics is off until visitors opt in, and site sections are measured without sending Bible references, search text, personal notes or highlights.
- Add hostname and consent tests, a Cloudflare Pages configuration endpoint, and instructions for enabling a dedicated GA4 property.

## 0.26.0 - 29/10/2026: Twenty Old Testament narrative reviews

- Compare twenty more Samuel, Kings, Chronicles and Isaiah narratives with paired reading contexts, named commentary and explicit differences.
- Follow scoped citations to six commentaries by four authors, with indexed-excerpt access limits clearly recorded.
- See 88 of 115 explained connections assessed on the About dashboard and roadmap, with 27 remaining and independent review still open.

## 0.25.0 - 29/10/2026: Twenty more source-backed Scripture connections

- Add dated assessments for twenty creation, shepherd, renewal, Law, mission and salvation comparisons, bringing review coverage to 68 of 115.
- Link each new comparison to two passage contexts and named commentary, with fifteen readable scholarly sources and claim-specific access notes.
- Replace generic explanations with attributed readings while retaining distinct settings, thematic labels and unresolved textual or theological questions.
- Update About and the roadmap: 68 assessed pairs, 47 still outside the dated register, and 36 with commentary or limited publisher-summary support. Independent specialist review remains open.

## 0.24.1 - 29/10/2026: Safer notebook saves and accessible study navigation

- Protect open linked-note and collection drafts from overwriting reviewed imports, and keep stale reader notes or saved-passage actions from overwriting another tab's changes.
- Improve light-theme contrast, match accessible names to visible labels, underline source links and announce the selected Gospel episode.
- Add a keyboard skip link, Escape-to-close mobile navigation, reliable navigation and Gospel episode focus, and accurate theme-switch labels.
- Check core reading, Atlas, maps, roadmap and notebook journeys automatically on desktop and mobile, with accessibility scans in both themes.
- Distinguish delivered automated browser coverage from outstanding manual screen-reader and real-device review in the roadmap.

## 0.24.0 - 28/10/2026: About dashboard and deeper connection reviews

- Explore the study library at a glance with a compact About dashboard showing dataset-backed Atlas, people, trail, edition and journey statistics.
- Add named scholarly commentary to twelve existing connection assessments, with source scope and remaining research limits.
- Compare twenty further Gospel and Acts passage pairs, bringing dated connection coverage to 48 of 115 while preserving account differences.
- Clarify the composite Mark citation and manna comparison, and keep dashboard totals and citation batches validated during releases.

## 0.23.0 - 28/10/2026: Twenty more Scripture connections explained

- Add passage contexts, source links and interpretive cautions for 20 further Scripture connections, bringing the citation register to 28 of 115 connections.
- Clarify composite quotations in Matthew 2 and Luke 4, distinguish quotations from echoes and themes, and correct two connection labels.
- Add scoped academic or commentary support for five connections while keeping source-access limits and the remaining 87 connection reviews visible.
- Open reviewed connections in the Atlas at their actual anchor verse.

## 0.22.0 - 28/10/2026: Sources for six disputed geography settings

- Add eight excavation and academic source records for Sychar, the eastern lakeshore, the Transfiguration mountain, Ephraim, Bethphage and Emmaus.
- Distinguish dated human remains, later settlement evidence and scholarly proposals from verified Gospel event locations.
- Address the six declared bibliography gaps while retaining disputed identifications, source-access limits and further comparative review.

## 0.21.1 - 28/10/2026: Revalidate updated research datasets

- Revalidate city-study and Gospel research data when loading, so returning browsers receive the updated source records and consistent audit metadata.

## 0.21.0 - 28/10/2026: Scientific and archaeological source expansion

- Add seven research and excavation/project sources across Gethsemane, Mount of Olives, Bethany, Jerusalem and Jericho.
- Explain radiocarbon sample ages, calibration limits, medieval olive-tree dates and the distinction between material context and event identification.
- Add two source-qualified city-study findings and expand the dated register to 45 assessments, with catalogue-only and abstract-only access clearly labelled.

## 0.20.0 - 28/10/2026: Citation coverage and editorial evidence review

- Inspect 43 dated assessments covering 18 Gospel issues, 13 places, four Nehemiah readings and eight passage comparisons.
- Open claim-level sources, access notes and retained warnings beside affected studies and in the downloadable About-page review register.
- Add scoped bibliography for Cana, Nain, Sidon and Caesarea Philippi, close four Nehemiah passage-access gaps and correct two thematic connection labels.
- Mark the first citation batch delivered, retain further source remediation and move browser, mobile and accessibility coverage to the next roadmap priority.

## 0.19.0 - 28/10/2026: Exodus and wilderness geography

- Explore twenty-five selected Exodus and wilderness readings in the new Hebrew Bible geography page.
- Search fifteen setting records, share reading selections and open the Bible reader, Atlas and existing study profiles.
- Compare five location and chronology topics using seven supporting sources with explicit access notes and evidence limits.
- Mark the first collection delivered and move citation review to the next roadmap priority; leave exact routes, coordinates and event dates unassigned.

## 0.18.2 - 28/10/2026: The study behind Scripture Trails

- Describe about fifteen years of comprehensive personal Scripture study across the Old and New Testaments.
- State the Bible as the project's authoritative foundation, supported by manuscript research, archaeology and historical context, with continued learning and review.

## 0.18.1 - 28/10/2026: Roadmap review and remaining milestones

- Record the official-domain launch, Atlas path and preview improvements, and versioned release safeguards as delivered milestones.
- Clarify the eight remaining or exploratory milestones, with Hebrew Bible geography next and distinct citation, specialist-review and browser/accessibility work.
- Align roadmap priorities and completion criteria with the delivered notebook, schedules and twenty person-centred trails.

## 0.18.0 - 28/10/2026: Twenty person-centred Scripture trails

- Explore twelve further biblical figures in a searchable directory of twenty person-centred Scripture trails.
- Read forty-eight additional contextual passages with source and review labels, identity distinctions and interpretation cautions.
- Open each trail from Study journeys and follow its passages in the Bible reader or starting-verse Atlas.

## 0.17.0 - 28/10/2026: Place-linked observations and notebook organisation

- Link private observations to passages, existing places and regions, or both.
- Filter notes by place and annotation type, and move between place profiles and your private notes without losing a draft.
- Include place links in version 5 notebook backups while supporting older files and previewing conflicting links.

## 0.16.1 - 28/10/2026: Reliable live version and changelog display

- Keep the footer tied to the loaded website release and prevent cached changelog data from showing an older version.

## 0.16.0 - 28/10/2026: Custom study collections and reading schedules

- Create ordered passage collections from guided studies or your own references.
- Choose a start date and reading days, resume unread passages and track completion locally.
- Include collections and schedules in version 4 notebook backups, with older-backup support and conflict previews.

## 0.15.4 - 28/10/2026: Consistent People and Places page spacing

- Align the People, places and events content with the page gutters used elsewhere, including tablet and mobile spacing.

## 0.15.3 - 28/10/2026: More spacious highlight field labels

- Add space above the verse-reference and highlight-colour labels, with a small gap before each field.

## 0.15.2 - 28/10/2026: Reader and changelog layout refinements

- Add spacing between the highlight colour selector and Save highlight button.
- Remove the Discover-only navigation number for consistent menu labels.
- Align changelog dates and version badges in consistent columns, with a compact layout on small screens.

## 0.15.1 - 28/10/2026: Voyage to Rome evidence notes

- Correct the third-journey scope note to distinguish the separately available Voyage to Rome.
- Include Acts 27:17-26 in the voyage uncertainty register so the storm-drift discussion has its supporting passage link.
- Track outstanding independent review, exact unpinned settings and source-file responsibilities in sources/pauline/voyage-to-rome-review.md; retain all existing geographic qualifications.

## 0.15.0 - 28/10/2026: Linked notes and verse highlights

- Save tagged observations linked to multiple passages and manage them in My notebook.
- Highlight whole verses in amber, green or blue, with colour labels and reference-based persistence across reader editions.
- Filter linked notes and highlights by passage, text, tag or colour.
- Include annotations in version 3 backups while preserving older imports and previewing conflicting entries.

## 0.14.0 - 28/10/2026: Study journey reading progress

- Track completed passages in the six guided study journeys and resume the next unread passage.
- Save progress locally with explicit completion choices and confirmation before resetting a plan.
- Include progress in version 2 notebook backups, while supporting older imports and preserving existing completions.

## 0.13.0 - 28/10/2026: Private notebook backups

- Download saved passages and personal notes as a versioned JSON backup without uploading them.
- Preview new entries, duplicates and conflicting notes before importing; keep existing notes unless replacements are selected.
- Validate backup files and passage references, with safe handling of storage failures and stale previews.

## 0.12.0 - 28/10/2026: Paul's voyage to Rome

- Added a separate Voyage to Rome option with 22 passage-linked stages in Acts 27-28.
- Extended the map to Italy with credited location markers, Malta wintering and reader, Atlas and index links.
- Kept offshore passages, the storm and the shipwreck unpinned, with explicit source and location limitations.

## 0.11.2 - 28/10/2026: Consistent journey names

- Renamed Paul's journeys to Journeys of Paul across navigation, map labels, index links and the roadmap to match Journeys of Jesus.

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
