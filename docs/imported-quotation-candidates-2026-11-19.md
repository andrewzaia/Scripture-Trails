# Next imported Scripture quotation batch - research staging

Date: 2026-11-19
Status: staging only, not published in the website or canonical citation register
Base: Scripture Trails `main` at v1.20.1 (`508b5f223bd7128d0ca712a11a353ba8fc8a36a8`)

## Scope and method

Ten candidate source-to-receiving-verse pairs were checked against the version-controlled OpenBible.info book shards. Each is present as a navigable imported pair, is absent from the 161 fully explained Atlas pairs, and is absent from the 14 first-pass imported classifications (`xr001` to `xr014`). These are **pairs**, not ten independent quotation events: two rows share Psalm 91, two share Isaiah 9, two share Joel, and three share Psalm 16.

Candidate IDs `xr015` to `xr024` are reserved only in this research file. Do not increase the published coverage counter, mark these as reviewed in `public/data/citation-review.json`, or generate a public asset from these notes until a versioned release has run the normal checks.

Evidence access: the existing source-book JSON shards and editorial pair registers were inspected directly on GitHub on 2026-11-19. USCCB publisher chapter references and associated editorial cross-reference notes were located through indexed publisher search results on that date; some direct publisher page requests returned access errors. The claims below are narrow first-pass textual relationships, not full publisher-text collation, original-language manuscript assessment, or independent specialist signoff. No licensed Bible wording is copied into the repository.

## Proposed source-classification records

| Proposed ID | Source | Receiving passage | First-pass type | Local imported-pair check |
| --- | --- | --- | --- | --- |
| xr015 | Psalm 91:11 | Matthew 4:6 | quotation by an adversary | present |
| xr016 | Psalm 91:12 | Matthew 4:6 | quotation by an adversary | present |
| xr017 | Isaiah 9:1 | Matthew 4:15 | adapted quotation | present |
| xr018 | Isaiah 9:2 | Matthew 4:16 | quotation | present |
| xr019 | Joel 2:30 | Acts 2:19 | quotation | present |
| xr020 | Joel 2:32 | Acts 2:21 | quotation | present |
| xr021 | Psalm 16:8 | Acts 2:25 | quotation | present |
| xr022 | Psalm 16:9 | Acts 2:26 | quotation with Greek wording caution | present |
| xr023 | Psalm 16:11 | Acts 2:28 | quotation with Greek wording caution | present |
| xr024 | Isaiah 61:2 | Luke 4:19 | selective quotation | present |

### xr015-xr016: Psalm 91:11-12 / Matthew 4:6

Matthew places the protective-angel wording in the devil's speech during Jesus' wilderness temptation. The immediate exchange is completed by Jesus' refusal to test God in Matthew 4:7. These two pair records should share one explanation and should not imply that the narrator commends a deliberate leap from the temple.

**Context and limit:** Psalm 91 addresses trust in God's protection, not a warrant to manufacture danger. Compare the complete Psalm with the shorter citation in Matthew, including the wording "in all your ways". This is a clear literary quotation but does not establish Jesus' or the tempter's exact spoken-language text.

Publisher passages: [Psalm 91](https://bible.usccb.org/bible/psalms/91); [Matthew 4](https://bible.usccb.org/bible/matthew/4). Both publisher notes explicitly connect the passages.

### xr017-xr018: Isaiah 9:1-2 / Matthew 4:15-16

Matthew explicitly introduces the Zebulun, Naphtali and light language as a citation of Isaiah, applying it to Jesus' residence and ministry in Galilee.

**Context and limit:** Isaiah's original passage belongs to an oracle concerning the northern territories and hope after distress. Matthew uses the imagery in a new narrative setting. The publisher's Matthew 4 note distinguishes its geographical framing, including the "sea" in Isaiah versus Matthew's Galilean setting; do not present a reconstructed historical route as established by the quotation.

**Versification warning:** The OpenBible shard uses the common Protestant references Isaiah 9:1 and 9:2. In NABRE/USCCB, the territorial reference falls under Isaiah 8:23 and the people-walking-in-darkness line is Isaiah 9:1. The first row therefore needs source-edition mapping before its public annotation is finalised.

Publisher passages: [Isaiah 8](https://bible.usccb.org/bible/isaiah/8); [Isaiah 9](https://bible.usccb.org/bible/isaiah/9); [Matthew 4](https://bible.usccb.org/bible/matthew/4).

### xr019-xr020: Joel 2:30, 2:32 / Acts 2:19, 2:21

Acts 2:16-21 explicitly identifies the ensuing speech as the prophet Joel and includes the signs preceding the Lord's day and the promise regarding those who call upon the Lord.

**Context and limit:** These are two verse-level pairs within one larger quotation. Joel speaks in an oracle about the outpouring of God's Spirit, cosmic signs and Zion's deliverance; Peter applies the oracle to the Pentecost events and ensuing proclamation. Do not imply that every possible eschatological detail in Joel was exhaustively realised that day.

**Versification warning:** The local imported data uses Joel 2:30 and Joel 2:32; the NABRE/USCCB edition places these as Joel 3:3 and Joel 3:5. The earlier Joel 2:28 / Acts 2:17 pair already has a full Atlas explanation and must not be counted again as newly classified.

Publisher passages: [Joel 3 (USCCB numbering)](https://bible.usccb.org/bible/joel/3); [Acts 2](https://bible.usccb.org/bible/acts/2).

### xr021-xr023: Psalm 16:8-9, 11 / Acts 2:25-26, 28

Acts 2:25-28 expressly introduces a Davidic quotation from Psalm 16:8-11 during Peter's resurrection argument. These three previously unclassified source pairs sit on either side of the existing full Atlas explanation for Psalm 16:10 / Acts 2:27.

**Context and limit:** Psalm 16 expresses the psalmist's trust and hope in God; Acts uses the quotation to argue for Jesus' resurrection. The Hebrew and Greek renderings are not automatically word-for-word equivalent. In particular, the speech/tongue versus glory/whole-being wording around Psalm 16:9 should be separately checked against textual witnesses before claiming a Greek exemplar. Do not regenerate or duplicate the existing Psalm 16:10 explanation.

Publisher passages: [Psalm 16](https://bible.usccb.org/bible/psalms/16); [Acts 2](https://bible.usccb.org/bible/acts/2). Acts 2's publisher cross-reference identifies the full Psalm 16:8-11 block.

### xr024: Isaiah 61:2 / Luke 4:19

Luke's Nazareth synagogue scene quotes the proclamation of the Lord's favourable year from Isaiah. This source-to-verse pair is present in the imported Isaiah shard but lacks its own explanation; Isaiah 61:1 / Luke 4:18 is already fully explained.

**Context and limit:** The cited portion does not continue with the following day-of-vindication phrase in Isaiah 61:2. Record that textual selection without assigning a motive that the quotation itself does not establish. Luke 4:18-19 also draws on Isaiah 58:6, so the entire Nazareth reading must not be labelled a simple unmodified quotation of Isaiah 61.

Publisher passages: [Isaiah 61](https://bible.usccb.org/bible/isaiah/61); [Luke 4](https://bible.usccb.org/bible/luke/4).

## Publication gates

1. Recheck full publisher passage and note access where previously restricted; reconcile the two recorded edition-numbering differences and Greek-text qualifications.
2. Confirm all ten pairs remain present in the imported shards and disjoint from both existing explained and imported-reviewed sets at integration time.
3. Add structured entries to the canonical citation register with individual summary, limitation, reviewed date and source locators; rebuild the bundled register from its existing import script.
4. Update the About counts from the validated data rather than by hand, preserve the 198 historical editorial assessments and fourteen published first-pass classifications, and extend automated regression coverage.
5. Run `npm run release -- minor "..."` for the eventual substantial public research expansion, then `npm run build`, the browser checks and release consistency checks; verify GitHub CI, merge and the matching Cloudflare production commit. Do not merge public changes without this versioned process.

This staging work changes no public website file and therefore does not itself constitute a website release.
