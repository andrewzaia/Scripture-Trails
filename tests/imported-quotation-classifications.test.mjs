import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseRef} from '../public/assets/books.js';
import {CONNECTION_EVIDENCE,explainConnection} from '../public/assets/connection-evidence.js';
import {CITATION_REVIEW,IMPORTED_QUOTATION_KINDS,importedQuotationReview,appendImportedQuotationReview,renderCitationSummary,validateCitationReview} from '../public/assets/citation-review.js';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const data=CITATION_REVIEW.importedReviews,counts=JSON.parse(read('public/data/verse-counts.json'));
const importedShard=book=>JSON.parse(read('public/data/refs/'+book.abbr.toLowerCase()+'.json'));
class Element{constructor(tag){this.tagName=tag;this.children=[];this.textContent='';}append(...nodes){this.children.push(...nodes);}replaceChildren(...nodes){this.children=[...nodes];}}
const all=e=>[e,...e.children.flatMap(all)];

test('fourteen first-pass quotation classifications exist as distinct imported Atlas pairs, not existing explanations',()=>{
 assert.equal(data.entries.length,14);
 assert.equal(data.reviewedOn,'2026-11-18');
 assert.equal(validateCitationReview(CITATION_REVIEW,counts),true);
 assert.equal(CONNECTION_EVIDENCE.length,161);
 const ids=new Set(),pairs=new Set();
 for(const review of data.entries){
  const from=parseRef(review.from),to=parseRef(review.to);
  assert.ok(from?.verse&&to?.verse,review.id);
  assert.equal(from.book.testament,'Old Testament');
  assert.equal(to.book.testament,'New Testament');
  const key=[from.formatted,to.formatted].sort().join('|');
  assert.ok(!pairs.has(key),review.id);pairs.add(key);
  assert.ok(!ids.has(review.id),review.id);ids.add(review.id);
  assert.equal(explainConnection(review.from,review.to),null);
  assert.equal(importedQuotationReview(review.from,review.to)?.id,review.id);
  assert.equal(importedQuotationReview(review.to,review.from)?.id,review.id);
  assert.ok(IMPORTED_QUOTATION_KINDS[review.kind]);
  const item=importedShard(from.book)[from.chapter+':'+from.verse]||[];
  assert.ok(item.some(row=>Array.isArray(row)&&row[0]===to.book.index&&row[1]===to.chapter&&row[2]===to.verse),'not in imported archive: '+key);
  assert.equal(review.sources.length,2);
  for(const source of review.sources){assert.equal(source.publisher,'USCCB');assert.equal(new URL(source.url).hostname,'bible.usccb.org');assert.ok(source.locator);}
  assert.ok(review.summary.length>60&&review.limitation.length>60,review.id);
 }
 assert.match(data.method,/First-pass/);
 assert.match(CITATION_REVIEW.deferred[0],/301,378 remain without either level/);
});

test('curated quotations preserve composite, Greek-version and versification distinctions',()=>{
 const byId=Object.fromEntries(data.entries.map(r=>[r.id,r]));
 assert.deepEqual([byId.xr002.kind,byId.xr003.kind],['composite-quotation','composite-quotation']);
 assert.match(byId.xr004.limitation,/Moses' original quotation/);
 assert.match(byId.xr011.limitation,/Hebrew wording/);
 assert.match(byId.xr012.limitation,/45:7/);
 assert.match(byId.xr013.limitation,/102:26/);
 assert.match(byId.xr001.sources[0].locator,/2:25 in NABRE/);
});

test('invalid source classifications and duplicate pairs fail the research gate',()=>{
 const scenarios=[
  d=>{d.importedReviews.entries.push({...d.importedReviews.entries[0],id:'xr900'});},
  d=>{d.importedReviews.entries[0].id='xr002';},
  d=>{d.importedReviews.entries[0].kind='automatic-confidence';},
  d=>{d.importedReviews.entries[0].from='Hosea 2:999';},
  d=>{d.importedReviews.entries[0].sources[0].url='javascript:alert(1)';},
  d=>{d.importedReviews.entries[0].reviewedOn='2099-01-01';},
  d=>{d.importedReviews.entries[0].sources[1].locator='';}
 ];
 for(const mutate of scenarios){const clone=structuredClone(CITATION_REVIEW);mutate(clone);assert.throws(()=>validateCitationReview(clone,counts));}
});

test('About and Atlas source disclosures show classification scope and linked primary passages',t=>{
 const prior=globalThis.document;globalThis.document={createElement:tag=>new Element(tag)};
 t.after(()=>{if(prior===undefined)delete globalThis.document;else globalThis.document=prior;});
 const root=new Element('div');assert.equal(appendImportedQuotationReview(root,'Psalms 104:4','Hebrews 1:7'),true);
 assert.equal(root.children.length,1);
 assert.ok(all(root).some(e=>e.textContent.includes('Greek-version-dependent quotation')));
 const links=all(root).filter(e=>e.tagName==='a');assert.equal(links.length,2);
 assert.ok(links.every(e=>e.rel==='noopener noreferrer'));
 assert.equal(appendImportedQuotationReview(new Element('div'),'Genesis 1:1','Revelation 1:1'),false);
 const about=new Element('div');renderCitationSummary(about);
 assert.ok(all(about).some(e=>e.textContent.includes('Imported Scripture quotation reviews (14)')));
 assert.ok(all(about).some(e=>e.textContent.includes('14 additional imported Atlas pairs')));
 assert.ok(all(about).some(e=>e.textContent.includes('301,378 remain')));
});
