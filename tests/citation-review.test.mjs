import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CITATION_REVIEW,validateCitationReview,citationReviews,appendCitationReview,renderCitationSummary} from '../public/assets/citation-review.js';
import {CONNECTION_EVIDENCE} from '../public/assets/connection-evidence.js';
import {personTrail} from '../public/assets/person-trails.js';
import {validateCanonicalReference} from '../public/assets/reference-integrity.js';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const json=name=>JSON.parse(read('public/data/'+name+'.json'));
const counts=json('verse-counts'),geography=json('jesus-geography'),audit=json('jesus-audit');
const targets={issue:new Set(audit.issues.map(x=>x.id)),place:new Set(Object.keys(geography.places)),trail:new Set(personTrail('nehemiah-governor').stages.map(s=>s.ref)),connection:new Set(CONNECTION_EVIDENCE.map(x=>x.id))};
test('declared batch resolves real targets, canonical passages and scoped claim-level citations',()=>{
 assert.deepEqual(CITATION_REVIEW,json('citation-review'));
 assert.equal(validateCitationReview(CITATION_REVIEW,counts,targets),true);
 assert.equal(CITATION_REVIEW.records.length,105);
 assert.equal(CITATION_REVIEW.records.filter(r=>r.kind==='place'&&r.decision==='sources-added').length,15);
 assert.equal(CITATION_REVIEW.records.filter(r=>r.kind==='place'&&r.decision==='warning-retained').length,0);
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
 assert.equal(nodes(root).filter(e=>e.tagName==='article').length,105);
 assert.ok(nodes(root).some(e=>e.download?.endsWith('.json')));
 assert.ok(nodes(root).some(e=>e.textContent.includes('47')));
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

test('six geography additions retain event, period and identity limits',()=>{
 const expected={sychar:/do not date the cutting/, 'east-shore':/do not establish a first-century/,mountain:/not endorsing Tabor or Hermon/,ephraim:/different textual and historical scopes/,bethphage:/unexcavated or incompletely/,emmaus:/does not establish Luke/};
 for(const [id,pattern] of Object.entries(expected)){const r=citationReviews('place',id)[0];assert.equal(r.decision,'sources-added');assert.match(r.limitation,pattern);assert.ok(r.citations.length>=2);assert.equal(geography.places[id].review.status,'source-linked');}
 assert.match(CITATION_REVIEW.sources['ephraim-peq'].access,/early Hebrew geography/);
 assert.match(CITATION_REVIEW.sources['transfiguration-location'].access,/note 34/);
});

test('first twenty further connection assessments have actual anchors and explicit research limits',()=>{
 const b=CITATION_REVIEW.batches.find(b=>b.id==='connections-20-01');assert.equal(b.targets.length,20);assert.equal(new Set(b.targets).size,20);
 for(const id of b.targets){const r=citationReviews('connection',id)[0],e=CONNECTION_EVIDENCE.find(e=>e.id===id);assert.equal(r.batch,b.id);assert.equal(r.anchor,e.from);assert.ok(r.citations.length>=2);assert.match(r.limitation,/not|distinct|outside|retai|compare|Compare|Keep|Read|does/i);}
 assert.equal(CONNECTION_EVIDENCE.find(e=>e.id==='ce040').kind,'quotation');assert.equal(CONNECTION_EVIDENCE.find(e=>e.id==='ce041').kind,'echo');
 assert.match(citationReviews('connection','ce013')[0].note,/2 Samuel 5:2/);assert.match(citationReviews('connection','ce014')[0].note,/Isaiah 58:6/);
 assert.match(CITATION_REVIEW.batches[0].method,/Five assessments/);
});

test('second narrative batch retains account differences and follow-ups add scoped named commentary',()=>{
 const batch=CITATION_REVIEW.batches.find(b=>b.id==='connections-20-02');
 assert.equal(batch.count,20);
 for(const id of batch.targets){
  const r=citationReviews('connection',id)[0],e=CONNECTION_EVIDENCE.find(e=>e.id===id);
  assert.equal(r.anchor,e.from);assert.equal(r.note,e.explanation);
  assert.ok(r.limitation.includes(e.caution));assert.equal(r.citations.length,2);
  assert.match(r.limitation,/independent specialist review remain open/);
 }
 for(const [id,pattern] of [['ce098',/different orders/],['ce101',/Levi son of Alphaeus/],['ce104',/six days/],['ce110',/Mark 16:1-8/],['ce112',/one literary work/]])assert.match(citationReviews('connection',id)[0].limitation,pattern);
 const followup=CITATION_REVIEW.batches.find(b=>b.id==='connections-support-01');assert.equal(followup.count,12);
 for(const id of followup.targets){
  const r=citationReviews('connection',id)[0];
  assert.ok(r.citations.some(c=>CITATION_REVIEW.sources[c.sourceId].kind==='scholarly-commentary'));
  assert.match(r.limitation,/independent specialist review/);
 }
 assert.match(citationReviews('connection','ce044')[0].note,/Exodus 23:20/);
 assert.match(citationReviews('connection','ce030')[0].note,/ultimate giver/);
 for(const mutate of [d=>d.batches[1].count++,d=>d.batches[1].targets[0]='missing',d=>d.batches[1].id=d.batches[0].id,d=>d.records.find(r=>r.supportBatch).supportBatch='missing']){
  const d=structuredClone(CITATION_REVIEW);mutate(d);assert.throws(()=>validateCitationReview(d,counts,targets));
 }
});

test('third batch ties twenty distinct anchors to complete contexts and scoped named commentary',()=>{
 const batch=CITATION_REVIEW.batches.find(b=>b.id==='connections-20-03');
 assert.deepEqual(batch.targets,['ce015','ce016','ce025','ce026','ce029','ce033','ce035','ce036','ce037','ce038','ce039','ce042','ce045','ce046','ce047','ce048','ce049','ce050','ce051','ce058']);
 assert.equal(batch.count,20);
 const contains=(range,anchor)=>range.book===anchor.book&&range.startChapter===anchor.startChapter&&range.endChapter===anchor.endChapter&&range.startVerse<=anchor.startVerse&&range.endVerse>=anchor.endVerse;
 for(const id of batch.targets){
  const r=citationReviews('connection',id)[0],e=CONNECTION_EVIDENCE.find(e=>e.id===id);
  assert.equal(r.batch,batch.id);assert.equal(r.reviewedOn,'2026-10-29');assert.equal(r.anchor,e.from);
  assert.equal(r.note,e.explanation);assert.ok(r.limitation.includes(e.caution));assert.equal(e.context,r.passages[1]);
  assert.ok(contains(validateCanonicalReference(r.passages[0],counts),validateCanonicalReference(e.from,counts)));
  assert.ok(contains(validateCanonicalReference(r.passages[1],counts),validateCanonicalReference(e.to,counts)));
  assert.equal(r.citations.length,3);
  assert.equal(r.citations.filter(c=>CITATION_REVIEW.sources[c.sourceId].kind==='primary-scripture').length,2);
  const commentary=r.citations.find(c=>CITATION_REVIEW.sources[c.sourceId].kind==='scholarly-commentary');assert.ok(commentary);
  const s=CITATION_REVIEW.sources[commentary.sourceId];assert.ok(r.note.includes(s.author));assert.equal(s.checkedOn,r.reviewedOn);
  assert.match(s.access,/selected readable discussion/);assert.match(s.access,/Confessional interpretation/);
  assert.match(r.limitation,/independent specialist review remain open/);
  assert.equal(e.kind,id==='ce038'?'echo':'theme');
 }
 const connections=CITATION_REVIEW.records.filter(r=>r.kind==='connection');
 assert.equal(connections.length,68);assert.equal(CONNECTION_EVIDENCE.filter(e=>!connections.some(r=>r.target===e.id)).length,47);
 assert.equal(connections.filter(r=>r.citations.some(c=>['scholarly-commentary','publisher-note','publisher-abstract'].includes(CITATION_REVIEW.sources[c.sourceId].kind))).length,36);
});

test('third batch keeps quotation, interpretation and suffering limits visible',()=>{
 const review=id=>citationReviews('connection',id)[0];
 assert.match(review('ce015').note,/Isaiah 65:17/);
 assert.match(review('ce025').note,/Ezekiel 47/);
 assert.match(review('ce029').limitation,/does not quote Genesis 12:3/);
 assert.match(review('ce037').limitation,/does not explicitly quote Isaiah 9:6/);
 assert.match(review('ce045').limitation,/does not make the two arguments identical/);
 assert.match(review('ce046').limitation,/not be used to blame distressed readers/);
 assert.match(review('ce047').limitation,/Galilee.*Jerusalem/);
 assert.match(review('ce058').limitation,/fixed end-times sequence/);
 assert.equal(CONNECTION_EVIDENCE.length,115);
});
