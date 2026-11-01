import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateJourneyData,validateAuditData,validatePlaceStudies} from '../public/assets/jesus-map.js';
import {validateGospelChronology} from '../public/assets/gospel-chronology.js';
import {validatePaulineData} from '../public/assets/paul-map.js';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const jes=read('public/data/jesus-journeys.json'), audit=read('public/data/jesus-audit.json');
const geography=read('public/data/jesus-geography.json'),chron=read('public/data/gospel-chronology.json');
const paul=read('public/data/pauline-journeys.json'),counts=read('public/data/verse-counts.json'),road=read('public/data/roadmap.json');
const J=id=>jes.events.find(e=>e.id===id),P=id=>paul.events.find(e=>e.id===id);
test('targeted evidence pass preserves all 162 stable journey stages and schemas',()=>{
 assert.equal(jes.events.length,79);assert.equal(paul.events.length,83);
 assert.equal(new Set(jes.events.map(e=>e.id)).size,79);assert.equal(new Set(paul.events.map(e=>e.id)).size,83);
 assert.equal(validateJourneyData(jes),true);assert.equal(validatePlaceStudies(geography,jes),true);
 assert.equal(validateAuditData(audit,jes,geography),true);assert.equal(validateGospelChronology(chron,jes,audit),true);
 assert.equal(validatePaulineData(paul,counts),true);
 assert.ok(road.milestones.some(m=>m.id==='v1-journey-evidence-pass-01'&&m.status==='delivered'));
 assert.equal(road.v1Readiness.gates.flatMap(g=>g.criteria).find(c=>c.id==='content-audit').status,'met');
});
test('Markan Bethsaida destination and Gennesaret landfall are explicitly distinguished with bounded research',()=>{
 const a=J('j035'),b=J('j036'),issue=audit.issues.find(i=>i.id==='sea-crossing-destinations');
 assert.match(a.qualification,/Bethsaida/);assert.match(a.qualification,/Gennesaret/);
 assert.match(b.qualification,/6:53/);
 for(const e of [a,b]){assert.equal(e.review.status,'qualified');assert.ok(e.review.issueIds.includes(issue.id));}
 assert.ok(issue.references.some(url=>url.includes('peeters-leuven.be')));
 const entry=chron.comparisons.find(c=>c.id==='bethsaida-gennesaret-crossing');
 assert.deepEqual(entry.events,['j035','j036']);
 assert.equal(entry.issueId,issue.id);
 assert.ok(entry.passages.includes('Mark 6:53-56'));
 assert.ok(entry.sourceIds.includes('andrejevs-2022'));
 assert.match(chron.sources.find(s=>s.id==='andrejevs-2022').claim,/abstract/);
 assert.match(audit.evidenceAddendum.sourceLimit,/full article access/i);
});
test('disputed Jericho and ascension geography remains qualified, not GPS geography',()=>{
 assert.match(J('j058').qualification,/Luke 18:35/);assert.match(J('j058').qualification,/Mark 10:46/);
 assert.match(J('j079').qualification,/Acts 1:12/);assert.match(J('j079').qualification,/surveyed/);
});
test('Acts distinguishes real landings from overclaimed routes, unreached ports and unlocated wreck',()=>{
 assert.match(P('paul-second-20').qualification,/does not name/);
 assert.equal(paul.places.find(p=>p.id==='unnamed-church').coordinates,null);
 assert.match(P('paul-third-10').qualification,/by land/);
 assert.match(P('paul-third-12').qualification,/does not describe landing/);
 assert.equal(paul.places.find(p=>p.id==='chios').coordinates,null);
 assert.match(P('paul-third-13').qualification,/touched at Samos/);
 assert.match(P('paul-rome-08').qualification,/not a stop/);
 assert.equal(paul.events.some(e=>e.place==='phoenix'),false);
 for(const id of ['storm-drift','wreck','cauda-offshore'])assert.equal(paul.places.find(p=>p.id===id).coordinates,null);
 assert.match(P('paul-rome-12').qualification,/unidentified bay/);
 assert.match(P('paul-rome-13').qualification,/island identification is explicit/);
 const sources=paul.issues.find(x=>x.id==='rome-storm-drift').sourceLinks;
 assert.ok(sources.length&&sources.every(s=>s.url.startsWith('https://')&&s.scope.length>30));
 assert.match(paul.review,/Independent historical and textual specialist review has not occurred/);
});
