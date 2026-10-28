import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CONNECTION_EVIDENCE,REVIEW_LABELS,explainConnection,validateConnectionEvidence} from '../public/assets/connection-evidence.js';
import {PERSON_TRAILS,personTrail,validatePersonTrails} from '../public/assets/person-trails.js';
import {createPassageComparison} from '../public/assets/atlas-comparison.js';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const data=n=>JSON.parse(read('public/data/'+n));
const counts=data('verse-counts.json'),history=data('biblical-history.json'),people=data('biblical-people.json'),extra=data('biblical-people-expanded.json');
test('115 comparisons maintain distinct review status, full citations and nonduplicated pairs',()=>{
 assert.equal(CONNECTION_EVIDENCE.length,115);
 assert.equal(validateConnectionEvidence(counts),true);
 assert.equal(CONNECTION_EVIDENCE.filter(x=>x.review==='scripture-context-screened').length,60);
 assert.equal(CONNECTION_EVIDENCE.filter(x=>x.review==='editorial-reading-aid').length,55);
 assert.match(REVIEW_LABELS['scripture-context-screened'],/not external peer review/);
 assert.match(REVIEW_LABELS['editorial-reading-aid'],/pending/);
 assert.ok(CONNECTION_EVIDENCE.every(x=>x.explanation.length>20&&x.caution.length>15&&x.context&&x.basis));
 const keys=CONNECTION_EVIDENCE.map(x=>[x.from,x.to].sort().join('|'));
 assert.equal(new Set(keys).size,115);
});
test('cross-account parallels expose distinct readings, not archaeological proof or harmonised chronology',()=>{
 for(const [a,b,review='editorial-reading-aid'] of [
  ['2 Kings 25:1','Jeremiah 52:4'],['2 Kings 19:35','Isaiah 37:36'],
  ['1 Kings 10:1','2 Chronicles 9:1','scripture-context-screened'],['2 Samuel 24:1','1 Chronicles 21:1'],
  ['Matthew 8:23','Mark 4:35'],['Luke 24:1','John 20:1'],
  ['Acts 9:3','Acts 26:13']]){
  const x=explainConnection(a,b);
  assert.ok(x, a+' versus '+b);
  assert.equal(x.kind,'parallel');
  assert.equal(x.review,review);
  assert.ok(x.caution.length>30);
 }
 assert.match(explainConnection('2 Samuel 24:1','1 Chronicles 21:1').caution,/Attribution/);
 assert.equal(explainConnection('Matthew 3:14','Mark 1:9'),null);
});
test('twenty curated people have qualified trails while the original eight retain their stages',()=>{
 const ids=new Set([...history.people,...people.people,...extra.people].map(x=>x.id));
 assert.equal(validatePersonTrails(counts,ids),true);
 assert.equal(PERSON_TRAILS.length,20);
 for(const id of ['abraham','moses','david-king','solomon-king','hezekiah','esther','paul-apostle','jesus']){
  const trail=personTrail(id);assert.ok(trail,id);assert.equal(trail.stages.length,5,id);
  assert.match(trail.qualification,/not a full biography/);
 }
 assert.equal(personTrail('not-a-person'),null);
});
class El{
 constructor(){this.children=[];this.listeners={};this.hidden=false;this.value='';this.textContent='';this.className='';}
 replaceChildren(...xs){this.children=xs;}
 append(...xs){this.children.push(...xs);}
 addEventListener(type,fn){(this.listeners[type]??=[]).push(fn);}
 dispatch(type){for(const f of this.listeners[type]||[])f();}
 scrollIntoView(){this.scrolled=true;}
}
function setup(){
 const ids=['edition','close','retry','swap','left-title','right-title','left-open','right-open','explanation','provenance','context','left-passage','right-passage','left-status','right-status','left-copyright','right-copyright'];
 const controls=new Map(ids.map(x=>[x,new El()]));
 const root=new El();root.hidden=true;
 root.querySelector=selector=>controls.get(selector.match(/data-compare="([^"]+)"/)?.[1]);
 return {root,controls};
}
test('side-by-side reader requests both passages from existing licensed server route',async()=>{
 const old={document:globalThis.document,fetch:globalThis.fetch};
 const {root,controls}=setup(),requested=[],views=[],opened=[];
 try{
  globalThis.document={createElement:()=>new El()};
  globalThis.fetch=async (url,opts)=>{requested.push({url,opts});return {ok:true,json:async()=>({passages:['<p>licensed passage</p>'],copyright:'Publisher terms',fums:{token:'provider-test-token'}})};};
  const ui=createPassageComparison(root,{sanitize:s=>{const e=new El();e.textContent=s;return e;},getEdition:()=> 'NIV',onViewed:x=>views.push(x),onRead:x=>opened.push(x)});
  assert.equal(ui.open('Genesis 15:6','Romans 4:3',explainConnection('Genesis 15:6','Romans 4:3')),true);
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(root.hidden,false);
  assert.equal(controls.get('edition').value,'NIV');
  assert.equal(requested.length,2);
  assert.ok(requested.every(x=>x.url.startsWith('/api/passage?')&&x.url.includes('translation=NIV')&&x.opts.cache==='no-store'));
  assert.equal(views.length,2);
  assert.equal(controls.get('left-passage').children.length,1);
  assert.equal(controls.get('right-passage').children.length,1);
  assert.match(controls.get('provenance').textContent,/No independent specialist certification/);
  controls.get('left-open').dispatch('click');
  assert.deepEqual(opened,['Genesis 15:6']);
  controls.get('edition').value='ESV';controls.get('edition').dispatch('change');
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(requested.length,4);
  assert.ok(requested.slice(2).every(x=>x.url.includes('translation=ESV')));
  controls.get('close').dispatch('click');
  assert.equal(root.hidden,true);
 }finally{
  for(const [k,v] of Object.entries(old)){if(v===undefined)delete globalThis[k];else globalThis[k]=v;}
 }
});
test('comparison refuses malformed or chapter-only references before requesting Bible text',()=>{
 const old=globalThis.document,{root}=setup();
 try{
  globalThis.document={createElement:()=>new El()};
  const ui=createPassageComparison(root,{sanitize:()=>new El()});
  assert.equal(ui.open('Genesis 99:1','Romans 4:3'),false);
  assert.equal(ui.open('Genesis 15','Romans 4:3'),false);
  assert.equal(root.hidden,true);
 }finally{if(old===undefined)delete globalThis.document;else globalThis.document=old;}
});
test('Atlas, people routes and licensing UI have functioning integration entry points',()=>{
 const app=read('public/assets/app.js'),index=read('public/assets/entity-index.js'),html=read('public/index.html'),comparison=read('public/assets/atlas-comparison.js');
 assert.match(app,/createPassageComparison/);
 assert.match(app,/comparePassages\(e.from,e.to,e\)/);
 assert.match(app,/onCompare:/);
 assert.match(index,/personTrail\(record.id\)/);
 assert.match(index,/Follow this person's Scripture trail/);
 assert.match(index,/Compare side by side/);
 assert.match(html,/id="atlas-compare"/);
 assert.match(html,/data-compare="left-passage"/);
 assert.match(html,/data-compare="right-passage"/);
 assert.match(comparison,/handlers.sanitize\(html\)/);
 assert.match(comparison,/handlers.onViewed/);
 assert.match(comparison,/result.copyright/);
 assert.ok(!comparison.includes('innerHTML='));
});
test('dependency cache keys are checked for the new comparison, person trails, and expanded evidence',()=>{
 const pkg=JSON.parse(read('package.json')),v=pkg.version,app=read('public/assets/app.js'),index=read('public/assets/entity-index.js'),evidence=read('public/assets/connection-evidence.js');
 assert.ok(app.includes('atlas-comparison.js?v='+v));
 assert.ok(index.includes('person-trails.js?v='+v));
 assert.ok(evidence.includes('connection-evidence-expanded.js?v='+v));
 assert.match(read('scripts/check-release.mjs'),/Comparison and person trails must match release version/);
 assert.match(read('scripts/release.mjs'),/expanded evidence/);
});
