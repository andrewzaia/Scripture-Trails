# Scripture Trails

A responsive, extensible Bible study website with in-page ESV, NASB20, NIV (2011) and NKJV translation selection. Follow passages and references, explore the interactive connection atlas, use six guided study journeys and retain bookmarks and notes locally.

Production address: <https://www.scripturetrails.com/>. The apex `scripturetrails.com` and HTTP requests redirect permanently to HTTPS on `www`, preserving the full path and query string, including passage and translation links. Cloudflare DNS points `www` to `scripture-trails.pages.dev`; a proxied originless apex record supports the zone redirect rule. The Pages custom domain is `www.scripturetrails.com`. Canonical and sharing metadata, `robots.txt` and the sitemap use this address.

The top-right header has separate, display-only ESV, NASB20, NIV and NKJV status rectangles. Each shows a small green circle followed by its edition acronym, turning the circle red only when a reading request identifies a problem. A retry keeps the last known colour until the request finishes; a successful response restores green. Accessible names and hover text describe availability without adding visible status labels. Translation selection remains in the Bible reader, with ESV as the default until the user chooses another edition. Each reading request updates only its own translation, and late responses cannot overwrite a newer result for that edition. Status is not stored across page loads, and no configuration check or provider polling is performed.

## What works now

- Journeys of Paul, covering three missionary journeys and the voyage to Rome: 83 Acts-linked stages, 43 approximate ancient place markers, regional/offshore gaps and an accessible timeline and list.

- Passage navigation across all 66 Protestant canonical Bible books, with chapter selectors and deep links such as `?view=reader&ref=John%203%3A16`.
- Official ESV text via Crossway, plus NASB20, NIV (2011) and NKJV via API.Bible when their server-side keys are configured.
- Translation selection preserves the exact verse, range or chapter, persists the preference on this device, and records the edition in shared links. Per-verse Atlas actions work across reader editions.
- ESV keyword search (10 results per query) through a server-side Cloudflare Pages Function.
- Starter reference network with editorial labels for quotations, parallels, echoes and themes.
- Interactive pan-and-zoom connection map, with one to ten levels of bounded verse-to-verse exploration. Hover over a node to light up the shortest visible route to the centre; the highlight follows the graph's shown links, not unrendered relationships.
- Six guided studies, saved passages, recent-history list and user notes.
- Responsive layout, keyboard-focus indicators, dark/light themes and accessible text alternatives for the graph.
- Clear separation of Scripture text, reference data and editorial interpretation.

The website deliberately **does not bundle the ESV text**. The official ESV API is available to eligible **non-commercial** sites subject to [Crossway's conditions](https://api.esv.org/). Without a configured key, passages link directly to ESV.org. The connection map and journeys still work with the starter references.

## Local development

Requirements: Node.js 22 or newer.

```bash
npm install
```

Obtain an ESV API token by creating an application at <https://api.esv.org/>. In the project root, create a `.dev.vars` file:

```ini
ESV_API_KEY=YOUR_CROSSWAY_API_KEY
API_BIBLE_KEY=YOUR_API_BIBLE_KEY
```

Run:

```bash
npm run dev
```

For a static-only preview, you can run `python -m http.server 8080 -d public`. The front-end features work, but requests to `/api/passage` and `/api/search` will display the ESV.org fallback.

**Do not place the API key in `public/`, client JavaScript, GitHub commits, or browser storage.**

## Cloudflare Pages deployment with private GitHub

Repository: `andrewzaia/Scripture-Trails` (private). Deploy the `main` branch through Cloudflare Pages Git integration.

The `wrangler.toml` file declares `scripture-trails` and sets `pages_build_output_dir = "./public"`. `public/_routes.json` limits Pages Functions invocation to `/api/*` and does not proxy static routes. Keep the project root at the repository root so `functions/` is discovered.

Cloudflare Pages build settings:

| Setting | Value |
| --- | --- |
| Project | `scripture-trails` |
| Git repository | `andrewzaia/Scripture-Trails` |
| Production branch | `main` |
| Framework preset | None |
| Root directory | `/` |
| Build command | `npm run build` |
| Build output directory | `public` |
| Node.js | `22` |
| Preview deployments | Disabled at initial rollout; enable intentionally if needed |

`npm run build` validates the source by running the automated tests. There is no asset compilation required for this static HTML and JavaScript website. Cloudflare automatically discovers the Pages Functions in `functions/api/`.

### ESV credentials

Obtain an ESV API key from <https://api.esv.org/> and configure `ESV_API_KEY` as an encrypted production Pages secret. Do not commit the key. Until configured, users can still explore curated references and follow official ESV.org links, but embedded ESV text and keyword search will not function. Check licence suitability before enabling any commercial features.

For testing the production release, visit `/api/passage?q=John%201%3A1` and `/api/search?q=faith`. Without a configured secret each endpoint should give a 503 JSON response containing `not_configured`. With a valid key, verify official response data and licensing conditions. These endpoints expose the ESV content but never reveal the key.

### API.Bible credentials and approved translations

In **Cloudflare > Workers & Pages > scripture-trails > Settings > Variables and Secrets**, add an encrypted **Production** secret named **`API_BIBLE_KEY`**. Use the API key issued for this application at <https://api.bible/>. Keep `ESV_API_KEY` for ESV. After adding or changing a Pages secret, redeploy the production build so the Functions receive it. No extra endpoint environment variable is needed: the server uses `https://rest.api.bible/v1`.

The fixed, approved mappings from the application owner's API.Bible access panel are:

| Translation | Bible ID | Publisher |
| --- | --- | --- |
| NASB20 | `a761ca71e0b3ddcf-01` | The Lockman Foundation |
| NIV (2011) | `78a9f6124f344018-01` | Biblica, Inc. |
| NKJV | `63097d2a0a2f7db3-01` | HarperCollins Christian Publishing |

Check `/api/passage?q=John%203%3A16&translation=NIV` after activation, then repeat for NASB20 and NKJV and a chapter such as `John%203`. Absent configuration returns `503 not_configured`. Invalid editions are rejected. Authorisation failures, unavailable verses and request limits receive explicit messages. An unavailable edition never silently substitutes ESV. Keyword search remains explicitly labelled ESV; opening a search result uses the selected reading edition.

The proxy validates references, requests one chapter or up to 30 selected verses, sets a 10-second upstream timeout, bounds upstream payloads to 1 MiB, and prevents credentials being forwarded through redirects. Responses are `no-store`; Bible text is never added to browser storage or bundled for offline access. Only the translation preference and personal study data are stored locally. Copyright HTML is filtered before display. Returned full copyright notices appear below every API.Bible passage and update the corresponding About entry for the current page session. Publisher and API.Bible attribution links remain visible.

API.Bible requires Scripture-view reporting. The client loads only fixed official FUMS trackers when an API.Bible passage is shown: current `fumsToken` reporting via `https://pkg.api.bible/fumsV3.min.js`, or legacy `fumsId` via `https://cdn.scripture.api.bible/fums/fumsv2.min.js`. Returned executable JavaScript is never used. The CSP permits those two scripts and their specific reporting hosts. About explains the anonymous device/session reporting. Ad blockers may prevent the provider's reporting.

Production verse and chapter retrieval was verified for NASB20, NIV and NKJV on 27 October 2026, including returned copyright and FUMS tokens. Re-check the API key and all three entitlements after future credential or access changes. Mock tests verify routing and failure handling, but cannot establish the validity of a real key or the publisher terms associated with the account. References are shared across editions while verse numbering may differ.

References: [API.Bible chapters](https://docs.api.bible/guides/chapters/), [passages](https://docs.api.bible/guides/passages/), [view reporting](https://docs.api.bible/resources/fair-use/), [terms](https://api.bible/terms-and-conditions).

### Security and deployment notes

A private GitHub repository does not make the Cloudflare `pages.dev` website private. Initial preview deployments are disabled to reduce the number of publicly accessible deployment URLs and avoid unintended ESV API quota usage. Configure Cloudflare Access if the site itself must be restricted. Review Cloudflare rate limiting options for `/api/*` if traffic or scraping becomes a concern.

CI runs the Node tests for pushes and pull requests. Cloudflare deploys successful updates to `main` through the Git integration. Do not configure a separate GitHub Actions deployment job on top of the Pages Git integration, as that can cause duplicate deployments.

Static hosting such as GitHub Pages **cannot run** the API Functions. With static hosting the site remains a reference explorer with direct ESV.org links unless you provide a suitable server-side API elsewhere.

## Locally stored OpenBible reference data

The Atlas loads reference files hosted with this site, without querying OpenBible.info or GitHub in a visitor's browser. The project also retains the unchanged original archive supplied by the site owner in `sources/openbible/cross-references.zip` and reviewed provenance/checksums in `sources/openbible/provenance.json`.

The 26 October 2026 source snapshot contains **344,799 reference rows**. All 344,799 unique source/target pairs match an official OpenBible download retrieved during verification. That retrieved download carries a 19 October 2026 header and differs in 3,525 vote counts; the archives are not byte-identical. Importing the supplied snapshot accepts **344,753 rows**, skips **46 invalid or self links**, and generates **603,076 directed navigation links** covering **30,303 source verses** in **66 book files**. Reverse navigation and deduplication explain the different row and link totals.

Rebuild entirely from the stored archive:

```bash
npm run import:refs
npm run check:refs
npm run build
```

No reference download is made by these commands. Importing the same source is deterministic. Production builds verify the archived source, generated file checksums, coverage and website tests. An explicit TSV or compatible single-file ZIP can still be passed using `npm run import:refs -- /path/to/source`; review and update provenance before replacing the default snapshot. Commit the source archive, provenance and generated shards together. The manual GitHub rebuild workflow uses the same local source.

**Attribution:** OpenBible.info Bible Cross-References, CC BY 4.0, based primarily on public-domain sources, especially the Treasury of Scripture Knowledge. [Original source](https://www.openbible.info/labs/cross-references/) and [licence](https://creativecommons.org/licenses/by/4.0/). Imported data normalises book IDs, validates verse counts, omits invalid or self links, clamps negative votes to zero, deduplicates destinations and adds reverse navigation. Range endpoints are retained while ranges are indexed by their first verse. These links are study aids, not independent proof of quotation, prophecy or interpretation.

The project policy in `AGENTS.md` prefers locally stored, versioned copies of reusable data and assets where redistribution is allowed. Public access alone does not grant republication rights. Licensed Bible text still uses its authorised API and required view reporting.

## Editorial conventions

- Scripture quotations must remain unaltered and display the selected edition's attribution and copyright.
- Descriptions of verse links are separate editorial commentary.
- `quotation` denotes a direct cited passage, while `theme` and `echo` are interpretative groupings. Some direct quotations can involve translation variants, and their surrounding context must still be read.
- A link is an invitation to study, **not proof** of a theological position or biblical date.
- New interpretative categories such as promise/fulfilment or typology should have source and reviewer metadata before being added to a public reference graph.
- All user notes and saved references are stored locally in the browser, not synced.

## ESV compliance and operational caveats

Crossway's official non-commercial API conditions include daily, hourly and minute request limits, maximum passage sizes, local caching restrictions and a copyright notice/link on any ESV display page. This application requests one chapter or a short verse range at a time. It does not deliberately cache ESV responses persistently; API responses are marked `no-store`. Do not add an offline ESV package or CDN caching without reviewing the licence and obtaining appropriate permissions. If you introduce ads, paid subscriptions, sponsorships or donation-oriented functionality, re-check Crossway's definition of non-commercial use before launch.

Crossway provides the reference content in the `/v3/passage/html/` response. The client-side renderer conservatively filters HTML tags and attributes, removes event handlers and retains only safe ESV.org links. The proxy never returns the ESV access key.

## Architecture

```text
public/
  index.html                    App shell and main views
  assets/books.js               66 books, parsing and chapter navigation
  assets/studies.js             Curated study journeys and reference annotations
  assets/graph.js               Canvas network visualiser
  assets/app.js                 UI state, notes, history, API integration
  assets/style.css              Theme and responsive interface
  data/refs/*.json              Optional per-book dataset generated by importer
functions/api/passage.js         Server-side ESV and approved API.Bible passage routing
functions/api/_api-bible.js      Bounded authenticated API.Bible retrieval
public/assets/translations.js   Approved editions and USFM reference mapping
public/assets/fums.js           Official API.Bible Scripture-view reporting
functions/api/search.js          Server-side authenticated ESV keyword search
scripts/import-crossrefs.mjs     Dataset importer, without copyrighted Bible text
tests/                          Built-in Node tests
```

## Roadmap

The canonical roadmap is [public/data/roadmap.json](public/data/roadmap.json), displayed on the [Project roadmap](https://www.scripturetrails.com/?view=roadmap). Reviewed on 28 October 2026 against the application through v0.20.0. It records 29 delivered implementation milestones and seven remaining or exploratory milestones. Historical expansion cards describe successive releases, not independent feature counts.

Delivered foundations include four reader editions, the local 603,076-link Atlas and passage comparison, 79 Jesus-journey episodes and 35 dossiers, five city studies, Gospel chronology comparison, the expanded people/events index, 83 Pauline stages, twenty person trails with 88 readings, and the private notebook with highlights, place links, backups, collections and schedules. This review also records the official-domain launch, Atlas path/preview improvements and release consistency safeguards as distinct delivered milestones.

| Order / track | Remaining milestone | Completion or decision gate |
| --- | --- | --- |
| Ongoing evidence | Further citation remediation and context review | Separately scoped batches address remaining place, trail and passage-pair source gaps |
| Next priority | Browser, mobile and accessibility release coverage | Critical flows run in CI; accessibility findings are triaged and manual keyboard/screen-reader checks recorded |
| Specialist availability | Independent historical, textual and nautical review | Actual named, dated specialist review of a declared scope; publish decisions and remaining disagreements |
| Later content | Kings, prophets and wider historical geography | Build on the first Hebrew Bible collection; audit each collection separately |
| Later content | Broader people, family and event relationships | Scope each expansion around new study needs and validate identity, passages, relationships and sources |
| Research | Original-language study | Resolve licensing, datasets, versification and a useful first-tool scope before implementation |
| Conditional research | Optional encrypted sync and accounts | Demonstrated need plus security, recovery, conflicts, deletion and cost design; no commitment yet |

The first Exodus/wilderness collection is delivered. Citation work and browser coverage now support further expansion. External review depends on suitable specialists and is not implied by editorial checks. Original-language tools and accounts have no committed delivery date. Preserve uncertainty, local licensed supporting data and publisher restrictions in every milestone. Do not describe a universal, settled biblical chronology or a fully classified cross-reference corpus as delivered.

## Licence

No universal open-source licence is assigned to this prototype. The ESV translation is separately copyrighted by Crossway; the optional OpenBible cross-reference data is CC BY 4.0. Do not assume all bundled and future content is covered by the same licence.

## Connection Atlas - extended reference network

The Atlas supports selecting any book, chapter and verse in the 66-book canon and exploring up to **10 hops** through the available cross-reference graph. The default is 3 hops. A bounded breadth-first display chooses a readable subset at each hop (up to 10 new verses per layer), rather than rendering every possible path and freezing the browser. Recenter on any node to continue the investigation. The accessible depth-list provides the same selected verses without using the canvas.

Reference sources are kept separate: editor-curated quotation, parallel, echo and theme labels; OpenBible.info community-ranked cross-reference data (CC BY 4.0, sourced mainly from the Treasury of Scripture Knowledge); and reading-context links, used only when a verse has no cross-reference. These context links **are not semantic connections**. Votes are a rough ranking, not a statement of authority. OpenBible multi-verse ranges are indexed to their first verse, with the original range retained in imported data. Some Bible versions differ slightly in versification.

**Reader editions** are ESV via Crossway and NASB20, NIV and NKJV via API.Bible. Publisher text is retrieved on demand using server-side credentials; the repository contains no Bible text. Translation-neutral reference links are not inaccurately described as coming from one translation. Future source-specific cross-references may be imported with permission and source-level attribution.

The expanded network comes from the OpenBible.info cross-reference dataset (CC BY 4.0). To regenerate from the stored snapshot without network access, run `npm run import:refs`. The repo includes chapter verse counts for navigation, derived from a public domain KJV dataset, used only for versification numbers, never Bible text. See [OpenBible.info](https://www.openbible.info/labs/cross-references/) and [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

## Atlas version 0.2

- Pick any of the 66 books, then an individual chapter and verse using per-chapter verse counts.
- Follow up to ten hops in a capped breadth-first sample, with an accessible hop-by-hop list and re-centre on any node. The cap is deliberate to avoid freezing mobile browsers on dense hubs.
- Each verse number in the selected reader edition has its own Atlas action.
- A missing reference triggers a **reading context** link to nearby verses, explicitly not a claimed biblical cross-reference.
- Reader editions: ESV (Crossway), NASB20, NIV and NKJV (API.Bible). Cross-reference relationships are translation-neutral unless their source specifically asserts otherwise.

### Importing real-world connections

The manual `Rebuild local Atlas references` GitHub Actions workflow imports the reviewed archive from `sources/openbible/`, validates all 66 files, and commits deterministic data only if it changes. It performs no third-party reference-data download. Update snapshots deliberately after reviewing provenance and reuse rights.

The corpus uses KJV-style chapter/verse metadata for navigation, which may differ from textual-variant decisions in the supported reader editions.

## Journeys of Jesus - historical Gospel map

The separate **Journeys of Jesus** page (`/?view=jesus-map`) is a self-hosted SVG interactive atlas with a draggable event timeline, step-by-step playback, eight narrative periods, location selector, repeat-visit index and citation links directly into the ESV reader. It has no third-party map scripts, trackers or map tile services, and follows the technical approach of the Assyrian Living Archive's historical map. The current release catalogues 79 distinct narrative episodes, 35 locations or broad regions and 155 cited Gospel / Acts passage references.

Source of truth: `public/data/jesus-journeys.json`. New map events require a stable ID, stage, named or regional location, a short factual summary, explicit Gospel/Acts references, and an evidence grade; approximate or disputed site placement also requires a caveat. All episode content is separate from the copyrighted ESV text. Selected references open in the chosen ESV, NASB20, NIV or NKJV reader edition.

**Accuracy constraints:** This is a narrative itinerary, not a measured walking route, an exhaustive travel diary, or a consensus day-by-day Gospel harmony. Multiple sources for a single event are grouped rather than counted as independent trips. Travel connectors are schematic straight lines. Locations such as Egypt (unidentified refuge), the desert temptations, Bethany beyond the Jordan, Cana, the site of the Transfiguration, Bethsaida and Emmaus cannot be pinpointed confidently. All regional and contested pins are explained to the reader. Biblical accounts are primary sources for reported actions, while identifying them with modern coordinates is a separate inference. Historic map context: [Biblica's Ministry of Jesus map](https://downloads.open.bible/maps/en/en_biblica_std/the_ministry_of_jesus.pdf), with the publisher retaining rights to that map. No third-party art is copied.

Use `node --test tests/jesus-map.test.mjs` to validate reference formats, place links, event grouping and uncertainty. On each change, verify desktop and mobile navigation and the interactive controls manually. This feature is designed for further expansion by adding cited episodes, not manufacturing geographic precision or treating all Gospel accounts as a single settled chronology.

## Historical place dossiers and project roadmap (October 2026)

**Journeys of Jesus** includes one historical study record for each of its 35 current places or regional markers. Select a pin, town or recorded episode, then scroll to **Biblical place dossier** beneath the journey map. It shows:

- Ancient and modern names / regional labels, with uncertainty for disputed sites.
- The historical context and any externally grounded archaeological evidence.
- Old Testament passages with an explicit description of how they relate to the place or wider region. They are not presented as records of Jesus' visit.
- All catalogued Gospel and Acts episodes and their Scripture references, opening the ESV reader when clicked.
- Independent external research links when one has been reviewed and attached; a clear evidence gap otherwise.
- A separate caution field explaining what the source does **not** establish.

The editable corpus is `public/data/jesus-geography.json` and the interface is implemented in `public/assets/jesus-map.js` and `public/assets/jesus-map.css`. The existing `public/data/jesus-journeys.json` remains the primary record of the 79 narrative episodes; no route order, number or citation was changed for this milestone. The new `validatePlaceStudies` function checks one-to-one place coverage and linked source IDs.

Historical reading uses a distinction between excavation of a town, traditional site identification and evidence for a **specific Gospel event**. A Roman-period settlement does not independently verify a narrated miracle, while a later church or pilgrimage tradition does not make a first-century house or hill certain. Reconstructed place names, historic routes and the Gospel harmonisation remain qualified throughout the interface. Third-party archaeology sources remain with their publishers and are linked rather than reproduced.

The new **Project roadmap** is a first-class navigation page at `/?view=roadmap`. Its content lives in `public/data/roadmap.json`; filters and expandable details use `public/assets/roadmap.js`. Its statuses are `delivered`, `next`, `planned` and `research`, with separate acceptance criteria and no promised delivery dates. The initial Gospel screening, five city studies and textual-order comparison are delivered. Remaining priorities and completion gates are listed in the Roadmap section above. Update the data when any milestone changes; do not mark an unimplemented feature as delivered. Edit existing cards rather than adding contradictory records. `tests/geography.test.mjs` and `tests/ui-structure.test.mjs` guard these features.

### Key independent source starting points

- UNESCO - [Bethlehem: Church of the Nativity](https://whc.unesco.org/en/list/1433/), [Jerusalem](https://whc.unesco.org/en/list/148/), [Jericho/Tell es-Sultan](https://whc.unesco.org/en/list/1687/), [Al-Maghtas](https://whc.unesco.org/en/list/1446), [Tyre](https://whc.unesco.org/en/list/299/).
- Israel Antiquities Authority - [Nazareth excavation report](https://publications.iaa.org.il/atiqot/vol98/iss1/3/) and [Magdala excavation report](https://publications.iaa.org.il/atiqot/vol90/iss1/7/).
- Ken Dark - [Archaeology of Jesus' Nazareth](https://academic.oup.com/book/45361), Oxford University Press (2023).
- [First-century Capernaum archaeological survey](https://rsc.byu.edu/ministry-peter-chief-apostle/simon-peter-capernaum-archaeological-survey-first-century-village) and [el-Araj Bethsaida excavation report](https://www.bethsaida-julias.com/season8report).

These studies contextualise the material remains; none should be cited as independently proving a supernatural event. Additional place-by-place publications and specialist review remain on the roadmap.


## Gospel and place evidence audit - initial release (26 October 2026)

The 79 Gospel and Acts episodes and 35 mapped place dossiers now include **initial, AI-assisted editorial screening** metadata. This is not a completed archaeological monograph, direct independent Bible translation verification of every event, or external expert peer review. No invented time, route or geolocation is implied by a timeline or schematic point.

- `public/data/jesus-audit.json` records the methodology, **9 specific editorial corrections**, **18 known interpretative/source issues**, source-page checks and the distinctions between `open`, `qualified` and `corrected` issues. These are all displayed in the journey map's evidence register.
- `public/data/jesus-journeys.json` retains primary Gospel or Acts citations and adds screening statuses to every event. `screened` means no specific issue has been flagged in this first pass; it is not a statement of historical proof. `qualified` and `needs-further-review` disclose unresolved problems.
- `public/data/jesus-geography.json` records whether each place has any attached independent literature, is a regional placeholder, or requires independent source discovery. A link to an archaeology report documents a site or physical evidence, not proof of a Gospel miracle.
- The major corrections include moving Jairus from Capernaum to an unspecified lakeshore, identifying Capernaum in Mark 2:1, treating Caesarea Philippi as a district, not specifying the donkey's source village as Bethphage, distinguishing John 20's two disciple appearances, and flagging the Last Supper calendar and anointing parallel issues.
- The roadmap records this **first editorial screening** as delivered while retaining a separate **independent specialist review** milestone as research. This avoids misleading users into assuming all passages have received scholarly signoff.

Sources used in the issue register include canonical verses opened via the site's licensed reader, Crossway's textual note to John 7:53-8:11, SIL Bible translation notes on Mark 5, reputable commentary, and academic work on Gospel chronology. Links within `jesus-audit.json` are external background sources, **not substitutes for the biblical text**.


## Historical City Studies - biblical geography milestone (26 October 2026)

A distinct navigable view `?view=city-studies&city=jerusalem` provides five expanded studies using one reusable data-backed rendering system: Jerusalem, Nazareth, Capernaum, Bethlehem and Jericho. Switch cities with keyboard-accessible tabs or use the deep-study link in the Journeys of Jesus map. Each study includes a primary Scripture passage register, five broad historical periods, four individually qualified material-history findings, a modern-coordinate orientation diagram with selectable points, open research questions and independently linked institutional or scholarly sources. A separate interactive comparison discusses alternative locations proposed for Cana, Bethsaida and Emmaus without asserting any one as definitive.

Data: `public/data/city-studies.json` (5 cities, 40 biblical references, 25 historical periods, 20 evidence cards, 15 bibliography sources and 7 disputed candidate points). Code: `public/assets/city-studies.js` and `city-studies.css`. Tests: `tests/city-studies.test.mjs`.

**Source hierarchy:** Biblical passages are primary for what the texts say; external evidence supports only the independent archaeological or historical claim for which it is cited. Later pilgrimage monuments are not identified as the original first-century event settings. The existence of Bronze Age Jericho and late Roman Capernaum architecture does not independently establish Joshua 6 or an individual Gospel miracle. Sites and candidate coordinates are modern orientation aids, not ancient city polygons or travel paths.

**Modern images:** The five city photographs are served from `public/assets/city-photos/`. Their Commons source pages, authors, licences, original download hashes, local hashes and changes are recorded in `credits.json` and city metadata. Photos are resized without cropping and re-encoded as WebP; their original licences still apply, including applicable share-alike conditions. No Wikimedia image request is required to open a city study. External source and licence links remain for verification. The combined local image payload is about 1.02 MB. The CSP permits local images and mandatory API.Bible reporting hosts.

This milestone is an **editorial research release**. External specialist peer review and disputed-site adjudication are still outstanding and separately tracked on the roadmap. No additional copyrighted Bible text is bundled in the data or JavaScript.

## Public changelog and versioning

The website version is recorded in `package.json` and shown in the footer. The public About page reads `public/data/releases.json`. The full technical history remains in `CHANGELOG.md`. Historic release notes retain their dates, but only previously recorded version numbers are shown.

For each website update, run `npm run release -- patch "Public heading" "Short public summary"` before committing. Choose `minor` for new backward-compatible features and `major` for breaking changes. Additional quoted arguments become further public changelog bullets. This command synchronises `package.json`, public release notes, footer version, asset cache keys and the developer changelog.

`npm run build` checks that the version and public release history agree. When Git parent history is available, it also rejects code-changing commits without an increased version. GitHub CI fetches the previous commit so these checks are enforced. Semantic impact is chosen by the developer; the system will not guess whether a change is major, minor or patch. Documentation-only and test-only edits need no website release.

## Gospel-by-Gospel narrative chronology comparison (27 October 2026)

Journeys of Jesus provides a combined editorial study sequence and individual Matthew, Mark, Luke and John textual-order views. Each account view selects entries with an explicit citation for that book and sorts them by the first cited chapter and verse. This is **literary order within an existing 79-entry catalogue**, not a dated historical chronology or an exhaustive synopsis of all Gospel material. When an account view is active, speculative map travel connectors are hidden. Place dossiers still cover the wider combined catalogue.

The public comparison metadata in `public/data/gospel-chronology.json` flags disputed or possibly shared episodes without claiming two independently proven visits: the Nazareth rejection, temple action, Bethany anointing and differing call of fishermen narrative order. Every comparison links the canonical passages and relevant research publications. External research confirms interpretive issues, not a definitive timeline, and full specialist peer review remains uncompleted.

The pure `gospelSequence` and `validateGospelChronology` functions live in `public/assets/gospel-chronology.js`; `tests/gospel-chronology.test.mjs` exercises independent ordering, evidence links, interface structure and roadmap status. Future scholarship should expand coverage by source-critical review rather than treating every cross-Gospel resemblance as a confirmed parallel.

### Academic follow-up (27 October 2026)

The public evidence register also links the Nazareth ordering issue to Crawford's Oxford University Press chapter (2018), and the general Synoptic-order method to Tyson's article in *New Testament Studies*. The Capernaum synagogue entry is explicitly associated with the fishermen's-call sequence issue, since Mark 1:16-28 and Luke 4:31-5:11 present these accounts in different order. The original first-pass audit date is preserved; `jesus-audit.json` separately records the later bibliographic update. An academic publication discussing a method or a similar textual pattern is not independent historical confirmation of a particular incident, and editorial review is not peer review.

## Academic accuracy and citation integrity (27 October 2026)

The Atlas seven-bar display represents OpenBible.info source vote scores normalised to the strongest listed link from the selected verse. OpenBible.info says these scores combine initial weighting from other datasets and reader votes; they **do not** indicate independent academic confidence, historical proof, or a probability that an interpretation is correct. Reverse navigation links are generated locally and are not additional independent citations. Source: [OpenBible.info cross-references](https://www.openbible.info/labs/cross-references/) and its [2010 methodology explanation](https://www.openbible.info/blog/2010/04/new-in-labs-cross-references/).

The local 66-book KJV-style verse-count metadata is now used by `validateCanonicalReference` to check verse addresses and cross-chapter ranges across the 79 journey episodes, academic issue register, comparative passages, five city studies, 35 geographic dossiers, editorial links and six guided study paths. This is **reference-address validation**, not an evaluation of historical claims or manuscript variants. The public evidence register now states how many outstanding issues lack a linked secondary academic source. The original first-pass audit date and external-peer-review caveat remain unchanged.

## People, Places and Events Index - v0.5.0

The local `public/data/biblical-people.json` introduces 25 Gospel profiles with explicitly disambiguated homonyms, associated passages, editorial episode pointers and source-linked person-to-person relationships. `public/assets/entity-index-data.js` joins these curated profiles with **all 35** existing historical place dossiers and **all 79** Jesus journey entries at runtime; it does not fork or duplicate those original datasets. The interactive index supports free-text and reference searches, filters, deep links (`?view=entities&type=person&id=peter`, `?view=entities&type=place&id=capernaum`), access to the Bible reader, the Atlas, the Gospel journey map and the five city studies.

The index is not a full 66-book concordance. People and events beyond the initial Gospel-focused catalogue will be added only with source references and disambiguation; a search omission is not a claim that the Bible lacks an entity. Biblical narrative citations are primary literary witnesses, not independent archaeological or biographical attestation. Place archaeology citations substantiate only their own stated material-history scope. An indexed association with an event is not proof that a person is named in every verse of the event's passage. The evidence register's open scholarly questions remain open.

## Hebrew Bible Index expansion - v0.6.0

The Scripture Index now combines its existing 25 Gospel profiles, 35 Gospel-place dossiers and 79 mapped episodes with a separate locally versioned `public/data/biblical-history.json` of 43 additional Hebrew Bible people, 14 sites/regions/political polities and 31 narrative events. The browser reads these data files locally and builds an integrated index, without cloning Gospel primary records. Search by person, political designation, biblical reference or associated event; switch between all records, Hebrew Bible and Gospel content. Historical entries never gain a fictitious point on the Gospel Jesus map.

**Editorial evidence boundary:** Biblical citations describe the claims of their respective texts, not independent historical verification. Some episodes are prophetic or literary narratives. The source list links to a small, specifically scoped selection of independent museum material: the Assyrian Sennacherib prism concerning Hezekiah's tribute, the palace reliefs of Lachish, the Black Obelisk with tribute associated with Jehu, a royal Babylonian building inscription and a museum analysis of the Cyrus Cylinder. None should be treated as direct evidence of every episode, miracle, speech or court narrative. A polity is not a fixed surveyable border. The expanded index is still incomplete and externally unreviewed. See `tests/biblical-history.test.mjs` for reference, relation and category regression checks.

## People index expansion and discovery - v0.7.0

The Bible Index now extends the original 68 people with 105 curated, passage-linked figures, bringing the total to 173. These selected entries include named figures from Genesis, the monarchy and exilic prophets through the Gospels, Acts and Pauline letters. `public/data/biblical-people-expanded.json` holds the additions without replacing the existing Gospel or historical dossiers. People/Places/Events and Hebrew Bible/New Testament filters remain available. Featured links make Hezekiah, David, Solomon, Moses, Paul, Esther and Assyria directly selectable, and the interface explains a zero-result search caused by category filters. Assyria is a historical polity recorded in Places, not a person.

Module, stylesheet and JSON cache keys are advanced through the regular `npm run release` script, so new versions do not accidentally mix old index code and new data. The index continues to distinguish textual testimony from independent historical corroboration and does not claim all biblical people have been covered.

## Passage evidence in the Connection Atlas - v0.8.0

`public/assets/connection-evidence.js` provides 24 selected passage comparisons. Each has a quoted, parallel, echoed, typological or thematic relation, an explanatory summary, original-reading context and explicit limitation. The comparison is internal editorial screening, not independent specialist review. The 603,076 local OpenBible.info links remain intact and are **not automatically classified**. Community vote bars continue to show relative source ranking only.

The Atlas right panel includes a list filter for explained or unclassified links and expandable evidence details with both passage readers. Person profiles in the index show associated explanations when their own indexed Scripture citation ranges overlap a reviewed verse anchor. A link into an episode or passage does not imply the person occurs in every verse; historical and textual expert review remains pending.

## Deep Scripture Connections (v0.9.0)

A curated register of **115 passage-pair editorial comparisons** spans the initial 24 internally passage-screened items and 91 further editorial reading aids. Both statuses are deliberately distinguished from independent specialist assessment. Each record is verse-anchored and contains an explanation, context pointer and caution. The large local OpenBible.info archive is not automatically relabelled or treated as scholarly confidence.

The Atlas offers an on-demand side-by-side comparison reader using the existing server-side ESV and API.Bible integrations. Both panels use the chosen available licensed translation and display translation attribution; API.Bible Scripture views are reported through the existing FUMS implementation. HTML is sanitized by the application's existing allowlist, not inserted directly. No verse content is checked into Git or cached in the Atlas. Individual passage failures show an error without preventing the other passage from rendering. It also supports swapping, retrying and jumping to each passage or wider context.

The original eight People Index trails cover Abraham, Moses, David, Solomon, Hezekiah, Esther, Paul and Jesus, plus links from relevant editorial comparisons. The library now has twenty trails, described in the person-centred trails section below. Trails are structured reading aids, not settled reconstructions of historical chronology, and source claims await outside scholarly review. Both modules and their dependencies use the site's semantic-version cache-busting process.

## Journeys of Paul

Open [the Pauline map](https://www.scripturetrails.com/?view=paul-map) for three conventional journey groupings in Acts 13-21 and the voyage to Rome in Acts 27-28. The page follows the existing Jesus-map interaction and theme, with journey/place filters, narrative timeline, previous/next and manual playback, keyboard and pointer pan/zoom, repeat-visit navigation, reader/Atlas actions and People Index links. Deep links retain `paul-journey` and `paul-stop`.

All 83 stages are listed, including 22 stages without a geographic pin. Forty-three rounded Pleiades representative points provide approximate orientation; regions, unnamed settings and offshore passages receive no invented coordinates. Connectors join adjacent mapped stages within one journey only, never crossing unpinned gaps or journey boundaries. Natural Earth land polygons give low-resolution modern coastal orientation without political borders. Neither markers nor lines establish precise event sites, ancient roads, sailing tracks or travel distances.

The source and uncertainty register covers the conventional journey divisions, regional Galatia language, Acts 18:22, Greece/Corinth, island and offshore distinctions, Trogyllium and provisional Derbe/Lystra locations. Dates and letter-composition chronology are not reconstructed. The voyage to Rome is delivered as a separate selection. Independent specialist review is not claimed.

Local datasets: `public/data/pauline-journeys.json` and `public/data/pauline-coast.json`. Credited, pinned location metadata and transformation notes: `sources/pauline/`. Node tests validate references, marker/source alignment, narrative boundaries and provenance; production checks must also verify mobile/desktop navigation and the deployed version.

## Voyage to Rome

Journeys of Paul includes a separate Voyage to Rome selector for Acts 27-28: 22 stages, ten additional credited place markers, and unpinned sea, storm and wreck settings. This prisoner transfer is not a fourth missionary journey. Caesarea embarkation is qualified as inferred from the preceding custody narrative. Phoenix, Adramyttium and Alexandria are not plotted as reached destinations. Malta uses island-scale orientation only. The map now extends west to Italy; connectors remain schematic and break at unlocated stages. All 61 earlier stages retain their identifiers.

## Notebook backups

My notebook provides local JSON export and import for saved references and personal notes. Backups carry the `scripture-trails-notebook` format identifier. Current exports use schema version 5; versions 1 to 4 remain supported as import formats. Files are limited to 2 MiB, 300 saved references and 2,000 notes (50,000 characters per note). Files are parsed locally without upload. Backups are unencrypted; user notes may contain private information or text the user entered. No publisher passage text is fetched or automatically included.

Import previews additions, identical entries and conflicts, preserving existing notes by default. Each conflicting note has an explicit replacement choice. Invalid schemas, references and oversized merged collections are rejected. A single `scripture-trails:notebook` localStorage entry becomes authoritative on the next save or import; existing legacy notes and bookmarks are read without deletion. Import storage failures leave the persisted notebook unchanged. Stale previews and changes observed in another tab require a fresh preview or reload. Recent reading, preferences, credentials and unsaved note drafts are outside the backup.

## Study journey reading progress

The six existing Study journeys offer optional, self-reported passage checklists, completion indicators and a resume-next-unread action. Opening a passage does not mark it read. Reset requires a separate confirmation and affects only that plan. Progress uses the same local notebook snapshot, with storage failure and stale-tab checks before writes. These short editorial passage sequences are not a whole-Bible or calendar schedule.

Reading progress was introduced in backup schema version 2 as `readingPlans`, mapping the six plan IDs to completed references. Current exports use schema version 5 and preserve support for earlier import formats. Import merges completion sets, reports additional completions in preview and never clears current completions. Older clients cannot necessarily import newer schemas; use the current website for new backups. Verse highlights, structured annotations, custom collections and calendar schedules are delivered; see the sections below.

## Linked observations and highlights

My notebook has an annotation workspace for up to 1,000 linked notes (20 passage links and ten tags each). Existing single-passage reader notes remain separate and unchanged. Create, edit and confirm deletion of linked notes; filter annotations by passage, note text, tag or highlight colour. The reader provides a single-verse highlight control with amber, green and blue choices plus removal. Highlights wrap displayed verse text, retain publisher text, and carry visible colour labels. They follow canonical reference keys across editions, not character offsets; edition versification can differ. No Bible text is automatically copied into annotation records.

Annotations were introduced in backup schema version 3 and are included in current schema version 5 exports. Version 1 and 2 imports preserve current annotations; same-ID linked note changes and same-verse colour changes require explicit replacement choices. Existing values are kept by default. Unknown references, colours, duplicate IDs and oversized annotation collections are rejected. Storage writes preserve notes, bookmarks and progress together and reject stale snapshots. Backups remain unencrypted and local. Earlier schema versions are import formats; use the current site to import new exports.

## Custom study collections and schedules

My notebook supports up to 50 named, ordered collections of up to 100 passages each. Start with a guided study or enter canonical references separated by semicolons. An optional date and selected weekdays assign one passage per reading day. Schedule dates are fixed; missed readings remain due until explicitly completed. Dates use the device calendar. Collections are local and have independent progress from the original guided studies. Editing a collection retains completion for passages that remain in it. Deletion requires confirmation.

Collections and schedules were introduced in notebook backup schema 4 and are included in current schema version 5 exports. Versions 1 to 3 remain supported and preserve existing collections. Matching collection definitions union completion; conflicting definitions retain the current collection unless the user selects replacement. Replacement uses the backup collection, including its completion. No Bible text is stored in backups, no reminders are sent and no account is required.

## Place-linked private observations

My notebook accepts observations linked to passages, indexed places/regions, or both. Place choices reuse the 49 existing Gospel and Hebrew Bible index records; a private link is a study pointer, not a new geographic or historical claim. Place buttons open the source-qualified index profile, and each profile can open its matching private notes. Opening a place filter preserves any current draft; linking the filtered place to that draft is explicit. Filters combine place, annotation type, text/aliases, tag and highlight colour.

Notebook schema 5 includes place links. Versions 1 to 4 remain supported, preserving existing place-linked notes unless an identified conflict is explicitly replaced. Place-only notes require schema 5. A conflict preview includes changed place links. The registry is generated with `node scripts/build-note-places.mjs`; CI tests verify that it matches the existing place datasets.

## Person-centred Scripture trails

Study journeys includes a searchable directory of 20 person-centred trails, with 88 selected readings. The original eight trails retain their 40 anchors. Twelve further figures add 48 contextual passage ranges: Ruth, Hannah, Samuel, Elijah, Elisha, Jeremiah, Daniel, Nehemiah, Mary the mother of Jesus, Peter, John the Baptist and Barnabas. Search names, topics or references and filter Hebrew Bible / New Testament coverage.

The directory opens the existing disambiguated profile. Each stage displays its primary Scripture reference and editorial review label, plus reader and starting-verse Atlas actions. Cautions distinguish selected reading sequences from full biographies, harmonised chronologies, settled denominational interpretations or independent historical proof. The editorial method, primary-text reading links and access limitations are documented in `sources/person-trails/README.md`. Independent specialist review remains pending.

## Hebrew Bible geography: Exodus and wilderness

The [Hebrew Bible geography collection](https://www.scripturetrails.com/?view=hebrew-geography) contains 25 selected readings from Exodus 1 to Deuteronomy 34, ending with Moses in Moab. Five reading sections, a search field, previous/next controls and shareable `hb-stage`, `hb-phase` and `hb-q` parameters provide a complete list interface. Read actions use the chosen licensed Bible edition; Atlas actions use the starting verse. Related study profiles reuse existing person/place identities.

The 15 setting records include regions and grouped settings. They have no coordinates, invented routes or event dates. Five expandable comparison panels address the Delta cities, sea crossing, Horeb/Sinai, Kadesh and selected chronological models. Seven supporting source records distinguish excavation projects, a report catalogue, a heritage record, a scholar's essay, a research thesis and a publisher's study introduction. Their access notes say what was actually consulted. No source supplies independent signoff for the collection.

Data: `public/data/hebrew-geography.json`. Interface: `public/assets/hebrew-geography.js` and `.css`. Method, source access and open review tasks: `sources/exodus/README.md`. Tests reject invalid references, unqualified geometry/dates, broken source/profile links and incorrect restored/filter selections. Release tooling updates the page's module and stylesheet cache keys. The collection is selective; it is not a complete Numbers 33 camp list or all Hebrew Bible geography.

## Citation review: first declared batch

The About page and affected studies expose 43 dated assessments: 18 Gospel issues, 13 places, four Nehemiah readings and eight explained pairs. `public/data/citation-review.json` is the source register; `node scripts/import-citation-review.mjs` regenerates its browser module. Only original editorial assessments are bundled. Publisher text remains external. Four place bibliographies gain scoped sources; nine assessed dossiers still lack external archaeological support. Two comparisons of related but different events use thematic labels. The other 107 explained pairs retain existing labels without a new assessment. Independent specialist review remains outstanding.

## Scientific and archaeological citation expansion

Seven additional research/project sources support five place assessments and two new city-study findings. Reviewed coverage is now 45 records, including 15 place dossiers. Radiocarbon claims distinguish sample age, calibration and event attribution; Bethany catalogue access is explicitly limited. Six of the original thirteen assessed place dossiers retain missing-bibliography warnings. This does not complete site-wide citation remediation or independent specialist review.

## Six geography citation gaps: v0.22.0

Eight external research records now support Sychar/Jacob's Well, the eastern lakeshore, the unnamed Transfiguration mountain, Ephraim, Bethphage and Emmaus. Existing 45 assessments and geographic confidence labels are preserved. The declared six-record bibliography gap is addressed; this is not adjudication of disputed places. Sources distinguish human-remains dates from the age of a well, later Kursi remains from a Gospel landing, medieval Tabor remains from a first-century event, and Vespasian's Emmaus from Luke's setting. Ephraim proposals have different historical scopes. Full-paper access and comparative source review remain explicit follow-ups.
