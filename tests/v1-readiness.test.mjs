import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateRoadmap,validateV1Readiness,v1ReadinessCounts} from '../public/assets/roadmap.js';
import {CONNECTION_EVIDENCE} from '../public/assets/connection-evidence.js';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const roadmap=JSON.parse(read('public/data/roadmap.json'));
const review=JSON.parse(read('public/data/citation-review.json'));

test('v1.0 roadmap declares five launch gates with honest current baseline',()=>{
 assert.equal(validateRoadmap(roadmap),true);
 assert.equal(validateV1Readiness(roadmap.v1Readiness),true);
 assert.equal(roadmap.v1Readiness.target,'1.0.0');
 assert.equal(roadmap.v1Readiness.gates.length,5);
 assert.equal(roadmap.v1Readiness.stages.length,5);
 assert.deepEqual(v1ReadinessCounts(roadmap.v1Readiness),{met:4,open:13,total:17,ready:false});
 assert.equal(roadmap.milestones.find(m=>m.id==='v1-evidence-closeout')?.status,'next');
});

test('Atlas review deficit is displayed as pending rather than mistaken for completed scholarship',()=>{
 const records=review.records.filter(x=>x.kind==='connection');
 const reviewed=new Set(records.map(x=>x.target));
 assert.equal(CONNECTION_EVIDENCE.length,161);
 assert.equal(records.length,127);
 assert.equal(CONNECTION_EVIDENCE.filter(e=>!reviewed.has(e.id)).length,34);
 const evidence=roadmap.v1Readiness.gates.find(g=>g.id==='evidence');
 assert.equal(evidence.criteria.find(c=>c.id==='atlas-context').status,'met');
 assert.equal(evidence.criteria.find(c=>c.id==='atlas-reviews').status,'open');
 assert.equal(evidence.criteria.find(c=>c.id==='critical-claims').status,'open');
});

test('missing release gates, unsupported status and unverified manual signoff are rejected',()=>{
 for(const mutate of [
  d=>d.gates.pop(),
  d=>d.gates[0].criteria[0].status='guessed',
  d=>d.gates[0].criteria[0].evidence='',
  d=>d.gates[0].criteria[0].id=d.gates[1].criteria[0].id,
  d=>d.gates[0].criteria[1].status='met'
 ]){
  const d=structuredClone(roadmap.v1Readiness);
  mutate(d);assert.throws(()=>validateV1Readiness(d));
 }
});

test('release process enforces readiness criteria and protects unfinished launch',()=>{
 const build=JSON.parse(read('package.json')).scripts.build;
 const guard=read('scripts/check-v1-readiness.mjs');
 assert.match(build,/npm run check:v1/);
 assert.match(guard,/Version 1\.0 release blocked/);
 assert.match(guard,/unreviewed\.length/);
 const html=read('public/index.html');
 assert.match(html,/data-roadmap="v1-summary"/);
 assert.match(html,/data-roadmap="v1-stages"/);
 assert.match(html,/data-roadmap="v1-gates"/);
});
