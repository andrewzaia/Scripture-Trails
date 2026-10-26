import test from 'node:test';
import assert from 'node:assert/strict';
import {onRequestGet} from '../functions/api/translations.js';
import {statusForResponse} from '../public/assets/translation-status.js';

test('translation configuration checks do not call providers or expose credentials',async()=>{
 const original=globalThis.fetch;
 globalThis.fetch=()=>assert.fail('Status checks must not use Scripture API quota');
 try{
  for(const env of [{},{ESV_API_KEY:'private-crossway'},{API_BIBLE_KEY:'private-api-bible'},{ESV_API_KEY:'private-crossway',API_BIBLE_KEY:'private-api-bible'}]){
   const response=onRequestGet({env});
   assert.equal(response.status,200);
   assert.equal(response.headers.get('cache-control'),'no-store');
   const text=await response.text();
   assert.ok(!text.includes('private-'));
   assert.deepEqual(JSON.parse(text).translations,[
    {code:'ESV',configured:Boolean(env.ESV_API_KEY)},
    ...['NASB20','NIV','NKJV'].map(code=>({code,configured:Boolean(env.API_BIBLE_KEY)}))
   ]);
  }
 }finally{globalThis.fetch=original;}
});

test('reading status distinguishes missing setup, limits and an unavailable passage',()=>{
 assert.equal(statusForResponse(200),'available');
 assert.equal(statusForResponse(503,'not_configured'),'not_configured');
 assert.equal(statusForResponse(429,'upstream_failure'),'rate_limited');
 assert.equal(statusForResponse(404,'passage_unavailable'),'passage_unavailable');
 assert.equal(statusForResponse(502,'translation_unavailable'),'unavailable');
 assert.equal(statusForResponse(502,'upstream_unavailable'),'unavailable');
});
