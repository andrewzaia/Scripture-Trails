import {readFileSync} from 'node:fs';
import {BOOKS,parseRef} from '../public/assets/books.js';
const dir=new URL('../public/data/refs/',import.meta.url);
const manifest=JSON.parse(readFileSync(new URL('manifest.json',dir),'utf8'));
if(!manifest.enabled || manifest.acceptedRows<300000)throw Error('Reference import appears incomplete.');
let edges=0,sourceVerses=0;
for(const book of BOOKS){
  const data=JSON.parse(readFileSync(new URL(`${book.abbr.toLowerCase()}.json`,dir),'utf8'));
  for(const [ref,links] of Object.entries(data)){
    if(!parseRef(`${book.name} ${ref}`)||!Array.isArray(links))throw Error('Invalid source or links '+book.name+' '+ref);
    sourceVerses++;
    for(const link of links){const to=Array.isArray(link)?(BOOKS[link[0]]?`${BOOKS[link[0]].name} ${link[1]}:${link[2]}`:null):link.to;if(!parseRef(to)||to===`${book.name} ${ref}`)throw Error('Invalid target '+ref);edges++;}
  }
}
if(sourceVerses<25000 || edges<400000)throw Error(`Insufficient reference coverage: ${sourceVerses} verses, ${edges} connections.`);
console.log(`Validated ${sourceVerses} source verses and ${edges} bidirectional reference links.`);
