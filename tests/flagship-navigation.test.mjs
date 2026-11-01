import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildEntityCatalog} from '../public/assets/entity-index-data.js';
import {PATHS} from '../public/assets/studies.js';
import {PERSON_TRAILS} from '../public/assets/person-trails.js';
import {validateCanonicalReference} from '../public/assets/reference-integrity.js';
import {validateReadingPlans} from '../public/assets/reading-plans.js';
import {validateRoadmap} from '../public/assets/roadmap.js';
const read=name=>JSON.parse(readFileSync(new URL('../public/data/'+name,import.meta.url),'utf8'));
const counts=read('verse-counts.json'),gospel=read('jesus-journeys.json'),paul=read('pauline-journeys.json');
const people=read('biblical-people.json'),expanded=read('biblical-people-expanded.json');
const history=read('biblical-history.json'),geo=read('jesus-geography.json'),audit=read('jesus-audit.json'),cities=read('city-studies.json');
const catalog=buildEntityCatalog(people,gospel,geo,audit,cities,counts,history,expanded);
const app=readFileSync(new URL('../public/assets/app.js',import.meta.url),'utf8');

test('all twenty person trails resolve to unique indexed people and reading actions',()=>{
 assert.equal(PERSON_TRAILS.length,20);
 assert.equal(new Set(PERSON_TRAILS.map(t=>t.personId)).size,20);
 for(const trail of PERSON_TRAILS){
  const person=catalog.byKey.get('person:'+trail.personId);
  assert.ok(person,'Person trail has no target in the index: '+trail.personId);
  assert.ok(person.title,'Indexed person has no visible title: '+trail.personId);
  assert.ok(trail.stages.length>=4,'No trail stages: '+trail.personId);
  for(const ref of [...trail.stages.map(s=>s.ref),...trail.study.furtherRefs]){
   assert.ok(validateCanonicalReference(ref,counts),'Broken person reading link: '+trail.personId+' '+ref);
  }
 }
});
test('every journey stop and Gospel place has an indexed destination and canonical reader target',()=>{
 assert.equal(gospel.events.length,79);assert.equal(paul.events.length,83);
 for(const episode of gospel.events){
  assert.ok(catalog.byKey.has('event:'+episode.id),'Missing index event: '+episode.id);
  assert.ok(catalog.byKey.has('place:'+episode.place),'Missing indexed location: '+episode.place);
  for(const ref of [...episode.passages,...episode.study.crossReferences]){
   assert.ok(validateCanonicalReference(ref,counts),'Broken Gospel reading: '+episode.id+' '+ref);
  }
 }
 for(const episode of paul.events){
  assert.ok(episode.study,'Missing Pauline stage study: '+episode.id);
  for(const ref of [...episode.passages,...episode.study.crossReferences])assert.ok(validateCanonicalReference(ref,counts),'Broken Acts stage reading: '+episode.id+' '+ref);
 }
 for(const id of ['jerusalem','nazareth','capernaum','bethlehem','jericho'])assert.ok(cities.cities.some(c=>c.id===id),'Broken historic city link: '+id);
});
test('all six journal permalinks reference immutable plan identifiers and saved progress data',()=>{
 assert.deepEqual(PATHS.map(x=>x.id),['creation','messiah','shepherd','covenant','grace','comfort']);
 for(const journal of PATHS){
  assert.equal(journal.chapters.length,6);
  assert.ok(journal.refs.length>=35,journal.id);
  assert.deepEqual(validateReadingPlans({[journal.id]:[journal.refs[0]]})[journal.id],[journal.refs[0]]);
  for(const ref of journal.refs)assert.ok(validateCanonicalReference(ref,counts),'Broken journal target: '+journal.id+' '+ref);
 }
 assert.match(app,/url\.searchParams\.set\('journey',id\)/);
 assert.match(app,/PATHS\.some\(path=>path\.id===requested\)/);
 assert.match(app,/else url\.searchParams\.delete\('journey'\)/);
 assert.match(app,/history\.pushState\(\{\},'',url\);showView\('journeys',false,true\)/);
 assert.match(app,/history\.pushState\(\{\},'',url\);showView\('entities',false,true\)/);
});
test('flagship navigation retains source evidence alongside owner scholarly content acceptance',()=>{
 const roadmap=read('roadmap.json');
 assert.equal(validateRoadmap(roadmap),true);
 assert.equal(roadmap.milestones.find(m=>m.id==='v1-flagship-navigation-links')?.status,'delivered');
 assert.equal(roadmap.v1Readiness.gates.flatMap(g=>g.criteria).find(c=>c.id==='content-audit')?.status,'met');
});
