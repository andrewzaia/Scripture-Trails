import test from 'node:test';
import assert from 'node:assert/strict';
import {BOOKS} from '../public/assets/books.js';
import {TRANSLATIONS,getTranslation,apiBibleTarget} from '../public/assets/translations.js';
import {onRequestGet} from '../functions/api/passage.js';

const request=(ref,translation)=>new Request(`https://example.test/api/passage?${new URLSearchParams({q:ref,translation})}`);
async function mockedFetch(mock,run){const original=globalThis.fetch;globalThis.fetch=mock;try{await run();}finally{globalThis.fetch=original;}}
function passage(translation='NIV',overrides={}){
 return {data:{bibleId:getTranslation(translation).bibleId,content:'<p><span class="v">16</span>Mock passage</p>',copyright:'Mock publisher copyright',...overrides},meta:{fumsToken:'mock-fums-token',fumsId:'00000000-0000-4000-8000-000000000001'}};
}

test('API.Bible uses the three approved editions and USFM IDs for all 66 books',()=>{
 assert.deepEqual(TRANSLATIONS.map(t=>t.code),['ESV','NASB20','NIV','NKJV']);
 assert.equal(getTranslation('nasb20').bibleId,'a761ca71e0b3ddcf-01');
 assert.equal(getTranslation('NIV').bibleId,'78a9f6124f344018-01');
 assert.equal(getTranslation('NKJV').bibleId,'63097d2a0a2f7db3-01');
 assert.equal(getTranslation('LSB'),null);
 assert.equal(new Set(BOOKS.map(book=>apiBibleTarget(`${book.name} 1`).id)).size,66);
 for(const [ref,id] of [['Psalms 23','PSA.23'],['Song of Solomon 2','SNG.2'],['1 Kings 3','1KI.3'],['Philippians 4:13','PHP.4.13'],['1 John 1:1','1JN.1.1']])assert.equal(apiBibleTarget(ref).id,id);
});
test('single verse, range and full chapter route to their exact API.Bible resources',async()=>{
 await mockedFetch(async(url,options)=>{
  assert.equal(options.headers['api-key'],'server-only-key');
  assert.equal(options.redirect,'error');
  assert.ok(options.signal instanceof AbortSignal);
  const u=new URL(url),i=calls.length;calls.push(u);
  assert.equal(u.origin,'https://rest.api.bible');
  assert.equal(u.searchParams.get('content-type'),'html');
  assert.equal(u.searchParams.get('include-titles'),i===2?'true':'false');
  return Response.json(passage('NIV'));
 },async()=>{
  for(const ref of ['John 3:16','John 3:16-18','John 3']){
   const res=await onRequestGet({request:request(ref,'NIV'),env:{API_BIBLE_KEY:'server-only-key'}});
   assert.equal(res.status,200);
   const text=await res.text();assert.ok(!text.includes('server-only-key'));
   const body=JSON.parse(text);assert.equal(body.canonical,ref);assert.equal(body.translation,'NIV');assert.equal(body.copyright,'Mock publisher copyright');assert.equal(body.fums.token,'mock-fums-token');
   assert.equal(res.headers.get('cache-control'),'no-store');
  }
  assert.deepEqual(calls.map(u=>u.pathname),[
   '/v1/bibles/78a9f6124f344018-01/verses/JHN.3.16',
   '/v1/bibles/78a9f6124f344018-01/passages/JHN.3.16-JHN.3.18',
   '/v1/bibles/78a9f6124f344018-01/chapters/JHN.3'
  ]);
 });
});
const calls=[];
test('each approved translation selects its own fixed Bible ID',async()=>{
 const requested=[];
 await mockedFetch(async url=>{const edition=TRANSLATIONS.find(e=>e.bibleId&&url.includes(e.bibleId));requested.push(edition.code);return Response.json(passage(edition.code));},async()=>{
  for(const translation of ['NASB20','NIV','NKJV'])assert.equal((await onRequestGet({request:request('Genesis 1',translation),env:{API_BIBLE_KEY:'test-key'}})).status,200);
  assert.deepEqual(requested,['NASB20','NIV','NKJV']);
 });
});
test('new editions require their own secret and never silently return ESV',async()=>{
 for(const translation of ['NASB20','NIV','NKJV']){
  const res=await onRequestGet({request:request('John 3:16',translation),env:{ESV_API_KEY:'crossway-only'}});
  assert.equal(res.status,503);const body=await res.json();assert.equal(body.code,'not_configured');assert.ok(body.message.includes(translation));
 }
});
test('arbitrary editions, hosts and oversized ranges cannot reach the upstream API',async()=>{
 await mockedFetch(()=>assert.fail('Invalid requests must not call the upstream'),async()=>{
  for(const [ref,translation] of [['John 3:16','https://evil.test'],['John 3:1-31','NIV'],['https://evil.test','NIV'],['Genesis 51','NASB20']])assert.equal((await onRequestGet({request:request(ref,translation),env:{API_BIBLE_KEY:'test'}})).status,400);
 });
});
test('API errors give actionable messages without returning upstream bodies or keys',async()=>{
 for(const [status,expected,code] of [[401,502,'translation_unavailable'],[403,502,'translation_unavailable'],[404,404,'passage_unavailable'],[429,429,'rate_limited'],[500,502,'upstream_failure']]){
  await mockedFetch(async()=>new Response('private-upstream-information',{status}),async()=>{
   const res=await onRequestGet({request:request('John 3:16','NIV'),env:{API_BIBLE_KEY:'private-key'}});
   assert.equal(res.status,expected);const text=await res.text();assert.equal(JSON.parse(text).code,code);assert.ok(!text.includes('private-upstream-information'));assert.ok(!text.includes('private-key'));
  });
 }
});
test('wrong edition, missing copyright and malformed payloads are rejected',async()=>{
 for(const body of [passage('NIV',{copyright:''}),passage('NKJV'),{data:{content:null}},{}]){
  await mockedFetch(async()=>Response.json(body),async()=>assert.equal((await onRequestGet({request:request('John 3:16','NIV'),env:{API_BIBLE_KEY:'test'}})).status,502));
 }
});
test('upstream failures and excessive responses fail safely',async()=>{
 for(const mock of [async()=>{throw new Error('network failure');},async()=>new Response('x'.repeat(1024*1024+1))])await mockedFetch(mock,async()=>{
  const res=await onRequestGet({request:request('John 3','NIV'),env:{API_BIBLE_KEY:'test'}});assert.equal(res.status,502);assert.equal((await res.json()).code,'upstream_unavailable');
 });
});
