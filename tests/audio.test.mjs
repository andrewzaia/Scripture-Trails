import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {onRequestGet} from '../functions/api/audio.js';

const request=(q,translation='ESV',headers={})=>new Request('https://scripturetrails.test/api/audio?'+new URLSearchParams({q,translation}),{headers});
const html=(reference,link='https://audio.esv.org/hw/43011035-43011035.mp3')=>Response.json({
 canonical:reference,passages:['<h2>'+reference+' <a class="mp3link" href="'+link+'" type="audio/mpeg">Listen</a></h2>']
});
async function mockedFetch(fake,callback){const old=globalThis.fetch;globalThis.fetch=fake;try{await callback();}finally{globalThis.fetch=old;}}

test('ESV audio rejects other translations, malformed references, oversize verse ranges and bad byte ranges',async()=>{
 await mockedFetch(()=>assert.fail('Invalid requests must not access the provider'),async()=>{
  for(const [q,translation] of [['John 3:16','NIV'],['John 3:16','NASB20'],['John 3:16','NKJV'],['Genesis 51','ESV'],['John 3:1-40','ESV'],['https://evil.test','ESV']]){
   const r=await onRequestGet({request:request(q,translation),env:{ESV_API_KEY:'secret'}});
   assert.equal(r.status,400,q);
  }
  assert.equal((await onRequestGet({request:request('John 3:16','ESV',{Range:'bytes=0-5,8-9'}),env:{ESV_API_KEY:'secret'}})).status,416);
  assert.equal((await onRequestGet({request:request('John 3:16'),env:{}})).status,503);
 });
});

test('single verse, range and chapter use official ESV passage audio links and do not forward the secret',async()=>{
 const calls=[];
 await mockedFetch(async(url,options)=>{
  calls.push({url:new URL(url),options});
  if(calls.length%2===1)return html(new URL(url).searchParams.get('q'));
  return new Response(new Uint8Array([73,68,51,0]),{status:200,headers:{'Content-Type':'audio/mpeg'}});
 },async()=>{
  for(const q of ['John 3:16','John 3:16-18','John 3']){
   const r=await onRequestGet({request:request(q),env:{ESV_API_KEY:'secret-only'}});
   assert.equal(r.status,200,q);assert.equal(r.headers.get('content-type'),'audio/mpeg');
   assert.equal(r.headers.get('cache-control'),'private, no-store');
   assert.deepEqual([...new Uint8Array(await r.arrayBuffer())],[73,68,51,0]);
  }
 });
 assert.deepEqual(calls.filter((_,i)=>i%2===0).map(x=>x.url.searchParams.get('q')),['John 3:16','John 3:16-18','John 3']);
 for(let i=0;i<calls.length;i++){
  const {url,options}=calls[i];assert.equal(options.redirect,'manual');
  if(i%2===0){
   assert.equal(url.origin,'https://api.esv.org');
   assert.equal(url.pathname,'/v3/passage/html/');
   assert.equal(url.searchParams.get('include-audio-link'),'true');
   assert.equal(options.headers.Authorization,'Token secret-only');
  }else{
   assert.equal(url.href,'https://audio.esv.org/hw/43011035-43011035.mp3');
   assert.equal(options.headers.Authorization,undefined);
  }
 }
});

test('audio range requests are forwarded only to the official media host and content-range is retained',async()=>{
 let count=0;
 await mockedFetch(async(url,options)=>{
  count++;
  if(count===1)return html('Psalms 23','https://audio.esv.org/hw/19023001-19023006.mp3');
  assert.deepEqual(options.headers,{Range:'bytes=100-'});
  assert.equal(options.signal,undefined,'Streaming must not stop early for lengthy chapters');
  return new Response(new Uint8Array([1,2,3]),{status:206,headers:{'Content-Type':'audio/mpeg','Content-Range':'bytes 100-102/900','Content-Length':'3','Accept-Ranges':'bytes'}});
 },async()=>{
  const r=await onRequestGet({request:request('Psalms 23','ESV',{Range:'bytes=100-'}),env:{ESV_API_KEY:'private'}});
  assert.equal(r.status,206);assert.equal(r.headers.get('Content-Range'),'bytes 100-102/900');
  assert.equal(r.headers.get('Content-Length'),null);
 });
});

test('malicious, unsigned, ambiguous or wrong-reference audio links never reach an external media host',async()=>{
 for(const [reference,link] of [
  ['John 3:16','https://evil.example/recording.mp3'],
  ['John 3:16','http://audio.esv.org/hw/43003016-43003016.mp3'],
  ['John 3:16','https://audio.esv.org:444/hw/43003016-43003016.mp3'],
  ['John 3:16','https://audio.esv.org/hw/malware.mp3']
 ]){
  let calls=0;
  await mockedFetch(async()=>{calls++;return html(reference,link);},async()=>{
   const r=await onRequestGet({request:request('John 3:16'),env:{ESV_API_KEY:'private'}});
   assert.equal(r.status,503,link);assert.equal((await r.json()).code,'audio_link_invalid');
  });
  assert.equal(calls,1);
 }
 await mockedFetch(async()=>html('John 3:17'),async()=>{
  const r=await onRequestGet({request:request('John 3:16'),env:{ESV_API_KEY:'private'}});
  assert.equal(r.status,503);assert.equal((await r.json()).code,'audio_link_invalid');
 });
});

test('publisher errors and malformed responses fail safely without exposing a secret',async()=>{
 for(const [fake,status] of [
  [()=>new Response('publisher private response',{status:429}),429],
  [()=>new Response('publisher private response',{status:404}),404],
  [()=>new Response('publisher private response',{status:403}),503],
  [()=>new Response('<html>bad response</html>',{status:200}),503],
  [()=>new Response(null,{status:302,headers:{Location:'https://evil.example/'}}),503],
  [()=>{throw Error('provider offline');},503]
 ]){
  await mockedFetch(fake,async()=>{
   const r=await onRequestGet({request:request('John 3:16'),env:{ESV_API_KEY:'secret'}});
   assert.equal(r.status,status);
   const body=await r.text();assert.ok(!body.includes('secret'));assert.ok(!body.includes('publisher private response'));
  });
 }
});

test('the reader keeps the UI accessible and does not embed a publisher key',()=>{
 const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
 const app=readFileSync(new URL('../public/assets/app.js',import.meta.url),'utf8');
 const audio=readFileSync(new URL('../public/assets/reader-audio.js',import.meta.url),'utf8');
 assert.match(html,/id="reader-audio-button"/);
 assert.match(html,/id="reader-audio-status"[^>]*role="status"/);
 assert.match(app,/readerAudio\.sync/);assert.match(app,/readerAudio\.stop/);
 assert.match(audio,/translation==='ESV'/);assert.match(audio,/encodeURIComponent\(requested\)/);
 assert.doesNotMatch(audio,/ESV_API_KEY|Authorization/);
});
