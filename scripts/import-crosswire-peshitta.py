#!/usr/bin/env python3
"""Import pinned public-domain CrossWire Peshitta SWORD ZIP into local verse shards."""
import hashlib,html,json,re,struct,sys,zipfile,zlib
from pathlib import Path
SHA="badce0aa0a9b70a9c81891ed48d5a9e86de1e24d12ad4ad378e060e03cabc7b9"
BOOKS=[("Matt","Matthew"),("Mark","Mark"),("Luke","Luke"),("John","John"),("Acts","Acts"),("Rom","Romans"),("1Cor","1 Corinthians"),("2Cor","2 Corinthians"),("Gal","Galatians"),("Eph","Ephesians"),("Phil","Philippians"),("Col","Colossians"),("1Thess","1 Thessalonians"),("2Thess","2 Thessalonians"),("1Tim","1 Timothy"),("2Tim","2 Timothy"),("Titus","Titus"),("Phlm","Philemon"),("Heb","Hebrews"),("Jas","James"),("1Pet","1 Peter"),("2Pet","2 Peter"),("1John","1 John"),("2John","2 John"),("3John","3 John"),("Jude","Jude"),("Rev","Revelation")]
def main(path):
 raw=Path(path).read_bytes()
 if hashlib.sha256(raw).hexdigest()!=SHA: raise ValueError("Peshitta archive SHA mismatch")
 with zipfile.ZipFile(path) as z:
  conf=z.read("mods.d/peshitta.conf").decode()
  for expected in ("ModDrv=zText","Versification=KJV","DistributionLicense=Public Domain","Version=2.0","CompressType=ZIP","BlockType=BOOK"):
   if expected not in conf: raise ValueError("Unexpected metadata "+expected)
  base="modules/texts/ztext/peshitta/"
  bzs,bzv,bzz=[z.read(base+x) for x in ("nt.bzs","nt.bzv","nt.bzz")]
 if len(bzs)%12 or len(bzv)%10: raise ValueError("Bad index length")
 blocks=[]
 for i in range(0,len(bzs),12):
  offset,size,length=struct.unpack_from("<III",bzs,i)
  block=zlib.decompress(bzz[offset:offset+size])
  if len(block)!=length: raise ValueError("Bad compressed block")
  blocks.append(block)
 books={}; current=None; chapter=None; verse_no=0
 for i in range(0,len(bzv),10):
  block,offset,length=struct.unpack_from("<IIH",bzv,i)
  if block>=len(blocks) or offset+length>len(blocks[block]): raise ValueError("Bad verse index")
  if not length: continue
  fragment=blocks[block][offset:offset+length].decode("utf-8")
  match=re.search(r'<div canonical="true" osisID="([^"]+)"[^>]*type="book"',fragment)
  if match:
   current=match.group(1)
   if current in books: raise ValueError("Duplicate book")
   books[current]={}; chapter=None
  match=re.search(r'<chapter n="(\d+)"[^>]*sID=',fragment)
  if match:
   if current is None: raise ValueError("Chapter encountered before book heading")
   chapter=match.group(1)
   if chapter in books[current]: raise ValueError("Duplicate chapter")
   books[current][chapter]={}; verse_no=0
  verse=html.unescape(re.sub(r"<[^>]*>","",fragment)).strip()
  if re.search("[\\u0700-\\u074f]",verse):
   if current is None or chapter is None: raise ValueError("Unmapped verse")
   verse_no+=1; books[current][chapter][str(verse_no)]=verse
 if set(books)!={b for b,_ in BOOKS}: raise ValueError("Unexpected book coverage")
 count=sum(len(ch) for book in books.values() for ch in book.values())
 if count!=7956 or len(books["John"])!=21 or len(books["Rev"])!=22 or len(books["3John"]["1"])!=14: raise ValueError("Unexpected verse coverage")
 if not books["John"]["1"]["1"].startswith("ܒܪܫܝܬ") or not books["Rev"]["22"]["21"].startswith("ܛܝܒܘܬܗ"): raise ValueError("Reference check failed")
 out=Path("public/data/originals"); manifest_path=Path("sources/original-languages/manifest.json")
 manifest=json.loads(manifest_path.read_text())
 for code,name in BOOKS:
  record={"book":name,"language":"syc","source":"CrossWire Peshitta, British and Foreign Bible Society (1905)","editionNote":"Later Syriac textual tradition; outside the traditional 22-book Peshitta canon." if code in {"2Pet","2John","3John","Jude","Rev"} else "","chapters":books[code]}
  data=(json.dumps(record,ensure_ascii=False,separators=(",",":"))+"\n").encode()
  filename=code.lower()+".json"; (out/filename).write_bytes(data)
  manifest["files"][filename]=hashlib.sha256(data).hexdigest()
 manifest["sourceCommits"].pop("syrnt",None)
 manifest["sourceArchives"]={"crosswirePeshitta":{"version":"2.0","date":"2020-02-08","sha256":SHA,"licence":"Public Domain","edition":"British and Foreign Bible Society 1905","versification":"KJV"}}
 manifest_path.write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+"\n")
 print("Imported 27 books, 7956 verse entries")
if __name__=="__main__":
 if len(sys.argv)!=2:
  raise SystemExit("Usage: python3 scripts/import-crosswire-peshitta.py /path/to/Peshitta.zip")
 main(sys.argv[1])
