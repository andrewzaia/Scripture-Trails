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
 assert.deepEqual(v1ReadinessCounts(roadmap.v1Readiness),{met:14,acceptedRisk:2,open:1,total:17,ready:false});
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
 assert.equal(evidence.criteria.find(c=>c.id==='critical-claims').status,'met');
 assert.equal(evidence.criteria.find(c=>c.id==='critical-claims').mode,'editorial');
});

test('missing release gates, unsupported status and unverified manual signoff are rejected',()=>{
 for(const mutate of [
  d=>d.gates.pop(),
  d=>d.gates[0].criteria[0].status='guessed',
  d=>d.gates[0].criteria[0].evidence='',
  d=>d.gates[0].criteria[0].id=d.gates[1].criteria[0].id,
  d=>{delete d.gates[0].criteria[2].reviewer;}
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
 for(const id of ['launch-signoff'])assert.equal(gates.find(c=>c.id===id).status,'open');
 const report=read('sources/operations/v1-reader-provider-production-smoke-2026-10-31.md');
 for(const name of ['ESV','NASB20','NIV','NKJV','John 3:16','Psalms 23:1','Romans 8:28','not','licence'])assert.ok(report.includes(name));
 const packageJson=JSON.parse(read('package.json'));
 assert.equal(packageJson.scripts['check:live-reader'],'node scripts/check-live-reader.mjs');
});

test('owner risk acceptance never masquerades as physical-device testing',()=>{
 const readiness=roadmap.v1Readiness;
 const criteria=readiness.gates.flatMap(g=>g.criteria);
 for(const id of ['screen-readers','cross-browser-zoom']){
  const criterion=criteria.find(c=>c.id===id);
  assert.equal(criterion.status,'accepted-risk');
  assert.equal(criterion.mode,'manual');
  assert.equal(criterion.reviewedOn,'2026-11-02');
  assert.match(criterion.reviewer,/project owner/i);
  assert.equal(criterion.evidence,'sources/operations/v1-device-compatibility-owner-acceptance-2026-11-02.md');
  assert.match(criterion.risk,/No verified/i);
  for(const mutation of [
   c=>{delete c.risk;},
   c=>{delete c.reviewer;},
   c=>{c.mode='automated';},
   c=>{c.id='launch-signoff';}
  ]){
   const copy=structuredClone(readiness);
   const target=copy.gates.flatMap(g=>g.criteria).find(c=>c.id===id);
   mutation(target);
   assert.throws(()=>validateV1Readiness(copy));
  }
 }
 assert.equal(v1ReadinessCounts(readiness).ready,false);
 const record=read('sources/operations/v1-device-compatibility-owner-acceptance-2026-11-02.md');
 for(const term of ['VoiceOver','TalkBack','Safari','unverified','not','owner'])assert.ok(record.toLowerCase().includes(term.toLowerCase()),term);
});

test('owner-accepted publisher rights are qualified, dated and not described as an independent account audit',()=>{
 const gates=roadmap.v1Readiness.gates.flatMap(g=>g.criteria);
 const c=gates.find(x=>x.id==='source-licences');
 assert.equal(c.status,'met');
 assert.equal(c.mode,'manual');
 assert.equal(c.reviewedOn,'2026-11-02');
 assert.match(c.reviewer,/Project owner/);
 assert.match(c.reviewer,/not independently inspected/);
 assert.equal(c.evidence,'sources/legal/publisher-rights-review-2026-10-31.md');
 const evidence=read(c.evidence);
 assert.match(evidence,/Acceptance addendum - 2 November 2026/);
 assert.match(evidence,/owner contractual acceptance/i);
 assert.match(evidence,/not an independent legal opinion/i);
 assert.match(evidence,/5,000 monthly end users/);
 assert.match(evidence,/confidential/i);
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
 for(const id of ['screen-readers','cross-browser-zoom'])assert.equal(criteria.find(c=>c.id===id).status,'accepted-risk',id);
 assert.equal(criteria.find(c=>c.id==='launch-signoff').status,'open');
});

test('threat-model acceptance is source-linked while publisher licences and independent testing remain open',()=>{
 const gates=roadmap.v1Readiness.gates.flatMap(g=>g.criteria),review=gates.find(x=>x.id==='security-review');
 assert.equal(review.status,'met');assert.equal(review.mode,'manual');
 assert.equal(review.reviewedOn,'2026-10-31');
 assert.match(review.reviewer,/AI-assisted bounded threat-model review/);
 assert.equal(review.evidence,'sources/security/v1-privacy-threat-model-2026-10-31.md');
 const content=read(review.evidence);
 for(const term of ['FUMS','Crossway','API.Bible','XSS','CSP','rate limits','30 requests','no-referrer','unencrypted','penetration test'])assert.ok(content.includes(term),'Threat model lacks '+term);
 for(const id of ['screen-readers','cross-browser-zoom'])assert.equal(gates.find(x=>x.id===id).status,'accepted-risk');
 assert.equal(gates.find(x=>x.id==='launch-signoff').status,'open');
 assert.equal(roadmap.milestones.find(m=>m.id==='v1-security-privacy-threat-model')?.status,'delivered');
});

test('v1 launch ledger remains explicit about unresolved gates and documents production verification commands',()=>{
 const r=roadmap.v1Readiness;
 assert.equal(r.updated,'2026-11-02');
 const counts=v1ReadinessCounts(r);
 assert.deepEqual(counts,{met:14,acceptedRisk:2,open:1,total:17,ready:false});
 const ledger=read('sources/operations/v1-launch-evidence-ledger-2026-11-01.md');
 for(const id of ['critical-claims','source-licences','content-audit','screen-readers','cross-browser-zoom','rollback','live-smoke','launch-signoff'])assert.ok(ledger.includes(id),id);
 assert.match(ledger,/Verified production recovery exercise/);
 assert.match(ledger,/ba8a6f38-60d0-4f18-9f2b-f1d5ddcee3f8/);
 assert.match(ledger,/55626de6-2faf-489b-b737-98efa26a40ec/);
 assert.match(ledger,/not a screen-reader certification/);
 const p=JSON.parse(read('package.json'));
 assert.equal(p.scripts['check:live-v1'],'node scripts/check-live-v1.mjs');
 assert.match(ledger,/check:live-v1/);
});

test('real Cloudflare rollback recovery is accepted as a scoped manual gate with distinct evidence',()=>{
 const criterion=roadmap.v1Readiness.gates.flatMap(g=>g.criteria).find(x=>x.id==='rollback');
 assert.equal(criterion.status,'met');
 assert.equal(criterion.mode,'manual');
 assert.equal(criterion.reviewedOn,'2026-11-01');
 assert.match(criterion.reviewer,/Cloudflare live-production operational verification/);
 assert.equal(criterion.evidence,'sources/operations/v1-launch-evidence-ledger-2026-11-01.md');
 const ledger=read(criterion.evidence);
 for(const marker of ['v0.44.19','v0.44.20','9301e903325e0bfbead45e6443064b0c60183322','9b0bd28e99c1e32aa3278cfc5fd102402a544bd8','www.scripturetrails.com'])assert.ok(ledger.includes(marker),marker);
});

test('owner-led scholarly acceptance and actual production acceptance have dated, distinct evidence',()=>{
 const gates=roadmap.v1Readiness.gates.flatMap(g=>g.criteria);
 for(const id of ['critical-claims','content-audit']){
  const c=gates.find(x=>x.id===id);
  assert.equal(c.status,'met');assert.equal(c.mode,'editorial');assert.equal(c.reviewedOn,'2026-11-01');
  assert.match(c.reviewer,/project owner/i);
  assert.equal(c.evidence,'sources/editorial/v1-owner-scholarly-acceptance-2026-11-01.md');
 }
 const owner=read('sources/editorial/v1-owner-scholarly-acceptance-2026-11-01.md');
 assert.match(owner,/owner-declared scholarly and editorial signoff/i);
 assert.match(owner,/not.*independently.*peer review/i);
 const smoke=gates.find(x=>x.id==='live-smoke');
 assert.equal(smoke.status,'met');assert.equal(smoke.reviewedOn,'2026-11-01');
 assert.equal(smoke.evidence,'sources/operations/v1-production-acceptance-v0.44.19-2026-11-01.md');
 const live=read(smoke.evidence);
 for(const term of ['9301e903325e0bfbead45e6443064b0c60183322','41278653454','FUMS','v1.0'])assert.ok(live.includes(term),term);
 for(const id of ['screen-readers','cross-browser-zoom'])assert.equal(gates.find(x=>x.id===id).status,'accepted-risk');
 assert.equal(gates.find(x=>x.id==='launch-signoff').status,'open');
});
