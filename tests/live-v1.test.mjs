import test from 'node:test';
import assert from 'node:assert/strict';
import {checkLiveV1} from '../scripts/check-live-v1.mjs';

function mockFetcher(version='0.44.10',overrides={}){
 const records=[];
 const page='<html><span id="site-version">v'+version+'</span><script src="/assets/app.js?v='+version+'"></script>'+
 ['view-reader','view-connections','view-journeys','view-entities','view-city-studies','view-roadmap','view-notebook'].map(x=>'<section id="'+x+'"></section>').join('')+'</html>';
 const routes={
 '/':{text:page},
 '/data/releases.json':{json:{releases:[{version}]}},
 '/data/roadmap.json':{json:{v1Readiness:{target:'1.0.0',gates:[4,4,3,3,3].map(n=>({criteria:Array.from({length:n},(_,i)=>({id:'id-'+n+'-'+i,status:'open'}))}))}}},
 '/assets/app.js':{text:'import {APP} from "./books.js?v='+version+'";'}
 };
 return {records,fetcher:async(url,opts)=>{
  records.push({url:String(url),redirect:opts.redirect});
  const u=new URL(url),item=overrides[u.pathname]??routes[u.pathname];
  if(!item)return {ok:false,status:404};
  return {ok:item.status?item.status===200:true,status:item.status||200,text:async()=>item.text||'',json:async()=>item.json||{}};
 }};
}

test('public v1 release smoke checks exact footer, release history, module and all flagship view anchors',async()=>{
 const {fetcher,records}=mockFetcher();
 const result=await checkLiveV1({origin:'https://www.scripturetrails.com',expectedVersion:'0.44.10',fetcher});
 assert.equal(result.version,'0.44.10');
 assert.equal(result.viewsChecked,7);
 assert.equal(result.roadmapGates,5);
 assert.equal(result.criteriaTotal,17);
 assert.equal(result.criteriaOpen,17);
 assert.equal(records.length,4);
 assert.ok(records.every(x=>x.redirect==='error'));
 assert.ok(records.every(x=>x.url.startsWith('https://www.scripturetrails.com/')));
});

test('public v1 smoke fails closed for stale deployments and missing release assets',async()=>{
 for(const [overrides,message] of [
  [{'/':{text:'<html>stale site version</html>'}},/footer version/],
  [{'/data/releases.json':{json:{releases:[{version:'0.44.9'}]}}},/changelog version/],
  [{'/data/roadmap.json':{json:{v1Readiness:{target:'1.0.0',gates:[]}}}},/roadmap readiness/],
  [{'/data/roadmap.json':{json:{v1Readiness:{target:'1.0.0',gates:[{},{},{},{},{}]}}}},/readiness criteria incomplete/],
  [{'/assets/app.js':{text:'no versioned imports'}},/main module/]
 ]){
  const {fetcher}=mockFetcher('0.44.10',overrides);
  await assert.rejects(checkLiveV1({origin:'https://www.scripturetrails.com',expectedVersion:'0.44.10',fetcher}),message);
 }
 await assert.rejects(checkLiveV1({origin:'http://example.com',expectedVersion:'0.44.10',fetcher:mockFetcher().fetcher}),/HTTPS/);
 await assert.rejects(checkLiveV1({expectedVersion:'main',fetcher:mockFetcher().fetcher}),/semantic/);
});
