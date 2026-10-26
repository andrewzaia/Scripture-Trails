import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {validateJourneyData,projectLocation,passageStart} from '../public/assets/jesus-map.js';
import {parseRef} from '../public/assets/books.js';
const corpus=JSON.parse(readFileSync(new URL('../public/data/jesus-journeys.json',import.meta.url),'utf8'));

test('curated route has validated primary references for every event',()=>{
 assert.equal(validateJourneyData(corpus),true);
 assert.ok(corpus.events.length>=70);
 assert.ok(corpus.places.length>=30);
 assert.ok(corpus.events.every(e=>e.passages.length>=1));
 for(const event of corpus.events){
   for(const cite of event.passages){
     const start=passageStart(cite);
     assert.ok(start,`Passage parse failed: ${cite}`);
     assert.ok(parseRef(start),`Unrecognised book or chapter: ${cite}`);
   }
 }
});
test('repeat visits are individual events, not a single city label',()=>{
 const byPlace=new Map();
 for(const event of corpus.events)byPlace.set(event.place,(byPlace.get(event.place)||0)+1);
 assert.ok(byPlace.get('jerusalem')>=12);
 assert.ok(byPlace.get('capernaum')>=7);
 assert.ok(byPlace.get('nazareth')>=3);
 assert.ok(byPlace.get('bethany')>=2);
});
test('uncertain places and travel links are presented as approximations',()=>{
 const flagged=['egypt','wilderness','beyond-jordan','mountain','emmaus','galilee-region'];
 for(const id of flagged){const p=corpus.places.find(p=>p.id===id);assert.ok(p);assert.notEqual(p.certainty,'identified');assert.ok(p.note.length>30);}
 for(const p of corpus.places){const [x,y]=projectLocation(p.coordinates);assert.ok(x>=0&&x<=1100&&y>=0&&y<=780,`Out-of-bounds marker: ${p.id}`);}
 assert.match(corpus.method,/not a reconstructed GPS track/);
});
test('site and phase selectors can enumerate all recorded stops',()=>{
 const indexed=new Set(corpus.places.map(p=>p.id));
 const ids=new Set(corpus.events.map(e=>e.id));assert.equal(ids.size,corpus.events.length);
 assert.ok(corpus.events.every(e=>indexed.has(e.place)));
 assert.equal(corpus.events[0].place,'bethlehem');
 assert.equal(corpus.events.at(-1).place,'olives');
 assert.deepEqual([...new Set(corpus.events.map(e=>e.phase))],corpus.phases.map(p=>p.id));
});
test('Scripture locations are not claimed for regional travel',()=>{
 const region=corpus.events.find(e=>e.title==='Journey into Galilee');
 assert.equal(region.place,'galilee-region');
 assert.equal(region.evidence,'region');
 assert.equal(passageStart('Matthew 5:1-7:29'),'Matthew 5:1');
 assert.equal(passageStart('1 Corinthians 5:7-8'),'1 Corinthians 5:7');
});
