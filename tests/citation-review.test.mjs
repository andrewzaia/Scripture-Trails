import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {CITATION_REVIEW,validateCitationReview,citationReviews,appendCitationReview,renderCitationSummary,commentaryCoverage,reviewCitations} from '../public/assets/citation-review.js';
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
 assert.equal(CITATION_REVIEW.records.length,152);
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
 assert.equal(nodes(root).filter(e=>e.tagName==='article').length,152);
 assert.ok(nodes(root).some(e=>e.download?.endsWith('.json')));
 assert.ok(nodes(root).some(e=>e.textContent.includes('All 115 previously assessed pairs have dated editorial assessments')));
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
 assert.equal(connections.length,115);assert.equal(CONNECTION_EVIDENCE.filter(e=>!connections.some(r=>r.target===e.id)).length,46);
 assert.equal(connections.filter(r=>r.citations.some(c=>['scholarly-commentary','publisher-note','publisher-abstract'].includes(CITATION_REVIEW.sources[c.sourceId].kind))).length,83);
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
 assert.equal(CONNECTION_EVIDENCE.length,161);
});

test('fourth batch adds twenty bounded narrative parallels with scoped commentary',()=>{
 const batch=CITATION_REVIEW.batches.find(b=>b.id==='connections-20-04');
 assert.deepEqual(batch.targets,['ce020','ce021','ce066','ce067','ce068','ce069','ce070','ce073','ce074','ce075','ce076','ce077','ce078','ce079','ce080','ce081','ce082','ce083','ce084','ce085']);
 assert.equal(batch.count,20);
 const contains=(range,anchor)=>range.book===anchor.book&&range.startChapter===anchor.startChapter&&range.endChapter===anchor.endChapter&&range.startVerse<=anchor.startVerse&&range.endVerse>=anchor.endVerse;
 const scholars=new Set(),authors=new Set();
 for(const id of batch.targets){
  const r=citationReviews('connection',id)[0],e=CONNECTION_EVIDENCE.find(e=>e.id===id);
  assert.equal(r.batch,batch.id);assert.equal(r.reviewedOn,'2026-10-29');assert.equal(r.anchor,e.from);
  assert.equal(e.kind,'parallel');assert.equal(e.review,'scripture-context-screened');assert.equal(e.context,r.passages[1]);
  assert.equal(r.note,e.explanation);assert.ok(r.limitation.startsWith(e.caution));
  assert.ok(contains(validateCanonicalReference(r.passages[0],counts),validateCanonicalReference(e.from,counts)));
  assert.ok(contains(validateCanonicalReference(r.passages[1],counts),validateCanonicalReference(e.to,counts)));
  assert.equal(r.citations.length,3);
  assert.equal(r.citations.filter(c=>CITATION_REVIEW.sources[c.sourceId].kind==='primary-scripture').length,2);
  const citations=r.citations.filter(c=>CITATION_REVIEW.sources[c.sourceId].kind==='scholarly-commentary');assert.equal(citations.length,1);
  const c=citations[0],s=CITATION_REVIEW.sources[c.sourceId];scholars.add(c.sourceId);authors.add(s.author);
  assert.ok(r.note.includes(s.author));assert.equal(s.checkedOn,r.reviewedOn);assert.ok(c.locator.length>20&&c.supports.length>20);
  assert.match(r.limitation,/independent specialist review remain open/);
 }
 assert.equal(scholars.size,6);assert.equal(authors.size,4);
 assert.match(CITATION_REVIEW.sources['b4-1kings'].access,/indexed excerpts.*HTTP 403/);
 assert.match(CITATION_REVIEW.sources['b4-2chronicles'].access,/indexed excerpts.*HTTP 403/);
 assert.match(batch.method,/two commentaries was limited to indexed excerpts/);
 const followup=json('roadmap').milestones.find(m=>m.id==='source-coverage-followup');assert.match(followup.summary,/115 of 115.*32.*commentary follow-ups/);
});

test('fourth narrative batch preserves consequential differences and access limits',()=>{
 const review=id=>citationReviews('connection',id)[0];
 for(const [id,pattern] of [['ce020',/tribute/],['ce021',/priests carrying.*Levites/],['ce066',/explicit theological verdict/],['ce068',/Narrative placement alone does not date/],['ce069',/different threshing-floor names/],['ce070',/Chronicles omits that clause/],['ce074',/not a settled chronological result/],['ce076',/modern nation/],['ce077',/queen is unnamed/],['ce078',/not demonstrate that those works are extant/],['ce080',/differently named mother/],['ce081',/Ezra.*not adopted/],['ce083',/English ESV numbering/],['ce085',/distinct people.*modern diagnosis/]])assert.match(review(id).limitation,pattern);
 assert.match(review('ce080').limitation,/indexed passage excerpts/);
 assert.equal(CITATION_REVIEW.scope.connections,115);
 assert.equal(CONNECTION_EVIDENCE.length-CITATION_REVIEW.scope.connections,46);
});

test('fourth batch preserves all previous dated assessments and source records',()=>{
 const digest=value=>createHash('sha256').update(JSON.stringify(value, (key,value)=>key==='supplement'?undefined:value)).digest('hex');
 assert.equal(digest(CITATION_REVIEW.records.slice(0,105)),'65b0a7ad0ff29c87815075702742b7342085c2db3f921e83601c731f37c834ce');
 assert.equal(digest(Object.fromEntries(Object.entries(CITATION_REVIEW.sources).slice(0,190))),'35c34ed5434903be0028b2aad319d2de9113df5b7313947e2b3d711e72185268');
});

test('fifth batch assesses twenty remaining pairs with contained anchors and scoped named sources',()=>{
 const batch=CITATION_REVIEW.batches.find(b=>b.id==='connections-20-05');
 assert.deepEqual(batch.targets,['ce018','ce019','ce023','ce024','ce034','ce052','ce053','ce054','ce055','ce056','ce057','ce059','ce060','ce061','ce062','ce063','ce064','ce087','ce088','ce089']);
 assert.equal(batch.count,20);
 const contains=(range,anchor)=>range.book===anchor.book&&range.startChapter===anchor.startChapter&&range.endChapter===anchor.endChapter&&range.startVerse<=anchor.startVerse&&range.endVerse>=anchor.endVerse;
 const scholars=new Set(),authors=new Set(),kinds={};
 for(const id of batch.targets){
  const r=citationReviews('connection',id)[0],e=CONNECTION_EVIDENCE.find(e=>e.id===id);
  assert.equal(r.batch,batch.id);assert.equal(r.reviewedOn,'2026-10-29');assert.equal(r.anchor,e.from);
  assert.equal(e.review,'scripture-context-screened');assert.equal(e.context,r.passages[1]);assert.equal(r.note,e.explanation);assert.ok(r.limitation.startsWith(e.caution));
  assert.ok(contains(validateCanonicalReference(r.passages[0],counts),validateCanonicalReference(e.from,counts)));
  assert.ok(contains(validateCanonicalReference(r.passages[1],counts),validateCanonicalReference(e.to,counts)));
  assert.equal(r.citations.length,3);assert.equal(new Set(r.citations.map(c=>c.sourceId)).size,3);
  assert.equal(r.citations.filter(c=>CITATION_REVIEW.sources[c.sourceId].kind==='primary-scripture').length,2);
  const commentary=r.citations.filter(c=>CITATION_REVIEW.sources[c.sourceId].kind==='scholarly-commentary');assert.equal(commentary.length,1);
  const s=CITATION_REVIEW.sources[commentary[0].sourceId];scholars.add(commentary[0].sourceId);authors.add(s.author);kinds[e.kind]=(kinds[e.kind]||0)+1;
  assert.ok(r.note.includes(s.author));assert.equal(s.checkedOn,r.reviewedOn);assert.match(s.access,/Selected readable discussion checked/);assert.match(s.access,/Confessional interpretation/);
  assert.match(r.limitation,/independent specialist review remain open/);
 }
 assert.equal(scholars.size,17);assert.equal(authors.size,16);assert.deepEqual(kinds,{parallel:7,theme:13});
 const assessed=new Set(CITATION_REVIEW.records.slice(0,145).filter(r=>r.kind==='connection').map(r=>r.target));
 assert.deepEqual(CONNECTION_EVIDENCE.filter(e=>Number(e.id.slice(2))<=115&&!assessed.has(e.id)).map(e=>e.id),['ce086','ce090','ce091','ce092','ce093','ce094','ce095']);
});

test('fifth batch retains account differences, bodily life, harm and the single Revelation vision',()=>{
 const review=id=>citationReviews('connection',id)[0];
 for(const [id,pattern] of [['ce018',/Matthew's additional petitions/],['ce019',/loveless Judaism/],['ce023',/companions' hearing.*not silently harmonised/],['ce024',/later retelling is not independent/],['ce034',/domineering leadership/],['ce052',/good works that follow/],['ce053',/precedes Lazarus's emergence/],['ce054',/permission for coercion/],['ce055',/does not explicitly cite Ecclesiastes/],['ce056',/Ephesians 2:10/],['ce057',/bodies are evil/],['ce059',/must not excuse abuse/],['ce060',/positive thinking/],['ce061',/excuse wrongdoing/],['ce062',/pairing with Ephesians is thematic/],['ce063',/reject evidence/],['ce064',/one passage, not two independent/],['ce087',/not its full implementation/],['ce088',/verified plague diagnosis/],['ce089',/differing order of remedy and sign/]])assert.match(review(id).limitation,pattern);
 const vision=review('ce064');assert.equal(vision.passages[0],vision.passages[1]);assert.match(vision.title,/within one vision/);
 const texts=vision.citations.map(c=>CITATION_REVIEW.sources[c.sourceId]).filter(s=>s.kind==='primary-scripture');
 assert.deepEqual(new Set(texts.map(s=>s.publisher)),new Set(['USCCB','Crossway']));assert.equal(new Set(texts.map(s=>s.url)).size,2);
 assert.equal(CITATION_REVIEW.scope.connections,115);
});

test('fifth batch preserves the complete previous assessment and source register',()=>{
 const digest=value=>createHash('sha256').update(JSON.stringify(value, (key,value)=>key==='supplement'?undefined:value)).digest('hex');
 assert.equal(digest(CITATION_REVIEW.records.slice(0,125)),'79df0c2a0f6fb62b4206e42029506d89fa5888e6dba37ebe23003e29de8c6265');
 assert.equal(digest(Object.fromEntries(Object.entries(CITATION_REVIEW.sources).slice(0,233))),'686a306569d6bc31a57ca9344f46a1dae8ea21ddd010fc9cab84ceda543972fe');
});

test('final seven assessments complete the exact explained-pair register with contained contexts',()=>{
 const batch=CITATION_REVIEW.batches.find(b=>b.id==='connections-final-07');
 assert.deepEqual(batch.targets,['ce086','ce090','ce091','ce092','ce093','ce094','ce095']);assert.equal(batch.count,7);
 const point=(chapter,verse)=>chapter*1000+verse;
 const contains=(range,anchor)=>range.book===anchor.book&&point(range.startChapter,range.startVerse)<=point(anchor.startChapter,anchor.startVerse)&&point(range.endChapter,range.endVerse)>=point(anchor.endChapter,anchor.endVerse);
 const scholars=new Set(),authors=new Set(),texts=new Set();
 for(const id of batch.targets){
  const r=citationReviews('connection',id)[0],e=CONNECTION_EVIDENCE.find(e=>e.id===id);
  assert.equal(r.batch,batch.id);assert.equal(r.reviewedOn,'2026-10-29');assert.equal(r.anchor,e.from);
  assert.equal(e.kind,'parallel');assert.equal(e.review,'scripture-context-screened');assert.equal(e.context,r.passages[1]);
  assert.equal(r.note,e.explanation);assert.ok(r.limitation.startsWith(e.caution));assert.match(r.limitation,/independent specialist review remain open/);
  for(const [i,anchor] of [e.from,e.to].entries())assert.ok(contains(validateCanonicalReference(r.passages[i],counts),validateCanonicalReference(anchor,counts)),id+' '+anchor);
  assert.equal(r.citations.length,3);assert.equal(new Set(r.citations.map(c=>c.sourceId)).size,3);
  const primary=r.citations.filter(c=>CITATION_REVIEW.sources[c.sourceId].kind==='primary-scripture');assert.equal(primary.length,2);primary.forEach(c=>texts.add(c.sourceId));
  const commentary=r.citations.filter(c=>CITATION_REVIEW.sources[c.sourceId].kind==='scholarly-commentary');assert.equal(commentary.length,1);
  const c=commentary[0],s=CITATION_REVIEW.sources[c.sourceId];scholars.add(c.sourceId);authors.add(s.author);
  assert.ok(r.note.includes(s.author));assert.equal(s.checkedOn,r.reviewedOn);assert.match(s.access,/Selected readable discussion checked/);assert.match(s.access,/Confessional interpretation/);
  assert.ok(c.locator.length>20&&c.supports.length>20);
 }
 assert.equal(scholars.size,3);assert.equal(authors.size,3);assert.equal(texts.size,12);
 const records=CITATION_REVIEW.records.filter(r=>r.kind==='connection');
 assert.equal(records.length,115);assert.deepEqual(new Set(records.map(r=>r.target)),new Set(CONNECTION_EVIDENCE.filter(e=>Number(e.id.slice(2))<=115).map(e=>e.id)));
 assert.equal(Object.keys(CITATION_REVIEW.sources).length,317);
 assert.equal(records.filter(r=>r.citations.some(c=>['scholarly-commentary','publisher-note','publisher-abstract'].includes(CITATION_REVIEW.sources[c.sourceId].kind))).length,83);
 assert.equal(CITATION_REVIEW.scope.connections,115);assert.match(batch.method,/full OpenBible corpus.*outside/);
});

test('completed coverage retains final narrative differences and further-review work',()=>{
 const review=id=>citationReviews('connection',id)[0];
 for(const [id,pattern] of [['ce086',/Assyria oppressed him and gave no help/],['ce090',/repentance is absent from Kings.*innocent blood/],['ce091',/Deuteronomy is an interpretation.*Huldah/],['ce092',/carried dead from Megiddo.*wounded return.*not silently harmonised/],['ce093',/shared personal name is insufficient/],['ce094',/seventh day.*tenth.*multi-day sequence is not established/],['ce095',/differing family counts.*common source/]])assert.match(review(id).limitation,pattern);
 assert.match(review('ce095').note,/42,360.*775.*652/);
 assert.deepEqual(review('ce091').passages,['2 Kings 22:8-23:3','2 Chronicles 34:14-33']);
 assert.deepEqual(review('ce094').passages,['2 Kings 25:1-12','Jeremiah 52:4-16']);
 assert.match(CITATION_REVIEW.sources['b6-text-2-kings-23'].access,/Kings 23 view also supplied 22:8-20/);
 assert.ok(CITATION_REVIEW.deferred.some(s=>/All 115.*32 previously passage-based.*not independent specialist signoff/.test(s)));
 assert.equal(CITATION_REVIEW.deferred.some(s=>s.includes('The other 7 explained pairs')),false);
 const roadmap=json('roadmap');assert.equal(roadmap.milestones.find(m=>m.id==='source-coverage-final-07').status,'delivered');
 const followup=roadmap.milestones.find(m=>m.id==='source-coverage-followup');assert.equal(followup.status,'planned');assert.match(followup.summary,/115 of 115.*32.*not constitute scholarly certification/);
 assert.ok(roadmap.currentFocus.some(item=>/manual screen-reader.*real-device/.test(item)));
});

test('final batch preserves all earlier assessments, sources, anchors and classifications',()=>{
 const digest=value=>createHash('sha256').update(JSON.stringify(value, (key,value)=>key==='supplement'?undefined:value)).digest('hex');
 assert.equal(digest(CITATION_REVIEW.records.slice(0,145)),'4f815f85a238cc8667e9199ecd39010bc4563fabe109c644d7a93139381fee7b');
 assert.equal(digest(Object.fromEntries(Object.entries(CITATION_REVIEW.sources).slice(0,286))),'45b9a095de603e52ef7ff6693faf898a51af86dc5a5a69b203892d8860174ab7');
 const expected={ce086:['2 Kings 16:1','2 Chronicles 28:1'],ce090:['2 Kings 21:1','2 Chronicles 33:1'],ce091:['2 Kings 22:8','2 Chronicles 34:14'],ce092:['2 Kings 23:29','2 Chronicles 35:20'],ce093:['2 Kings 24:18','Jeremiah 52:1'],ce094:['2 Kings 25:1','Jeremiah 52:4'],ce095:['Ezra 2:1','Nehemiah 7:6']};
 for(const [id,anchors] of Object.entries(expected)){const e=CONNECTION_EVIDENCE.find(e=>e.id===id);assert.deepEqual([e.from,e.to],anchors);assert.equal(e.kind,'parallel');}
});

test('commentary follow-up covers exactly the previously passage-based targets',()=>{
 const batch=CITATION_REVIEW.batches.find(b=>b.id==='connections-support-32');
 const original=CITATION_REVIEW.records.filter(r=>r.kind==='connection'&&!r.citations.some(c=>['scholarly-commentary','publisher-note','publisher-abstract'].includes(CITATION_REVIEW.sources[c.sourceId].kind)));
 assert.equal(batch.count,32);assert.deepEqual(new Set(batch.targets),new Set(original.map(r=>r.target)));
 assert.equal(commentaryCoverage(),115);
 assert.equal(CITATION_REVIEW.records.filter(r=>r.supplement).length,32);
 for(const r of original){
  const s=r.supplement;assert.equal(s.batch,batch.id);assert.equal(s.reviewedOn,'2026-10-29');assert.equal(s.citations.length,1);
  const c=s.citations[0],source=CITATION_REVIEW.sources[c.sourceId];
  assert.equal(source.kind,'scholarly-commentary');assert.ok(s.note.includes(source.author));assert.ok(c.locator.length>15&&c.supports.length>15);
  assert.match(s.limitation,/independent specialist review remain open/);
  assert.equal(reviewCitations(r).length,r.citations.length+1);
 }
 assert.equal(new Set(original.flatMap(r=>r.supplement.citations.map(c=>c.sourceId))).size,16);
 // A source on one claim cannot satisfy coverage for a different assessment.
 const d=structuredClone(CITATION_REVIEW);delete d.records.find(r=>r.target==='ce027').supplement;assert.equal(commentaryCoverage(d),114);
});

test('follow-up rejects missing claims, invalid dates, non-commentary sources and undeclared targets',()=>{
 const record=d=>d.records.find(r=>r.target==='ce027'&&r.kind==='connection');
 for(const mutate of [d=>record(d).supplement.reviewedOn='2099-01-01',d=>record(d).supplement.reviewedOn='2026-10-27',d=>record(d).supplement.batch='missing',d=>record(d).supplement.note='',d=>record(d).supplement.limitation='',d=>record(d).supplement.citations=[],d=>record(d).supplement.citations[0].sourceId='missing',d=>record(d).supplement.citations[0].sourceId='rom16',d=>record(d).supplement.citations[0].locator='',d=>record(d).supplement.citations.push(record(d).supplement.citations[0]),d=>d.batches.find(b=>b.id==='connections-support-32').targets[0]='ce015']){
  const d=structuredClone(CITATION_REVIEW);mutate(d);assert.throws(()=>validateCitationReview(d,counts,targets));
 }
});

test('all earlier assessment fields, sources and classifications survive the supplements',()=>{
 const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
 const original=CITATION_REVIEW.records.map(({supplement,...record})=>record);
 assert.equal(digest(original),'17e9a33374b20e963fc9c664d75486acfce30fa7d3478a47dfa7e5523d5dc396');
 assert.equal(digest(Object.fromEntries(Object.entries(CITATION_REVIEW.sources).slice(0,301))),'2d48c0299bad22deb186aea5f8d90d71ce5ef67dcee0c36116a071b87f46551a');
 assert.equal(CONNECTION_EVIDENCE.find(e=>e.id==='ce027').kind,'echo');
 for(const id of ['ce065','ce071'])assert.equal(CONNECTION_EVIDENCE.find(e=>e.id===id).kind,'theme');
 for(const id of CITATION_REVIEW.batches.find(b=>b.id==='connections-20-02').targets)assert.equal(CONNECTION_EVIDENCE.find(e=>e.id===id).kind,'parallel');
});

test('new commentary retains competing interpretations and access limits',()=>{
 const s=id=>citationReviews('connection',id)[0].supplement;
 assert.match(s('ce027').note,/instead.*Psalm 110:1/);assert.match(s('ce027').limitation,/does not affirm a Genesis 3:15 echo/);
 assert.match(s('ce065').limitation,/does not settle the textual problem/);assert.match(s('ce072').limitation,/not identical wording/);
 assert.match(s('ce101').limitation,/does not independently establish historical identity/);
 assert.match(s('ce104').limitation,/six days\/about eight days/);assert.match(s('ce113').limitation,/not a completed Greek-text investigation/);
 assert.match(CITATION_REVIEW.sources['follow-matthew'].access,/indexed excerpts.*HTTP 403/);
 for(const k of ['healing','passover'])assert.match(CITATION_REVIEW.sources['follow-'+k].access,/full handbook was not examined/);
 const roadmap=json('roadmap');assert.equal(roadmap.milestones.find(m=>m.id==='source-support-32').status,'delivered');assert.equal(roadmap.milestones.find(m=>m.id==='source-coverage-followup').status,'planned');
});

test('About and claim panels render the dated supplement and current coverage without stale gap claims',t=>{
 const previous=globalThis.document;globalThis.document={createElement:tag=>new El(tag)};t.after(()=>{if(previous===undefined)delete globalThis.document;else globalThis.document=previous;});
 const root=new El('div');renderCitationSummary(root);const all=nodes(root);
 assert.ok(all.some(e=>e.textContent.includes('115 comparisons include named scholarly commentary')));
 assert.ok(all.some(e=>e.textContent.includes('does not imply scholarly agreement with every link')));
 assert.equal(all.some(e=>e.textContent.includes('the other 32 rely')),false);
 root.replaceChildren();appendCitationReview(root,'connection','ce027');const text=nodes(root).map(e=>e.textContent).join(' ');
 assert.match(text,/Genesis describes enmity/);assert.match(text,/Commentary follow-up/);assert.match(text,/Donny Ray Mathis II.*Psalm 110:1/);assert.match(text,/Earlier assessment retained above/);
 assert.ok(nodes(root).some(e=>e.href==='https://www.thegospelcoalition.org/commentary/Romans/'));
});
