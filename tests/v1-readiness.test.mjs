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
 assert.deepEqual(v1ReadinessCounts(roadmap.v1Readiness),{met:9,open:8,total:17,ready:false});
 assert.equal(roadmap.milestones.find(m=>m.id==='v1-evidence-closeout')?.status,'next');
});

test('Atlas review deficit is displayed as pending rather than mistaken for completed scholarship',()=>{
 const records=review.records.filter(x=>x.kind==='connection');
 const reviewed=new Set(records.map(x=>x.target));
 assert.equal(CONNECTION_EVIDENCE.length,161);
 assert.equal(records.length,161);
 assert.equal(CONNECTION_EVIDENCE.filter(e=>!reviewed.has(e.id)).length,0);
 const evidence=roadmap.v1Readiness.gates.find(g=>g.id==='evidence');
 assert.equal(evidence.criteria.find(c=>c.id==='atlas-context').status,'met');
 assert.equal(evidence.criteria.find(c=>c.id==='atlas-reviews').status,'met');
 assert.equal(evidence.criteria.find(c=>c.id==='critical-claims').status,'open');
});

test('missing release gates, unsupported status and unverified manual signoff are rejected',()=>{
 for(const mutate of [
  d=>d.gates.pop(),
  d=>d.gates[0].criteria[0].status='guessed',
  d=>d.gates[0].criteria[0].evidence='',
  d=>d.gates[0].criteria[0].id=d.gates[1].criteria[0].id,
  d=>d.gates[0].criteria[2].status='met'
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

test('provider acceptance has traceable live and simulated evidence without implied licence approval',()=>{
 const gates=roadmap.v1Readiness.gates.flatMap(g=>g.criteria);
 for(const id of ['reader-provider-smoke','provider-failures']){
  const criterion=gates.find(c=>c.id===id);
  assert.equal(criterion.status,'met');
  assert.equal(criterion.mode,'manual');
  assert.equal(criterion.reviewedOn,'2026-10-31');
  assert.match(criterion.reviewer,/AI-assisted verification/);
  assert.equal(criterion.evidence,'sources/operations/v1-reader-provider-production-smoke-2026-10-31.md');
 }
 for(const id of ['source-licences','critical-claims','live-smoke','launch-signoff'])assert.equal(gates.find(c=>c.id===id).status,'open');
 const report=read('sources/operations/v1-reader-provider-production-smoke-2026-10-31.md');
 for(const name of ['ESV','NASB20','NIV','NKJV','John 3:16','Psalms 23:1','Romans 8:28','not','licence'])assert.ok(report.includes(name));
 const packageJson=JSON.parse(read('package.json'));
 assert.equal(packageJson.scripts['check:live-reader'],'node scripts/check-live-reader.mjs');
});

test('local backup recovery is accepted by evidence while physical data loss and other gates remain open',()=>{
 const criteria=roadmap.v1Readiness.gates.flatMap(g=>g.criteria);
 const recovery=criteria.find(c=>c.id==='data-recovery');
 assert.equal(recovery.status,'met');assert.equal(recovery.mode,'manual');
 assert.equal(recovery.reviewedOn,'2026-10-31');
 assert.match(recovery.reviewer,/AI-assisted review/);
 assert.equal(recovery.evidence,'sources/operations/v1-notebook-recovery-audit-2026-10-31.md');
 const report=read(recovery.evidence);
 for(const item of ['quota','another tab','Raw','permanently lost','unencrypted','Backups'])assert.ok(report.toLowerCase().includes(item.toLowerCase()),item);
 for(const id of ['source-licences','screen-readers','cross-browser-zoom','live-smoke','launch-signoff'])assert.equal(criteria.find(c=>c.id===id).status,'open',id);
});

test('threat-model acceptance is source-linked while publisher licences and independent testing remain open',()=>{
 const gates=roadmap.v1Readiness.gates.flatMap(g=>g.criteria),review=gates.find(x=>x.id==='security-review');
 assert.equal(review.status,'met');assert.equal(review.mode,'manual');
 assert.equal(review.reviewedOn,'2026-10-31');
 assert.match(review.reviewer,/AI-assisted bounded threat-model review/);
 assert.equal(review.evidence,'sources/security/v1-privacy-threat-model-2026-10-31.md');
 const content=read(review.evidence);
 for(const term of ['FUMS','Crossway','API.Bible','XSS','CSP','rate limits','30 requests','no-referrer','unencrypted','penetration test'])assert.ok(content.includes(term),'Threat model lacks '+term);
 for(const id of ['source-licences','critical-claims','screen-readers','cross-browser-zoom','rollback','launch-signoff'])assert.equal(gates.find(x=>x.id===id).status,'open');
 assert.equal(roadmap.milestones.find(m=>m.id==='v1-security-privacy-threat-model')?.status,'delivered');
});
