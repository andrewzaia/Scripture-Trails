import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateCanonicalReference} from '../public/assets/reference-integrity.js';
import {EDITORIAL_LINKS,PATHS} from '../public/assets/studies.js';
import {BOOKS} from '../public/assets/books.js';
const read=(file)=>JSON.parse(readFileSync(new URL('../public/data/'+file,import.meta.url),'utf8'));
const counts=read('verse-counts.json'),journeys=read('jesus-journeys.json'),audit=read('jesus-audit.json');
const geography=read('jesus-geography.json'),cityData=read('city-studies.json'),comparisons=read('gospel-chronology.json');
test('verse-count metadata covers all 66 books with correct chapter arrays',()=>{
 assert.equal(Object.keys(counts).length,66);
 for(const book of BOOKS){assert.equal(counts[book.name]?.length,book.chapters,book.name);assert.ok(counts[book.name].every(n=>Number.isInteger(n)&&n>=1));}
});
test('single verses, chapter spans, aliases and cross-chapter ranges validate',()=>{
 for(const example of ['John 3:16','Psalm 122:1-9','Luke 24','Matthew 26:57-27:31','Mark 14:53-15:20']){
  assert.ok(validateCanonicalReference(example,counts),example);
 }
 const cross=validateCanonicalReference('Matthew 26:57-27:31',counts);
 assert.equal(cross.endChapter,27);assert.equal(cross.endVerse,31);
});
test('invalid endpoints, impossible chapters and malformed spans are rejected',()=>{
 for(const example of ['John 3:37','John 3:16-37','Jude 2:1','Matthew 29:1','Mark 14:53-15:99','Mark 15:20-14:53','Luke 4:30-16','John 3:16-2:5','Unicorn 1:1','Mark 2:0']){
  assert.equal(validateCanonicalReference(example,counts),null,example);
 }
});
test('all curated narrative, geography, comparison and city references fit chapter and verse boundaries',()=>{
 const checked=[];
 const check=(category,ref)=>{checked.push(category+': '+ref);assert.ok(validateCanonicalReference(ref,counts),category+': '+ref);};
 for(const event of journeys.events)for(const ref of event.passages)check(event.id,ref);
 for(const correction of audit.corrections)for(const ref of correction.passages)check('correction '+correction.event,ref);
 for(const c of comparisons.comparisons)for(const ref of c.passages)check('comparison '+c.id,ref);
 for(const [id,p] of Object.entries(geography.places))for(const item of p.oldTestament)check('place '+id,item.ref);
 for(const city of cityData.cities){
  for(const item of city.biblical)check(city.id+' biblical',item.ref);
  for(const item of city.timeline)for(const ref of item.passages||[])check(city.id+' timeline',ref);
  for(const item of city.findings)for(const ref of item.passages||[])check(city.id+' finding',ref);
 }
 for(const site of cityData.disputed)check('disputed '+site.id,site.ref);
 for(const path of PATHS)for(const ref of path.refs)check('guided '+path.id,ref);
 for(const edge of EDITORIAL_LINKS){check('curated from',edge.from);check('curated to',edge.to);}
 assert.ok(checked.length>=300,'Too few inspected references');
});
test('cross-reference relevance and historical evidence distinctions remain explicit',()=>{
 const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
 const app=readFileSync(new URL('../public/assets/app.js',import.meta.url),'utf8');
 const map=readFileSync(new URL('../public/assets/jesus-map.js',import.meta.url),'utf8');
 assert.match(html,/not factual confidence/);
 assert.match(html,/community-ranked study suggestions/);
 assert.match(html,/OpenBible.info source and methodology/);
 assert.doesNotMatch(app,/No verified cross-reference recorded/);
 assert.match(map,/research issues without a linked secondary source/);
 assert.match(audit.methodology.voteAndSourcePolicy,/not scholarly confidence/);
 assert.match(audit.referenceIntegrity.limitations,/different versification/);
});
