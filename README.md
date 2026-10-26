# Scripture Trails

A responsive, extensible Bible study website designed around the English Standard Version (ESV). Follow passages and references, explore the interactive connection atlas, use six guided study journeys and retain bookmarks and notes locally.

## What works now

- Passage navigation across all 66 Protestant canonical Bible books, with chapter selectors and deep links such as `?view=reader&ref=John%203%3A16`.
- Official ESV passage display and verse-by-verse cross-reference callouts when the Crossway ESV API is configured.
- ESV keyword search (10 results per query) through a server-side Cloudflare Pages Function.
- Starter reference network with editorial labels for quotations, parallels, echoes and themes.
- Interactive pan-and-zoom connection map, with one to ten levels of bounded verse-to-verse exploration.
- Six guided studies, saved passages, recent-history list and user notes.
- Responsive layout, keyboard-focus indicators, dark/light themes and accessible text alternatives for the graph.
- Clear separation of Scripture text, reference data and editorial interpretation.

The website deliberately **does not bundle the ESV text**. The official ESV API is available to eligible **non-commercial** sites subject to [Crossway's conditions](https://api.esv.org/). Without a configured key, passages link directly to ESV.org. The connection map and journeys still work with the starter references.

## Local development

Requirements: Node.js 20 or newer.

```bash
npm install
```

Obtain an ESV API token by creating an application at <https://api.esv.org/>. In the project root, create a `.dev.vars` file:

```ini
ESV_API_KEY=YOUR_CROSSWAY_API_KEY
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

### Security and deployment notes

A private GitHub repository does not make the Cloudflare `pages.dev` website private. Initial preview deployments are disabled to reduce the number of publicly accessible deployment URLs and avoid unintended ESV API quota usage. Configure Cloudflare Access if the site itself must be restricted. Review Cloudflare rate limiting options for `/api/*` if traffic or scraping becomes a concern.

CI runs the Node tests for pushes and pull requests. Cloudflare deploys successful updates to `main` through the Git integration. Do not configure a separate GitHub Actions deployment job on top of the Pages Git integration, as that can cause duplicate deployments.

Static hosting such as GitHub Pages **cannot run** the API Functions. With static hosting the site remains a reference explorer with direct ESV.org links unless you provide a suitable server-side API elsewhere.

## Expand to 340,000+ external cross-references

The included links are a small **editorially curated starter dataset**, not comprehensive full-Bible coverage.

To add broader references:

1. Download the original cross-reference archive from <https://www.openbible.info/labs/cross-references/>.
2. Extract the `cross_references.txt` TSV file, retaining the copyright/attribution from the source archive.
3. Run `node scripts/import-crossrefs.mjs ./cross_references.txt`.
4. Commit the 66 generated `public/data/refs/*.json` files after reviewing source provenance and sizes. The files are git-ignored by default to prevent accidentally committing a large dataset; force-add only after approval, e.g. `git add -f public/data/refs/*.json`.
5. Verify sample connections against the original dataset, and confirm the file format before relying on any counts. The importer writes both directions for navigation and deduplicates each target.

**Attribution:** OpenBible.info Bible Cross-References, CC BY 4.0, primarily derived from the public-domain Treasury of Scripture Knowledge. <https://www.openbible.info/labs/cross-references/>. Dataset-derived links are labelled `dataset`, not automatically classified as quotations, messianic prophecies or theological conclusions. If you import this dataset, preserve this attribution in the site's About page and documentation.

## Editorial conventions

- Scripture quotations must remain unaltered and display ESV attribution and copyright.
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
functions/api/passage.js         Server-side authenticated ESV passage retrieval
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

**Permitted study editions** are ESV, NASB 2020 and LSB. The in-site reader serves the ESV using the official Crossway API. Links lead to the official NASB 2020 and LSB readers; the app neither scrapes nor redistributes those copyrighted texts. Translation-neutral reference links are not inaccurately described as coming from one translation. Future source-specific cross-references may be imported with permission and source-level attribution.

The expanded network comes from the OpenBible.info cross-reference dataset (CC BY 4.0). To regenerate locally, download the official TSV and run `npm run import:refs -- /path/to/cross_references.txt`. The repo includes chapter verse counts for navigation, derived from a public domain KJV dataset, used only for versification numbers, never Bible text. See [OpenBible.info](https://www.openbible.info/labs/cross-references/) and [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

## Atlas version 0.2

- Pick any of the 66 books, then an individual chapter and verse using per-chapter verse counts.
- Follow up to ten hops in a capped breadth-first sample, with an accessible hop-by-hop list and re-centre on any node. The cap is deliberate to avoid freezing mobile browsers on dense hubs.
- Each verse number in an ESV chapter has its own Atlas action.
- A missing reference triggers a **reading context** link to nearby verses, explicitly not a claimed biblical cross-reference.
- Study editions: ESV (displayed via Crossway), NASB 2020 and LSB (linked to official readers; text not republished). Cross-reference relationships are translation-neutral unless their source specifically asserts otherwise.

### Importing real-world connections

The `Refresh atlas cross-references` GitHub Actions workflow downloads a **SHA-256 pinned** OpenBible.info CC BY 4.0 archive snapshot from the `trekhleb/bible-cross-references` public source repository, imports it into 66 shards and checks that the result is complete. The workflow is deliberately not run on every build. It commits only the derived reference JSON, never any Bible translation text. If the source changes, manually update the pin after verifying provenance and licence.

The corpus uses KJV-style chapter/verse metadata for navigation, which may differ from textual-variant decisions in ESV/NASB/LSB.
