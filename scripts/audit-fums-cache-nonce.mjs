import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';

// Test a publisher-documented GET with a new, anonymous cache nonce on each view.
// Never output any publisher token, anonymous ID, tokenised URL, or Bible text.
const response=await fetch('https://www.scripturetrails.com/api/passage?q=John%203%3A16&translation=NIV',{headers:{Accept:'application/json'},redirect:'error',signal:AbortSignal.timeout(15000)});
assert.equal(response.status,200,'Production NIV API response unavailable');
const body=await response.json();
const token=body.fums?.token;
assert.ok(typeof token==='string'&&token.length>12&&/^[a-zA-Z0-9_-]+$/.test(token),'Missing validated publisher FUMS token');
const dId=randomUUID(),sId=randomUUID(),results=[];
for(let i=0;i<2;i++){
 const url=new URL('https://fums.api.bible/f3');
 url.searchParams.set('t',token);
 url.searchParams.set('dId',dId);
 url.searchParams.set('sId',sId);
 url.searchParams.set('cb',randomUUID());
 const r=await fetch(url,{method:'GET',redirect:'manual',headers:{Accept:'image/gif'},signal:AbortSignal.timeout(15000)});
 results.push({status:r.status,redirected:r.status>=300&&r.status<400,cacheControl:r.headers.get('cache-control')||null,contentType:r.headers.get('content-type')||null});
 await r.body?.cancel().catch(()=>{});
}
const safe={productionOrigin:'www.scripturetrails.com',fumsHostname:'fums.api.bible',requests:results,stableAnonymousIDs:true,uniquePerViewNonce:true,secretDataLogged:false};
console.log(JSON.stringify(safe));
assert.ok(results.every(x=>x.status===200&&!x.redirected),'Publisher did not accept repeated GETs with an anonymous per-view cache parameter');
