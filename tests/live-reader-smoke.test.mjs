import test from 'node:test';
import assert from 'node:assert/strict';
import {checkLiveReader,READER_PROBES} from '../scripts/check-live-reader.mjs';
const copyright='Synthetic test publisher notice. No Bible text.';
const fakeResponse=(code='ESV',ref='John 3:16',options={})=>{
  const body={canonical:ref,passages:['<p>Invented test fixture - no publisher content.</p>']};
  if(code!=='ESV')Object.assign(body,{translation:code,provider:'API.Bible',copyright});
  Object.assign(body,options.payload||{});
  return new Response(JSON.stringify(body),{status:options.status||200,headers:{'cache-control':options.cache??'no-store'}});
};
test('production probe targets all four editions and three canonical representative passages without storing text',async()=>{
 const calls=[];
 const results=await checkLiveReader({fetcher:async url=>{
  const code=url.searchParams.get('translation'),ref=url.searchParams.get('q');
  assert.equal(url.origin,'https://www.scripturetrails.com');
  calls.push([code,ref]);return fakeResponse(code,ref);
 }});
 assert.equal(calls.length,12);assert.equal(results.length,12);
 assert.deepEqual(new Set(calls.map(([code])=>code)),new Set(['ESV','NASB20','NIV','NKJV']));
 assert.deepEqual(new Set(calls.map(([,ref])=>ref)),new Set(READER_PROBES));
 assert.ok(!JSON.stringify(results).includes('Invented test fixture'));
});
test('live provider probe fails closed on unavailable editions, wrong translation, missing copyright and caching',async()=>{
 for(const variant of [
  {status:503},{status:429},{cache:'public, max-age=60'},
  {payload:{passages:[]}},{payload:{copyright:''}},
  {payload:{translation:'NKJV'}},{payload:{provider:'untrusted'}},{payload:{canonical:''}}
 ]){
  await assert.rejects(()=>checkLiveReader({editions:['NIV'],references:['John 3:16'],fetcher:async()=>fakeResponse('NIV','John 3:16',variant)}));
 }
});
test('live probe forbids insecure or credential-bearing target origins and unapproved edition codes',async()=>{
 for(const origin of ['http://www.scripturetrails.com','https://user:pass@example.com/','https://example.com/?key=x','https://example.com/other']){
  await assert.rejects(()=>checkLiveReader({origin,fetcher:()=>assert.fail('Must reject before request')}),/HTTPS site root/);
 }
 await assert.rejects(()=>checkLiveReader({editions:['OTHER'],fetcher:()=>assert.fail('Must reject before request')}),/Unexpected translation/);
});
