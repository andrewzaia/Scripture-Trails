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
