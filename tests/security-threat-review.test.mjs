import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {onRequestGet as searchESV} from '../functions/api/search.js';
import {fumsViewUrl,reportScriptureView} from '../public/assets/fums.js';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('FUMS makes private-referrer GET pixels without executing third-party scripts',()=>{
 const oldImage=globalThis.Image,oldWindow=globalThis.window,oldFetch=globalThis.fetch;
 const stored=new Map(),session=new Map(),pixels=[],networkFetches=[];
 globalThis.window={
  localStorage:{getItem:k=>stored.get(k)??null,setItem:(k,v)=>stored.set(k,v)},
  sessionStorage:{getItem:k=>session.get(k)??null,setItem:(k,v)=>session.set(k,v)}
 };
 globalThis.fetch=(...args)=>{networkFetches.push(args);throw new Error('FUMS must not make a browser fetch');};
 globalThis.Image=class{
  constructor(width,height){assert.equal(width,1);assert.equal(height,1);pixels.push(this);}
  set src(url){this.request=new URL(url);this.onload?.();}
 };
 try{
  assert.equal(reportScriptureView(null),false);
  assert.equal(reportScriptureView({token:'invalid&uId=secret'}),false);
  for(let i=0;i<2;i++)assert.equal(reportScriptureView({token:'TEST_FUMS_USAGE_TOKEN_1234'}),true);
  assert.equal(pixels.length,2);
  assert.equal(networkFetches.length,0);
  for(const p of pixels){
   assert.equal(p.request.origin,'https://fums.api.bible');
   assert.equal(p.request.pathname,'/f3');
   assert.equal(p.request.searchParams.get('t'),'TEST_FUMS_USAGE_TOKEN_1234');
   assert.equal(p.referrerPolicy,'no-referrer');
   assert.deepEqual([...p.request.searchParams.keys()].sort(),['cb','dId','sId','t']);
   assert.match(p.request.searchParams.get('cb'),/^[0-9a-f-]{36}$/i);
   assert.ok(!p.request.href.includes('John')&&!p.request.href.includes('notes'));
  }
  assert.equal(pixels[0].request.searchParams.get('dId'),pixels[1].request.searchParams.get('dId'));
  assert.equal(pixels[0].request.searchParams.get('sId'),pixels[1].request.searchParams.get('sId'));
  assert.notEqual(pixels[0].request.searchParams.get('dId'),pixels[0].request.searchParams.get('sId'));
  assert.notEqual(pixels[0].request.searchParams.get('cb'),pixels[1].request.searchParams.get('cb'));
  assert.equal(stored.size,1);
  assert.equal(session.size,1);
 }finally{
  if(oldImage===undefined)delete globalThis.Image;else globalThis.Image=oldImage;
  globalThis.fetch=oldFetch;globalThis.window=oldWindow;
 }
});
test('invalid FUMS identifiers and tokens cannot create tracking requests',async()=>{
 assert.equal(fumsViewUrl('bad&uId=private','00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000002'),null);
 assert.equal(fumsViewUrl('','00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000002'),null);
 assert.equal(fumsViewUrl('TEST_FUMS_USAGE_TOKEN_1234','invalid','00000000-0000-4000-8000-000000000002'),null);
});
test('search proxy blocks secret-bearing redirects and checks upstream timeout',async()=>{
 const old=globalThis.fetch;let count=0;
 globalThis.fetch=async(url,options)=>{
  count++;assert.equal(new URL(url).origin,'https://api.esv.org');
  assert.equal(options.redirect,'manual');
  assert.ok(options.signal instanceof AbortSignal);
  assert.equal(options.headers.Authorization,'Token PRIVATE_SERVER_ONLY');
  return new Response(null,{status:302,headers:{Location:'https://untrusted.example/'}});
 };
 try{
  const result=await searchESV({request:new Request('https://site.test/api/search?q=faith'),env:{ESV_API_KEY:'PRIVATE_SERVER_ONLY'}});
  assert.equal(result.status,502);
  assert.ok(!(await result.text()).includes('PRIVATE_SERVER_ONLY'));
  assert.equal(count,1);
 }finally{globalThis.fetch=old;}
});
test('search proxy validates bounded upstream payload and avoids raw provider errors',async()=>{
 const old=globalThis.fetch;
 const request=new Request('https://site.test/api/search?q=faith');
 try{
  for(const response of [
   new Response('{invalid',{status:200}),
   new Response('x'.repeat(256*1024+1),{status:200}),
   Response.json({results:{}}),
   Response.json({results:[{reference:'John 1:1',content:12}]}),
   new Response('private publisher response',{status:503}),
   new Response('private rate limit response',{status:429})
  ]){
   globalThis.fetch=async()=>response;
   const result=await searchESV({request,env:{ESV_API_KEY:'PRIVATE_SERVER_ONLY'}});
   assert.ok([429,502].includes(result.status));
   assert.ok(!(await result.text()).includes('PRIVATE_SERVER_ONLY'));
  }
  globalThis.fetch=async()=>Response.json({total_results:1,results:[{reference:'John 3:16',content:'Synthetic search fixture'}]});
  const ok=await searchESV({request,env:{ESV_API_KEY:'PRIVATE_SERVER_ONLY'}});
  assert.equal(ok.status,200);
  assert.deepEqual((await ok.json()).results,[{reference:'John 3:16',content:'Synthetic search fixture'}]);
 }finally{globalThis.fetch=old;}
});
test('CSP blocks executable FUMS scripts, disallows inline scripts and unsafe referrers',()=>{
 const headers=read('public/_headers');
 assert.match(headers,/Referrer-Policy: no-referrer/);
 assert.match(headers,/Content-Security-Policy: default-src 'self'; script-src 'self' https:\/\/www\.googletagmanager\.com;/);
 assert.match(headers,/frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'/);
 assert.ok(!/script-src[^\n]*unsafe-inline/.test(headers));
 assert.ok(!/script-src[^\n]*pkg\.api\.bible/.test(headers));
 assert.ok(!/script-src[^\n]*cdn\.scripture\.api\.bible/.test(headers));
 assert.match(headers,/connect-src[^\n]*https:\/\/fums\.api\.bible/);
 assert.match(headers,/img-src[^\n]*https:\/\/fums\.api\.bible/);
 assert.match(read('functions/api/_api-bible.js'),/'fums-version':'3'/);
 const scripts=read('public/assets/fums.js');
 assert.ok(!scripts.includes('createElement(\'script\')'));
 const analytics=read('public/assets/analytics.js');
 assert.match(analytics,/if \(!isProductionHost\(win\.location\.hostname\)\) return false/);
 assert.match(analytics,/if \(choice === 'allow'\) startTracking\(\)/);
});
