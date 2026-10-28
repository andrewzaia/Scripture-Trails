import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHebrewGeography} from '../public/assets/hebrew-geography.js';
const read=path=>JSON.parse(readFileSync(new URL('../public/data/'+path,import.meta.url),'utf8'));
const data=read('hebrew-geography.json'),counts=read('verse-counts.json');

// A minimal DOM surface for exercising the controller's user actions and async lifecycle.
class Node {
 constructor(tag='div'){this.tagName=tag;this.children=[];this.dataset={};this.attributes={};this.events={};this.value='';this.textContent='';this.hidden=false;this.disabled=false;}
 append(...nodes){this.children.push(...nodes);}
 replaceChildren(...nodes){this.children=[...nodes];}
 setAttribute(name,value){this.attributes[name]=value;}
 getAttribute(name){return this.attributes[name]??null;}
 addEventListener(name,fn){this.events[name]=fn;}
 click(){if(!this.disabled){this.events.click?.();this.onclick?.();}}
 focus(){this.focused=true;}
 scrollIntoView(){}
 querySelectorAll(selector){return this.children.flatMap(n=>n instanceof Node?[...(selector==='button'&&n.tagName==='button'?[n]:[]),...n.querySelectorAll(selector)]:[]);}
 querySelector(selector){if(selector==='summary')return this.children.find(n=>n.tagName==='summary');const match=selector.match(/^\[data-hb-comparison="(.+)"\]$/);return match?this.children.find(n=>n.dataset.hbComparison===match[1]):null;}
}
function environment(t,url='https://example.test/?view=hebrew-geography',fetcher=null){
 const names=['search','phase','list','result-count','phases','detail','stage-label','heading','summary','place-name','place-status','place-note','caution','passages','location-sources','primary-check','related','related-index','stage-comparisons','previous','next','comparisons','sources','scope','method','review','geography','chronology','clear','reading-total','setting-total','comparison-total','loading'];
 const elements=Object.fromEntries(names.map(n=>[n,new Node()]));
 const root=new Node();root.querySelector=selector=>elements[selector.match(/data-hb="(.+)"/)[1]];
 const saved={};for(const key of ['document','window','location','history','fetch'])saved[key]=Object.getOwnPropertyDescriptor(globalThis,key);
 const writes=[];
 Object.defineProperties(globalThis,{
  document:{configurable:true,value:{createElement:tag=>new Node(tag)}},
  window:{configurable:true,value:{matchMedia:()=>({matches:false})}},
  location:{configurable:true,value:{href:url,search:new URL(url).search}},
  history:{configurable:true,value:{state:null,replaceState(state,unused,next){writes.push(next.toString());location.href=next.toString();location.search=next.search;}}},
  fetch:{configurable:true,writable:true,value:fetcher|| (async url=>({ok:true,json:async()=>url.includes('verse-counts')?counts:data}))}
 });
 t.after(()=>{for(const key of Object.keys(saved)){if(saved[key])Object.defineProperty(globalThis,key,saved[key]);else delete globalThis[key];}});
 return {root,elements,writes};
}

test('controller loads a shared stage, filters readings and calls the licensed-reader, Atlas and index handlers',async t=>{
 const {root,elements:e,writes}=environment(t,'https://example.test/?view=hebrew-geography&hb-phase=departure&hb-stage=exodus-10');
 const calls=[];const page=createHebrewGeography(root,{onRead:r=>calls.push(['read',r]),onAtlas:r=>calls.push(['atlas',r]),onEntity:(type,id)=>calls.push([type,id]),onIndex:r=>calls.push(['index',r])});
 await page.activate();assert.equal(root.dataset.ready,'true');assert.equal(e.heading.textContent,'Deliverance through the sea');assert.equal(e.list.children.length,4);assert.equal(e['reading-total'].textContent,'25');
 const row=e.passages.children[0];row.children[1].click();row.children[2].click();e.related.children[0].click();e['related-index'].onclick();
 assert.deepEqual(calls,[['read','Exodus 14:15-31'],['atlas','Exodus 14:15'],['person','moses'],['index','Exodus 14:15-31']]);
 e.phase.value='moab';e.phase.events.change();assert.equal(e.list.children.length,2);assert.equal(e.heading.textContent,'The camp in the plains of Moab');
 e.next.click();assert.equal(e.heading.textContent,'Moses sees the land from Nebo');assert.equal(e.next.disabled,true);e.previous.click();assert.equal(e.previous.disabled,true);
 e.search.value='no result';e.search.events.input();assert.equal(e.detail.hidden,true);assert.match(e['result-count'].textContent,/0 of 25/);
 e.clear.click();assert.equal(e.list.children.length,25);assert.equal(e.detail.hidden,false);assert.equal(e.search.value,'');assert.ok(writes.every(u=>u.startsWith('https://example.test/')));
});
test('background collection completion cannot rewrite the URL after the user leaves the page',async t=>{
 let release;const blocked=new Promise(resolve=>{release=resolve;});
 const {root,writes}=environment(t,'https://example.test/?view=hebrew-geography',async url=>{await blocked;return {ok:true,json:async()=>url.includes('verse-counts')?counts:data};});
 const page=createHebrewGeography(root),pending=page.activate();page.suspend();location.href='https://example.test/?view=reader&ref=John+3%3A16';location.search=new URL(location.href).search;release();await pending;
 assert.equal(writes.length,0);assert.match(location.href,/view=reader/);
 await page.activate(new URLSearchParams('hb-phase=moab&hb-stage=exodus-25'));assert.equal(writes.length,1);assert.match(writes[0],/hb-stage=exodus-25/);
});
test('failed source loading exposes a retry and a successful retry completes the collection',async t=>{
 let fail=true;const {root,elements:e}=environment(t,'https://example.test/?view=hebrew-geography',async url=>({ok:!fail,json:async()=>url.includes('verse-counts')?counts:data}));
 const page=createHebrewGeography(root);await page.activate();assert.notEqual(root.dataset.ready,'true');assert.equal(e.loading.children.at(-1).textContent,'Retry');
 fail=false;e.loading.children.at(-1).click();await page.activate();assert.equal(root.dataset.ready,'true');assert.equal(e.loading.hidden,true);
});
