# Atlas explanation expansion - 30 October 2026

## Scope and counting method

The local OpenBible.info snapshot contains 603,076 directed, bidirectional navigation links, representing 301,538 distinct imported pairs. The previous 115 editorial records included 15 pairs not already in that imported dataset, for 301,553 distinct pairs in the union.

Before this batch: 115 explained pairs and 301,438 without explanations (0.038% explained).
After this batch: 161 explained pairs and 301,392 without explanations (0.053% explained).

These totals count unique undirected reference pairs, not graph edges rendered in a viewport. The 46 new records (ce116-ce161) were checked against locally stored reference shards and all belong to the imported dataset; they do not raise the total number of distinct pairs.

## Editorial scope

- Added 46 passage-specific reading aids with a connection kind, explanatory paragraph, interpretive caution and reading context.
- Rewrote ce027 (Genesis 3:15 / Romans 16:20) to describe the proposed serpent/defeat echo without claiming a direct quotation or certain authorial intent.
- Rewrote ce028 (Genesis 12:3 / Galatians 3:8) to explain Paul's use of the Abraham blessing and the possible combination of parallel Genesis formulations.
- Explicitly distinguish direct quotations from interpretive echoes and typological applications. Retain original audiences and contexts, such as Hosea 11:1's backward-looking reference to Israel's exodus and the textual difference between Amos 9:11 and Acts 15:16.
- Existing 115 dated citation reviews and linked secondary sources remain unchanged and available. The new 46 records are labelled `editorial-reading-aid` with separate dated external/source assessment outstanding. Their notes are not externally peer reviewed, and relative vote bars are not evidence confidence.

## Follow-up

Review the new entries in auditable batches, adding paired context, textual/translation variants, scoped academic commentary where available, source access limits and disagreement where relevant. Prioritise clear citations and strong narrative parallels. Keep the coverage denominator stable and do not turn community rankings into theological certainty.

## Verification

The release process should run `npm run release -- minor` using the current `package.json` version, `npm run build`, and browser regression tests. Validate the source counts, current version, both changelogs, About footer, GitHub checks and Cloudflare deployment before calling the release complete.
