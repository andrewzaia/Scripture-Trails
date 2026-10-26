import {readFileSync} from 'node:fs';
import {BOOKS,parseRef} from '../public/assets/books.js';
const dir=new URL('../public/data/refs/',import.meta.url);
const manifest=JSON.parse(readFileSync(new URL('manifest.json',dir),'utf8'));
if(!manifest.enabled || manifest.acceptedRows<300000)throw Error('Reference import appears incomplete.');
let edges=0,sourceVerses=0;
for(const book of BOOKS){
  const data=JSON.parse(readFileSync(new URL(`${book.abbr.toLowerCase()}.json`,dir),'utf8'));
  for(const [ref,links] of Object.entries(data)){
    if(!parseRef(ref)||!Array.isArray(links))throw Error('Invalid source or links '+ref);
    sourceVerses++;
    for(const link of links){if(!parseRef(link.to)||link.to===ref)throw Error('Invalid target '+ref);edges++;}
  }
}
if(sourceVerses<25000 || edges<400000)throw Error(`Insufficient reference coverage: ${sourceVerses} verses, ${edges} connections.`);
console.log(`Validated ${sourceVerses} source verses and ${edges} bidirectional reference links.`);
