import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {onRequestGet} from '../functions/api/audio.js';

const request=(q,translation='ESV',headers={})=>new Request('https://scripturetrails.test/api/audio?'+new URLSearchParams({q,translation}),{headers});
async function mockedFetch(fake,callback){const old=globalThis.fetch;globalThis.fetch=fake;try{await callback();}finally{globalThis.fetch=old;}}

test('ESV audio rejects non-ESV translations, malformed references and unsafe ranges',async()=>{
 await mockedFetch(()=>assert.fail('Invalid requests must not access the provider'),async()=>{
  for(const [q,translation] of [['John 3:16','NIV'],['John 3:16','NASB20'],['John 3:16','NKJV'],['Genesis 51','ESV'],['John 3:1-40','ESV'],['https://evil.test','ESV']]){
   const r=await onRequestGet({request:request(q,translation),env:{ESV_API_KEY:'secret'}});
   assert.equal(r.status,400,q);
  }
  assert.equal((await onRequestGet({request:request('John 3:16','ESV',{Range:'bytes=0-5,8-9'}),env:{ESV_API_KEY:'secret'}})).status,416);
  assert.equal((await onRequestGet({request:request('John 3:16'),env:{}})).status,503);
 });
});

test('an individual verse, short range, and chapter are requested exactly, and audio key never reaches the media host',async()=>{
 const requests=[];
 await mockedFetch(async(url,options)=>{
  requests.push({url:new URL(url),options});
  if(requests.length%2===1)return new Response(null,{status:302,headers:{location:'https://audio.esv.org/mock.mp3'}});
  return new Response(new Uint8Array([73,68,51,0]),{status:200,headers:{'Content-Type':'audio/mpeg','Accept-Ranges':'bytes'}});
 },async()=>{
  for(const q of ['John 3:16','John 3:16-18','John 3']){
   const r=await onRequestGet({request:request(q),env:{ESV_API_KEY:'secret-only'}});
   assert.equal(r.status,200);
   assert.equal(r.headers.get('Content-Type'),'audio/mpeg');
   assert.equal(r.headers.get('Cache-Control'),'private, no-store');
   assert.deepEqual([...new Uint8Array(await r.arrayBuffer())],[73,68,51,0]);
  }
 });
 assert.deepEqual(requests.filter((_,i)=>i%2===0).map(x=>x.url.searchParams.get('q')),['John 3:16','John 3:16-18','John 3']);
 for(let i=0;i<requests.length;i++){
  const {url,options}=requests[i];assert.equal(options.redirect,'manual');
  if(i%2===0){assert.equal(url.origin,'https://api.esv.org');assert.equal(options.headers.Authorization,'Token secret-only');}
  else{assert.equal(url.origin,'https://audio.esv.org');assert.equal(options.headers.Authorization,undefined);}
 }
});

test('audio byte-range requests are relayed to the media host, preserving partial content',async()=>{
 let count=0;
 await mockedFetch(async(url,options)=>{
  count++;
  if(count===1){assert.equal(options.headers.Authorization,'Token private');return new Response(null,{status:302,headers:{location:'https://cdn.crossway.org/audio.mp3'}});}
  assert.deepEqual(options.headers,{Range:'bytes=100-'});
  return new Response(new Uint8Array([1,2,3]),{status:206,headers:{'Content-Type':'audio/mpeg','Content-Range':'bytes 100-102/900','Content-Length':'3','Accept-Ranges':'bytes'}});
 },async()=>{
  const r=await onRequestGet({request:request('Psalms 23','ESV',{Range:'bytes=100-'}),env:{ESV_API_KEY:'private'}});
  assert.equal(r.status,206);assert.equal(r.headers.get('Content-Range'),'bytes 100-102/900');assert.equal(r.headers.get('Content-Length'),'3');
 });
});

test('unsafe redirects never receive credentials, even if Crossway unexpectedly supplies them',async()=>{
 for(const location of ['http://audio.esv.org/a.mp3','https://127.0.0.1/a.mp3','https://evil.example/audio.mp3','https://user:pw@audio.esv.org/a.mp3','https://audio.esv.org:444/a.mp3']){
  let count=0;
  await mockedFetch(async()=>{count++;return new Response(null,{status:302,headers:{location}});},async()=>{
   const r=await onRequestGet({request:request('John 1:1'),env:{ESV_API_KEY:'private'}});
   assert.equal(r.status,502,location);assert.equal((await r.json()).code,'audio_redirect');
  });
  assert.equal(count,1);
 }
});

test('upstream failures do not expose private credentials or arbitrary provider bodies',async()=>{
 for(const [fake,status] of [
  [()=>new Response('publisher private response',{status:429}),429],
  [()=>new Response('publisher private response',{status:404}),404],
  [()=>new Response('<html>wrong response</html>',{status:200,headers:{'Content-Type':'text/html'}}),502],
  [()=>new Response(null,{status:302,headers:{location:'https://audio.esv.org'}}),502],
  [()=>{throw Error('provider offline');},502]
 ]){
  await mockedFetch(fake,async()=>{
   const r=await onRequestGet({request:request('John 3:16'),env:{ESV_API_KEY:'secret'}});
   assert.equal(r.status,status);
   const body=await r.text();assert.ok(!body.includes('secret'));assert.ok(!body.includes('publisher private response'));
  });
 }
});

test('audio reader has accessible UI, canonical reference encoding and no browser secret',()=>{
 const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
 const app=readFileSync(new URL('../public/assets/app.js',import.meta.url),'utf8');
 const audio=readFileSync(new URL('../public/assets/reader-audio.js',import.meta.url),'utf8');
 assert.match(html,/id="reader-audio-button"/);
 assert.match(html,/id="reader-audio-status"[^>]*role="status"/);
 assert.match(app,/readerAudio\.sync/);assert.match(app,/readerAudio\.stop/);
 assert.match(audio,/translation==='ESV'/);
 assert.match(audio,/encodeURIComponent\(requested\)/);
 assert.doesNotMatch(audio,/ESV_API_KEY|Authorization/);
});
