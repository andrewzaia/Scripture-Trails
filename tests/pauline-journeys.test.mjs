import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validatePaulineData,validatePaulineCoast,projectPaulLocation,journeyEvents,narrativeConnections} from '../public/assets/paul-map.js';
const read=path=>JSON.parse(readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const data=read('public/data/pauline-journeys.json'),counts=read('public/data/verse-counts.json'),coast=read('public/data/pauline-coast.json'),sources=read('sources/pauline/pleiades-selected.json');
const clone=()=>structuredClone(data);

test('Pauline stages have valid Acts references and complete journey metadata',()=>{
 assert.equal(validatePaulineData(data,counts),true);
 assert.deepEqual(data.journeys.map(j=>j.id),['first','second','third']);
 assert.equal(data.events.length,61);
 assert.deepEqual(data.journeys.map(j=>journeyEvents(data,j.id).length),[18,21,22]);
 for(const journey of data.journeys){
  const events=journeyEvents(data,journey.id);let previous=0;
  for(const event of events){const m=event.passages[0].match(/Acts (\d+):(\d+)/);const ordinal=Number(m[1])*100+Number(m[2]);assert.ok(ordinal>=previous,event.id);previous=ordinal;}
 }
});
test('every marker matches a pinned credited source point and projects within the map',()=>{
 assert.match(sources.revision,/^[a-f0-9]{40}$/);assert.equal(sources.licence,'CC BY 3.0');
 const mapped=data.places.filter(p=>p.coordinates);assert.equal(mapped.length,33);
 for(const place of mapped){
  const source=sources.records[place.sourceId];assert.ok(source,place.id);assert.ok(source.creators.length>0);assert.match(source.originalSha256,/^[a-f0-9]{64}$/);assert.ok(source.snapshotUrl.includes(sources.revision));
  assert.deepEqual(place.coordinates,source.reprPoint.map(n=>Number(n.toFixed(4))),place.id);
  assert.equal(place.sourceUrl,source.uri.replace('http:','https:'));const [x,y]=projectPaulLocation(place.coordinates);assert.ok(x>=0&&x<=1100&&y>=0&&y<=850);
 }
 assert.equal(sources.records['derbe-unlocated-comparison'].locations[0].precision,'rough');
});
test('unnamed, regional and offshore stages never acquire invented locations',()=>{
 const unpinned=new Set(data.places.filter(p=>p.coordinates===null).map(p=>p.id));
 for(const id of ['syria-cilicia','phrygia-galatia','inland','greece','unnamed-church','chios','cyprus-offshore'])assert.ok(unpinned.has(id));
 assert.equal(data.events.filter(e=>unpinned.has(e.place)).length,14);
 assert.equal(data.events.filter(e=>e.journey==='second'&&e.place==='jerusalem').length,0);
 assert.equal(data.events.filter(e=>e.journey==='third'&&e.place==='corinth').length,0);
 assert.equal(data.events.filter(e=>e.journey==='third'&&e.place==='ephesus').length,1);
 for(const id of ['samothrace','cos','rhodes','samos'])assert.equal(data.places.find(p=>p.id===id).certainty,'island');
 assert.match(data.places.find(p=>p.id==='unnamed-church').note,/inference/);
 assert.match(data.places.find(p=>p.id==='chios').note,/No landing/);
});
test('narrative connectors preserve gaps, direction and journey boundaries',()=>{
 const links=narrativeConnections(data,data.events),byId=new Map(data.events.map(e=>[e.id,e]));
 assert.ok(links.length>20);
 for(const link of links){const a=byId.get(link.from),b=byId.get(link.to);assert.equal(a.journey,b.journey);assert.equal(data.events.indexOf(b),data.events.indexOf(a)+1);assert.equal(link.coordinates.length,2);}
 const named=data.events.find(e=>e.place==='caesarea'&&e.journey==='second');
 assert.ok(!links.some(l=>l.from===named.id),'Do not jump past the unnamed church');
 const mitylene=data.events.find(e=>e.place==='mitylene');assert.ok(!links.some(l=>l.from===mitylene.id),'Do not invent a Chios landing or skip the offshore stage');
 assert.deepEqual(narrativeConnections(data,[data.events[0]]),[]);
 assert.deepEqual(narrativeConnections(data,[data.events[17],data.events[18]]),[]);
});
test('repeated outward and return visits remain separately selectable',()=>{
 const first=journeyEvents(data,'first');for(const id of ['lystra','iconium','antioch-pisidia','perga','antioch-syria'])assert.equal(first.filter(e=>e.place===id).length,2,id);
 assert.equal(journeyEvents(data,'all').length,data.events.length);
 assert.equal(data.events.filter(e=>e.place==='caesarea').length,2);
});
test('invalid citations, duplicate stages, unsourced markers and false pins fail validation',()=>{
 let bad=clone();bad.events[0].passages=['Acts 13:99'];assert.throws(()=>validatePaulineData(bad,counts),/reference/);
 bad=clone();bad.events[1].id=bad.events[0].id;assert.throws(()=>validatePaulineData(bad,counts),/Duplicate/);
 bad=clone();bad.places[0].sourceUrl=null;assert.throws(()=>validatePaulineData(bad,counts),/marker/);
 bad=clone();bad.places.find(p=>p.kind==='region').coordinates=[30,35];assert.throws(()=>validatePaulineData(bad,counts),/pin/);
 bad=clone();bad.places[0].coordinates=[180,90];assert.throws(()=>validatePaulineData(bad,counts),/marker/);
 bad=clone();bad.places[0].certainty='offshore';assert.throws(()=>validatePaulineData(bad,counts),/place/);
 bad=clone();bad.events[0].reviewStatus='peer-reviewed';assert.throws(()=>validatePaulineData(bad,counts),/stage/);
 bad=clone();bad.events[0].journey='unknown';assert.throws(()=>validatePaulineData(bad,counts),/stage/);
});
test('coastal orientation retains source terms, bounds and closed polygons',()=>{
 assert.equal(validatePaulineCoast(coast),true);assert.match(coast.sourceSha256,/^[a-f0-9]{64}$/);assert.match(coast.snapshotUrl,/\/blob\/[a-f0-9]{40}\//);
 for(const ring of coast.rings)assert.deepEqual(ring[0],ring.at(-1));
 const bad=structuredClone(coast);bad.rings[0][0]=[190,0];assert.throws(()=>validatePaulineCoast(bad),/geometry/);
});
test('journey review limits and future Rome milestone remain explicit',()=>{
 assert.match(data.review,/Independent.*review has not occurred/);assert.match(data.chronology,/No absolute years/);
 const roadmap=read('public/data/roadmap.json');assert.equal(roadmap.milestones.find(m=>m.id==='pauline-journeys').status,'delivered');assert.equal(roadmap.milestones.find(m=>m.id==='paul-rome').status,'next');
 assert.ok(data.issues.some(i=>i.id==='unnamed-church'));assert.ok(data.issues.some(i=>i.id==='greece-corinth'));
});
