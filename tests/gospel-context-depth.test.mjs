import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateCanonicalReference} from '../public/assets/reference-integrity.js';
import {validateJourneyData,validateAuditData,validatePlaceStudies} from '../public/assets/jesus-map.js';
import {validateGospelChronology} from '../public/assets/gospel-chronology.js';
const read=path=>JSON.parse(readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const journeys=read('public/data/jesus-journeys.json'),audit=read('public/data/jesus-audit.json');
const chronology=read('public/data/gospel-chronology.json'),geography=read('public/data/jesus-geography.json');
const counts=read('public/data/verse-counts.json'),road=read('public/data/roadmap.json');
const byId=id=>journeys.events.find(e=>e.id===id);

test('every one of 79 Gospel journey entries has unique original biblical reading context',()=>{
 assert.equal(journeys.events.length,79);
 assert.equal(validateJourneyData(journeys),true);
 assert.equal(validateAuditData(audit,journeys,geography),true);
 assert.equal(validatePlaceStudies(geography,journeys),true);
 assert.equal(validateGospelChronology(chronology,journeys,audit),true);
 const contexts=new Set(),ids=new Set();
 for(const e of journeys.events){
  assert.ok(!ids.has(e.id),'Duplicate stage '+e.id);ids.add(e.id);
  const n=e.study;assert.ok(n,'Missing episode study '+e.id);
  assert.equal(n.method,'scripture-context-editorial');assert.equal(n.reviewedOn,'2026-10-31');
  assert.ok(n.context.trim().length>=120,'Underdeveloped context '+e.id);
  assert.ok(!contexts.has(n.context),'Repeated context '+e.id);contexts.add(n.context);
  assert.ok(n.crossReferences.length>=1&&n.crossReferences.length<=3,e.id);
  assert.equal(new Set(n.crossReferences).size,n.crossReferences.length);
  for(const ref of n.crossReferences)assert.ok(validateCanonicalReference(ref,counts),'Invalid canonical reading '+e.id+': '+ref);
 }
 assert.equal(ids.size,79);assert.equal(contexts.size,79);
 assert.equal(journeys.events.reduce((n,e)=>n+e.study.crossReferences.length,0),156);
 assert.match(journeys.contextCoverage.limitations,/independent historical review/);
 assert.match(audit.evidenceAddendum.sourceLimit,/full article access/i);
 assert.equal(road.milestones.find(m=>m.id==='v1-gospel-79-context')?.status,'delivered');
 assert.equal(road.v1Readiness.gates.flatMap(g=>g.criteria).find(c=>c.id==='content-audit')?.status,'open');
});

test('historical birth dating, Mark ending and ascension variants are explicit and source-linked',()=>{
 assert.equal(audit.issues.length,22);
 const census=audit.issues.find(i=>i.id==='census-herod-dating');
 assert.equal(census.status,'open');
 assert.ok(census.references.some(s=>s.includes('10.1093/oxfordhb')));
 assert.ok(census.events.includes('j001'));
 for(const id of ['j001','j003','j005'])assert.ok(byId(id).review.issueIds.includes('census-herod-dating'),id);
 assert.match(byId('j001').qualification,/Quirinius/);
 const mark=audit.issues.find(i=>i.id==='mark-longer-ending');
 assert.equal(mark.status,'qualified');assert.ok(mark.references.some(s=>s.includes('Mark.16.9')));
 assert.ok(byId('j074').review.issueIds.includes('mark-longer-ending'));
 assert.ok(byId('j074').passages.includes('Mark 16:1-8'));
 assert.match(byId('j074').qualification,/manuscript-disputed/);
 const asc=audit.issues.find(i=>i.id==='luke-ascension-variants');
 assert.ok(asc.references.some(s=>s.includes('10.1017/S0028688500020713')));
 assert.ok(byId('j079').review.issueIds.includes('luke-ascension-variants'));
 assert.match(byId('j079').qualification,/textual-critical/);
 assert.equal(chronology.comparisons.length,7);
 assert.ok(chronology.comparisons.some(c=>c.id==='bethlehem-census-herod'&&c.sourceIds.includes('huizenga-census-2020')));
 assert.ok(chronology.comparisons.some(c=>c.id==='luke-acts-ascension'&&c.sourceIds.includes('zwiep-ascension-1996')));
 for(const sourceId of ['huizenga-census-2020','zwiep-ascension-1996']){
  assert.match(chronology.sources.find(s=>s.id===sourceId).claim,/full (chapter|article) was not accessed/);
 }
});

test('incomplete or misleading episode-study metadata fails closed',()=>{
 const bad=structuredClone(journeys);delete bad.events[0].study;
 assert.throws(()=>validateJourneyData(bad),/Scripture study/);
 const short=structuredClone(journeys);short.events[12].study.context='Short.';
 assert.throws(()=>validateJourneyData(short),/Scripture study/);
 const forged=structuredClone(journeys);forged.events[23].study.method='peer-reviewed';
 assert.throws(()=>validateJourneyData(forged),/Scripture study/);
 const noRefs=structuredClone(journeys);noRefs.events[44].study.crossReferences=[];
 assert.throws(()=>validateJourneyData(noRefs),/Scripture study/);
 const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
 const js=readFileSync(new URL('../public/assets/jesus-map.js',import.meta.url),'utf8');
 for(const hook of ['episode-study-context','episode-study-links'])assert.ok(html.includes('data-jesus="'+hook+'"'));
 assert.match(js,/renderEpisodeStudy\(e\)/);
});
