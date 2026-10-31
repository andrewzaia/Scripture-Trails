import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PATHS} from '../public/assets/studies.js';
import {personTrail} from '../public/assets/person-trails.js';
import {validateCanonicalReference} from '../public/assets/reference-integrity.js';
import {validateReadingPlans} from '../public/assets/reading-plans.js';

const counts=JSON.parse(readFileSync(new URL('../public/data/verse-counts.json',import.meta.url),'utf8'));
const stage=(id,n)=>PATHS.find(p=>p.id===id)?.chapters[n-1];
test('five missing primary-text contexts have direct valid readings',()=>{
 const cases=[['creation',4,'Genesis 1'],['messiah',6,'Psalms 110'],['shepherd',5,'Isaiah 53:4-6'],['comfort',6,'Romans 8:18-27'],['messiah',3,'Isaiah 7:1-9']];
 for(const [id,n,ref] of cases){
  const chapter=stage(id,n);
  assert.ok(chapter,id+' stage '+n);
  assert.ok(chapter.readings.includes(ref),id+' stage '+n+' is missing '+ref);
  assert.ok(validateCanonicalReference(ref,counts),ref+' outside verse boundaries');
  assert.equal(new Set(chapter.readings).size,chapter.readings.length,'duplicate in '+id+' stage '+n);
  assert.ok(PATHS.find(p=>p.id===id).refs.includes(ref),'progress lookup missing '+ref);
 }
 assert.equal(PATHS.reduce((n,p)=>n+p.chapters.reduce((m,c)=>m+c.readings.length,0),0),224);
});
test('previous journal reading progress survives contextual expansion',()=>{
 const saved={creation:['Genesis 1'],messiah:['Isaiah 7:10-17','Psalms 110'],shepherd:['John 10:11-30'],covenant:['Genesis 12:1-9'],grace:['James 2:14-26'],comfort:['Romans 8:28-39']};
 const restored=validateReadingPlans(saved);
 for(const [id,refs] of Object.entries(saved)){
  assert.deepEqual(restored[id],refs);
  assert.ok(refs.every(ref=>PATHS.find(p=>p.id===id).refs.includes(ref)));
  assert.match(PATHS.find(p=>p.id===id).time,/\d+-\d+ hours/);
 }
});
test('three person links open complete narrated episodes, with honest source labels',()=>{
 const cases=[['david-king','Anointing','1 Samuel 16:12-13'],['paul-apostle','Encounter near Damascus','Acts 9:3-9'],['abraham','Isaac and the test','Genesis 22:1-19']];
 for(const [id,label,ref] of cases){
  const item=personTrail(id)?.stages.find(s=>s.label===label);
  assert.ok(item,id+' missing '+label);
  assert.equal(item.ref,ref);
  assert.ok(validateCanonicalReference(item.ref,counts));
  assert.equal(item.source,'primary-scripture');
  assert.equal(item.review,'editorial-reading-aid');
 }
 const sign=personTrail('abraham').stages.find(s=>s.label==='Covenant sign');
 assert.equal(sign.ref,'Genesis 17:9-14');
 assert.match(sign.note,/circumcision as a sign and obligation/);
 assert.doesNotMatch(sign.note,/new covenant stage/);
});
