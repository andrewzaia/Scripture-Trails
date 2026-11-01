// API.Bible documents a manual FUMS v3 GET endpoint. No third-party JavaScript
// needs to run in the origin that also stores visitors' private study notes.
const DEVICE_KEY='scripture-trails:fums-device-id';
const SESSION_KEY='scripture-trails:fums-session-id';
let fallbackDevice=null,fallbackSession=null;
const safeStore=kind=>{try{return kind==='session'?window.sessionStorage:window.localStorage;}catch{return null;}};
function identifier(kind){
 const store=safeStore(kind),key=kind==='session'?SESSION_KEY:DEVICE_KEY;
 try{const saved=store?.getItem(key);if(saved&&/^[0-9a-f-]{36}$/i.test(saved))return saved;}catch{}
 const prior=kind==='session'?fallbackSession:fallbackDevice;
 if(prior)return prior;
 const id=crypto.randomUUID();
 if(kind==='session')fallbackSession=id;else fallbackDevice=id;
 try{store?.setItem(key,id);}catch{/* Consent-independent pseudonymous fallback is in memory only. */}
 return id;
}
export function fumsViewUrl(token,deviceId,sessionId){
 if(typeof token!=='string'||token.length<12||token.length>4096||!/^[a-zA-Z0-9_-]+$/.test(token))return null;
 if(!/^[0-9a-f-]{36}$/i.test(deviceId)||!/^[0-9a-f-]{36}$/i.test(sessionId))return null;
 const url=new URL('https://fums.api.bible/f3');
 url.searchParams.set('t',token);
 url.searchParams.set('dId',deviceId);
 url.searchParams.set('sId',sessionId);
 return url;
}
// A browser image request uses the API.Bible documented FUMS GET pixel.
// Unlike their remote tracker script, it cannot read the notebook stored here.
// The endpoint may return HTTP 200 with a non-image body, so onerror only
// releases the image reference; it does not establish reporting failure.
const activePixels=new Set();
export function reportScriptureView(meta){
 const token=meta?.token;
 if(!token||typeof Image==='undefined')return false;
 const url=fumsViewUrl(token,identifier('device'),identifier('session'));
 if(!url)return false;
 let pixel=null,timeout=null;
 const cleanup=()=>{
  if(timeout!==null){clearTimeout(timeout);timeout=null;}
  if(pixel){activePixels.delete(pixel);pixel.onload=null;pixel.onerror=null;}
 };
 try{
  pixel=new Image(1,1);
  pixel.referrerPolicy='no-referrer';
  pixel.onload=cleanup;
  pixel.onerror=cleanup;
  activePixels.add(pixel);
  timeout=setTimeout(cleanup,12000);
  // FUMS must record every display, even if the same token is reused from cache.
  // A per-view nonce prevents browser image-cache reuse without changing device/session IDs.
  url.searchParams.set('cb',crypto.randomUUID());
  pixel.src=url.href;
  return true;
 }catch{cleanup();return false;}
}
