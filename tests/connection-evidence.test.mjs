import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CONNECTION_EVIDENCE,CONNECTION_KINDS,explainConnection,connectionsForPassages,validateConnectionEvidence} from '../public/assets/connection-evidence.js';
import {EDITORIAL_LINKS} from '../public/assets/studies.js';
const read=n=>readFileSync(new URL('../'+n,import.meta.url),'utf8');
const json=n=>JSON.parse(read('public/data/'+n));
const counts=json('verse-counts.json'),history=json('biblical-history.json'),expanded=json('biblical-people-expanded.json');
test('115 editorial passage comparisons are explicit, source-cited and uniquely addressed',()=>{
 assert.equal(CONNECTION_EVIDENCE.length,115);
 assert.equal(validateConnectionEvidence(counts),true);
 assert.deepEqual(new Set(CONNECTION_EVIDENCE.map(e=>e.kind)),new Set(['quotation','parallel','echo','typology','theme']));
 assert.equal(Object.keys(CONNECTION_KINDS).length,5);
 const keys=new Set(CONNECTION_EVIDENCE.map(e=>[e.from,e.to].sort().join('|')));
 assert.equal(keys.size,CONNECTION_EVIDENCE.length);
 assert.equal(CONNECTION_EVIDENCE.filter(e=>e.review==='scripture-context-screened').length,24);
 assert.equal(CONNECTION_EVIDENCE.filter(e=>e.review==='editorial-reading-aid').length,91);
 assert.ok(CONNECTION_EVIDENCE.every(e=>/pending/i.test(e.basis)));
});
test('quotation, parallel, echo and typology are bounded by explicit Scripture pairs',()=>{
 for(const [from,to,kind] of [
  ['Genesis 15:6','Romans 4:3','quotation'],
  ['Jeremiah 31:31','Hebrews 8:8','quotation'],
  ['2 Kings 18:13','Isaiah 36:1','parallel'],
  ['1 Kings 8:1','2 Chronicles 5:2','parallel'],
  ['2 Samuel 7:12','Luke 1:32','echo'],
  ['Exodus 12:13','1 Corinthians 5:7','typology']]){
  assert.equal(explainConnection(from,to)?.kind,kind);
  assert.equal(explainConnection(to,from)?.kind,kind);
  assert.ok(explainConnection(from,to).caution.length>25);
 }
 assert.equal(explainConnection('Genesis 1:1','Genesis 1:2'),null);
 assert.equal(explainConnection('Genesis 1:2','Revelation 21:1'),null);
});
test('special editorial explanations never imply every existing cross-reference is classified',()=>{
 assert.ok(CONNECTION_EVIDENCE.length>EDITORIAL_LINKS.length);
 assert.ok(EDITORIAL_LINKS.every(link=>explainConnection(link.from,link.to)));
 const atlas=read('public/assets/app.js');
 assert.match(atlas,/link\.evidence/);
 assert.match(atlas,/OpenBible suggestion - unclassified/);
 assert.match(atlas,/OpenBible\.info community-ranked link; connection type not independently verified/);
 assert.match(atlas,/source:'passage-evidence'/);
 assert.match(atlas,/graphEvidenceFilter/);
 assert.match(atlas,/Read context:/);
 const html=read('public/index.html');
 assert.match(html,/id="graph-evidence-filter"/);
 assert.match(html,/Passage-explained only/);
 assert.match(html,/Without an explanation/);
 assert.match(html,/Editorial passage checks are not independent scholarly review/);
});
test('People Index links source passages to routes without inventing biographical appearances',()=>{
 const hezekiah=history.people.find(p=>p.id==='hezekiah');
 const david=history.people.find(p=>p.id==='david-king');
 const solomon=history.people.find(p=>p.id==='solomon-king');
 const paul=expanded.people.find(p=>p.id==='paul-apostle');
 const moses=history.people.find(p=>p.id==='moses');
 for(const [name,person,expected] of [
  ['Hezekiah',hezekiah,'2 Kings 18:13'],
  ['David',david,'2 Samuel 7:12'],
  ['Solomon',solomon,'1 Kings 8:1'],
  ['Paul',paul,'Acts 9:3'],
  ['Moses',moses,'Exodus 3:2']]){
  assert.ok(person,name);
  assert.ok(connectionsForPassages(person.passages,counts).some(e=>e.from===expected||e.to===expected),name);
 }
 assert.deepEqual(connectionsForPassages(['Genesis 50:1-3'],counts),[]);
 const index=read('public/assets/entity-index.js');
 assert.match(index,/Related Atlas connections/);
 assert.match(index,/connectionsForPassages\(record.passages,counts,8\)/);
 assert.match(index,/They do not prove the person appears in both texts/);
});
test('broken or invented source data fails closed',()=>{
 const old=CONNECTION_EVIDENCE[0].from;
 assert.ok(old);
 assert.equal(explainConnection('Isaiah 36:1','2 Kings 18:13')?.kind,'parallel');
 assert.ok(connectionsForPassages([],counts).length===0);
 assert.ok(connectionsForPassages(['Fake Book 500:1'],counts).length===0);
});
test('release consistency covers versioned Atlas annotations',()=>{
 const pkg=JSON.parse(read('package.json'));
 const version=pkg.version;
 const release=read('scripts/release.mjs'),check=read('scripts/check-release.mjs'),app=read('public/assets/app.js'),index=read('public/assets/entity-index.js');
 assert.match(release,/Atlas evidence module/);
 assert.match(release,/index evidence import/);
 assert.match(check,/Atlas evidence modules must match website release version/);
 assert.ok(app.includes('connection-evidence.js?v='+version));
 assert.ok(index.includes('connection-evidence.js?v='+version));
});
