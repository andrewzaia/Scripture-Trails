import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {filterPersecutionReports,reportKind} from '../public/assets/persecution-catalogue.js';
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
