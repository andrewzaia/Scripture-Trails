import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validatePlaceStudies,validateAuditData,validateJourneyData} from '../public/assets/jesus-map.js';
import {validateRoadmap} from '../public/assets/roadmap.js';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const geo=read('public/data/jesus-geography.json');
const cityStudies=read('public/data/city-studies.json');
const jes=read('public/data/jesus-journeys.json');
const audit=read('public/data/jesus-audit.json');
const roadmap=read('public/data/roadmap.json');
const highRisk=['bethsaida','emmaus','magadan','sychar','gethsemane'];
const newSources=['bethsaida-et-tell-arav','bethsaida-araj-av-notley','magadan-taylor-2014','emmaus-robinson-1984','sychar-pummer-2022'];

test('35 dossiers preserve honest source classes and original regional placeholders',()=>{
 assert.equal(validateJourneyData(jes),true);
 assert.equal(validatePlaceStudies(geo,jes),true);
 assert.equal(validateAuditData(audit,jes,geo),true);
 assert.equal(validateRoadmap(roadmap),true);
 assert.equal(Object.keys(geo.places).length,35);
 const placeholders=Object.entries(geo.places).filter(([id,p])=>p.review.status==='regional-placeholder');
 assert.equal(placeholders.length,12);
 for(const [id,p] of placeholders){
  assert.equal(p.literature.length,0,'Region incorrectly given site source: '+id);
  assert.equal(p.review.independentSourceCount,0,id);
  assert.ok(!p.identificationReview,'Implied fixed site for schematic area: '+id);
 }
 assert.equal(geo.audit.identificationAddendum.regionalPlaceholdersPreserved,12);
 assert.equal(geo.audit.identificationAddendum.placesReviewed,35);
 assert.equal(audit.siteReviewAddendum.reviewedOn,'2026-10-31');
 assert.equal(roadmap.milestones.find(x=>x.id==='v1-gospel-site-evidence-05')?.status,'delivered');
 assert.equal(roadmap.v1Readiness.gates.flatMap(g=>g.criteria).find(c=>c.id==='critical-claims').status,'met');
});

test('five disputed site dossiers distinguish evidence, interpretation and unresolved location',()=>{
 assert.equal(Object.entries(geo.places).filter(([id,p])=>!!p.identificationReview).length,5);
 for(const id of highRisk){
  const p=geo.places[id],x=p.identificationReview;
  assert.ok(x,'Missing disputed site comparison: '+id);
  assert.equal(x.reviewedOn,'2026-10-31');
  assert.equal(x.method,'bounded-publisher-and-primary-text-comparison');
  assert.ok(x.question.length>35,id);
  for(const field of ['claim','support','limit'])assert.ok(x[field].length>=95,id+' '+field);
  assert.ok(x.sourceIds.length>=2);
  for(const sourceId of x.sourceIds){
   assert.ok(p.literature.includes(sourceId),id+' missing literature '+sourceId);
   assert.ok(geo.sources[sourceId].url.startsWith('https://'));
  }
  assert.equal(p.review.independentSourceCount,p.literature.length);
 }
 for(const id of newSources){
  const source=geo.sources[id];
  assert.ok(source&&source.title&&source.scope&&source.url,'Missing source record '+id);
  assert.match(source.scope,/not |does not |remains|Full /i);
  assert.ok(audit.sourceChecks.some(s=>s.source===id&&s.checkedOn==='2026-10-31'),id);
 }
 assert.equal(audit.sourceChecks.length,Object.keys(geo.sources).length);
 assert.match(geo.places.bethsaida.identificationReview.claim,/competing/);
 assert.match(geo.places.emmaus.identificationReview.limit,/not be selected/);
 assert.match(geo.places.magadan.identificationReview.limit,/does not confirm/);
 assert.match(geo.places.sychar.identificationReview.limit,/neither proves/);
 assert.match(geo.places.gethsemane.identificationReview.limit,/does not identify/);
});
test('unsubstantiated site comparisons and invented bibliography fail closed',()=>{
 for(const mutate of [
  g=>{g.places.bethsaida.identificationReview.sourceIds=['not-a-source','bethsaida-excavation'];},
  g=>{g.places.emmaus.identificationReview.limit='No.';},
  g=>{g.places.magadan.identificationReview.method='peer-reviewed-certification';},
  g=>{g.places.sychar.identificationReview.sourceIds=['sychar-pummer-2022','sychar-pummer-2022'];},
  g=>{g.places.gethsemane.literature=[];}
 ]){
  const g=structuredClone(geo);mutate(g);
  assert.throws(()=>validatePlaceStudies(g,jes),/Invalid identification evidence|Unsourced claim/);
 }
 const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
 const js=readFileSync(new URL('../public/assets/jesus-map.js',import.meta.url),'utf8');
 for(const hook of ['study-identification-review','study-identification-claim','study-identification-support','study-identification-limit','study-identification-sources'])assert.ok(html.includes('data-jesus="'+hook+'"'),hook);
 assert.match(js,/review.hidden=!detail/);
});

test('Bethsaida and Emmaus Gospel research links agree with historical-city citations',()=>{
 for(const id of ['bethsaida','emmaus']){
  const issue=audit.issues.find(x=>x.id===id+'-identification'),city=cityStudies.disputed.find(x=>x.id===id);
  assert.equal(issue.status,'open');assert.ok(city);
  const approved=new Set([...city.sourceIds,...city.candidates.flatMap(c=>c.sourceIds||[])].map(x=>cityStudies.sources[x]?.url));
  assert.deepEqual(new Set(Object.keys(issue.referenceTitles)),new Set(issue.references));
  assert.equal(new Set(issue.references).size,issue.references.length);
  for(const url of issue.references)assert.ok(approved.has(url),'Unregistered cross-study source '+url);
  assert.match(issue.description,/do not|cannot independently/i);
 }
 assert.equal(audit.issues.find(x=>x.id==='bethsaida-identification').references.length,3);
 assert.equal(audit.issues.find(x=>x.id==='emmaus-identification').references.length,2);
 const broken=structuredClone(audit);
 delete broken.issues.find(x=>x.id==='emmaus-identification').referenceTitles['https://bible.org/seriespage/luke-24'];
 assert.throws(()=>validateAuditData(broken,jes,geo),/Missing audit source title/);
});
