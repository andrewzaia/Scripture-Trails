# OpenBible.info source snapshot

`cross-references.zip` is the unmodified archive supplied by the site owner, containing `cross_references.txt` with the source date 26 October 2026. It contains reference identifiers and votes, without Bible translation text.

Source: https://www.openbible.info/labs/cross-references/
Download: https://a.openbible.info/data/cross-references.zip
Licence: Creative Commons Attribution 4.0 International, https://creativecommons.org/licenses/by/4.0/
Attribution: OpenBible.info. The data draws primarily from public-domain sources, especially the Treasury of Scripture Knowledge.

`provenance.json` records hashes, dates, verification limits and transformations. Every source/target pair matches the official download retrieved during verification. The retrieved official file has an earlier date and different crowd-vote counts; the supplied archive is not claimed to be byte-identical to it.

Run `npm run import:refs` from the repository root to rebuild the locally hosted reference files without an internet connection. `npm run check:refs` checks source/shard hashes and coverage. The supplied ZIP is preserved byte-for-byte; generated data normalises IDs, validates verse counts, omits invalid or self links, clamps negative votes to zero, deduplicates destinations and adds reverse navigation. Ranges retain their end but are indexed by their first verse.

Updating this source is a deliberate maintenance action: review the source and licence, update provenance, regenerate all 66 files and run the checks before committing them together.
