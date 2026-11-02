import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {onRequestGet,audioUrlFromMetadata} from '../functions/api/audio.js';
import {parseRef} from '../public/assets/books.js';
const request=(q,translation='ESV',headers={})=>new Request('https://scripturetrails.test/api/audio?'+new URLSearchParams({q,translation}),{headers});
const metadata=(canonical,parsed)=>Response.json({canonical,parsed,passages:['Synthetic fixture. No ESV text.']});
async function withFetch(fake,run){const prior=globalThis.fetch;globalThis.fetch=fake;try{await run();}finally{globalThis.fetch=prior;}}
const cases=[
 {q:'John 11:35',parsed:[[43011035,43011035]],url:'https://audio.esv.org/hw/43011035-43011035.mp3'},
 {q:'John 3:16-18',parsed:[[43003016,43003018]],url:'https://audio.esv.org/hw/43003016-43003018.mp3'},
 {q:'John 3',parsed:[[43003001,43003036]],url:'https://audio.esv.org/hw/43003001-43003036.mp3'},
 {q:'Psalms 23',parsed:[[19023001,19023006]],url:'https://audio.esv.org/hw/19023001-19023006.mp3'}
];
test('exact Crossway metadata safely resolves a verse, range and complete chapter',async()=>{
 for(const {q,parsed,url} of cases){
  assert.equal(audioUrlFromMetadata({canonical:q,parsed},parseRef(q)),url);
  const calls=[];
  await withFetch(async(requestUrl,options)=>{
   calls.push({url:new URL(requestUrl),options});
   return metadata(q,parsed);
  },async()=>{
   const response=await onRequestGet({request:request(q),env:{ESV_API_KEY:'private-token'}});
   assert.equal(response.status,302,q);
   assert.equal(response.headers.get('location'),url);
   assert.match(response.headers.get('cache-control'),/no-store/);
  });
  assert.equal(calls.length,1,'No API key or audio file should be requested from the media host');
  assert.equal(calls[0].url.origin,'https://api.esv.org');
  assert.equal(calls[0].url.pathname,'/v3/passage/text/');
  assert.equal(calls[0].url.searchParams.get('q'),q);
  assert.equal(calls[0].options.headers.Authorization,'Token private-token');
  assert.equal(calls[0].options.redirect,'manual');
 }
});

test('real Crossway canonical range separator is normalised without relaxing verse validation',async()=>{
 const canonical='John 3:16\u201318',query='John 3:16-18',parsed=[[43003016,43003018]];
 const url='https://audio.esv.org/hw/43003016-43003018.mp3';
 assert.equal(audioUrlFromMetadata({canonical,parsed},parseRef(query)),url);
 await withFetch(async()=>metadata(canonical,parsed),async()=>{
  const response=await onRequestGet({request:request(query),env:{ESV_API_KEY:'secret'}});
  assert.equal(response.status,302);
  assert.equal(response.headers.get('location'),url);
 });
 assert.equal(audioUrlFromMetadata({canonical,parsed:[[43003016,43003019]]},parseRef(query)),null);
 assert.equal(audioUrlFromMetadata({canonical:'John 3:16\u201319',parsed},parseRef(query)),null);
});

test('metadata mismatch, ambiguous ranges, invalid book/chapter and manipulated verses are refused',async()=>{
 const q='John 11:35',ref=parseRef(q);
 for(const payload of [
  {canonical:'John 11:36',parsed:[[43011035,43011035]]},
  {canonical:q,parsed:null},
  {canonical:q,parsed:[]},
  {canonical:q,parsed:[[43011035,43011035],[43011036,43011036]]},
  {canonical:q,parsed:[[43011034,43011035]]},
  {canonical:q,parsed:[[43011035,43011036]]},
  {canonical:q,parsed:[[40011035,40011035]]},
  {canonical:q,parsed:[[43012035,43012035]]},
  {canonical:q,parsed:[[43011035,'43011035']]},
  {canonical:q,parsed:[[43011035,999999999]]}
 ])assert.equal(audioUrlFromMetadata(payload,ref),null,JSON.stringify(payload));
});
test('chapter audio must start at verse one and stay within a single canonical chapter',()=>{
 const ref=parseRef('John 11');
 for(const range of [[[43011002,43011057]],[[43011001,43012001]],[[43011001,43011177]]]){
  assert.equal(audioUrlFromMetadata({canonical:'John 11',parsed:range},ref),null);
 }
});
test('ESV-only access, bounded references, missing key and unsafe ranges fail without contacting Crossway',async()=>{
 await withFetch(()=>assert.fail('Invalid input must not reach Crossway'),async()=>{
  for(const [q,version] of [['John 11:35','NIV'],['John 11:35','NASB20'],['John 11:35','NKJV'],['Genesis 51','ESV'],['John 3:1-40','ESV'],['https://evil.example','ESV']]){
   const response=await onRequestGet({request:request(q,version),env:{ESV_API_KEY:'private'}});
   assert.equal(response.status,400,q);
  }
  assert.equal((await onRequestGet({request:request('John 11:35'),env:{}})).status,503);
  assert.equal((await onRequestGet({request:request('John 11:35','ESV',{Range:'bytes=0-99,200-299'}),env:{ESV_API_KEY:'private'}})).status,416);
 });
});
test('upstream failure, malformed JSON and incorrect Crossway metadata fail safely',async()=>{
 for(const [body,status] of [
  [new Response('confidential upstream text',{status:403}),503],
  [new Response('upstream fail',{status:429}),429],
  [new Response('no passage',{status:404}),404],
  [new Response('<html>error</html>',{status:200}),503],
  [metadata('John 11:35',[]),503]
 ]){
  await withFetch(async()=>body.clone(),async()=>{
   const res=await onRequestGet({request:request('John 11:35'),env:{ESV_API_KEY:'secret'}});
   assert.equal(res.status,status);
   const text=await res.text();
   assert.ok(!text.includes('secret')&&!text.includes('upstream text'));
  });
 }
});
test('reader stays accessible and browser media CSP only allows the official audio host',()=>{
 const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
 const app=readFileSync(new URL('../public/assets/app.js',import.meta.url),'utf8');
 const reader=readFileSync(new URL('../public/assets/reader-audio.js',import.meta.url),'utf8');
 const policy=readFileSync(new URL('../public/_headers',import.meta.url),'utf8');
 assert.match(html,/id="reader-audio-button"/);
 assert.match(app,/readerAudio\.sync/);
 assert.match(reader,/translation==='ESV'/);
 assert.match(reader,/\/api\/audio\?q=/);
 assert.match(policy,/media-src 'self' https:\/\/audio\.esv\.org/);
 assert.doesNotMatch(reader,/ESV_API_KEY|Authorization/);
});
