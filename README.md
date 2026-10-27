# Scripture Trails

A responsive, extensible Bible study website with in-page ESV, NASB20, NIV (2011) and NKJV translation selection. Follow passages and references, explore the interactive connection atlas, use six guided study journeys and retain bookmarks and notes locally.

Production address: <https://www.scripturetrails.com/>. The apex `scripturetrails.com` and HTTP requests redirect permanently to HTTPS on `www`, preserving the full path and query string, including passage and translation links. Cloudflare DNS points `www` to `scripture-trails.pages.dev`; a proxied originless apex record supports the zone redirect rule. The Pages custom domain is `www.scripturetrails.com`. Canonical and sharing metadata, `robots.txt` and the sitemap use this address.

The top-right header has separate, display-only ESV, NASB20, NIV and NKJV status rectangles. Each shows a small green circle followed by its edition acronym, turning the circle red only when a reading request identifies a problem. A retry keeps the last known colour until the request finishes; a successful response restores green. Accessible names and hover text describe availability without adding visible status labels. Translation selection remains in the Bible reader, with ESV as the default until the user chooses another edition. Each reading request updates only its own translation, and late responses cannot overwrite a newer result for that edition. Status is not stored across page loads, and no configuration check or provider polling is performed.

## What works now

- Passage navigation across all 66 Protestant canonical Bible books, with chapter selectors and deep links such as `?view=reader&ref=John%203%3A16`.
- Official ESV text via Crossway, plus NASB20, NIV (2011) and NKJV via API.Bible when their server-side keys are configured.
- Translation selection preserves the exact verse, range or chapter, persists the preference on this device, and records the edition in shared links. Per-verse Atlas actions work across reader editions.
- ESV keyword search (10 results per query) through a server-side Cloudflare Pages Function.
- Starter reference network with editorial labels for quotations, parallels, echoes and themes.
- Interactive pan-and-zoom connection map, with one to ten levels of bounded verse-to-verse exploration.
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

1. Source a reviewed, complete dataset of reference edges and add provenance, confidence and editorial review status per connection.
2. Add study annotations, structured notes, verse highlights and user-managed reading plans.
3. Add canonical biblical chronology, historical maps and people/place indexes with source documentation and competing date models where relevant.
4. Support original language tools and textual notes with separately licensed lexical datasets.
5. Optionally enable account sync with a proper authentication and privacy design. No account system exists in this version.
6. Add browser E2E and accessibility tests in CI, with live ESV API testing against a permitted test key and conservative rate limits.

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

The new **Project roadmap** is a first-class navigation page at `/?view=roadmap`. Its content lives in `public/data/roadmap.json`; filters and expandable details use `public/assets/roadmap.js`. Its statuses are `delivered`, `next`, `planned` and `research`, with separate acceptance criteria and no promised delivery dates. The next priorities are an event-by-event evidence audit, deeper fully documented city research and alternative Gospel chronology views. Update the data when any milestone changes; do not mark an unimplemented feature as delivered. Edit existing cards rather than adding contradictory records. `tests/geography.test.mjs` and `tests/ui-structure.test.mjs` guard these features.

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
