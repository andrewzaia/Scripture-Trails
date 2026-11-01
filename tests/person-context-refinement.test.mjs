import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {personTrail,PERSON_TRAILS} from '../public/assets/person-trails.js';
import {validateCanonicalReference} from '../public/assets/reference-integrity.js';

const counts=JSON.parse(readFileSync(new URL('../public/data/verse-counts.json',import.meta.url),'utf8'));
test('Moses departure and Solomon ark stage readings include the narrated actions',()=>{
 const m=personTrail('moses').stages.find(s=>s.label==='Departure from Egypt');
 const s=personTrail('solomon-king').stages.find(s=>s.label==='The ark enters the temple');
 assert.equal(m.ref,'Exodus 12:31-42');
 assert.match(m.note,/orders Israel to leave/);
 assert.match(m.note,/departure from Egypt/);
 assert.equal(s.ref,'1 Kings 8:1-11');
 assert.match(s.note,/priests place the ark in the inner sanctuary/);
 assert.match(s.note,/cloud fills the temple/);
 for(const stage of [m,s]){
  assert.ok(validateCanonicalReference(stage.ref,counts),stage.ref+' out of bounds');
  assert.equal(stage.source,'primary-scripture');
  assert.equal(stage.review,'editorial-reading-aid');
 }
});
test('all 20 people trails, 88 stages, and previous high-priority links remain intact',()=>{
 assert.equal(PERSON_TRAILS.length,20);
 assert.equal(PERSON_TRAILS.reduce((n,p)=>n+p.stages.length,0),88);
 assert.equal(new Set(PERSON_TRAILS.map(p=>p.personId)).size,20);
 assert.equal(personTrail('david-king').stages.find(x=>x.label==='Anointing').ref,'1 Samuel 16:12-13');
 assert.equal(personTrail('paul-apostle').stages.find(x=>x.label==='Encounter near Damascus').ref,'Acts 9:3-9');
 assert.equal(personTrail('abraham').stages.find(x=>x.label==='Isaac and the test').ref,'Genesis 22:1-19');
});
