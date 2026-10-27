import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildEntityCatalog,findEntities,referenceOverlaps} from '../public/assets/entity-index-data.js';
const data=name=>JSON.parse(readFileSync(new URL('../public/data/'+name,import.meta.url),'utf8'));
const people=data('biblical-people.json'),journeys=data('jesus-journeys.json'),geography=data('jesus-geography.json'),audit=data('jesus-audit.json'),cities=data('city-studies.json'),counts=data('verse-counts.json');
const catalog=buildEntityCatalog(people,journeys,geography,audit,cities,counts);
test('the Gospel people index reuses every mapped place and every journey episode',()=>{
 assert.equal(catalog.count.person,25);
 assert.equal(catalog.count.place,35);assert.equal(catalog.count.event,79);
 assert.equal(catalog.records.length,25+35+79);
 assert.equal(catalog.byKey.size,catalog.records.length);
 assert.equal(catalog.byKey.get('event:j055').place,'bethany');
 assert.equal(catalog.byKey.get('place:jerusalem').cityStudy,'jerusalem');
});
test('named people with a shared name remain separate and source-cited',()=>{
 const mary=findEntities(catalog,'Mary','person',counts);
 assert.ok(mary.some(e=>e.id==='mary-mother'));
 assert.ok(mary.some(e=>e.id==='mary-magdalene'));
 assert.ok(mary.some(e=>e.id==='mary-bethany'));
 assert.ok(!mary.some(e=>e.id==='martha-bethany'));
 assert.match(catalog.byKey.get('person:nathanael').disambiguation,/Bartholomew/);
 assert.ok(catalog.byKey.get('person:john-zebedee').disambiguation.includes('John the Baptist'));
});
test('search supports text aliases, Gospel passage overlap and type filters',()=>{
 assert.equal(findEntities(catalog,'Pontius Pilate','person',counts)[0].id,'pilate');
 assert.equal(findEntities(catalog,'blind Bartimaeus','person',counts)[0].id,'bartimaeus');
 assert.ok(findEntities(catalog,'John 11:35','event',counts).some(x=>x.id==='j055'));
 assert.ok(findEntities(catalog,'Bethlehem','place',counts).some(x=>x.id==='bethlehem'));
 assert.ok(findEntities(catalog,'not-a-real-person','person',counts).length===0);
 assert.equal(referenceOverlaps('John 11:35','John 11:1-44',counts),true);
 assert.equal(referenceOverlaps('John 11:35','John 11:1-2',counts),false);
 assert.equal(referenceOverlaps('Matthew 27:4','Matthew 26:57-27:31',counts),true);
 assert.equal(referenceOverlaps('John 11:35','Luke 11:35',counts),false);
});
test('source fields enforce scholarly boundary and place bibliography gaps',()=>{
 const p=catalog.byKey.get('place:jerusalem');
 assert.ok(p.sourceLinks.length>=1);
 const missing=catalog.records.filter(x=>x.type==='place'&&!x.sourceLinks.length);
 assert.ok(missing.length>5);
 assert.ok(missing.every(x=>x.sourceStatus.includes('No linked independent')));
 const simon=catalog.byKey.get('person:peter');
 assert.ok(simon.relationships.some(x=>x.to==='andrew'&&x.ref==='John 1:40-42'));
 assert.match(people.scope,/not a complete/);
});
test('invalid citations and broken relationship identifiers fail closed',()=>{
 const altered=structuredClone(people);altered.people[0].passages[0]='John 22:999';
 assert.throws(()=>buildEntityCatalog(altered,journeys,geography,audit,cities,counts),/Invalid/);
 const dangling=structuredClone(people);dangling.people[0].relationships[0].to='fictional-person';
 assert.throws(()=>buildEntityCatalog(dangling,journeys,geography,audit,cities,counts),/Unknown person relation/);
 const badEvent=structuredClone(journeys);badEvent.events[0].place='unrecorded-destination';
 assert.throws(()=>buildEntityCatalog(people,badEvent,geography,audit,cities,counts),/Unmatched journey event/);
});
test('navigation entry points, detail controls and release state exist',()=>{
 const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
 const app=readFileSync(new URL('../public/assets/app.js',import.meta.url),'utf8');
 const js=readFileSync(new URL('../public/assets/entity-index.js',import.meta.url),'utf8');
 for(const id of ['entity-search','view-entities','reader-related-index','open-entity-index'])assert.ok(html.includes('id="'+id+'"'),id);
 assert.ok(html.includes('data-view="entities"'));
 assert.match(app,/createEntityIndex/);
 assert.match(js,/onJourney/);
 assert.match(js,/onCity/);
 assert.match(js,/aria-pressed/);
 assert.match(html,/not a complete/);
});
