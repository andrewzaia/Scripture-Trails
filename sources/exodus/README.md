# Exodus and wilderness: editorial method and review record

Release: v0.19.0. Source checks: 28 October 2026.

This first Hebrew Bible geography collection contains 25 selected readings, 15 setting records, five comparison topics and seven supporting bibliography records. It runs from Exodus 1 to Deuteronomy 34, ending with Moses in Moab. It is not every plague, every episode, the Numbers 33 camp catalogue or a complete Hebrew Bible geography library.

The Bible is the primary text and foundation. Stage summaries are short original paraphrases of the cited passages. The reading sequence follows the order of the selected texts. Narrative testimony, archaeological settlements, sacred-site traditions and modern identifications are distinguished. No third-party Bible text, illustration, map or complete publication is bundled.

## Primary-text checks

AI-assisted checks consulted USCCB chapter views for Exodus 1-4, 12-16 and 20 and Numbers 10, 14, 20 and 21. When direct USCCB views were unavailable, Crossway's official ESV chapter views were consulted for Exodus 17 and 19, Numbers 13 and 22, and Deuteronomy 34. Each stage retains its check URL, date and method. These are source-reading entry points; available chapter views sometimes include neighbouring chapters. Public USCCB views use a different translation from the website's four reader editions. They are not added as a reader edition.

The exact stage addresses are checked against the site's canonical verse metadata. Reader actions use the existing authorised publisher APIs and preserve the selected edition. Atlas actions use the starting verse rather than silently pretending that the graph represents a complete passage range. The site stores no publisher passage text in this dataset.

Key textual distinctions preserved:

- Moses' call at Horeb precedes the departure from Egypt. The return in Exodus 4 is not a second collective Exodus.
- The selected Exodus 4 reading describes setting out for Egypt, without locating an arrival palace.
- Exodus 15's Shur, Marah and Elim are grouped for one reading, not counted as a single ancient town.
- The wilderness of Sin in Exodus 16 is kept distinct from Zin in Numbers 20.
- Exodus 17 at Rephidim and Numbers 20 at Kadesh remain different readings and setting records.
- The Edom passage reports refusal and turning away, not an arrival inside Edom.
- Numbers 22's messengers travel to Balaam; the Israelite camp remains in Moab.
- Deuteronomy 34 does not supply a known grave coordinate. The collection ends before the Jordan crossing.

Related people and place links reuse existing index identities. These are contextual links; they do not imply each profile is explicitly named in every selected verse.

## Supporting sources and access scope

The bibliography is stored in `public/data/hebrew-geography.json`, with authorship, URL, scope, access notes, access date and limitations. Rights are not inferred from public availability. All seven sources are linked rather than vendored.

| Source | Consulted material | Permitted conclusion here |
| --- | --- | --- |
| Austrian Archaeological Institute / Austrian Academy of Sciences: Tell el-Daba / Avaris project | Public excavation-project account | Avaris and Pi-Ramesse's settlement relationship; not an identified Exodus event |
| Qantir/Pi-Ramesse Project exhibition: Chronicle of a City | Public project chronology | City identification and the Tanis confusion; not the departure year |
| Barry J. Beitzel, The Ancient Near East Today, September 2021 | Essay and candidate discussion | Attributed sea-location proposals and the author's argument against Aqaba; not equal certainty for every proposal |
| UNESCO World Heritage Centre: Saint Catherine Area | Heritage description and significance statement | Religious tradition and monastic heritage, not excavation proof of the biblical mountain |
| Deborah Anne Hurn, Avondale University doctoral thesis, copyright 2022 | Title, abstract and selected geography-survey sections | An attributed research survey of regional/mountain proposals; the thesis's hydrological reconstruction is not adopted |
| Cohen and Bernick-Greenberg, IAA Reports 34/1 (2007) | Publisher abstract and table of contents | Published Qudeirat identification and Iron Age fortresses; not an audited full excavation report or Moses-era assignment |
| Crossway, ESV Global Study Bible: Introduction to Exodus | Public introduction | Two reported chronological readings, with their interpretive premises; no date attached to a stage |

Only selected source sections were consulted. Sources are not treated as endorsements of Scripture Trails. The comparison panels are selective, not exhaustive reviews of every proposed date or location. Individual modern site claims require more specific research before coordinates or routes are introduced.

## Unassigned geography and chronology

Every setting has `coordinates: null`; every stage has `date: null`. The collection deliberately uses an accessible searchable list, with no route lines, inferred camp distances, ancient borders, summit pin, grave pin or named pharaoh. Supporting scholarship does not resolve every modern identification. The two date proposals occur only in the comparison panel as attributed models. Broad regional labels are not current political territorial claims.

## Independent review tasks

- [ ] Arrange named, dated historical/textual and archaeological specialist review of a declared scope.
- [ ] Read the relevant IAA excavation chapters and assess their dating arguments, separately from the publisher's abstract.
- [ ] Broaden the Sinai and sea-crossing bibliography, documenting arguments and objections without assuming equal evidential strength.
- [ ] Revisit the relationship of Horeb/Sinai, Kadesh/Paran/Zin and the grouped settings with specialist commentaries.
- [ ] Review chronological premises, translation/versification issues and interpretive wording in the selected readings.
- [ ] Record reviewer expertise, method, bibliography, accepted/rejected changes and remaining disagreements here.

No independent specialist has signed off. Structural tests, primary-text reading checks and publication links do not supply that signoff. Update the roadmap only for what has actually been implemented and reviewed.
