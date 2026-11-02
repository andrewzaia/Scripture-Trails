import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {onRequestGet,validatedAudioDestination} from '../functions/api/audio.js';

const request=(q,translation='ESV',headers={})=>new Request('https://scripturetrails.test/api/audio?'+new URLSearchParams({q,translation}),{headers});
async function withFetch(fake,fn){const before=globalThis.fetch;globalThis.fetch=fake;try{await fn();}finally{globalThis.fetch=before;}}
const sample='https://audio.esv.org/hw/43011035-43011035.mp3';

test('non-ESV translations, invalid references, forbidden ranges and missing configuration fail before provider requests',async()=>{
 await withFetch(()=>assert.fail('Provider must not be called'),async()=>{
  for(const [q,translation] of [['John 3:16','NIV'],['John 3:16','NASB20'],['John 3:16','NKJV'],['Genesis 51','ESV'],['John 3:1-40','ESV'],['https://evil.test','ESV']]){
   assert.equal((await onRequestGet({request:request(q,translation),env:{ESV_API_KEY:'secret'}})).status,400,q);
  }
  assert.equal((await onRequestGet({request:request('John 3:16','ESV',{Range:'bytes=0-5,8-9'}),env:{ESV_API_KEY:'secret'}})).status,416);
  assert.equal((await onRequestGet({request:request('John 3:16'),env:{}})).status,503);
 });
});

test('official ESV passage audio endpoint is authenticated and only an approved MP3 location reaches the browser',async()=>{
 const calls=[];
 await withFetch(async(url,opts)=>{
  calls.push({url:new URL(url),opts});
  return new Response(null,{status:302,headers:{location:sample}});
 },async()=>{
  for(const q of ['John 11:35','John 3:16-18','John 3']){
   const res=await onRequestGet({request:request(q),env:{ESV_API_KEY:'server-private'}});
   assert.equal(res.status,302,q);
   assert.equal(res.headers.get('location'),sample);
   assert.match(res.headers.get('cache-control'),/no-store/);
   assert.equal(res.headers.get('referrer-policy'),'no-referrer');
  }
 });
 assert.deepEqual(calls.map(c=>c.url.searchParams.get('q')),['John 11:35','John 3:16-18','John 3']);
 assert.ok(calls.every(c=>c.url.origin==='https://api.esv.org'&&c.url.pathname==='/v3/passage/audio/'));
 assert.ok(calls.every(c=>c.opts.headers.Authorization==='Token server-private'&&c.opts.redirect==='manual'));
 assert.equal(calls.length,3,'The Worker must not download the media or forward the token');
});

test('unexpected or malicious publisher redirects never reach the browser',async()=>{
 const invalid=['http://audio.esv.org/hw/43011035-43011035.mp3','https://evil.example/hw/43011035-43011035.mp3','https://user:pass@audio.esv.org/hw/43011035-43011035.mp3','https://audio.esv.org:444/hw/43011035-43011035.mp3','https://audio.esv.org/hw/43011035-43011035.mp3?token=abc','https://audio.esv.org/hw/../script','https://audio.esv.org/hw/43011035.mp3','//audio.esv.org/hw/43011035-43011035.mp3',null];
 for(const location of invalid){
  assert.equal(validatedAudioDestination(location),null,String(location));
  await withFetch(async()=>new Response(null,{status:302,headers:location?{location}:{}}),async()=>{
   const r=await onRequestGet({request:request('John 11:35'),env:{ESV_API_KEY:'secret'}});
   assert.equal(r.status,502,String(location));
   assert.equal((await r.json()).code,'invalid_audio_redirect');
  });
 }
 assert.equal(validatedAudioDestination(sample),sample);
});

test('an official direct MP3 or byte-range response is streamed without leaking authentication or publisher Content-Length',async()=>{
 for(const status of [200,206]){
  let requests=0;
  await withFetch(async(url,opts)=>{
   requests++;
   assert.equal(opts.headers.Authorization,'Token secret');
   return new Response(new Uint8Array([73,68,51,4]),{status,headers:{'Content-Type':'audio/mpeg','Content-Length':'4',...(status===206?{'Content-Range':'bytes 0-3/1000','Accept-Ranges':'bytes'}:{})}});
  },async()=>{
   const res=await onRequestGet({request:request('John 11:35','ESV',{Range:'bytes=0-3'}),env:{ESV_API_KEY:'secret'}});
   assert.equal(res.status,status);
   assert.equal(res.headers.get('content-type'),'audio/mpeg');
   assert.equal(res.headers.get('content-length'),null);
   if(status===206)assert.equal(res.headers.get('content-range'),'bytes 0-3/1000');
   assert.deepEqual([...new Uint8Array(await res.arrayBuffer())],[73,68,51,4]);
  });
  assert.equal(requests,1);
 }
});

test('upstream errors and HTML responses fail safely and never expose provider content or secrets',async()=>{
 const fixtures=[[429,429],[404,404],[403,503],[502,503],[200,502]];
 for(const [upstream,expected] of fixtures){
  await withFetch(async()=>new Response('some confidential provider body',{status:upstream,headers:{'Content-Type':'text/html'}}),async()=>{
   const r=await onRequestGet({request:request('John 11:35'),env:{ESV_API_KEY:'server-private'}});
   assert.equal(r.status,expected);
   const body=await r.text();
   assert.ok(!body.includes('server-private')&&!body.includes('some confidential provider body'));
  });
 }
});

test('browser audio control and CSP allow the approved ESV media origin without exposing the publisher token',()=>{
 const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
 const app=readFileSync(new URL('../public/assets/app.js',import.meta.url),'utf8');
 const client=readFileSync(new URL('../public/assets/reader-audio.js',import.meta.url),'utf8');
 const headers=readFileSync(new URL('../public/_headers',import.meta.url),'utf8');
 assert.match(html,/id="reader-audio-button"/);
 assert.match(app,/readerAudio\.sync/);assert.match(client,/translation==='ESV'/);
 assert.match(client,/\/api\/audio\?q=/);
 assert.match(headers,/media-src 'self' https:\/\/audio\.esv\.org/);
 assert.doesNotMatch(client,/ESV_API_KEY|Authorization/);
});
