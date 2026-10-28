import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CITATION_REVIEW,validateCitationReview,citationReviews,appendCitationReview,renderCitationSummary} from '../public/assets/citation-review.js';
import {CONNECTION_EVIDENCE} from '../public/assets/connection-evidence.js';
import {personTrail} from '../public/assets/person-trails.js';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const json=name=>JSON.parse(read('public/data/'+name+'.json'));
const counts=json('verse-counts'),geography=json('jesus-geography'),audit=json('jesus-audit');
const targets={issue:new Set(audit.issues.map(x=>x.id)),place:new Set(Object.keys(geography.places)),trail:new Set(personTrail('nehemiah-governor').stages.map(s=>s.ref)),connection:new Set(CONNECTION_EVIDENCE.map(x=>x.id))};
test('declared batch resolves real targets, canonical passages and scoped claim-level citations',()=>{
 assert.deepEqual(CITATION_REVIEW,json('citation-review'));
 assert.equal(validateCitationReview(CITATION_REVIEW,counts,targets),true);
 assert.equal(CITATION_REVIEW.records.length,45);
 assert.equal(CITATION_REVIEW.records.filter(r=>r.kind==='place'&&r.decision==='sources-added').length,9);
 assert.equal(CITATION_REVIEW.records.filter(r=>r.kind==='place'&&r.decision==='warning-retained').length,6);
 for(const r of CITATION_REVIEW.records.filter(r=>r.kind==='connection')){
  const e=CONNECTION_EVIDENCE.find(e=>e.id===r.target);
  assert.ok(r.passages.some(p=>p.startsWith(e.from.split(':')[0]+':')));
  assert.ok(r.passages.some(p=>p.startsWith(e.to.split(':')[0]+':')));
 }
});
test('false source scope, unsafe URLs, unknown targets and future review dates fail validation',()=>{
 for(const mutate of [d=>d.scope.issues++,d=>d.records.push(d.records[0]),d=>d.records[0].target='missing',d=>d.records[0].passages=['Luke 2:999'],d=>d.records[0].citations[0].sourceId='missing',d=>delete d.records[0].limitation,d=>d.sources.luke2.url='javascript:alert(1)',d=>d.sources.luke2.url='https://name:secret@example.test/',d=>d.sources.luke2.checkedOn='2026-02-30',d=>d.records[0].reviewedOn='2099-01-01',d=>d.status='peer-reviewed',d=>d.records.find(r=>r.kind==='place'&&r.decision==='sources-added').citations=[{sourceId:'luke2',locator:'2',supports:'site'}]]){
  const d=structuredClone(CITATION_REVIEW);mutate(d);assert.throws(()=>validateCitationReview(d,counts,targets));
 }
});
test('new place bibliography is scoped and original open issues remain open',()=>{
 for(const id of ['cana','nain','sidon','caesarea-philippi']){
  const p=geography.places[id];assert.equal(p.review.status,'source-linked');assert.equal(p.review.independentSourceCount,p.literature.length);
  assert.ok(p.literature.some(k=>geography.sources[k].checkedOn==='2026-10-28'));
 }
 for(const id of ['bethsaida-identification','emmaus-identification','nazareth-order'])assert.equal(audit.issues.find(i=>i.id===id).status,'open');
 for(const id of ['ce065','ce071']){assert.equal(CONNECTION_EVIDENCE.find(e=>e.id===id).kind,'theme');assert.equal(CONNECTION_EVIDENCE.find(e=>e.id===id).review,'editorial-reading-aid');}
 assert.match(citationReviews('issue','bethsaida-identification')[0].limitation,/report was readable/);
});
class El {
 constructor(tag){this.tagName=tag;this.children=[];this.textContent='';}
 append(...nodes){this.children.push(...nodes);}
 replaceChildren(...nodes){this.children=[...nodes];}
}
const nodes=e=>[e,...e.children.flatMap(n=>nodes(n))];
test('claim panels and About register show scope, external links and retained warnings without publisher text',t=>{
 const previous=globalThis.document;globalThis.document={createElement:tag=>new El(tag)};t.after(()=>{if(previous===undefined)delete globalThis.document;else globalThis.document=previous;});
 const root=new El('div');appendCitationReview(root,'place','nain');assert.equal(root.children.length,1);
 const all=nodes(root);assert.ok(all.some(e=>e.textContent.includes('publisher abstract')));assert.ok(all.some(e=>e.textContent.includes('Independent specialist review pending')));
 for(const a of all.filter(e=>e.tagName==='a')){assert.match(a.href,/^https:\/\//);assert.equal(a.rel,'noopener noreferrer');}
 root.replaceChildren();appendCitationReview(root,'place','not-indexed');assert.equal(root.children.length,0);
 renderCitationSummary(root);const first=nodes(root).length;renderCitationSummary(root);assert.equal(nodes(root).length,first);
 assert.equal(nodes(root).filter(e=>e.tagName==='article').length,45);
 assert.ok(nodes(root).some(e=>e.download?.endsWith('.json')));
 assert.ok(nodes(root).some(e=>e.textContent.includes('107')));
});
test('review register is reachable from About, Gospel, profiles, Atlas and comparison panel',()=>{
 for(const path of ['app.js','jesus-map.js','entity-index.js','atlas-comparison.js'])assert.match(read('public/assets/'+path),/appendCitationReview/);
 assert.match(read('public/assets/app.js'),/if\(name==='about'\)renderCitationSummary/);
 assert.match(read('public/index.html'),/id="citation-review-summary"/);
 const roadmap=json('roadmap');assert.equal(roadmap.milestones.find(m=>m.id==='source-coverage').status,'delivered');assert.equal(roadmap.milestones.find(m=>m.id==='source-coverage-followup').status,'planned');assert.equal(roadmap.milestones.find(m=>m.id==='browser-accessibility').status,'next');
});
test('scientific expansion preserves sample, calibration, publication-access and event limits',()=>{
 const trees=citationReviews('place','gethsemane')[0],jericho=citationReviews('place','jericho')[0];
 assert.match(trees.note,/three of eight.*twelfth century/);assert.match(trees.limitation,/neither date all trees/);
 assert.match(jericho.limitation,/1995 calibration/);assert.match(jericho.limitation,/neither attackers/);
 assert.match(citationReviews('place','bethany')[0].limitation,/full monograph remains unread/);
 for(const key of ['gethsemane-dating','jerusalem-radiocarbon','jericho-radiocarbon','olives-cave','bethany-saller','bethany-heritage','gethsemane-bath']){
  const s=CITATION_REVIEW.sources[key];assert.ok(s.author&&s.publisher&&s.access);assert.equal(s.checkedOn,'2026-10-28');
 }
 const cities=json('city-studies');for(const id of ['jerusalem','jericho']){const f=cities.cities.find(c=>c.id===id).findings.find(f=>f.title==='Radiocarbon evidence and chronology');assert.ok(f.sourceIds.length);assert.ok(f.limitation.length>60);}
});
