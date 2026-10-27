import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildEntityCatalog,findEntities} from '../public/assets/entity-index-data.js';
import {createEntityIndex} from '../public/assets/entity-index.js';
const read=name=>JSON.parse(readFileSync(new URL('../public/data/'+name,import.meta.url),'utf8'));
const gospel=read('biblical-people.json'),journeys=read('jesus-journeys.json'),geography=read('jesus-geography.json'),audit=read('jesus-audit.json'),cities=read('city-studies.json'),counts=read('verse-counts.json'),history=read('biblical-history.json'),expanded=read('biblical-people-expanded.json');
const catalog=buildEntityCatalog(gospel,journeys,geography,audit,cities,counts,history,expanded);
test('expanded biographies preserve all earlier entries and their canonical identifiers',()=>{
 assert.equal(expanded.people.length,105);
 assert.equal(expanded.people.filter(x=>x.corpus==='Hebrew Bible').length,63);
 assert.equal(expanded.people.filter(x=>x.corpus==='Gospels').length,42);
 assert.equal(catalog.count.person,173);
 assert.equal(catalog.count.place,49);
 assert.equal(catalog.count.event,110);
 assert.equal(catalog.records.length,332);
 assert.equal(catalog.byKey.size,332);
 assert.equal(catalog.byKey.get('person:hezekiah').title,'Hezekiah king of Judah');
 assert.equal(catalog.byKey.get('person:david-king').title,'David');
 assert.equal(catalog.byKey.get('person:solomon-king').title,'Solomon');
});
test('prompts and featured choices have source-linked index matches',()=>{
 for(const [query,type,id] of [['Hezekiah','person','hezekiah'],['David','person','david-king'],['Solomon','person','solomon-king'],['Moses','person','moses'],['Paul','person','paul-apostle'],['Esther','person','esther'],['Assyria','place','assyria-empire'],['Babylonia','place','babylonian-empire']]){
  assert.ok(findEntities(catalog,query,type,counts,'all').some(x=>x.id===id),query);
 }
 assert.equal(findEntities(catalog,'Assyria','person',counts,'all').some(x=>x.id==='assyria-empire'),false);
 assert.ok(findEntities(catalog,'2 Kings 18:14','person',counts).some(x=>x.id==='hezekiah'));
});
test('representative names from Genesis, Judges, the monarchy, prophets, Acts and letters have a passage',()=>{
 for(const query of ['Adam','Eve','Noah','Cain','Rebekah','Rahab','Samson','Delilah','Bathsheba','Nathan','Jonathan','Jezebel','Huldah','Haggai','Job','Matthew','Paul','Barnabas','Timothy','Titus','Stephen','Cornelius','Lydia','Priscilla','Apollos','Luke']){
  const hits=findEntities(catalog,query,'person',counts);
  assert.ok(hits.length&&hits.some(x=>x.passages.length),query);
 }
 assert.ok(findEntities(catalog,'Herod','person',counts).length>=3);
 assert.ok(findEntities(catalog,'Joseph','person',counts).length>=3);
});
test('invalid extra profiles fail source verification and duplicate checks',()=>{
 const b=structuredClone(expanded);b.people[0].passages[0]='Genesis 51:10';
 assert.throws(()=>buildEntityCatalog(gospel,journeys,geography,audit,cities,counts,history,b),/Invalid extended person/);
 const d=structuredClone(expanded);d.people[0].id='solomon-king';
 assert.throws(()=>buildEntityCatalog(gospel,journeys,geography,audit,cities,counts,history,d),/Duplicate or invalid/);
 const missing=structuredClone(expanded);missing.people[0].corpus='Not a book';
 assert.throws(()=>buildEntityCatalog(gospel,journeys,geography,audit,cities,counts,history,missing),/Incomplete/);
});
class El{
 constructor(tag='div',dataset={}){this.tagName=tag;this.dataset=dataset;this.children=[];this.listeners={};this.hidden=false;this.value='';this.textContent='';this.className='';this.attrs={};this.classList={toggle(){}};}
 append(...xs){this.children.push(...xs);}
 replaceChildren(...xs){this.children=[...xs];}
 addEventListener(type,fn){(this.listeners[type]??=[]).push(fn);}
 dispatch(type){for(const fn of this.listeners[type]||[])fn();}
 setAttribute(k,v){this.attrs[k]=v;}
 scrollIntoView(){}
}
const makeUI=()=>{
 const map=new Map(['loading','totals','search','period','featured','list','more','result-count','detail'].map(n=>[n,new El(n)]));
 const tabButtons=['all','person','place','event'].map(type=>new El('button',{entityType:type}));
 const root=new El('div',{ready:'false'});
 root.querySelector=selector=>selector==='.entity-detail'?map.get('detail'):map.get(/^\[data-entity="([^"]+)"\]$/.exec(selector)?.[1])||null;
 root.querySelectorAll=selector=>selector==='[data-entity-type]'?tabButtons:[];
 root.closest=()=>({querySelector:root.querySelector});
 const doc={createElement:tag=>new El(tag)};
 return {root,map,tabButtons,doc};
};
const hasTitle=(list,title)=>list.children.some(el=>el.children.some(x=>x.textContent===title));
test('browser-index smoke test: featured records and filter-aware search work',async()=>{
 const old={document:globalThis.document,fetch:globalThis.fetch,location:globalThis.location,history:globalThis.history};
 const {root,map,tabButtons,doc}=makeUI();
 try{
  globalThis.document=doc;globalThis.location={href:'https://www.scripturetrails.com/?view=entities',search:'?view=entities'};
  globalThis.history={pushState(){}};
  globalThis.fetch=async url=>({ok:true,json:async()=>read(/\/data\/([^?]+)/.exec(url)[1])});
  const controller=createEntityIndex(root);
  controller.activate();
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(root.dataset.ready,'true','Data and UI fully loaded');
  assert.match(map.get('totals').textContent,/173 people/);
  assert.equal(map.get('featured').children.length,8);
  map.get('featured').children[0].dispatch('click');
  assert.equal(map.get('detail').children.find(x=>x.tagName==='h2').textContent,'Hezekiah king of Judah');
  map.get('featured').children[6].dispatch('click');
  assert.equal(map.get('detail').children.find(x=>x.tagName==='h2').textContent,'Assyria (imperial polity)');
  map.get('search').value='Solomon';map.get('search').dispatch('input');
  assert.equal(hasTitle(map.get('list'),'Solomon'),false,'A place filter hides people until reset');
  assert.ok(map.get('list').children.some(x=>x.textContent?.includes('outside the current filters')));
  map.get('list').children.find(x=>x.tagName==='button').dispatch('click');
  assert.ok(hasTitle(map.get('list'),'Solomon'));
  map.get('search').value='David';map.get('search').dispatch('input');
  assert.ok(hasTitle(map.get('list'),'David'));
  map.get('search').value='Assyria';map.get('search').dispatch('input');
  assert.ok(hasTitle(map.get('list'),'Assyria (imperial polity)'));
  tabButtons.find(x=>x.dataset.entityType==='person').dispatch('click');
  assert.ok(map.get('list').children.some(x=>x.textContent?.includes('outside the current filters')));
 }finally{
  for(const [k,v] of Object.entries(old)){if(v===undefined)delete globalThis[k];else globalThis[k]=v;}
 }
});
test('asset and release scripts version the complete index dependency chain',()=>{
 const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
 const app=readFileSync(new URL('../public/assets/app.js',import.meta.url),'utf8');
 const index=readFileSync(new URL('../public/assets/entity-index.js',import.meta.url),'utf8');
 const pkg=read('releases.json').releases[0].version; // published release matches current package
 assert.ok(html.includes('entity-index.css?v='+pkg));
 assert.ok(app.includes('entity-index.js?v='+pkg));
 assert.ok(index.includes('entity-index-data.js?v='+pkg));
 assert.ok(index.includes("ENTITY_INDEX_DATA_VERSION='"+pkg+"'"));
 assert.match(index,/biblical-people-expanded\.json/);
 assert.match(html,/data-entity="featured"/);
 assert.match(index,/Retry loading index/);
});
