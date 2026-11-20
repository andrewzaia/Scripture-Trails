# Original-language source texts

The Bible reader displays locally generated original-language corpus shards
alongside existing English Scripture supplied separately by Crossway or API.Bible.

## Hebrew Old Testament

- Source: Westminster Leningrad Codex, as transcribed in the Open Scriptures Hebrew Bible (OSHB).
- Repository: https://github.com/openscriptures/morphhb
- Pinned commit: db6c5c9b46b8f39346f10915ddb1a70dcd429901
- WLC text: public domain. OSHB morphology and editorial enhancements: CC BY 4.0.
- Only Scripture words and original punctuation are selected; morphology, notes and identifiers are omitted.
- Hebrew vowel and cantillation marks are retained. Biblical Aramaic passages in Ezra and Daniel remain in their source language.
- OSHB's own VerseMap.xml remaps complete Westminster-to-KJV verse correspondences. Partial matches are omitted rather than assigned to an incorrect English verse. Psalm superscriptions are retained separately where mapped to verse zero.
- English translations may differ in verse segmentation, so a non-corresponding source verse is marked unavailable rather than guessed.

## Syriac Aramaic New Testament

- Source: CrossWire Peshitta SWORD module version 2.0, British and Foreign Bible Society 1905 edition.
- Module: https://ftp.crosswire.org/sword/modules/ModInfo.jsp?modName=Peshitta
- Archive SHA-256: badce0aa0a9b70a9c81891ed48d5a9e86de1e24d12ad4ad378e060e03cabc7b9
- Distribution licence: Public Domain, per bundled module metadata.
- Scripture is displayed in Syriac script as Classical Syriac, an Aramaic language.
- The classic Syriac Peshitta comprises 22 New Testament books. 2 Peter, 2 John, 3 John, Jude and Revelation in the imported full 27-book Syriac corpus come from later Syriac textual tradition. The UI identifies this distinction.

## Import and maintenance

Run from the repository root:

    python3 scripts/import-crosswire-peshitta.py /path/to/Peshitta.zip
    python3 scripts/import-original-languages.py

The CrossWire importer replaces the 27 Syriac JSON files; the Hebrew importer
regenerates 39 Hebrew books while retaining the pinned CrossWire source.
Together these generate 66 JSON files in public/data/originals/ and a SHA-256
file manifest in sources/original-languages/manifest.json. These generated
files are committed to the repository and served locally. The normal
public build does not contact the external source hosts.

The importer must fail if it cannot retrieve a pinned source or if
the expected examples for Genesis, Psalms, Joel, Malachi, John and Revelation
are missing. New source revisions require scholarly and licensing review.
No English Bible publisher data is downloaded or stored by this importer.

Release and validate the website using the mandatory npm run release process.
