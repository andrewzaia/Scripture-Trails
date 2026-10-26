import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateCityStudies} from '../public/assets/city-studies.js';
import {parseRef} from '../public/assets/books.js';
import {passageStart} from '../public/assets/jesus-map.js';
const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
const cities=JSON.parse(read('../public/data/city-studies.json'));
const roadmap=JSON.parse(read('../public/data/roadmap.json'));
const index=read('../public/index.html'),app=read('../public/assets/app.js'),css=read('../public/assets/city-studies.css'),headers=read('../public/_headers');

test('Five source-linked flagship city studies have complete evidence registers',()=>{
 assert.equal(validateCityStudies(cities),true);
 assert.equal(cities.cities.length,5);
 assert.equal(cities.cities.reduce((n,c)=>n+c.findings.length,0),20);
 assert.ok(cities.cities.every(c=>c.timeline.length>=5&&c.biblical.length>=5));
 assert.ok(cities.cities.every(c=>c.findings.every(f=>f.sourceIds.length||f.passages.length)));
 assert.ok(cities.cities.every(c=>c.biblical.every(p=>parseRef(passageStart(p.ref)))));
});

test('Bible remains primary: excavations never automatically certify a biblical miracle or precise house',()=>{
 for(const c of cities.cities){assert.ok(c.status.length>30);assert.ok(c.debates.length>=3);assert.ok(c.findings.every(f=>f.limitation.length>45));}
 assert.match(cities.cities.find(c=>c.id==='capernaum').lead,/later construction phase/i);
 assert.match(cities.cities.find(c=>c.id==='bethlehem').lead,/commemoration|tradition/i);
 assert.match(cities.cities.find(c=>c.id==='jericho').lead,/Bronze Age/i);
});

test('Every city source and linked modern photo has independent HTTPS, authorship and licence record',()=>{
 assert.ok(Object.keys(cities.sources).length>=15);
 for(const c of cities.cities){assert.ok(c.image.author);assert.ok(c.image.license);assert.match(c.image.page,/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);assert.match(c.image.licenseUrl,/^https:/);}
});

test('Location comparisons keep several candidate sites, never claim unique proof',()=>{
 assert.deepEqual(cities.disputed.map(c=>c.id),['cana','bethsaida','emmaus']);
 assert.deepEqual(cities.disputed.map(c=>c.candidates.length),[2,2,3]);
 for(const c of cities.disputed)assert.match(c.statement,/not |neither |multiple|complicate/i);
 const bad=structuredClone(cities);bad.cities[0].timeline[0].sourceIds.push('fabricated');assert.throws(()=>validateCityStudies(bad));
});

test('Full historical study view is linked from menu, the journeys map, and the passage reader',()=>{
 assert.match(index,/id="view-city-studies"/);
 assert.match(index,/data-view="city-studies"/);
 assert.match(index,/data-jesus="city-deep-link"/);
 assert.match(app,/createCityStudies/);
 assert.match(app,/openCityStudy/);
 assert.match(app,/onRead:ref=>selectRef\(ref,'reader'\)/);
 assert.match(app,/onAtlas:ref=>selectRef\(ref,'connections'\)/);
 const controls=[...read('../public/assets/city-studies.js').matchAll(/\$\('([a-z-]+)'\)/g)].map(x=>x[1]);
 for(const id of new Set(controls))assert.ok(index.includes(`data-city="${id}"`),`Missing city control ${id}`);
 assert.match(css,/max-width:760px/);
});

test('External site photos are restricted to Wikimedia image hosts by CSP',()=>{
 assert.match(headers,/img-src 'self' data: https:\/\/upload\.wikimedia\.org https:\/\/commons\.wikimedia\.org/);
 assert.match(headers,/script-src 'self'/);
 assert.match(read('../public/assets/city-studies.js'),/referrerpolicy|no-referrer|photo\.src/);
});
