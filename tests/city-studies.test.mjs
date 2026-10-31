import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {validateCityStudies,cityPhotoCandidates,isApprovedPhotoUrl} from '../public/assets/city-studies.js';
import {parseRef} from '../public/assets/books.js';
import {passageStart} from '../public/assets/jesus-map.js';
const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
const cities=JSON.parse(read('../public/data/city-studies.json'));
const roadmap=JSON.parse(read('../public/data/roadmap.json'));
const index=read('../public/index.html'),app=read('../public/assets/app.js'),css=read('../public/assets/city-studies.css'),headers=read('../public/_headers');

test('Five source-linked flagship city studies have complete evidence registers',()=>{
 assert.equal(validateCityStudies(cities),true);
 assert.equal(cities.cities.length,5);
 assert.equal(cities.cities.reduce((n,c)=>n+c.findings.length,0),22);
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

test('city photo CSP permits local assets and required Bible reporting without Wikimedia requests',()=>{
 assert.match(headers,/img-src 'self' data: https:\/\/www\.google-analytics\.com/);
 assert.match(headers,/connect-src[^\n]*https:\/\/fums\.api\.bible/);
 assert.doesNotMatch(headers,/script-src[^\n]*fumsV3|script-src[^\n]*fumsv2/);
 assert.doesNotMatch(headers,/https:\/\/(?:upload|commons)\.wikimedia\.org/);
 assert.match(headers,/script-src 'self'/);
});

test('all five city photographs are local licensed assets with verified byte hashes',()=>{
 for(const c of cities.cities){
  const candidates=cityPhotoCandidates(c.image);
  assert.equal(candidates.length,1);
  assert.match(candidates[0],/^\/assets\/city-photos\/[a-z-]+\.webp$/);
  assert.ok(isApprovedPhotoUrl(candidates[0]));
  assert.ok(!isApprovedPhotoUrl(c.image.sourceUrl));
  const bytes=readFileSync(new URL('../public'+c.image.url,import.meta.url));
  assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');
  assert.equal(createHash('sha256').update(bytes).digest('hex'),c.image.sha256);
  assert.ok(bytes.length<600000);assert.ok(c.image.changes.includes('WebP'));
  assert.equal(c.image.page,`https://commons.wikimedia.org/wiki/File:${c.image.file}`);
 }
 assert.equal(isApprovedPhotoUrl('//evil.example/photo.webp'),false);
 assert.equal(isApprovedPhotoUrl('/assets/city-photos/../secret.webp'),false);
 assert.equal(isApprovedPhotoUrl('https://evil.example.org/image.jpg'),false);
 const script=read('../public/assets/city-studies.js');
 assert.match(script,/photo\.onerror=\(\)=>\{photoIndex\+\+/);
 assert.match(script,/photo\.onload=\(\)=>/);
});


test('Each flagship city has substantial Scripture-first historical reading layers with traceable support',()=>{
 const expected=['jerusalem','nazareth','capernaum','bethlehem','jericho'];
 assert.deepEqual(cities.cities.map(c=>c.id),expected);
 assert.equal(cities.cities.reduce((n,c)=>n+c.studyLayers.length,0),15);
 for(const city of cities.cities){
  assert.deepEqual(city.studyLayers.map(l=>l.kind),['biblical-reading','material-context','interpretive-question']);
  for(const layer of city.studyLayers){
   assert.ok(layer.body.split(/\s+/).length>=45,city.id+' '+layer.title);
   assert.ok(layer.qualification.length>=65,city.id);
   for(const ref of layer.passages)assert.ok(parseRef(passageStart(ref)),city.id+' '+ref);
   for(const id of layer.sourceIds)assert.ok(cities.sources[id],city.id+' '+id);
   assert.ok(!/verified the miracle|proof of (?:the )?birth|certainly belonged to/i.test(layer.body),city.id);
  }
  assert.ok(city.studyLayers.find(l=>l.kind==='material-context').sourceIds.length>=1);
 }
 assert.equal(cities.sources['nazareth-iaa'].kind,'Excavation report, 2020');
 assert.match(cities.sources['nazareth-iaa'].publisher,/2020/);
 const nz=cities.cities.find(c=>c.id==='nazareth');
 assert.match(nz.studyLayers[1].body,/2020/);
 const c=cities.cities.find(c=>c.id==='capernaum');
 assert.match(c.studyLayers[1].qualification,/debated/);
 const b=cities.cities.find(c=>c.id==='bethlehem');
 assert.match(b.studyLayers[1].body,/339 CE/);
 const j=cities.cities.find(c=>c.id==='jericho');
 assert.match(j.studyLayers[1].body,/eighteen samples/);
 assert.match(j.studyLayers[1].qualification,/tentative listing/);
 const hist=cities.cities.find(c=>c.id==='jerusalem');
 assert.match(hist.studyLayers[1].body,/103 radiocarbon dates/);
});

test('Layered historical studies fail closed for unsupported or missing material',()=>{
 for(const mutate of [
  d=>d.cities[0].studyLayers.pop(),
  d=>d.cities[1].studyLayers[1].sourceIds.push('invented-report'),
  d=>d.cities[2].studyLayers[1].passages=['Mark 1:999'],
  d=>d.cities[3].studyLayers[0].body='Vague source links only.',
  d=>d.cities[4].studyLayers[1].sourceIds=[]
 ]){
  const d=structuredClone(cities);mutate(d);assert.throws(()=>validateCityStudies(d));
 }
 const html=read('../public/index.html');
 assert.match(html,/data-city="study-layers"/);
 const ui=read('../public/assets/city-studies.js');
 assert.match(ui,/city-study-layer-body/);
 assert.match(ui,/document.createTextNode\(item.qualification\)/);
});

test('Jericho radiocarbon conclusions retain the publisher calibration limits and distinguish Joshua',()=>{
 const jericho=cities.cities.find(c=>c.id==='jericho');
 const finding=jericho.findings.find(f=>f.title==='Radiocarbon evidence and chronology');
 const material=jericho.studyLayers.find(l=>l.kind==='material-context');
 const source=cities.sources['jericho-radiocarbon'];
 assert.ok(finding&&material&&source);
 assert.match(finding.claim,/eighteen radiocarbon samples/);
 assert.match(finding.claim,/preliminary calendar calibrations/);
 assert.match(finding.limitation,/calibration curves/);
 assert.match(finding.limitation,/Joshua 6/);
 assert.match(material.body,/six short-lived cereal-grain samples and twelve charcoal samples/);
 assert.match(material.body,/calibration-curve uncertainty/);
 assert.match(material.qualification,/preliminary/);
 assert.match(material.qualification,/tentative listing/);
 assert.equal(source.doi,'10.1017/S0033822200030666');
 assert.match(source.publisher,/Radiocarbon 37\(2\)/);
 assert.match(source.rights,/Linked only/);
 assert.match(finding.limitation,/neither attackers nor the particular event narrated in Joshua 6/);
 assert.match(source.url,/^https:\/\/www\.cambridge\.org\/core\/journals\/radiocarbon\/article\//);
 assert.match(source.access,/not independently reanalysed/);
});

test('Cana competing sites have distinct archaeological citations and no claimed wedding-site identification',()=>{
 const cana=cities.disputed.find(d=>d.id==='cana');
 assert.ok(cana);
 assert.match(cana.statement,/Neither candidate is established/);
 assert.match(cana.statement,/do not authenticate/);
 assert.equal(cana.candidates.length,2);
 const [kafr,qana]=cana.candidates;
 assert.deepEqual(kafr.sourceIds,['cana-kafr-iaa']);
 assert.deepEqual(qana.sourceIds,['cana-qana-kinneret']);
 assert.match(kafr.note,/early Roman occupation/);
 assert.match(qana.note,/Late Roman and\/or Byzantine/);
 assert.match(cities.sources[kafr.sourceIds[0]].url,/^https:\/\/hadashot\.iaa\.org\.il\//);
 assert.equal(cities.sources[qana.sourceIds[0]].url,'https://synagogues.kinneret.ac.il/synagogues/qana/');
 assert.ok(validateCityStudies(cities));
 for(const mutate of [
  d=>d.disputed.find(x=>x.id==='cana').candidates[0].sourceIds=['unregistered-source'],
  d=>d.disputed.find(x=>x.id==='cana').candidates[1].sourceIds='wrong-type'
 ]){
  const invalid=structuredClone(cities);mutate(invalid);
  assert.throws(()=>validateCityStudies(invalid));
 }
});
