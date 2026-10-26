import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateJourneyData,validatePlaceStudies,passageStart} from '../public/assets/jesus-map.js';
import {validateRoadmap} from '../public/assets/roadmap.js';
import {parseRef} from '../public/assets/books.js';
const read=name=>JSON.parse(readFileSync(new URL(`../public/data/${name}`,import.meta.url),'utf8'));
const itinerary=read('jesus-journeys.json'),geography=read('jesus-geography.json'),roadmap=read('roadmap.json');
test('all 35 Gospel and Acts map places have archaeological and biblical dossiers',()=>{
 assert.equal(validateJourneyData(itinerary),true);
 assert.equal(validatePlaceStudies(geography,itinerary),true);
 assert.equal(Object.keys(geography.places).length,itinerary.places.length);
 for(const place of itinerary.places){const record=geography.places[place.id];assert.ok(record.ancientNames.length);assert.ok(record.modernSetting);assert.ok(record.archaeology.length>=55);assert.ok(record.caution.length>=40);}
});
test('Old Testament historical references are valid and are not mislabelled as Jesus visits',()=>{
 let total=0;for(const [id,p] of Object.entries(geography.places))for(const citation of p.oldTestament){
  assert.ok(parseRef(passageStart(citation.ref)),`${id} ${citation.ref}`);
  assert.ok(parseRef(passageStart(citation.ref)).book.testament==='Old Testament');total++;
 }assert.ok(total>=20);
});
test('named heritage and archaeology sources are HTTPS and remain editorially separate from passages',()=>{
 assert.ok(Object.keys(geography.sources).length>=9);
 for(const [key,source] of Object.entries(geography.sources)){
  assert.match(source.url,/^https:\/\//,key);assert.ok(source.title.length>8);assert.ok(source.kind);
 }
 assert.deepEqual(geography.places.emmaus.literature,[]);
 assert.equal(geography.places.emmaus.evidenceLevel,'disputed');
 assert.equal(geography.places.egypt.evidenceLevel,'regional');
 assert.notEqual(geography.places['beyond-jordan'].modernSetting,geography.places.bethany.modernSetting);
});
test('roadmap data is complete and keeps completed distinct from planned work',()=>{
 assert.equal(validateRoadmap(roadmap),true);
 assert.ok(roadmap.milestones.length>=14);
 assert.ok(roadmap.milestones.filter(m=>m.status==='delivered').length>=6);
 assert.ok(roadmap.milestones.filter(m=>m.status==='next').length>=2);
 assert.ok(roadmap.milestones.some(m=>m.id==='places'&&m.status==='delivered'));
 assert.ok(roadmap.milestones.some(m=>m.id==='bible-languages'&&m.status==='research'));
 for(const m of roadmap.milestones)assert.ok(m.verification.length>=45);
});
test('unknown source IDs or missing research place details are rejected',()=>{
 const missing=structuredClone(geography);delete missing.places.bethlehem;assert.throws(()=>validatePlaceStudies(missing,itinerary));
 const noSource=structuredClone(geography);noSource.places.bethlehem.literature.push('invented');assert.throws(()=>validatePlaceStudies(noSource,itinerary));
});
