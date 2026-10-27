import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildEntityCatalog,findEntities,referenceOverlaps} from '../public/assets/entity-index-data.js';
import {createEntityIndex} from '../public/assets/entity-index.js';
const read=n=>JSON.parse(readFileSync(new URL('../public/data/'+n,import.meta.url),'utf8'));
const g=read('biblical-people.json'),j=read('jesus-journeys.json'),geo=read('jesus-geography.json'),audit=read('jesus-audit.json'),city=read('city-studies.json'),verses=read('verse-counts.json'),history=read('biblical-history.json');
const catalog=buildEntityCatalog(g,j,geo,audit,city,verses,history);
test('source-aware index unifies all existing Gospel records and added Hebrew Bible material',()=>{
 assert.equal(history.people.length,43);
 assert.equal(history.places.length,14);
 assert.equal(history.events.length,31);
 assert.equal(catalog.count.person,68);
 assert.equal(catalog.count.place,49);
 assert.equal(catalog.count.event,110);
 assert.equal(catalog.records.length,227);
 assert.equal(typeof createEntityIndex,'function');
 assert.ok(catalog.byKey.get('place:jerusalem').passages.includes('2 Kings 18:17-37'));
 assert.equal(catalog.byKey.size,227);
 assert.equal(catalog.byKey.get('event:j055').place,'bethany');
 assert.equal(catalog.byKey.get('event:h018').place,'jerusalem');
});
test('different similarly named figures and separate political entities are disambiguated',()=>{
 const jeroboam=findEntities(catalog,'Jeroboam','person',verses);
 assert.ok(jeroboam.some(x=>x.id==='jeroboam-i'));
 assert.ok(jeroboam.some(x=>x.id==='jeroboam-ii'));
 const hosea=findEntities(catalog,'Hosea','person',verses);
 assert.ok(hosea.some(x=>x.id==='hosea-prophet'));
 const hoshea=findEntities(catalog,'Hoshea','person',verses);
 assert.ok(hoshea.some(x=>x.id==='hoshea-king'));
 assert.notEqual(catalog.byKey.get('person:shalmaneser-v').title,catalog.byKey.get('person:sennacherib').title);
 for(const id of ['northern-israel','judah-kingdom','assyria-empire','babylonian-empire','persian-empire'])
  assert.equal(catalog.byKey.get('place:'+id).kind,'polity',id);
});
test('Hebrew Bible reference search, canonical range overlap and period filters are accurate',()=>{
 assert.ok(findEntities(catalog,'2 Kings 18:14','event',verses).some(x=>x.id==='h017'));
 assert.ok(findEntities(catalog,'2 Kings 18:20','event',verses).some(x=>x.id==='h018'));
 assert.ok(findEntities(catalog,'Nineveh','place',verses).some(x=>x.id==='nineveh'));
 assert.ok(findEntities(catalog,'Assyria','place',verses).some(x=>x.id==='assyria-empire'));
 assert.ok(findEntities(catalog,'Abraham','person',verses,'Hebrew Bible').some(x=>x.id==='abraham'));
 assert.equal(findEntities(catalog,'Abraham','person',verses,'Gospels').length,0);
 assert.ok(findEntities(catalog,'Peter','person',verses,'Gospels').some(x=>x.id==='peter'));
 assert.equal(findEntities(catalog,'Peter','person',verses,'Hebrew Bible').length,0);
 assert.equal(referenceOverlaps('2 Kings 18:14','2 Kings 18:13-17',verses),true);
 assert.equal(referenceOverlaps('2 Kings 18:14','Isaiah 36:1-3',verses),false);
});
test('selected museum links explain what the material record supports and what it does not',()=>{
 assert.equal(Object.keys(history.sources).length,5);
 for(const [id,source] of Object.entries(history.sources)){
  assert.match(source.url,/^https:\/\//,id);
  assert.ok(source.scope.length>35,id);
  assert.ok(source.title.length>15,id);
 }
 const s=catalog.byKey.get('event:h018');
 assert.ok(s.sourceLinks.some(x=>x.id==='sennacherib-prism'));
 assert.match(s.qualification,/does not claim Jerusalem was captured/i);
 assert.match(catalog.byKey.get('person:cyrus-ii').summary,/does not mention Jerusalem/i);
 assert.match(catalog.byKey.get('event:h019').qualification,/not independently verified/i);
 assert.ok(!catalog.byKey.get('place:assyria-empire').coordinates);
});
test('invalid historical source citations, event IDs and person relationships fail the build',()=>{
 const broken=structuredClone(history);
 broken.events[0].passages[0]='2 Kings 26:9';
 assert.throws(()=>buildEntityCatalog(g,j,geo,audit,city,verses,broken),/Invalid/);
 const noSource=structuredClone(history);
 noSource.events.find(x=>x.id==='h017').sourceIds=['invented-archive'];
 assert.throws(()=>buildEntityCatalog(g,j,geo,audit,city,verses,noSource),/Invalid historical source/);
 const doubled=structuredClone(history);
 doubled.people[0].id='peter';
 assert.throws(()=>buildEntityCatalog(g,j,geo,audit,city,verses,doubled),/Duplicate person ID/);
 const personEdge=structuredClone(history);
 personEdge.people.find(x=>x.id==='moses').relationships[0].to='unlisted-identity';
 assert.throws(()=>buildEntityCatalog(g,j,geo,audit,city,verses,personEdge),/Unknown person relation/);
});
test('historical entry UI gives source transparency and does not send Hebrew Bible events to Jesus map',()=>{
 const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
 const ui=readFileSync(new URL('../public/assets/entity-index.js',import.meta.url),'utf8');
 assert.match(html,/data-entity="period"/);
 assert.match(html,/Hebrew Bible/);
 assert.match(html,/political categories with changing boundaries/);
 assert.match(ui,/if\(record\.isJourney\)/);
 assert.match(ui,/independently certify the entire biblical narrative/);
 assert.match(ui,/biblical-history\.json/);
});
