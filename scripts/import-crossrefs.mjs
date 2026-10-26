/**
 * Converts the OpenBible.info cross-references TSV dataset into lightweight per-book JSON files.
 * Source: https://www.openbible.info/labs/cross-references/
 * Attribution: OpenBible.info, CC BY 4.0. Original sources include Treasury of Scripture Knowledge.
 *
 * Usage: node scripts/import-crossrefs.mjs ./cross_references.txt
 * The .txt/.tsv file is extracted from the official cross-references ZIP.
 * This script does not import Bible text and does not require an ESV licence.
 */
import {createReadStream,mkdirSync,writeFileSync} from 'node:fs';
import {createInterface} from 'node:readline';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {BOOKS,parseRef} from '../public/assets/books.js';
const path=process.argv[2];
if(!path){console.error('Usage: node scripts/import-crossrefs.mjs <path-to-cross_references.txt>');process.exit(1);}
const directory=resolve(fileURLToPath(new URL('../public/data/refs/',import.meta.url)));mkdirSync(directory,{recursive:true});
const perBook=new Map(BOOKS.map(b=>[b.abbr.toLowerCase(),new Map()]));
let accepted=0,skipped=0;
function add(from,to,votes){const parsed=parseRef(from);if(!parsed)return;const book=parsed.book.abbr.toLowerCase();const map=perBook.get(book);if(!map.has(parsed.formatted))map.set(parsed.formatted,new Map());const links=map.get(parsed.formatted);if(links.get(to)===undefined||links.get(to)<votes)links.set(to,votes);}
const lines=createInterface({input:createReadStream(resolve(path),{encoding:'utf8'}),crlfDelay:Infinity});
for await(const line of lines){if(!line||line.startsWith('#')||line.startsWith('From Verse'))continue;
 const cols=line.trim().split('\t');if(cols.length<2){skipped++;continue;}
 const src=parseRef(cols[0]),dst=parseRef(cols[1]);if(!src||!dst||src.formatted===dst.formatted){skipped++;continue;}
 const votes=Math.max(0,Math.min(100000,Number(cols[2])||0));add(src.formatted,dst.formatted,votes);add(dst.formatted,src.formatted,votes);accepted++;
}
for(const book of BOOKS){const obj={};for(const [key,targets] of perBook.get(book.abbr.toLowerCase())){obj[key]=[...targets.entries()].map(([to,votes])=>({to,votes})).sort((a,b)=>b.votes-a.votes);}writeFileSync(join(directory,`${book.abbr.toLowerCase()}.json`),JSON.stringify(obj));}
writeFileSync(join(directory,'manifest.json'),JSON.stringify({enabled:true,source:'OpenBible.info',licence:'CC BY 4.0',acceptedRows:accepted,generatedAt:new Date().toISOString()}));
console.log(`Imported ${accepted} cross-reference rows, skipped ${skipped} invalid rows into 66 book files.`);
