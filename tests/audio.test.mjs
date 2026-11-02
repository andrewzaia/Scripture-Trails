import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {onRequestGet,audioUrlFromMetadata} from '../functions/api/audio.js';
import {parseRef} from '../public/assets/books.js';

const request=(q,translation='ESV',headers={})=>new Request('https://scripturetrails.test/api/audio?'+new URLSearchParams({q,translation}),{headers});
const publisher=(canonical,parsed)=>Response.json({canonical,parsed,passages:['Synthetic passage text']});
async function withFetch(fake,fn){const old=globalThis.fetch;globalThis.fetch=fake;try{await fn();}finally{globalThis.fetch=old;}}
const cases=[
 {q:'Genesis 1:1',canonical:'Genesis 1:1',range:[1001001,1001001],mp3:'https://audio.esv.org/hw/01001001-01001001.mp3'},
 {q:'Genesis 1',canonical:'Genesis 1',range:[1001001,1001031],mp3:'https://audio.esv.org/hw/01001001-01001031.mp3'},
 {q:'John 11:35',canonical:'John 11:35',range:[43011035,43011035],mp3:'https://audio.esv.org/hw/43011035-43011035.mp3'},
 {q:'John 3:16-18',canonical:'John 3:16\u201318',range:[43003016,43003018],mp3:'https://audio.esv.org/hw/43003016-43003018.mp3'},
 {q:'John 3',canonical:'John 3',range:[43003001,43003036],mp3:'https://audio.esv.org/hw/43003001-43003036.mp3'}
];
test('authenticated Crossway metadata returns an exact approved MP3 redirect for verses, ranges and chapters',async()=>{
 for(const c of cases){
  const calls=[];
  await withFetch(async(url,opts)=>{calls.push({url:new URL(url),opts});return publisher(c.canonical,[c.range]);},async()=>{
   const response=await onRequestGet({request:request(c.q),env:{ESV_API_KEY:'secret'}});assert.equal(response.status,302,c.q);
   assert.equal(response.headers.get('location'),c.mp3);
   assert.match(response.headers.get('cache-control'),/no-store/);
   assert.equal(response.headers.get('referrer-policy'),'no-referrer');
  });
  assert.equal(calls.length,1,c.q);
  assert.equal(calls[0].url.pathname,'/v3/passage/text/');
  assert.equal(calls[0].url.searchParams.get('q'),c.q);
  assert.equal(calls[0].opts.headers.Authorization,'Token secret');
  assert.equal(calls[0].opts.redirect,'manual');
 }
});
test('metadata canonical unicode separator and leading-zero book identifiers are handled without changing boundaries',()=>{
 for(const c of cases)assert.equal(audioUrlFromMetadata({canonical:c.canonical,parsed:[c.range]},parseRef(c.q)),c.mp3);
 const query=parseRef('John 3:16-18');
 for(const x of [
  {canonical:'John 3:16\u201319',parsed:[[43003016,43003018]]},
  {canonical:'John 3:16\u201318',parsed:[[43003016,43003019]]},
  {canonical:'John 3:16\u201318',parsed:[[40003016,40003018]]},
  {canonical:'John 3:16\u201318',parsed:[[43004016,43004018]]},
  {canonical:'John 3:16\u201318',parsed:[[43003016,'43003018']]},
  {canonical:'John 3:16\u201318',parsed:[[43003016,43003018],[43003019,43003020]]}
 ])assert.equal(audioUrlFromMetadata(x,query),null,JSON.stringify(x));
});
test('ESV-only access, unsafe ranges and unsupported Scripture references are rejected without contacting the publisher',async()=>{
 await withFetch(()=>assert.fail('Invalid reference must not make an API request'),async()=>{
  for(const [q,translation] of [['John 11:35','NIV'],['John 11:35','NASB20'],['John 11:35','NKJV'],['Genesis 51','ESV'],['John 3:1-40','ESV'],['https://evil.example','ESV']])
   assert.equal((await onRequestGet({request:request(q,translation),env:{ESV_API_KEY:'secret'}})).status,400,q);
  assert.equal((await onRequestGet({request:request('John 11:35'),env:{}})).status,503);
  assert.equal((await onRequestGet({request:request('John 11:35','ESV',{Range:'bytes=0-99,200-299'}),env:{ESV_API_KEY:'secret'}})).status,416);
 });
});
test('upstream errors, incorrect canonical text and missing metadata fail closed without leaking secrets',async()=>{
 for(const [factory,status] of [
  [()=>new Response('private text',{status:429}),429],
  [()=>new Response('private text',{status:404}),404],
  [()=>new Response('private text',{status:403}),503],
  [()=>new Response('<html>error</html>',{status:200}),503],
  [()=>publisher('John 11:36',[[43011035,43011035]]),503],
  [()=>publisher('John 11:35',[]),503]
 ]){
  await withFetch(async()=>factory(),async()=>{
   const r=await onRequestGet({request:request('John 11:35'),env:{ESV_API_KEY:'secret'}});
   assert.equal(r.status,status);
   const body=await r.text();assert.ok(!body.includes('secret')&&!body.includes('private text'));
  });
 }
});
test('the deployed reader restricts browser media and does not expose API credentials',()=>{
 const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
 const app=readFileSync(new URL('../public/assets/app.js',import.meta.url),'utf8');
 const audio=readFileSync(new URL('../public/assets/reader-audio.js',import.meta.url),'utf8');
 const policy=readFileSync(new URL('../public/_headers',import.meta.url),'utf8');
 assert.match(html,/id="reader-audio-button"/);
 assert.match(app,/readerAudio\.sync/);
 assert.match(audio,/translation==='ESV'/);
 assert.match(policy,/media-src 'self' https:\/\/audio\.esv\.org/);
 assert.doesNotMatch(audio,/ESV_API_KEY|Authorization/);
});
