/**
 * Convert OpenBible.info CC BY 4.0 TSV cross-references to compact book shards.
 * Data originates primarily from the public-domain Treasury of Scripture Knowledge.
 * References only, no copyrighted Bible translation text.
 * Usage: node scripts/import-crossrefs.mjs <cross_references.txt>
 */
import {mkdirSync,writeFileSync,readFileSync,existsSync} from 'node:fs';
import {Readable} from 'node:stream';
import {createInterface} from 'node:readline';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {BOOKS,findBook} from '../public/assets/books.js';
import {readReferenceSource,readVendoredReferenceSource,sha256} from './crossref-source.mjs';
const input=process.argv[2];
const source=input?readReferenceSource(resolve(input)):readVendoredReferenceSource();
const dir=process.argv[3]?resolve(process.argv[3]):fileURLToPath(new URL('../public/data/refs/',import.meta.url));mkdirSync(dir,{recursive:true});
const countPath=fileURLToPath(new URL('../public/data/verse-counts.json',import.meta.url));const counts=existsSync(countPath)?JSON.parse(readFileSync(countPath,'utf8')):{};
const perBook=new Map(BOOKS.map(b=>[b.name,new Map()]));
function parse(value){const m=String(value||'').match(/^([1-3]?[A-Za-z]+)\.(\d+)\.(\d+)(?:-(.+))?$/);if(!m)return null;
 const book=findBook(m[1]),chapter=+m[2],verse=+m[3];if(!book||chapter<1||chapter>book.chapters||verse<1||verse>(counts[book.name]?.[chapter-1]||176))return null;
 const end=m[4]?.match(/^([1-3]?[A-Za-z]+)\.(\d+)\.(\d+)$/);const endBook=end?findBook(end[1]):null;
 return {book:book.name,id:book.index,chapter,verse,ref:`${book.name} ${chapter}:${verse}`,end:endBook?{id:endBook.index,chapter:+end[2],verse:+end[3]}:null};}
function add(a,b,votes){const src=perBook.get(a.book);if(!src.has(a.ref))src.set(a.ref,new Map());const links=src.get(a.ref),old=links.get(b.ref);
 if(!old||old[3]<votes)links.set(b.ref,[b.id,b.chapter,b.verse,votes,...(b.end?[b.end.chapter,b.end.verse,b.end.id]:[])]);}
let accepted=0,skipped=0,edges=0;
const lines=createInterface({input:Readable.from([source.text]),crlfDelay:Infinity});
for await(const line of lines){if(!line||line.startsWith('#')||line.startsWith('From Verse'))continue;
 const [from,to,rank]=line.trim().split('\t');const a=parse(from),b=parse(to);if(!a||!b||a.ref===b.ref){skipped++;continue;}
 const votes=Math.max(0,Math.min(100000,Number(rank)||0));add(a,b,votes);add(b,a,votes);accepted++;}
const shardSha256={};
for(const book of BOOKS){const obj={};for(const [ref,links] of perBook.get(book.name)){
 const vals=[...links.values()].sort((a,b)=>b[3]-a[3]);const m=ref.match(/(\d+:\d+)$/);if(!m)throw Error('Bad reference '+ref);obj[m[1]]=vals;edges+=vals.length;}
 const filename=`${book.abbr.toLowerCase()}.json`,json=JSON.stringify(obj);writeFileSync(join(dir,filename),json);shardSha256[filename]=sha256(json);}
writeFileSync(join(dir,'manifest.json'),JSON.stringify({enabled:true,source:'OpenBible.info',sourceUrl:'https://www.openbible.info/labs/cross-references/',licence:'CC BY 4.0',licenceUrl:'https://creativecommons.org/licenses/by/4.0/',sourceDate:source.sourceDate,sourceSha256:source.sha256,sourceArchiveSha256:source.archiveSha256,hosting:'local',acceptedRows:accepted,skippedRows:skipped,directedLinks:edges,bidirectional:true,rangeIndexing:'First verse; range ending retained as book/chapter/verse',shardSha256}));
console.log(`Imported ${accepted} rows, skipped ${skipped}, wrote ${edges} directed edges across 66 book files.`);
