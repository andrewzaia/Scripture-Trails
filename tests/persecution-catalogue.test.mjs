import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,statSync} from 'node:fs';
import {filterPersecutionReports,reportKind,formatReportDate} from '../public/assets/persecution-catalogue.js';
import {aggregateIncidentLocations} from '../public/assets/christian-heatmap.js';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const records=JSON.parse(read('public/data/christian-persecution.json')).reports;
const media=JSON.parse(read('public/data/christian-persecution-media.json')).media;
test('open-ended reporting preserves source attribution, IDs and historical date precision',()=>{
 assert.ok(records.length>=252);
 assert.ok(records.filter(r=>r.country==='Australia').length>=37);
 assert.equal(new Set(records.map(x=>x.id)).size,records.length);
 assert.ok(new Set(records.map(x=>x.country)).size>=32);
 assert.ok(records.some(r=>r.date==='1997-02-06'));
 assert.ok(records.some(r=>r.date==='1999'));
 const archive=JSON.parse(read('public/data/christian-persecution.json'));
 assert.equal('period' in archive,false);
 for(const r of records){
  assert.match(r.id,/^CT-\d{4}$/);
  assert.match(r.date,/^\d{4}(?:-\d{2}(?:-\d{2})?)?$/);
  assert.notEqual(formatReportDate(r.date),'Invalid Date');
  assert.ok(r.title&&r.published_account&&r.publisher&&r.country);
  assert.equal(new URL(r.source_url).protocol,'https:');
  for(const field of ['second_source_url','media_url'])if(r[field])assert.equal(new URL(r[field]).protocol,'https:');
 }
});
test('media index retains publisher links and rights notes in the expanded archive',()=>{
 assert.ok(media.length>=65);
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
 assert.equal(totals.reportCount,records.length);
 assert.equal([...totals.countries.values()].reduce((a,b)=>a+b,0),records.length);
 assert.ok(totals.countries.size>=32);
 assert.ok(totals.countries.get('Australia')>=37);
 assert.equal(totals.located+totals.withoutLocality,records.length);
 assert.ok(Math.abs(totals.weight-totals.located)<0.0001);
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

test('historical dates display without inventing a day',()=>{
 assert.equal(formatReportDate('1999'),'1999');
 assert.equal(formatReportDate('2015-11'),'Nov 2015');
 assert.equal(formatReportDate('2024-04-15'),'15 Apr 2024');
 assert.equal(formatReportDate('2023-02-30'),'2023-02-30');
 assert.equal(formatReportDate('unknown'),'unknown');
 assert.ok(filterPersecutionReports(records,{country:'Australia',year:'1999'}).length>=1);
});
test('Australian and older reports remain filterable and mapped',()=>{
 assert.ok(filterPersecutionReports(records,{country:'Australia'}).length>=37);
 assert.ok(filterPersecutionReports(records,{country:'Pakistan',year:'1997'}).some(r=>r.title.includes('Shantinagar')));
 const geo=JSON.parse(read('public/data/christian-heatmap-places.json'));
 assert.equal(geo.countries.Australia.iso3,'AUS');
 assert.equal(geo.countries.Iraq.iso3,'IRQ');
 assert.equal(geo.countries.Libya.iso3,'LBY');
 assert.ok(geo.places['Australia|Wakeley, Sydney']);
});

test('Christian persecution page retains route and updated visible labels',()=>{
 const html=read('public/index.html'),app=read('public/assets/app.js');
 assert.match(html,/data-view="christian-persecution"[^>]*>.*Christian persecution<\/button>/);
 assert.match(html,/CHRISTIAN PERSECUTION/);
 assert.match(app,/'christian-persecution':'Christian persecution'/);
 assert.doesNotMatch(html,/CHRISTIANS WORLDWIDE/);
});
test('locally stored licensed image thumbnails have complete credits and valid JPEG bytes',()=>{
 const d=JSON.parse(read('public/data/christian-persecution-images.json'));
 assert.ok(d.images.length>=4);
 for(const pic of d.images){
  assert.ok(records.some(r=>r.id===pic.report_id),'Image must reference a report');
  assert.match(pic.path,/^\/assets\/persecution-media\/[a-z0-9-]+\.jpg$/);
  assert.ok(pic.author&&pic.alt&&pic.caption&&pic.licence_label&&pic.adaptation);
  assert.equal(new URL(pic.source).protocol,'https:');
  assert.equal(new URL(pic.licence).protocol,'https:');
  const filepath=new URL('../public'+pic.path,import.meta.url);
  assert.ok(existsSync(filepath),'Missing locally hosted photo '+pic.path);
  const bytes=readFileSync(filepath);
  assert.equal(bytes[0],0xff);assert.equal(bytes[1],0xd8);
  assert.ok(statSync(filepath).size<1250000,'Thumbnail must stay small '+pic.path);
 }
 const code=read('public/assets/persecution-catalogue.js');
 assert.match(code,/persecution-case-header/);
 assert.match(code,/image\.loading='lazy'/);
 assert.match(code,/pic\.author/);
 assert.doesNotMatch(code,/\.innerHTML\s*=/);
});
test('new reports extend geographic coverage without removing historic incidents',()=>{
 const geo=JSON.parse(read('public/data/christian-heatmap-places.json'));
 const countries=new Set(records.map(r=>r.country));
 for(const name of ['Ethiopia','Eritrea','Kenya'])assert.ok(countries.has(name));
 for(const code of ['ETH','ERI','KEN'])assert.ok(Object.values(geo.countries).some(x=>x.iso3===code));
 assert.ok(records.some(r=>r.date==='2026-10-24'&&r.country==='Ethiopia'));
 assert.ok(records.some(r=>r.date==='2015-04-02'&&r.country==='Kenya'));
});
