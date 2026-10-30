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
export async function reportScriptureView(meta){
 const token=meta?.token;
 const url=fumsViewUrl(token,identifier('device'),identifier('session'));
 if(!url)return;
 try{
  // GET is the API.Bible-documented mechanism. No cookies, referrer, notebook
  // contents, search queries or reader URL are sent. Errors do not hide Scripture.
  await fetch(url.href,{method:'GET',mode:'no-cors',credentials:'omit',referrerPolicy:'no-referrer',cache:'no-store',keepalive:true,redirect:'error'});
 }catch{/* A blocked reporting pixel must not remove the requested passage. */}
}
