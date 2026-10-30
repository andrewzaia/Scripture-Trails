import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {TRANSLATIONS} from '../public/assets/translations.js';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const ledger=JSON.parse(read('sources/legal/publisher-rights-register-2026-10-31.json'));
const html=read('public/index.html');
const roadmap=JSON.parse(read('public/data/roadmap.json'));
const cities=JSON.parse(read('public/data/city-studies.json'));

test('public licence review covers all four editions and non-commercial academic use',()=>{
 assert.equal(ledger.projectUse,'Non-commercial academic Bible study');
 assert.equal(ledger.method,'Public publisher terms and repository implementation audit only.');
 assert.equal(ledger.items.length,6);
 const editions=ledger.items.filter(x=>x.type==='copyrighted-translation');
 assert.deepEqual(new Set(editions.map(x=>x.edition)),new Set(TRANSLATIONS.map(x=>x.code)));
 for(const item of editions){
  assert.equal(item.status,'public-terms-reviewed',item.edition);
  assert.match(item.sourceUrl,/^https:\/\//);
  assert.ok(item.risks.length>=2);
 }
 assert.equal(roadmap.v1Readiness.gates.flatMap(g=>g.criteria).filter(x=>x.status==='met').length,9);
 assert.equal(roadmap.v1Readiness.gates.flatMap(g=>g.criteria).find(x=>x.id==='source-licences').status,'open');
 assert.equal(roadmap.milestones.find(x=>x.id==='v1-publisher-rights-evidence-ledger')?.status,'delivered');
});

test('About cites official public publisher terms and never embeds contract documents',()=>{
 assert.match(html,/Scripture Trails is a non-commercial academic Bible-study website/);
 assert.match(html,/Publisher permissions and review status/);
 assert.match(html,/does not provide a downloadable translation corpus/);
 for(const url of ['https://www.esv.org/api/','https://api.bible/terms-and-conditions','https://www.biblica.com/permissions/','https://www.lockman.org/permission-to-quote-copyright-trademark-information/'])assert.ok(html.includes(url),url);
 for(const id of ['copyright-nasb20','copyright-niv','copyright-nkjv'])assert.ok(html.includes('id="'+id+'"'));
 assert.match(html,/Users may not copy or download more than 500 verses of the ESV Bible/);
});

test('five local city photos retain their public licences, author credit and transformations',()=>{
 const photos=cities.cities.map(x=>x.image);
 assert.equal(photos.length,5);
 assert.equal(ledger.items.find(x=>x.id==='historical-city-photographs')?.status,'metadata-and-local-hashes-reviewed');
 for(const p of photos){
  assert.match(p.url,/^\/assets\/city-photos\/[a-z-]+\.webp$/);
  assert.match(p.page,/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
  assert.match(p.licenseUrl,/^https:\/\/creativecommons\.org\//);
  assert.ok(p.author&&p.license&&p.changes&&p.sha256);
 }
 const source=read('public/assets/city-studies.js');
 for(const marker of ['meta.author','meta.license','meta.changes'])assert.ok(source.includes(marker));
});

test('published review documents API restrictions and retains appropriate limits',()=>{
 const nkjv=ledger.items.find(x=>x.edition==='NKJV');
 const refs=ledger.items.find(x=>x.id==='openbible-crossrefs');
 assert.ok(nkjv.risks.some(x=>x.includes('5,000 monthly end users')));
 assert.ok(refs.risks.some(x=>x.includes('exact licence version')||x.includes('CC BY 4.0')));
 const review=read('sources/legal/publisher-rights-review-2026-10-31.md');
 assert.match(review,/non-commercial academic Bible-study website/);
 assert.match(review,/source-licences.*remains OPEN/);
 assert.match(review,/publicly available publisher terms/);
});

test('Atlas comparison attributes each edition with a publisher link',()=>{
 const source=read('public/assets/atlas-comparison.js');
 assert.match(source,/provider\.publisherUrl/);
 assert.match(source,/provider\.publisher\+' - publisher information'/);
 for(const edition of TRANSLATIONS){
  assert.match(edition.publisherUrl,/^https:\/\//);
 }
});
