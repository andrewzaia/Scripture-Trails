import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {filterPersecutionReports,reportKind} from '../public/assets/persecution-catalogue.js';
import {aggregateIncidentLocations} from '../public/assets/christian-heatmap.js';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const records=JSON.parse(read('public/data/christian-persecution.json')).reports;
const media=JSON.parse(read('public/data/christian-persecution-media.json')).media;
test('166 reports preserve source attribution, IDs, and reporting period',()=>{
 assert.equal(records.length,166);
 assert.equal(new Set(records.map(x=>x.id)).size,166);
 assert.equal(new Set(records.map(x=>x.country)).size,26);
 for(const r of records){
  assert.match(r.id,/^CT-\d{4}$/);
  assert.ok(r.date>='2016-11-11'&&r.date<='2026-11-11');
  assert.ok(r.title&&r.published_account&&r.publisher&&r.country);
  assert.equal(new URL(r.source_url).protocol,'https:');
  for(const field of ['second_source_url','media_url'])if(r[field])assert.equal(new URL(r[field]).protocol,'https:');
 }
});
test('media index retains 20 original publisher links and rights notes',()=>{
 assert.equal(media.length,20);
 for(const m of media){assert.ok(m.publisher_or_owner&&m.rights_and_reuse);assert.equal(new URL(m.media_url).protocol,'https:');}
});
test('source-preserving client filters combine without mutating records',()=>{
 const original=JSON.stringify(records);
 const result=filterPersecutionReports(records,{query:'Saint Nicholas',country:'France',year:'2026'});
 assert.ok(result.some(r=>r.id==='CT-0001'));
 assert.equal(filterPersecutionReports(records,{country:'Atlantis'}).length,0);
 const ascending=filterPersecutionReports(records,{sort:'oldest'});
 assert.ok(ascending[0].date<=ascending.at(-1).date);
 assert.equal(reportKind('Relic theft; desecration'),'Sacred sites and property');
 assert.equal(JSON.stringify(records),original);
});
test('dedicated view, navigation and media index are present without unsafe HTML insertion',()=>{
 const html=read('public/index.html'),app=read('public/assets/app.js'),module=read('public/assets/persecution-catalogue.js');
 assert.match(html,/id="view-christian-persecution"/);
 assert.match(html,/data-view="christian-persecution"/);
 assert.match(html,/data-pc-media-details/);
 assert.match(app,/createPersecutionCatalogue/);
 assert.doesNotMatch(module,/\.innerHTML\s*=/);
});

test('global distribution includes every report once and geographically separates unresolved places',()=>{
 const geo=JSON.parse(read('public/data/christian-heatmap-places.json'));
 const world=JSON.parse(read('public/data/world-heatmap-110m.json'));
 const totals=aggregateIncidentLocations(records,geo);
 assert.equal(totals.reportCount,166);
 assert.equal([...totals.countries.values()].reduce((a,b)=>a+b,0),166);
 assert.equal(totals.countries.size,26);
 assert.equal(totals.located,127);
 assert.equal(totals.withoutLocality,39);
 assert.ok(Math.abs(totals.weight-127)<0.0001);
 assert.equal(world.features.length,177);
 const countries=new Set(world.features.map(f=>f.id));
 for(const [name,location] of Object.entries(geo.countries))assert.ok(countries.has(location.iso3),'No Natural Earth shape for '+name);
 for(const [key,place] of Object.entries(geo.places)){
  assert.ok(key.includes('|')&&Array.isArray(place.points)&&place.points.length);
  for(const point of place.points){
   assert.ok(Number.isFinite(point.lat)&&Math.abs(point.lat)<=90,key);
   assert.ok(Number.isFinite(point.lon)&&Math.abs(point.lon)<=180,key);
  }
 }
});
test('adding reports automatically updates country heat and optional locality markers',()=>{
 const geo=JSON.parse(read('public/data/christian-heatmap-places.json'));
 const original=aggregateIncidentLocations(records,geo);
 const next={id:'CT-NEW',country:'France',place:'New synthetic town',title:'Synthetic fixture'};
 const unresolved=aggregateIncidentLocations([...records,next],geo);
 assert.equal(unresolved.countries.get('France'),original.countries.get('France')+1);
 assert.equal(unresolved.reportCount,original.reportCount+1);
 assert.equal(unresolved.withoutLocality,original.withoutLocality+1);
 const withCoords={...next,locations:[{name:'New synthetic town',lat:42.5,lon:3.2,precision:'city'}]};
 const located=aggregateIncidentLocations([...records,withCoords],geo);
 assert.equal(located.located,original.located+1);
 assert.ok(located.places.some(x=>x.label==='New synthetic town'));
 assert.equal(located.reportCount,original.reportCount+1);
 const twoPlaces={...next,locations:[{name:'First',lat:38,lon:3},{name:'Second',lat:39,lon:4}]};
 const split=aggregateIncidentLocations([twoPlaces],geo);
 assert.equal(split.located,1);
 assert.equal(split.places.length,2);
 assert.equal(split.weight,1);
});
test('heat map is local, release-versioned and uses text-only source attribution',()=>{
 const html=read('public/index.html'),module=read('public/assets/christian-heatmap.js');
 assert.match(html,/data-pc-map-surface/);
 assert.match(html,/data-pc-map-layer/);
 assert.match(html,/data-pc-map-reset/);
 assert.match(module,/onReset/);
 assert.match(module,/world-heatmap-110m.json\?v=/);
 assert.match(module,/christian-heatmap-places.json\?v=/);
 assert.doesNotMatch(module,/(maps\.google|mapbox|tile\.openstreetmap|\.innerHTML\s*=)/);
});
