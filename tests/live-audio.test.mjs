import test from 'node:test';
import assert from 'node:assert/strict';
import {checkLiveAudio} from '../scripts/check-live-audio.mjs';
const audioHeaders={'Content-Type':'audio/mpeg','Cache-Control':'private, no-store','Content-Range':'bytes 0-3/900'};
function fixture({version='1.1.1',status=206,bytes=[73,68,51,4],type='audio/mpeg',forbidNiv=true}={}){
 const calls=[];
 return {calls,fetcher:async(url,opts)=>{
  calls.push({url:url.toString(),opts});
  if(url.pathname==='/')return new Response('<footer><span id="site-version" class="site-version">v'+version+'</span></footer>');
  if(url.searchParams.get('translation')==='NIV')return Response.json({code:forbidNiv?'esv_only':'other'},{status:forbidNiv?400:200});
  return new Response(new Uint8Array(bytes),{status,headers:{...audioHeaders,'Content-Type':type}});
 }};
}
test('live MP3 check verifies bytes and no-store without revealing credentials',async()=>{
 const {calls,fetcher}=fixture();
 const result=await checkLiveAudio({fetcher,expectedVersion:'1.1.1'});
 assert.equal(result.audioStatus,206);assert.equal(result.nonEsvStatus,400);
 assert.equal(calls.length,3);
 assert.equal(new URL(calls[1].url).searchParams.get('q'),'John 11:35');
 assert.equal(calls[1].opts.headers.Range,'bytes=0-1023');
 assert.equal(calls[1].opts.redirect,'manual');
 assert.ok(calls.every(c=>!Object.values(c.opts.headers).some(v=>/Token|secret/.test(v))));
});
test('invalid MP3, wrong content type, upstream outage and open translation access all fail',async()=>{
 for(const cfg of [{status:502},{type:'text/html'},{bytes:[0,0,0,0]},{forbidNiv:false}]){
  await assert.rejects(checkLiveAudio({fetcher:fixture(cfg).fetcher}),/Live ESV|Non-ESV/);
 }
});
test('raw MPEG frame headers are accepted as well as ID3',async()=>{
 const result=await checkLiveAudio({fetcher:fixture({bytes:[255,251,144,100]}).fetcher});
 assert.equal(result.audioStatus,206);
});
test('live version and origin must be authentic',async()=>{
 await assert.rejects(checkLiveAudio({fetcher:fixture({version:'1.1.0'}).fetcher,expectedVersion:'1.1.1'}),/Production version mismatch/);
 for(const origin of ['http://www.scripturetrails.com','https://example.com/','https://www.scripturetrails.com/other','https://www.scripturetrails.com/?token=secret']){
  await assert.rejects(checkLiveAudio({origin,fetcher:()=>assert.fail('Forbidden origin reached')}),/HTTPS|approved production origin/);
 }
});
test('a production build may await the intended live footer version',async()=>{
 let count=0;const base=fixture();
 const result=await checkLiveAudio({fetcher:async(url,options)=>{
  if(url.pathname==='/'&&count++===0)return new Response('<span id="site-version">v1.1.0</span>');
  return base.fetcher(url,options);
 },expectedVersion:'1.1.1',waitForDeployment:true,sleep:async()=>{}});
 assert.equal(result.version,'1.1.1');
});

test('Crossway redirect is verified from the actual official media host without sending any token',async()=>{
 const calls=[];
 const link='https://audio.esv.org/hw/43011035-43011035.mp3';
 const fetcher=async(url,options)=>{
  calls.push({url:url.toString(),options});
  if(url.pathname==='/api/audio'&&url.searchParams.get('translation')==='NIV')return Response.json({code:'esv_only'},{status:400});
  if(url.pathname==='/api/audio')return new Response(null,{status:302,headers:{Location:link,'Cache-Control':'private, no-store'}});
  if(url.hostname==='audio.esv.org')return new Response(new Uint8Array([73,68,51,4]),{status:206,headers:{'Content-Type':'audio/mpeg','Content-Range':'bytes 0-3/900'}});
  if(url.pathname==='/api/passage')return Response.json({canonical:'John 11:35',passages:['synthetic']});
  if(url.searchParams.get('translation')==='NIV')return Response.json({code:'esv_only'},{status:400});
  return new Response('Unexpected', {status:500});
 };
 const result=await checkLiveAudio({fetcher,verifyRemoteMedia:true});
 assert.equal(result.routeStatus,302);
 assert.equal(result.audioStatus,206);
 assert.equal(calls.length,3);
 assert.equal(calls[1].url,link);
 assert.equal(calls[1].options.headers.Range,'bytes=0-1023');
 assert.ok(calls.every(c=>c.options.headers.Authorization===undefined));
});
test('untrusted redirects are rejected before visiting the media host',async()=>{
 const calls=[];
 const fetcher=async(url)=>{calls.push(url.href);return new Response(null,{status:302,headers:{Location:'https://evil.example/hw/43011035-43011035.mp3','Cache-Control':'private, no-store'}});};
 await assert.rejects(checkLiveAudio({fetcher}),/approved MP3 host/);
 assert.equal(calls.length,1);
});

test('default production check validates official streaming redirect without depending on GitHub CDN egress',async()=>{
 const link='https://audio.esv.org/hw/43011035-43011035.mp3',calls=[];
 const fetcher=async(url)=>{
  calls.push(url.href);
  if(url.pathname==='/api/audio'&&url.searchParams.get('translation')==='NIV')return Response.json({code:'esv_only'},{status:400});
  if(url.pathname==='/api/audio')return new Response(null,{status:302,headers:{Location:link,'Cache-Control':'private, no-store'}});
  throw Error('GitHub runner must not fetch audio.esv.org in the routine production gate');
 };
 const result=await checkLiveAudio({fetcher});
 assert.equal(result.routeStatus,302);
 assert.equal(result.mediaBytesVerified,false);
 assert.equal(result.audioStatus,null);
 assert.equal(result.nonEsvStatus,400);
 assert.equal(calls.length,2);
});
test('explicit CDN byte-level check fails rather than claiming success if the media host cannot be reached',async()=>{
 const fetcher=async(url)=>{
  if(url.hostname==='audio.esv.org')throw Error('CDN blocked in test runner');
  return new Response(null,{status:302,headers:{Location:'https://audio.esv.org/hw/43011035-43011035.mp3','Cache-Control':'private, no-store'}});
 };
 await assert.rejects(checkLiveAudio({fetcher,verifyRemoteMedia:true}),/CDN blocked/);
});
