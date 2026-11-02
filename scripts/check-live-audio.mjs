import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
// An independent production-only check: never trust the site's link validator.
function validatedAudioDestination(raw){
 try{
  const u=new URL(raw);
  return u.protocol==='https:'&&u.hostname==='audio.esv.org'&&!u.port&&!u.username&&!u.password&&!u.search&&!u.hash&&/^\/hw\/\d{8}-\d{8}\.mp3$/.test(u.pathname)?u.href:null;
 }catch{return null;}
}

const DEFAULT_ORIGIN='https://www.scripturetrails.com';
const pause=ms=>new Promise(done=>setTimeout(done,ms));
const AUDIO_REFERENCE='John 11:35';
function validateOrigin(origin){
 const base=new URL(origin);
 if(base.protocol!=='https:'||base.username||base.password||base.port||base.pathname!=='/'||base.search||base.hash)throw Error('Use a clean HTTPS website root');
 if(base.origin!==DEFAULT_ORIGIN)throw Error('Live checks must target the approved production origin');
 return base;
}
const isMp3=bytes=>(bytes[0]===73&&bytes[1]===68&&bytes[2]===51)||(bytes[0]===255&&(bytes[1]&224)===224);
async function fetchLive(fetcher,url,options){
 return fetcher(url,{redirect:'error',cache:'no-store',signal:AbortSignal.timeout(20000),...options});
}
export async function checkLiveAudio({fetcher=fetch,origin=DEFAULT_ORIGIN,expectedVersion=null,waitForDeployment=false,sleep=pause,waitLimitMs=150000,verifyRemoteMedia=false}={}){
 const base=validateOrigin(origin);
 if(expectedVersion&&!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(expectedVersion))throw Error('Invalid expected release version');
 if(waitForDeployment&&!expectedVersion)throw Error('A release version is required to await deployment');
 if(expectedVersion){
  const start=Date.now();let actual='';
  do{
   const home=new URL('/',base);home.searchParams.set('release-check',expectedVersion);
   const response=await fetchLive(fetcher,home,{headers:{Accept:'text/html'}});
   if(!response.ok)throw Error('Live website HTTP '+response.status);
   const html=await response.text();
   actual=html.match(/id="site-version"[^>]*>v(\d+\.\d+\.\d+)<\/span>/)?.[1]||'missing';
   if(actual===expectedVersion)break;
   if(!waitForDeployment||Date.now()-start>=waitLimitMs)throw Error('Production version mismatch: expected '+expectedVersion+', found '+actual);
   await sleep(7000);
  }while(true);
 }
 const url=new URL('/api/audio',base);url.searchParams.set('q',AUDIO_REFERENCE);url.searchParams.set('translation','ESV');
 const response=await fetchLive(fetcher,url,{headers:{Range:'bytes=0-1023',Accept:'audio/mpeg'},redirect:'manual'});
 const siteCache=response.headers.get('cache-control')||'';
 if(!/(?:^|[, ]+)no-store(?:$|[, ]+)/i.test(siteCache))throw Error('ESV audio redirect or response must not be cached by Scripture Trails');
 let media=response;
 if([301,302,303,307,308].includes(response.status)){
  const location=validatedAudioDestination(response.headers.get('location'));
  if(!location)throw Error('Publisher redirect did not point to an approved MP3 host');
  if(location!=='https://audio.esv.org/hw/43011035-43011035.mp3')throw Error('ESV audio redirect did not match the requested test verse');
  // Some CI networks cannot reach Crossway's CDN. Always prove that the website
  // returns an approved non-cached destination; verify actual bytes only from
  // an environment with independently established CDN connectivity.
  media=verifyRemoteMedia?await fetchLive(fetcher,new URL(location),{headers:{Range:'bytes=0-1023',Accept:'audio/mpeg'},redirect:'error'}):null;
 }
 if(media){
 if(media.status!==200&&media.status!==206){
  const body=await media.json().catch(()=>({}));
  const code=typeof body?.code==='string'&&/^[a-z_]{1,50}$/.test(body.code)?body.code:'unknown';
  const kind=(media.headers.get('content-type')||'missing').split(';')[0].slice(0,60);
  const server=(media.headers.get('server')||'missing').slice(0,30);
  let readerStatus='unavailable';
  try{const passage=new URL('/api/passage',base);passage.searchParams.set('q',AUDIO_REFERENCE);passage.searchParams.set('translation','ESV');const test=await fetchLive(fetcher,passage,{headers:{Accept:'application/json'}});readerStatus=String(test.status);await test.body?.cancel();}catch{}
  throw Error('Live ESV MP3 HTTP '+media.status+' ('+code+', type='+kind+', server='+server+', text-api='+readerStatus+')');
 }
 if(media.headers.get('content-type')?.split(';')[0].trim().toLowerCase()!=='audio/mpeg')throw Error('Live ESV MP3 content type mismatch');
 if(media.status===206&&!/^bytes 0-\d+\/(?:\d+|\*)$/.test(media.headers.get('content-range')||''))throw Error('Unexpected MP3 byte range');
 if(!media.body)throw Error('Live MP3 body is missing');
 const reader=media.body.getReader();let first=new Uint8Array(0);
 try{
  for(let i=0;i<3&&first.length<4;i++){
   const {done,value}=await reader.read();if(done)break;
   const joined=new Uint8Array(Math.min(16,first.length+value.length));
   joined.set(first.slice(0,joined.length));
   joined.set(value.slice(0,joined.length-first.length),first.length);
   first=joined;
  }
 }finally{await reader.cancel().catch(()=>{});}
 if(first.length<2||!isMp3(first))throw Error('Live ESV audio did not begin with an MP3 header');
 }
 const rejected=new URL('/api/audio',base);rejected.searchParams.set('q',AUDIO_REFERENCE);rejected.searchParams.set('translation','NIV');
 const wrong=await fetchLive(fetcher,rejected,{headers:{Accept:'application/json'}});
 if(wrong.status!==400)throw Error('Non-ESV audio restriction failed: HTTP '+wrong.status);
 const denial=await wrong.json().catch(()=>({}));
 if(denial.code!=='esv_only')throw Error('Non-ESV audio restriction returned an unexpected result');
 return {reference:AUDIO_REFERENCE,audioStatus:media?.status??null,routeStatus:response.status,nonEsvStatus:wrong.status,version:expectedVersion||null,mediaBytesVerified:Boolean(media)};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  const expectedVersion=process.env.SCRIPTURE_TRAILS_EXPECTED_VERSION||null;
  const result=await checkLiveAudio({expectedVersion,waitForDeployment:Boolean(expectedVersion),verifyRemoteMedia:process.env.SCRIPTURE_TRAILS_VERIFY_MEDIA==='1'});
  console.log(result.mediaBytesVerified?
   'Production ESV MP3 bytes verified: valid audio header, secure routing, ESV-only access'+(result.version?', v'+result.version:'')+'. No recording retained.':
   'Production ESV audio route verified: approved MP3 destination, no-store, ESV-only access'+(result.version?', v'+result.version:'')+'. CDN bytes require independent browser playback verification.');
 }catch(error){console.error('Production ESV audio FAILED: '+error.message);process.exitCode=1;}
}
