#!/usr/bin/env python3
"""Import pinned Hebrew WLC and Syriac NT source texts as local, verse-indexed shards.

Run intentionally, then commit the generated files. No licensed English Bible text
is fetched, cached or changed. Verse-map partial matches are not silently guessed.
"""
import json
import hashlib
from datetime import datetime, timezone
import re
import urllib.request
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

WLC_COMMIT = "db6c5c9b46b8f39346f10915ddb1a70dcd429901"
SYRNT_COMMIT = "dae3eb6ff62b9b272fb503646796c25d248175ce"
WLC_BASE = "https://raw.githubusercontent.com/openscriptures/morphhb/" + WLC_COMMIT + "/wlc/"
SYRNT_BASE = "https://raw.githubusercontent.com/ETCBC/syrnt/" + SYRNT_COMMIT + "/plain/0.1/"
OSIS = "{http://www.bibletechnologies.net/2003/OSIS/namespace}"
BOOKS = [
    ("Genesis","Gen"),("Exodus","Exod"),("Leviticus","Lev"),("Numbers","Num"),
    ("Deuteronomy","Deut"),("Joshua","Josh"),("Judges","Judg"),("Ruth","Ruth"),
    ("1 Samuel","1Sam"),("2 Samuel","2Sam"),("1 Kings","1Kgs"),("2 Kings","2Kgs"),
    ("1 Chronicles","1Chr"),("2 Chronicles","2Chr"),("Ezra","Ezra"),("Nehemiah","Neh"),
    ("Esther","Esth"),("Job","Job"),("Psalms","Ps"),("Proverbs","Prov"),
    ("Ecclesiastes","Eccl"),("Song of Solomon","Song"),("Isaiah","Isa"),("Jeremiah","Jer"),
    ("Lamentations","Lam"),("Ezekiel","Ezek"),("Daniel","Dan"),("Hosea","Hos"),
    ("Joel","Joel"),("Amos","Amos"),("Obadiah","Obad"),("Jonah","Jonah"),
    ("Micah","Mic"),("Nahum","Nah"),("Habakkuk","Hab"),("Zephaniah","Zeph"),
    ("Haggai","Hag"),("Zechariah","Zech"),("Malachi","Mal"),
    ("Matthew","Matt","Matthew"),("Mark","Mark","Mark"),("Luke","Luke","Luke"),
    ("John","John","John"),("Acts","Acts","Acts"),("Romans","Rom","Romans"),
    ("1 Corinthians","1Cor","1_Corinthians"),("2 Corinthians","2Cor","2_Corinthians"),
    ("Galatians","Gal","Galatians"),("Ephesians","Eph","Ephesians"),
    ("Philippians","Phil","Philippians"),("Colossians","Col","Colossians"),
    ("1 Thessalonians","1Thess","1_Thessalonians"),("2 Thessalonians","2Thess","2_Thessalonians"),
    ("1 Timothy","1Tim","1_Timothy"),("2 Timothy","2Tim","2_Timothy"),
    ("Titus","Titus","Titus"),("Philemon","Phlm","Philemon"),
    ("Hebrews","Heb","Hebrews"),("James","Jas","James"),
    ("1 Peter","1Pet","1_Peter"),("2 Peter","2Pet","2_Peter"),
    ("1 John","1John","1_John"),("2 John","2John","2_John"),
    ("3 John","3John","3_John"),("Jude","Jude","Jude"),("Revelation","Rev","Revelation"),
]
OUT = Path("public/data/originals")


def download(url):
    request = urllib.request.Request(url, headers={"User-Agent": "ScriptureTrails-SourceImporter/1.0"})
    with urllib.request.urlopen(request, timeout=40) as response:
        data = response.read()
    return data.decode("utf-8-sig")


def source_verse(element):
    """Preserve vocalisation and the source word order, omit morphology and footnotes."""
    pieces = []
    for item in element.iter():
        kind = item.tag.rsplit("}", 1)[-1]
        if kind == "w":
            word = "".join(item.itertext()).strip().replace("/", "")
            if word:
                pieces.append(word)
        elif kind == "seg":
            marker = (item.text or "").strip()
            if marker:
                if marker == "־" and pieces:
                    pieces[-1] += marker
                elif marker == "׃" and pieces:
                    pieces[-1] += marker
                else:
                    pieces.append(marker)
    return " ".join(pieces).replace("־ ", "־").strip()


def verse_map():
    root = ET.fromstring(download(WLC_BASE + "VerseMap.xml"))
    redirects = {}
    ambiguous = set()
    for element in root.iter():
        if element.tag.rsplit("}", 1)[-1] != "verse":
            continue
        native = element.attrib.get("wlc")
        english = element.attrib.get("kjv")
        kind = element.attrib.get("type")
        if not native or not english:
            continue
        if kind == "full":
            redirects[native] = english
        else:
            ambiguous.update((native.split('!')[0], english.split('!')[0]))
    return redirects, ambiguous


def wlc_book(book):
    name, code = book[:2]
    root = ET.fromstring(download(WLC_BASE + code + ".xml"))
    verses = {}
    for verse in root.findall(".//" + OSIS + "verse"):
        key = verse.attrib.get("osisID", "")
        if not re.fullmatch(re.escape(code) + r"\.\d+\.\d+", key):
            continue
        text = source_verse(verse)
        if text:
            verses[key] = text
    if not verses:
        raise ValueError("Missing WLC verses: " + name)
    return name, code, verses


def syriac_book(book):
    name, code, filename = book
    data = download(SYRNT_BASE + filename + ".txt")
    chapters = {}
    chapter = None
    for raw in data.splitlines():
        line = raw.strip()
        heading = re.fullmatch(r"[\w]+\s+(\d+)", line)
        if heading and not line[0].isdigit():
            chapter = heading.group(1)
            chapters.setdefault(chapter, {})
            continue
        # Numeric book headings such as '1Corinthians 1' also occur.
        if heading and re.search(r"[A-Za-z]", line.split()[0]):
            chapter = heading.group(1)
            chapters.setdefault(chapter, {})
            continue
        verse = re.fullmatch(r"(\d+)\s+(.+)", line)
        if verse and chapter:
            text = verse.group(2).strip()
            if re.search(r"[\u0700-\u074f]", text):
                chapters[chapter][verse.group(1)] = text
    if not chapters or not chapters.get("1", {}).get("1"):
        raise ValueError("Missing Syriac text: " + name)
    return code.lower(), {
        "book": name, "language": "syc", "source": "SEDRA 3.0 Syriac New Testament",
        "editionNote": ("Later Syriac textual tradition; outside the traditional 22-book Peshitta canon."
                        if code in ("2Pet", "2John", "3John", "Jude", "Rev") else ""),
        "chapters": chapters
    }


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    redirects, ambiguous = verse_map()
    relocated_targets = set(redirects.values())
    hebrew_books = BOOKS[:39]
    with ThreadPoolExecutor(max_workers=5) as pool:
        result = list(pool.map(wlc_book, hebrew_books))
    originals = {}
    collisions = []
    for name, code, verses in result:
        originals[code] = {"book": name, "language": "he", "source": "Westminster Leningrad Codex",
                           "editionNote": "Includes Biblical Aramaic where present in Ezra and Daniel.",
                           "chapters": {}, "superscriptions": {}}
        for native, text in verses.items():
            # The WLC may have a heading or split source verse at a KJV target
            # occupied by a different mapped source verse. Never overwrite it.
            if native not in redirects and native in relocated_targets:
                if code == "Ps" and native.endswith(".1"):
                    part = native.split(".")
                    originals[code]["superscriptions"][part[1]] = text
                continue
            english = redirects.get(native, native)
            if native in ambiguous or english in ambiguous:
                continue  # A partial alignment must not be presented as a full verse.
            target_book, chapter, verse = english.split(".")
            if target_book not in originals:
                originals[target_book] = {"book": "", "language": "he",
                                          "source": "Westminster Leningrad Codex",
                                          "chapters": {}, "superscriptions": {}}
            record = originals[target_book]
            if verse == "0":
                record["superscriptions"][chapter] = text
                continue
            chapter_data = record["chapters"].setdefault(chapter, {})
            if verse in chapter_data and chapter_data[verse] != text:
                # Four Psalms split the English first verse into two source
                # verses. Both parts must appear, in native source order.
                if code == "Ps" and native in redirects:
                    chapter_data[verse] += " " + text
                else:
                    collisions.append(english)
                    del chapter_data[verse]
            else:
                chapter_data[verse] = text
    if collisions:
        raise ValueError("Ambiguous Hebrew verse collisions: " + ", ".join(collisions[:12]))
    # Preserve complete, deterministic canonical book metadata.
    for name, code in hebrew_books:
        record = originals[code]
        record["book"] = name
        record["language"] = "he"
        record["source"] = "Westminster Leningrad Codex"
        record["editionNote"] = "Includes Biblical Aramaic where present in Ezra and Daniel."
        (OUT / (code.lower() + ".json")).write_text(
            json.dumps(record, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8"
        )
    with ThreadPoolExecutor(max_workers=5) as pool:
        syriac = list(pool.map(syriac_book, BOOKS[39:]))
    for slug, record in syriac:
        (OUT / (slug + ".json")).write_text(
            json.dumps(record, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8"
        )
    expected = {book[1].lower() + ".json" for book in BOOKS}
    actual = {p.name for p in OUT.glob("*.json")}
    if actual != expected:
        raise ValueError("Original-language corpus count mismatch: " + str(expected ^ actual))
    for slug, chapter, verse in [("gen","1","1"),("ps","3","1"),("joel","3","1"),
                                  ("mal","4","1"),("john","1","1"),("rev","1","1")]:
        data = json.loads((OUT / (slug + ".json")).read_text(encoding="utf-8"))
        if not data.get("chapters", {}).get(chapter, {}).get(verse):
            raise ValueError("Missing example alignment: " + slug + " " + chapter + ":" + verse)
    manifest = {
        "generatedAt": datetime.now(timezone.utc).date().isoformat(),
        "sourceCommits": {"wlc": WLC_COMMIT, "syrnt": SYRNT_COMMIT},
        "description": "Verse-aligned source-text snapshots; WLC uses its published KJV VerseMap where full equivalence exists.",
        "files": {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(OUT.glob("*.json"))},
    }
    evidence = Path("sources/original-languages")
    evidence.mkdir(parents=True, exist_ok=True)
    (evidence / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print("Imported 39 WLC and 27 Syriac books; checked mapped Psalms, Joel and Malachi examples.")


if __name__ == "__main__":
    main()
