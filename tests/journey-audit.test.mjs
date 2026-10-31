import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateAuditData,validateJourneyData,validatePlaceStudies,passageStart} from '../public/assets/jesus-map.js';
import {parseRef,findBook} from '../public/assets/books.js';
import {validateRoadmap} from '../public/assets/roadmap.js';
const read=name=>JSON.parse(readFileSync(new URL('../public/data/'+name,import.meta.url),'utf8'));
const j=read('jesus-journeys.json'),g=read('jesus-geography.json'),a=read('jesus-audit.json'),r=read('roadmap.json');

test('all 79 events and 35 places have first-pass review records but retain open research issues',()=>{
 assert.equal(validateJourneyData(j),true);assert.equal(validatePlaceStudies(g,j),true);assert.equal(validateAuditData(a,j,g),true);
 assert.equal(j.events.length,79);assert.equal(Object.keys(g.places).length,35);
 assert.equal(a.issues.length,22);assert.equal(a.corrections.length,10);
 assert.ok(a.issues.some(x=>x.status==='open'));
 assert.equal(j.events.every(x=>x.review.basis==='passage-index-and-location-screen'),true);
 assert.ok(/not a claim of independent scholarly certification/i.test(a.methodology.scope));
});
test('biblical citation starts and range endpoints resolve to recognised books and legal chapter ranges',()=>{
 for(const event of j.events)for(const ref of event.passages){
  const start=parseRef(passageStart(ref));assert.ok(start,ref);
  assert.ok(['Matthew','Mark','Luke','John','Acts'].includes(start.book.name),ref);
  const tail=ref.slice(passageStart(ref).length).trim();
  if(tail.startsWith('-')){
   const part=tail.slice(1),match=part.match(/^(?:(\d+):)?(\d+)$/);
   assert.ok(match,`Unrecognised ending: ${ref}`);
   const endChapter=match[1]?Number(match[1]):start.chapter;
   assert.ok(endChapter>=start.chapter&&endChapter<=start.book.chapters,`Invalid chapter ending ${ref}`);
   const endVerse=Number(match[2]);assert.ok(endVerse>=1&&endVerse<=176,`Invalid verse ending ${ref}`);
   if(endChapter===start.chapter)assert.ok(endVerse>=start.verse,`Backwards verse range ${ref}`);
  }
 }
});
test('specific corrected episode locations and uncertainty remain enforced',()=>{
 const by=Object.fromEntries(j.events.map(e=>[e.id,e]));
 assert.equal(by.j025.place,'capernaum');assert.equal(by.j025.evidence,'named');
 assert.equal(by.j032.place,'galilee-shore');assert.equal(by.j032.evidence,'region');
 assert.equal(by.j044.evidence,'region');assert.equal(by.j061.evidence,'inferred');
 assert.equal(by.j054.evidence,'inferred');
 assert.match(by.j076.qualification,/eight days later/i);assert.match(by.j069.qualification,/calendar/i);
 assert.match(by.j051.qualification,/earliest manuscripts/i);
 assert.deepEqual(by.j041.passages,['Mark 8:1-9','Matthew 15:29-38']);
 assert.match(g.places.bethphage.caution,/not state that the donkey was fetched/);
});
test('audit issue IDs, external source provenance, and milestone do not claim specialist sign-off',()=>{
 assert.equal(validateRoadmap(r),true);
 assert.equal(r.milestones.find(m=>m.id==='audit').status,'delivered');
 assert.equal(r.milestones.find(m=>m.id==='independent-audit').status,'research');
 const bad=structuredClone(a);bad.issues[0].events=['not-a-real-episode'];assert.throws(()=>validateAuditData(bad,j,g));
 const bad2=structuredClone(j);delete bad2.events[0].review;assert.throws(()=>validateAuditData(a,bad2,g));
 const noBibliography=Object.values(g.places).filter(x=>!x.literature.length);
 assert.equal(noBibliography.length,12);assert.ok(noBibliography.every(x=>x.review.independentSourceCount===0));
 assert.ok(a.issues.some(x=>x.id==='bethany-anointing'&&x.status==='open'));
});
test('visible map includes qualified evidence notes and public correction register',()=>{
 const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
 const js=readFileSync(new URL('../public/assets/jesus-map.js',import.meta.url),'utf8');
 for(const name of ['audit-status','audit-event-issues','audit-summary','audit-corrections','audit-open','study-source-status'])assert.ok(html.includes(`data-jesus="${name}"`),name);
 assert.match(js,/renderAuditRegister/);assert.match(js,/validateAuditData\(audit,data,geography\)/);
});

test('Last Supper chronology audit uses directly relevant, named opposing scholarly research and retains uncertainty',()=>{
 const issue=a.issues.find(x=>x.id==='last-supper-calendar'),event=j.events.find(x=>x.id==='j069');
 assert.equal(issue.status,'open');
 assert.equal(issue.references.length,3);
 assert.equal(Object.keys(issue.referenceTitles).length,3);
 assert.ok(issue.references.every(url=>/^https:\/\/www\.cambridge\.org\/core\/journals\//.test(url)));
 assert.ok(!issue.references.some(url=>url.includes('diatessaron')),'Unrelated Diatessaron paper must not be used as Last Supper chronology evidence');
 for(const url of issue.references)assert.ok(issue.referenceTitles[url].length>=10,url);
 assert.match(issue.description,/John 13:1, 18:28 and 19:14/);
 assert.match(issue.description,/scholarly interpretations remain debated|scholarly interpretations|Academic analyses/);
 assert.match(event.qualification,/No specific modern date/);
 assert.match(event.study.context,/1 Corinthians 11:23-26/);
 assert.deepEqual(event.study.crossReferences,['Mark 14:12-26','John 19:14','1 Corinthians 11:23-26']);
 assert.equal(validateAuditData(a,j,g),true);
 const missing=structuredClone(a);
 missing.issues.find(x=>x.id==='last-supper-calendar').referenceTitles['https://arbitrary.example/']='Fictitious unrelated publication';
 assert.throws(()=>validateAuditData(missing,j,g),/Unattributed audit source/);
 const weak=structuredClone(a);
 weak.issues.find(x=>x.id==='last-supper-calendar').referenceTitles[issue.references[0]]='x';
 assert.throws(()=>validateAuditData(weak,j,g),/Unattributed audit source/);
});
