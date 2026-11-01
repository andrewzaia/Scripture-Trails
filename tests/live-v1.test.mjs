import test from 'node:test';
import assert from 'node:assert/strict';
import {checkLiveV1} from '../scripts/check-live-v1.mjs';

function readiness({accepted=false,signoff='open'}={}){
 const sizes=[4,3,3,3,4];
 const gateIds=['evidence','content','accessibility','privacy','release'];
 const gates=sizes.map((n,g)=>({
  id:gateIds[g],title:'Gate '+g,summary:'Evidence '+g,next:'Follow up '+g,
  criteria:Array.from({length:n},(_,i)=>({
   id:g===4&&i===3?'launch-signoff':g===2&&i===1?'screen-readers':g===2&&i===2?'cross-browser-zoom':'criterion-'+g+'-'+i,
   title:'Criterion '+g+'.'+i,acceptance:'Test acceptance',evidence:'sources/operations/example.md',
   status:g===4&&i===3?signoff:accepted&&g===2&&i>0?'accepted-risk':'met',
   mode:g===4&&i===3?'manual':accepted&&g===2&&i>0?'manual':'automated',
   ...(g===4&&i===3&&signoff==='met'?{reviewedOn:'2026-11-02',reviewer:'Project owner - actual go decision'}:{}),
   ...(accepted&&g===2&&i>0?{risk:'Untested physical device',reviewedOn:'2026-11-02',reviewer:'Project owner'}:{})
  }))
 }));
 return {
  target:'1.0.0',baseline:'0.32.0',updated:'2026-11-02',note:'Qualified v1 release readiness',
  stages:Array.from({length:5},(_,i)=>({id:'stage-'+i,title:'Stage '+i,goal:'Evaluate '+i})),
  gates
 };
}

function mockFetcher(version='0.44.24',opts={},overrides={}){
 const records=[];
 const page='<html><span id="site-version">v'+version+'</span><script src="/assets/app.js?v='+version+'"></script>'+
 ['view-reader','view-connections','view-journeys','view-entities','view-city-studies','view-roadmap','view-notebook'].map(x=>'<section id="'+x+'"></section>').join('')+'</html>';
 const routes={
  '/':{text:page},
  '/data/releases.json':{json:{releases:[{version}]}},
  '/data/roadmap.json':{json:{v1Readiness:readiness(opts)}},
  '/assets/app.js':{text:'import {APP} from "./books.js?v='+version+'";'}
 };
 return {records,fetcher:async(url,options)=>{
  records.push({url:String(url),redirect:options.redirect});
  const u=new URL(url),item=overrides[u.pathname]??routes[u.pathname];
  if(!item)return {ok:false,status:404};
  return {ok:item.status?item.status===200:true,status:item.status||200,text:async()=>item.text||'',json:async()=>item.json||{}};
 }};
}
function mutateRoadmap(version,params,edit){
 const d=readiness(params);edit(d);
 return {'/data/roadmap.json':{json:{v1Readiness:d}}};
}

test('v1 smoke permits documented risk acceptance on a pre-v1 published candidate',async()=>{
 const {fetcher,records}=mockFetcher('0.44.24',{accepted:true});
 const result=await checkLiveV1({origin:'https://www.scripturetrails.com',expectedVersion:'0.44.24',fetcher});
 assert.deepEqual([result.criteriaMet,result.criteriaAcceptedRisk,result.criteriaOpen],[14,2,1]);
 assert.equal(result.launchSignoff,'open');
 assert.equal(result.viewsChecked,7);
 assert.equal(result.roadmapGates,5);
 assert.equal(result.criteriaTotal,17);
 assert.equal(records.length,4);
 assert.ok(records.every(x=>x.redirect==='error'));
 assert.ok(records.every(x=>x.url.startsWith('https://www.scripturetrails.com/')));
});

test('v1.0 live smoke requires actual owner launch approval and no open criteria',async()=>{
 const blocked=mockFetcher('1.0.0',{accepted:true,signoff:'open'});
 await assert.rejects(checkLiveV1({expectedVersion:'1.0.0',fetcher:blocked.fetcher}),/explicit met launch-signoff/);
 const approved=mockFetcher('1.0.0',{accepted:true,signoff:'met'});
 const result=await checkLiveV1({expectedVersion:'1.0.0',fetcher:approved.fetcher});
 assert.deepEqual([result.criteriaMet,result.criteriaAcceptedRisk,result.criteriaOpen],[15,2,0]);
 assert.equal(result.launchSignoff,'met');
});

test('v1 smoke fails closed for invalid or unauthorised accepted-risk criteria',async()=>{
 const cases=[
  [d=>{d.gates[2].criteria[1].reviewer='';},/undocumented launch risk acceptance/],
  [d=>{d.gates[2].criteria[1].risk='';},/undocumented launch risk acceptance/],
  [d=>{d.gates[2].criteria[1].mode='automated';},/undocumented launch risk acceptance/],
  [d=>{d.gates[1].criteria[0].status='accepted-risk';},/Unsupported or undocumented launch risk acceptance/],
  [d=>{d.gates[1].criteria[0].status='unknown';},/Invalid readiness criterion/],
  [d=>{d.gates[1].criteria[0].id=d.gates[0].criteria[0].id;},/Invalid readiness criterion/],
  [d=>{d.gates[4].criteria[3].id='launch-approved-without-evidence';},/launch-signoff criterion missing/],
  [d=>{d.gates[4].criteria[3].mode='automated';},/launch-signoff criterion missing or not manual/]
 ];
 for(const [edit,pattern] of cases){
  const mock=mockFetcher('0.44.24',{accepted:true},mutateRoadmap('0.44.24',{accepted:true},edit));
  await assert.rejects(checkLiveV1({expectedVersion:'0.44.24',fetcher:mock.fetcher}),pattern);
 }
});

test('public v1 smoke fails closed for stale deployments and missing release assets',async()=>{
 for(const [overrides,message] of [
  [{'/':{text:'<html>stale site version</html>'}},/footer version/],
  [{'/data/releases.json':{json:{releases:[{version:'0.44.23'}]}}},/changelog version/],
  [{'/data/roadmap.json':{json:{v1Readiness:{target:'1.0.0',gates:[]}}}},/roadmap readiness/],
  [{'/data/roadmap.json':{json:{v1Readiness:{target:'1.0.0',gates:[{},{},{},{},{}]}}}},/readiness criteria invalid/],
  [{'/assets/app.js':{text:'no versioned imports'}},/main module/]
 ]){
  const {fetcher}=mockFetcher('0.44.24',{},overrides);
  await assert.rejects(checkLiveV1({origin:'https://www.scripturetrails.com',expectedVersion:'0.44.24',fetcher}),message);
 }
 await assert.rejects(checkLiveV1({origin:'http://example.com',expectedVersion:'0.44.24',fetcher:mockFetcher().fetcher}),/HTTPS/);
 await assert.rejects(checkLiveV1({expectedVersion:'main',fetcher:mockFetcher().fetcher}),/semantic/);
});
