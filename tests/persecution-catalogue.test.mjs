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

test('media filter includes rights-cleared local photographs without publisher media URLs',()=>{
 const siteOnly=records.find(r=>r.id==='CT-0224');
 assert.ok(siteOnly&&!siteOnly.media_url&&!siteOnly.media_type);
 assert.equal(filterPersecutionReports([siteOnly],{media:true}).length,0);
 assert.equal(filterPersecutionReports([siteOnly],{media:true,localMediaIds:new Set([siteOnly.id])}).length,1);
});

test('Ukraine reports remain attributed and the world map includes locations with honest precision',()=>{
 const uk=records.filter(r=>r.country==='Ukraine');
 assert.equal(uk.length,41);
 assert.ok(records.length>=293,'Existing archive must remain intact');
 assert.equal(new Set(uk.map(x=>x.id)).size,uk.length);
 assert.ok(uk.some(x=>x.date==='2023-03-28'&&x.place==='Ivano-Frankivsk'));
 assert.ok(uk.some(x=>x.date==='2024-10-17'&&x.place==='Cherkasy'));
 assert.ok(uk.some(x=>x.date==='2025-07-02'&&/Onufriy/.test(x.title)));
 assert.ok(uk.some(x=>x.date==='2026-10-09'&&/Sinyuk/.test(x.title)));
 assert.ok(uk.some(x=>x.notes?.includes('Russian-occupied')));
 assert.ok(uk.some(x=>x.notes?.includes('government-controlled')));
 assert.ok(uk.some(x=>x.notes?.includes('Military mobilisation alone')));
 for(const r of uk){
  assert.match(r.id,/^CT-\d{4}$/);
  assert.ok(r.reported_actor&&r.publisher&&r.notes&&r.source_url,'Attribution missing for '+r.id);
 }
 const geo=JSON.parse(read('public/data/christian-heatmap-places.json'));
 assert.equal(geo.countries.Ukraine.iso3,'UKR');
 assert.ok(geo.places['Ukraine|Kyiv']);
 assert.ok(geo.places['Ukraine|Cherkasy']);
 assert.ok(!geo.places['Ukraine|Occupied Kherson region'],'Do not invent a detention-site pin');
 const all=aggregateIncidentLocations(records,geo);
 assert.equal(all.countries.get('Ukraine'),41);
 assert.equal(all.reportCount,records.length);
 assert.ok(all.places.some(x=>x.country==='Ukraine'&&x.label==='Kyiv'));
});

test('new-country archive expansion adds 25 mapped countries without losing earlier incidents',()=>{
 const newCountries=[
  'Algeria','Azerbaijan','Bangladesh','Belarus','Cameroon','Canada','Colombia','Cuba','Iran','Israel',
  'Laos','Malaysia','Mali','Myanmar','Nepal','Niger','North Korea','Palestinian territories','Somalia',
  'South Africa','South Sudan','Sudan','Uganda','Vietnam','Yemen'
 ];
 assert.equal(newCountries.length,25);
 assert.ok(records.length>=358);
 assert.ok(new Set(records.map(r=>r.country)).size>=58);
 const geo=JSON.parse(read('public/data/christian-heatmap-places.json'));
 const world=JSON.parse(read('public/data/world-heatmap-110m.json'));
 const validCodes=new Set(world.features.map(f=>f.id));
 const totals=aggregateIncidentLocations(records,geo);
 for(const country of newCountries){
  const all=records.filter(r=>r.country===country);
  assert.ok(all.length>=1,'Unrepresented country: '+country);
  assert.ok(geo.countries[country],'Missing map entry: '+country);
  assert.ok(validCodes.has(geo.countries[country].iso3),'Missing world-map shape: '+country);
  assert.equal(totals.countries.get(country),all.length);
  assert.ok(all.every(r=>r.publisher&&r.reported_actor&&r.notes),'Missing source qualification: '+country);
  assert.ok(all.every(r=>new URL(r.source_url).protocol==='https:'),'Unsafe source URL: '+country);
  assert.ok(filterPersecutionReports(records,{country}).length>=1,'Country filter failed: '+country);
 }
 for(const r of records)assert.ok(geo.countries[r.country],'Every report must map to a country: '+r.country);
 assert.equal(totals.reportCount,records.length);
 assert.equal([...totals.countries.values()].reduce((a,b)=>a+b,0),records.length);
 assert.ok(records.some(r=>r.country==='Bangladesh'&&r.notes.includes('land or intra-community dispute')));
 assert.ok(records.some(r=>r.country==='Canada'&&r.notes.includes('No religiously motivated')));
 assert.ok(records.some(r=>r.country==='Palestinian territories'&&r.notes.includes('No demonstrated intent')));
 assert.ok(records.some(r=>r.country==='Azerbaijan'&&r.publisher.includes('Caucasus Heritage Watch')));
});

test('further country and low-coverage research has all source and world-map invariants',()=>{
 const newlyCovered=['Kazakhstan','Kyrgyzstan','Uzbekistan','Turkmenistan','Tanzania','Chad','Ghana','Kosovo','Lebanon','Brazil','Venezuela','Morocco'];
 assert.equal(newlyCovered.length,12);
 assert.ok(records.length>=390);
 const geo=JSON.parse(read('public/data/christian-heatmap-places.json'));
 const world=JSON.parse(read('public/data/world-heatmap-110m.json'));
 const codes=new Set(world.features.map(f=>f.id));
 assert.ok(new Set(records.map(r=>r.country)).size>=70);
 const totals=aggregateIncidentLocations(records,geo);
 assert.equal(totals.reportCount,records.length);
 assert.equal([...totals.countries.values()].reduce((sum,n)=>sum+n,0),records.length);
 for(const country of newlyCovered){
   const recordsInCountry=records.filter(r=>r.country===country);
   assert.ok(recordsInCountry.length>=1,'Country missing reports: '+country);
   assert.ok(geo.countries[country]&&codes.has(geo.countries[country].iso3),'Country is not mapped: '+country);
   assert.equal(totals.countries.get(country),recordsInCountry.length);
   assert.ok(recordsInCountry.every(r=>r.publisher&&r.reported_actor&&r.source_url&&r.notes),'Missing provenance in '+country);
   assert.equal(filterPersecutionReports(records,{country}).length,recordsInCountry.length);
 }
 for(const report of records)assert.ok(geo.countries[report.country],'Unmapped report: '+report.id);
 assert.equal(records.filter(r=>r.country==='Tanzania').length,7);
 assert.ok(records.some(r=>r.country==='Morocco'&&r.notes.includes('Yearly pattern')));
 assert.ok(records.some(r=>r.country==='Ghana'&&r.notes.includes('not detained')));
 assert.ok(records.some(r=>r.country==='Lebanon'&&r.notes.includes('Suspected theft')));
 assert.ok(records.some(r=>r.country==='United Kingdom'&&r.publisher==='Crown Prosecution Service'));
 assert.ok(records.some(r=>r.country==='Mozambique'&&r.date==='2025-10-09'));
 const newRows=records.filter(r=>Number(r.id.slice(3))>=359&&Number(r.id.slice(3))<=390);
 assert.equal(newRows.length,32);
 for(const r of newRows){assert.equal(new URL(r.source_url).protocol,'https:');assert.ok(r.notes);}
});

test('report-inclusive global expansion adds 45 source-attributed reports with mapped country coverage',()=>{
 const countries=['Tajikistan','Armenia','Bhutan','Brunei','Jordan','Qatar','United Arab Emirates',
   'Saudi Arabia','Oman','Chile','Guatemala','Peru','Malawi','Greece'];
 assert.equal(countries.length,14);
 assert.ok(records.length>=435);
 assert.ok(new Set(records.map(r=>r.country)).size>=84);
 const geo=JSON.parse(read('public/data/christian-heatmap-places.json'));
 const world=JSON.parse(read('public/data/world-heatmap-110m.json'));
 const allowed=new Set(world.features.map(f=>f.id));
 const totals=aggregateIncidentLocations(records,geo);
 assert.equal(totals.reportCount,records.length);
 assert.equal([...totals.countries.values()].reduce((n,count)=>n+count,0),records.length);
 for(const country of countries){
   const subset=records.filter(r=>r.country===country);
   assert.ok(subset.length>0,'No reports in '+country);
   assert.ok(geo.countries[country]&&allowed.has(geo.countries[country].iso3),'Missing geometry '+country);
   assert.equal(totals.countries.get(country),subset.length);
   assert.equal(filterPersecutionReports(records,{country}).length,subset.length);
 }
 const newRows=records.filter(r=>Number(r.id.slice(3))>=391&&Number(r.id.slice(3))<=435);
 assert.equal(newRows.length,45);
 for(const record of newRows){
   assert.match(record.id,/^CT-\d{4}$/);
   assert.ok(record.title&&record.published_account&&record.publisher&&record.reported_actor&&record.notes);
   assert.equal(new URL(record.source_url).protocol,'https:');
 }
 const disputed=records.find(r=>r.id==='CT-0428');
 assert.equal(disputed.country,'Democratic Republic of the Congo');
 assert.ok(disputed.notes.includes('conflicting reports'));
 assert.equal(new URL(disputed.second_source_url).protocol,'https:');
 assert.ok(records.some(r=>r.country==='Armenia'&&r.category.includes('Clergy')));
 assert.ok(records.some(r=>r.country==='Brunei'&&r.category.includes('surveillance')));
 assert.ok(records.some(r=>r.country==='Saudi Arabia'&&r.notes.includes('Policy-level')));
 assert.ok(records.some(r=>r.country==='Chile'&&r.notes.includes('Aggregate published claim')));
 assert.ok(records.some(r=>r.country==='Guatemala'&&r.date==='2024-01'));
 const page=read('public/index.html');
 assert.match(page,/includes published reports even where they are uncorroborated, disputed or based on a single source/);
 assert.match(page,/GLOBAL REPORT DISTRIBUTION/);
 assert.ok(!page.includes('GLOBAL INCIDENT DISTRIBUTION'));
});

test('seven newly represented countries preserve incident-level and aggregate attribution',()=>{
 const countries=['Sweden','Netherlands','Croatia','Bosnia and Herzegovina','Argentina','Georgia','Serbia'];
 const geo=JSON.parse(read('public/data/christian-heatmap-places.json'));
 const world=JSON.parse(read('public/data/world-heatmap-110m.json'));
 const shapes=new Set(world.features.map(x=>x.id));
 const counts=aggregateIncidentLocations(records,geo);
 assert.ok(records.length>=460);
 assert.equal(records.filter(r=>Number(r.id.slice(3))<=460).length,460);
 assert.equal(new Set(records.map(x=>x.country)).size,91);
 assert.equal(counts.reportCount,records.length);
 assert.equal([...counts.countries.values()].reduce((a,b)=>a+b,0),records.length);
 for(const country of countries){
  const rows=records.filter(x=>x.country===country);
  assert.ok(rows.length,'Country missing: '+country);
  assert.ok(geo.countries[country]&&shapes.has(geo.countries[country].iso3),'No map geometry: '+country);
  assert.equal(counts.countries.get(country),rows.length);
  assert.equal(filterPersecutionReports(records,{country}).length,rows.length);
 }
 const fresh=records.filter(r=>Number(r.id.slice(3))>=436&&Number(r.id.slice(3))<=460);
 assert.equal(fresh.length,25);
 for(const r of fresh){
  assert.match(r.id,/^CT-\d{4}$/);
  assert.ok(r.publisher&&r.reported_actor&&r.notes&&r.published_account);
  assert.equal(new URL(r.source_url).protocol,'https:');
 }
 assert.ok(fresh.some(r=>r.country==='Croatia'&&r.title.includes('St Spyridon')));
 assert.ok(fresh.some(r=>r.country==='Sweden'&&r.title.includes('Syriac Orthodox')));
 assert.ok(fresh.some(r=>r.country==='Bosnia and Herzegovina'&&r.publisher.includes('OSCE')));
 assert.ok(fresh.some(r=>r.country==='Netherlands'&&r.incident_group==='EDE-CHURCHES-2026'));
 assert.ok(fresh.some(r=>r.country==='Serbia'&&r.place.includes('not specified')));
 assert.ok(fresh.some(r=>r.country==='Georgia'&&r.notes.includes('aggregate')));
});

test('daesh-linked expansion retains 45 distinct sourced report records and historical archive',()=>{
 const added=records.filter(r=>Number(r.id.slice(3))>=461&&Number(r.id.slice(3))<=505);
 assert.equal(added.length,45);
 assert.equal(records.length,535);
 assert.equal(new Set(records.map(x=>x.id)).size,535);
 assert.equal(new Set(records.map(x=>x.country)).size,91);
 const expected={Iraq:16,Syria:8,Libya:2,Egypt:3,Nigeria:5,'Democratic Republic of the Congo':3,Mozambique:6,Philippines:2};
 for(const [country,count] of Object.entries(expected)){
  assert.equal(added.filter(r=>r.country===country).length,count,'Missing reports: '+country);
  assert.ok(filterPersecutionReports(records,{country}).length>=count);
 }
 const groups=new Map();
 for(const r of added){
  assert.match(r.id,/^CT-\d{4}$/);
  assert.match(r.date,/^\d{4}(?:-\d{2}(?:-\d{2})?)?$/);
  assert.ok(r.title&&r.published_account&&r.publisher&&r.source_url&&r.reported_actor&&r.notes);
  assert.equal(new URL(r.source_url).protocol,'https:');
  assert.doesNotMatch([r.title,r.published_account,r.reported_actor,r.notes].join(' '),/\b(?:ISIS|ISIL|Daesh|Islamic State|ISWAP)\b/);
  if(r.incident_group)groups.set(r.incident_group,(groups.get(r.incident_group)||0)+1);
 }
 assert.ok(groups.get('IRQ-QARAQOSH-2014')>=2);
 assert.ok(groups.get('SYR-KHABUR-2015')>=2);
 assert.ok(added.some(r=>r.country==='Iraq'&&r.title.includes('Mosul Christians ordered')));
 assert.ok(added.some(r=>r.country==='Syria'&&r.title.includes('Assyrian Christian villages')));
 assert.ok(added.some(r=>r.country==='Nigeria'&&r.title.includes('Leah Sharibu')));
 assert.ok(added.some(r=>r.country==='Philippines'&&r.date==='2023-12-03'));
 const geo=JSON.parse(read('public/data/christian-heatmap-places.json'));
 const totals=aggregateIncidentLocations(records,geo);
 assert.equal(totals.reportCount,535);
 assert.equal([...totals.countries.values()].reduce((n,v)=>n+v,0),535);
 assert.equal(totals.located+totals.withoutLocality,535);
 assert.ok(totals.countries.get('Iraq')>=16);
});

test('thirty further daesh-related reports preserve provenance and report-based map counts',()=>{
 const fresh=records.filter(r=>Number(r.id.slice(3))>=506&&Number(r.id.slice(3))<=535);
 assert.equal(fresh.length,30);
 assert.equal(records.length,535);
 assert.equal(new Set(records.map(r=>r.id)).size,535);
 assert.equal(new Set(records.map(r=>r.country)).size,91);
 const expected={Bangladesh:4,Egypt:8,Pakistan:2,Indonesia:2,Syria:2,Nigeria:2,'Democratic Republic of the Congo':3,Mozambique:3,Iraq:3,France:1};
 for(const [country,count] of Object.entries(expected)){
  assert.equal(fresh.filter(r=>r.country===country).length,count);
  assert.ok(filterPersecutionReports(records,{country}).length>=count);
 }
 for(const r of fresh){
  assert.match(r.id,/^CT-\d{4}$/);
  assert.match(r.date,/^\d{4}(?:-\d{2}(?:-\d{2})?)?$/);
  assert.ok(r.title&&r.published_account&&r.publisher&&r.reported_actor&&r.notes&&r.incident_group);
  assert.equal(new URL(r.source_url).protocol,'https:');
  if(r.second_source_url)assert.equal(new URL(r.second_source_url).protocol,'https:');
  assert.doesNotMatch([r.title,r.published_account,r.reported_actor,r.notes].join(' '),/\b(?:ISIS|ISIL|Daesh|Islamic State|ISWAP)\b/);
 }
 assert.ok(fresh.some(r=>r.country==='Mozambique'&&r.date==='2026-04-30'));
 assert.ok(fresh.some(r=>r.country==='Iraq'&&r.title.includes('Clock Church')));
 assert.ok(fresh.some(r=>r.country==='France'&&r.title.includes('Father Jacques Hamel')));
 assert.ok(fresh.some(r=>r.country==='Syria'&&r.title.includes('Assyrian Christian restaurants')));
 const egypt=fresh.filter(r=>r.incident_group==='EGY-SINAI-COPTS-2017');
 assert.equal(egypt.length,6);
 assert.ok(egypt.every(r=>r.notes.includes('CT-0248')||r.date==='2017-05-06'));
 const geo=JSON.parse(read('public/data/christian-heatmap-places.json'));
 const totals=aggregateIncidentLocations(records,geo);
 assert.equal(totals.reportCount,535);
 assert.equal([...totals.countries.values()].reduce((s,n)=>s+n,0),535);
 assert.equal(totals.located+totals.withoutLocality,535);
});
