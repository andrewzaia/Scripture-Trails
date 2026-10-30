import test from 'node:test';
import assert from 'node:assert/strict';
import {onRequestGet as getPassage} from '../functions/api/passage.js';
import {onRequestGet as searchESV} from '../functions/api/search.js';
const req=q=>new Request(`https://example.test/api/passage?q=${encodeURIComponent(q)}`);
test('ESV proxy requires secret and never provides one client-side',async()=>{const res=await getPassage({request:req('John 3:16'),env:{}});assert.equal(res.status,503);assert.equal((await res.json()).code,'not_configured');});
test('ESV passage input cannot request arbitrary or oversized ranges',async()=>{for(const q of ['John 3:1-60','http://evil.example','Genesis 51']){const res=await getPassage({request:req(q),env:{ESV_API_KEY:'example'}});assert.equal(res.status,400,q);}});
test('ESV proxy sends secret only to Crossway and does not return it',async()=>{const original=globalThis.fetch;let url,auth;globalThis.fetch=async(u,options)=>{url=u;auth=options.headers.Authorization;return new Response(JSON.stringify({canonical:'John 3:16',passages:['<p>Sample server response</p>']}),{status:200});};try{const result=await getPassage({request:req('John 3:16'),env:{ESV_API_KEY:'secret-example'}});const body=await result.text();assert.equal(result.status,200);assert.equal(auth,'Token secret-example');assert.ok(url.startsWith('https://api.esv.org/v3/passage/html/?'));assert.ok(!body.includes('secret-example'));assert.equal(result.headers.get('cache-control'),'no-store');}finally{globalThis.fetch=original;}});
test('ESV search requires a key',async()=>{const result=await searchESV({request:req('grace'),env:{}});assert.equal(result.status,503);});

test('ESV proxy requests only the selected verse, selected range, or full chapter',async()=>{
 const original=globalThis.fetch;
 const calls=[];
 globalThis.fetch=async url=>{
  const params=new URL(url).searchParams;
  calls.push({query:params.get('q'),headings:params.get('include-headings')});
  return new Response(JSON.stringify({canonical:params.get('q'),passages:['<p>Mock ESV passage</p>']}),{status:200});
 };
 try{
  for(const ref of ['John 3:16','John 3:16-18','John 3']){
   const res=await getPassage({request:req(ref),env:{ESV_API_KEY:'test-only'}});
   assert.equal(res.status,200,ref);
  }
  assert.deepEqual(calls,[
   {query:'John 3:16',headings:'false'},
   {query:'John 3:16-18',headings:'false'},
   {query:'John 3',headings:'true'}
  ]);
 }finally{globalThis.fetch=original;}
});

test('ESV proxy refuses redirects and does not forward the Crossway key',async()=>{
 const original=globalThis.fetch;let calls=0;
 globalThis.fetch=async(url,options)=>{
  calls++;assert.equal(new URL(url).origin,'https://api.esv.org');
  assert.equal(options.redirect,'manual');assert.ok(options.signal instanceof AbortSignal);
  return new Response(null,{status:302,headers:{Location:'https://untrusted.example/'}});
 };
 try{
  const res=await getPassage({request:req('John 3:16'),env:{ESV_API_KEY:'private-only-key'}});
  assert.equal(res.status,502);assert.equal((await res.json()).code,'upstream_failure');assert.equal(calls,1);
 }finally{globalThis.fetch=original;}
});
test('ESV upstream rejects malformed and oversized responses without leaking credentials',async()=>{
 const original=globalThis.fetch;
 const fixtures=[
  new Response('bad JSON',{status:200}),
  Response.json({canonical:'John 3:16',passages:[]}),
  Response.json({canonical:'John 3:16',passages:['']}),
  new Response('x'.repeat(1024*1024+1),{status:200})
 ];
 try{for(const response of fixtures){
   globalThis.fetch=async()=>response;
   const res=await getPassage({request:req('John 3:16'),env:{ESV_API_KEY:'private-only-key'}});
   const body=await res.text();assert.equal(res.status,502);assert.ok(!body.includes('private-only-key'));assert.equal(JSON.parse(body).code,'upstream_unavailable');
  }
 }finally{globalThis.fetch=original;}
});
test('ESV upstream outages and throttling return bounded actionable errors',async()=>{
 const original=globalThis.fetch;
 try{
  globalThis.fetch=async()=>new Response('Sensitive upstream error',{status:429});
  let r=await getPassage({request:req('John 3:16'),env:{ESV_API_KEY:'private-key'}});
  assert.equal(r.status,429);assert.equal((await r.json()).code,'upstream_failure');
  globalThis.fetch=async()=>{throw new Error('Publisher connection down');};
  r=await getPassage({request:req('John 3:16'),env:{ESV_API_KEY:'private-key'}});
  assert.equal(r.status,502);assert.equal((await r.json()).code,'upstream_unavailable');
 }finally{globalThis.fetch=original;}
});
