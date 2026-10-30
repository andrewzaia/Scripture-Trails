# v1.0 flagship content audit - initial inventory (31 October 2026)

## Scope and provenance

Repository source inspection of `public/assets/studies.js`, `public/assets/person-trails.js` and `public/data/roadmap.json` on the main branch at v0.44.2. This is an **initial structural inventory**, not a completed passage-by-passage textual audit, an external source verification, a live navigation test, or independent specialist approval. Keep `content-audit` OPEN.

## Six guided journals

| Journal ID | Stages | Reading entries |
| --- | ---: | ---: |
| creation | 6 | 36 |
| messiah | 6 | 38 |
| shepherd | 6 | 36 |
| covenant | 6 | 37 |
| grace | 6 | 36 |
| comfort | 6 | 36 |
| **Total** | **36** | **219** |

The 219 entries count stage-specific reading occurrences, not unique canonical references. One reference, `James 2:14-26`, occurs more than once in the Grace journal. **Finding J-01 (low, open):** inspect whether the repetition serves distinct study questions; preserve deliberate revisits, or remove unnecessary repetition only after reviewing context. Do not automatically deduplicate.

## Twenty people trails

| Person ID | Stages | Additional Scripture references | External research links |
| --- | ---: | ---: | ---: |
| abraham | 5 | 3 | 0 |
| moses | 5 | 3 | 0 |
| david-king | 5 | 3 | 0 |
| solomon-king | 5 | 3 | 0 |
| hezekiah | 5 | 3 | 0 |
| esther | 5 | 3 | 1 |
| paul-apostle | 5 | 3 | 0 |
| jesus | 5 | 3 | 0 |
| ruth-moabite | 4 | 3 | 0 |
| hannah-samuel | 4 | 3 | 0 |
| samuel-prophet | 4 | 3 | 0 |
| elijah | 4 | 3 | 0 |
| elisha | 4 | 3 | 0 |
| jeremiah | 4 | 3 | 0 |
| daniel | 4 | 3 | 2 |
| nehemiah-governor | 4 | 3 | 0 |
| mary-mother | 4 | 3 | 0 |
| peter | 4 | 3 | 0 |
| john-baptist | 4 | 3 | 0 |
| barnabas | 4 | 3 | 0 |
| **Total** | **88** | **60** | **3** |

**Finding P-01 (information, open):** eighteen of twenty trails have no optional external research links. This is *not* automatically a defect. All stages declare `primary-scripture` sources and editorial reading-aid status. Assess individual external historical or geographical assertions before requiring new literature. Never add token citations merely to satisfy a count.

## Pre-existing safeguards observed

- Person trails have a canonical reference validator, duplicate-person and duplicate-stage checks, stage length limits and minimum study-text requirements.
- All twenty trails state an editorial qualification instead of claiming complete, independently reconstructed biographies.
- Journal stages have passage readings, a connection, a question and contextual notes.
- The v1 roadmap explicitly requires a **substantive** content/navigation review and records `content-audit` as OPEN.

## Work still required before signoff

1. Read all 219 journal reading occurrences against their actual passages and confirm interpretive scope, cross references and contextual cautions.
2. Read all 88 people-stage notes against the cited passages, checking namesakes, chronology, identity and ungrounded inferences.
3. Check journey and person deep links, keyboard paths, state/history preservation and dead ends in browser tests.
4. Record per-claim corrections, source evidence, and severities; resolve critical defects. Follow with the city and itinerary batches in Issue #67.
5. Any public site change requires an independent correctly versioned release using `npm run release`, matching changelogs, full CI and deployment verification. Do not combine with unmerged PR #66 indiscriminately.

This document alone is a repository editorial record. It does not change public website content or satisfy the v1.0 acceptance gate.


## Batch 2 - canonical address screening and claim-to-verse precision (31 October 2026)

**Method:** inspected the current `studies.js`, `person-trails.js`, `books.js` and `verse-counts.json` files. Reproduced the repository's book/chapter/verse boundary rules in an independent, read-only script for 219 journal reading entries, 88 person-trail stage addresses and 60 person-study further references. Supported the following claim-level observations with publisher-hosted biblical passages. These are *source-address checks and a focused textual comparison*, not a claim to have exegetically certified every one of the 367 cited items. No browser flows, full Node tests, screen readers, historical specialist review or production passages were tested in this batch.

| Check | Result | Qualification |
| --- | --- | --- |
| Journal reading addresses | 219 / 219 in chapter/verse bounds | Chapter-only selections are intentional; numerical validation does not establish accurate contextual interpretation |
| People-trail stage addresses | 88 / 88 in bounds | Content of individual stage summaries requires textual comparison |
| People-trail further references | 60 / 60 in bounds | Includes supported singular `Psalm` alias |
| Duplicate Grace reading | Deliberate revisit | `James 2:14-26` serves `Abraham in three arguments` (stage 2) and `Bringing the tensions into focus` (stage 6). **J-01 closed: retain both**; they ask distinct questions |
| External study links | 3 in person-trail research arrays | Optional for Scripture-only summaries; P-01 remains informational, not a release blocker |

### Confirmed citation-scope improvements - public changes deferred until versioned release

These are **content precision** findings, not broken references. The named anchor currently opens a valid passage, but only a nearby verse or wider range supports the whole published stage note. Correcting the anchor avoids giving readers an unnecessarily narrow proof-text.

| Finding | Stage | Current reference | Proposed replacement | Reason | Status |
| --- | --- | --- | --- | --- | --- |
| P-02 | Moses: burning bush and commissioning | `Exodus 3:2` | `Exodus 3:2-10` | 3:2 describes the bush; God's sending Moses to Pharaoh is explicit in 3:10 | Open - requires versioned website change |
| P-03 | Moses: commandments at Sinai | `Exodus 20:1` | `Exodus 20:1-17` | Verse 1 introduces the speech; the commandments follow in verses 2-17 | Open - requires versioned website change |
| P-04 | Abraham: death and burial | `Genesis 25:8` | `Genesis 25:8-10` | Death occurs in verse 8, while burial is narrated in verses 9-10 | Open - requires versioned website change |
| P-05 | David: house and successor | `2 Samuel 7:12` | `2 Samuel 7:12-16` | Verse 12 introduces the successor; the enduring royal house is developed in verses 13-16 | Open - requires versioned website change |

Publisher passage references, link only, no copied ESV text retained:

- Crossway, [Exodus 3:10](https://www.esv.org/verses/Exodus%2B3%3A10/) (commissioning).
- Crossway, [Exodus 20:1-17](https://www.esv.org/verses/Exodus%2B20%3A1%E2%80%9317/) (full commandments).
- Crossway, [Genesis 25:8-10](https://www.esv.org/Gn25.8-10/) (death and burial).
- Crossway, [2 Samuel 7:12-13 and 7:16](https://www.esv.org/2%2BSamuel%2B7%3A12%E2%80%9313%3B2%2BSamuel%2B7%3A16/) (descendants and royal house).

**Release dependency:** PR #66 remains a separate, unfinished cross-browser release, and its source gate requires Semantic Versioning. Do not introduce competing patch versions against the same baseline or silently edit the published site. Make the four people-trail address corrections as one scoped PATCH release after resolving the production release ordering, run the existing `npm run release`, and verify all required checks and Cloudflare deployment. These four findings do not justify marking `content-audit` met; substantive per-stage verification, city dossiers, itinerary stages and browser navigation remain open.
