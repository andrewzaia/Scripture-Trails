import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {onRequestGet,audioUrlFromMetadata,validatedPublisherRedirect} from '../functions/api/audio.js';
import {parseRef} from '../public/assets/books.js';
const request=(q,translation='ESV',headers={})=>new Request('https://scripturetrails.test/api/audio?'+new URLSearchParams({q,translation}),{headers});
const metadata=(canonical,parsed)=>Response.json({canonical,parsed,passages:['Synthetic fixture. No ESV text.']});
const redirect=url=>new Response(null,{status:302,headers:{Location:url}});
async function withFetch(mock,run){const previous=globalThis.fetch;globalThis.fetch=mock;try{await run();}finally{globalThis.fetch=previous;}}
const cases=[
 {q:'Genesis 1:1',parsed:[[1001001,1001001]],url:'https://audio.esv.org/hw/01001001-01001001.mp3'},
 {q:'Genesis 1',parsed:[[1001001,1001031]],url:'https://audio.esv.org/hw/01001001-01001031.mp3'},
 {q:'John 11:35',parsed:[[43011035,43011035]],url:'https://audio.esv.org/hw/43011035-43011035.mp3'},
 {q:'John 3:16-18',parsed:[[43003016,43003018]],url:'https://audio.esv.org/hw/43003016-43003018.mp3'},
 {q:'John 3',parsed:[[43003001,43003036]],url:'https://audio.esv.org/hw/43003001-43003036.mp3'},
 {q:'Psalms 23',parsed:[[19023001,19023006]],url:'https://audio.esv.org/hw/19023001-19023006.mp3'}
];
test('documented Crossway v3 audio API is the primary method for a verse, range and chapter',async()=>{
 for(const {q,url} of cases){
  const calls=[];
  await withFetch(async(u,opts)=>{calls.push({url:new URL(u),opts});return redirect(url);},async()=>{
   const response=await onRequestGet({request:request(q),env:{ESV_API_KEY:'private-key'}});
   assert.equal(response.status,302,q);
   assert.equal(response.headers.get('location'),url);
   assert.match(response.headers.get('cache-control'),/no-store/);
   assert.equal(response.headers.get('referrer-policy'),'no-referrer');
  });
  assert.equal(calls.length,1);
  assert.equal(calls[0].url.origin,'https://api.esv.org');
  assert.equal(calls[0].url.pathname,'/v3/passage/audio/');
  assert.equal(calls[0].url.searchParams.get('q'),q);
  assert.equal(calls[0].opts.headers.Authorization,'Token private-key');
  assert.equal(calls[0].opts.redirect,'manual','Server must inspect the redirect before sending it to the browser');
 }
});
test('publisher audio destinations must match the selected book chapter and verses exactly',()=>{
 for(const {q,url} of cases)assert.equal(validatedPublisherRedirect(url,parseRef(q)),url);
 const reference=parseRef('John 11:35');
 for(const dest of [
  'http://audio.esv.org/hw/43011035-43011035.mp3',
  'https://evil.example/hw/43011035-43011035.mp3',
  'https://audio.esv.org:444/hw/43011035-43011035.mp3',
  'https://audio.esv.org/hw/43011035-43011035.mp3?token=secret',
  'https://audio.esv.org/hw/43011035-43011036.mp3',
  'https://audio.esv.org/hw/43012035-43012035.mp3',
  'https://audio.esv.org/hw/43011034-43011035.mp3',
  '//audio.esv.org/hw/43011035-43011035.mp3'
 ])assert.equal(validatedPublisherRedirect(dest,reference),null,dest);
});
test('invalid or misleading redirects fail closed, with no metadata fallback',async()=>{
 let count=0;
 await withFetch(async()=>{count++;return redirect('https://evil.example/hw/43011035-43011035.mp3');},async()=>{
  const r=await onRequestGet({request:request('John 11:35'),env:{ESV_API_KEY:'private'}});
  assert.equal(r.status,502);
  assert.equal((await r.json()).code,'invalid_audio_redirect');
 });
 assert.equal(count,1);
});
test('metadata fallback is used only for transient audio API unavailability',async()=>{
 for(const {q,parsed,url} of cases){
  const calls=[];
  await withFetch(async(u,opts)=>{
   calls.push({url:new URL(u),opts});
   return calls.length===1?new Response('Provider offline',{status:502}):metadata(q==='John 3:16-18'?'John 3:16\u201318':q,parsed);
  },async()=>{
   const response=await onRequestGet({request:request(q),env:{ESV_API_KEY:'private-token'}});
   assert.equal(response.status,302,q);
   assert.equal(response.headers.get('location'),url);
  });
  assert.deepEqual(calls.map(c=>c.url.pathname),['/v3/passage/audio/','/v3/passage/text/']);
  assert.ok(calls.every(c=>c.opts.headers.Authorization==='Token private-token'));
 }
});
test('connection failures fall back without exposing secrets or publisher text',async()=>{
 let count=0;
 await withFetch(async()=>{count++;if(count===1)throw Error('Blocked connection');return metadata('John 11:35',[[43011035,43011035]]);},async()=>{
  const response=await onRequestGet({request:request('John 11:35'),env:{ESV_API_KEY:'private'}});
  assert.equal(response.status,302);assert.equal(response.headers.get('location'),'https://audio.esv.org/hw/43011035-43011035.mp3');
 });
 assert.equal(count,2);
});
test('metadata fallback refuses wrong range, unrelated book and forged canonical text',async()=>{
 const ref=parseRef('John 3:16-18');
 assert.equal(audioUrlFromMetadata({canonical:'John 3:16\u201318',parsed:[[43003016,43003018]]},ref),'https://audio.esv.org/hw/43003016-43003018.mp3');
 for(const payload of [
  {canonical:'John 3:16\u201319',parsed:[[43003016,43003018]]},
  {canonical:'John 3:16\u201318',parsed:[[43003016,43003019]]},
  {canonical:'John 3:16\u201318',parsed:[[40003016,40003018]]},
  {canonical:'John 3:16\u201318',parsed:[[43004016,43004018]]},
  {canonical:'John 3:16\u201318',parsed:[]}
 ])assert.equal(audioUrlFromMetadata(payload,ref),null);
});
test('publisher rate limits, missing audio and permission denial do not trigger fallback',async()=>{
 for(const [status,expected] of [[429,429],[404,404],[401,503],[403,503]]){
  let count=0;
  await withFetch(async()=>{count++;return new Response('private provider body',{status});},async()=>{
   const response=await onRequestGet({request:request('John 11:35'),env:{ESV_API_KEY:'secret'}});
   assert.equal(response.status,expected);
   assert.ok(!(await response.text()).includes('private provider body'));
  });
  assert.equal(count,1);
 }
});
test('fallback errors fail safely and do not leak publisher text or credentials',async()=>{
 await withFetch(async()=>new Response('Unavailable',{status:503}),async()=>{
  const response=await onRequestGet({request:request('John 11:35'),env:{ESV_API_KEY:'secret'}});
  assert.equal(response.status,503);
  assert.ok(!(await response.text()).includes('secret'));
 });
});
test('non-ESV, malformed references, missing key and invalid ranges never call upstream',async()=>{
 await withFetch(()=>assert.fail('Invalid request must not access Crossway'),async()=>{
  for(const [q,translation] of [['John 11:35','NIV'],['John 11:35','NASB20'],['John 11:35','NKJV'],['Genesis 51','ESV'],['John 3:1-40','ESV'],['https://evil.example','ESV']]){
   const response=await onRequestGet({request:request(q,translation),env:{ESV_API_KEY:'secret'}});
   assert.equal(response.status,400,q);
  }
  assert.equal((await onRequestGet({request:request('John 11:35'),env:{}})).status,503);
  assert.equal((await onRequestGet({request:request('John 11:35','ESV',{Range:'bytes=0-100,200-300'}),env:{ESV_API_KEY:'secret'}})).status,416);
 });
});
test('reader UI and CSP only permit ESV audio without browser-side publisher credentials',()=>{
 const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
 const app=readFileSync(new URL('../public/assets/app.js',import.meta.url),'utf8');
 const reader=readFileSync(new URL('../public/assets/reader-audio.js',import.meta.url),'utf8');
 const headers=readFileSync(new URL('../public/_headers',import.meta.url),'utf8');
 assert.match(html,/id="reader-audio-button"/);
 assert.match(app,/readerAudio\.sync/);
 assert.match(reader,/translation==='ESV'/);
 assert.match(reader,/\/api\/audio\?q=/);
 assert.match(headers,/media-src 'self' https:\/\/audio\.esv\.org/);
 assert.doesNotMatch(reader,/ESV_API_KEY|Authorization/);
});
