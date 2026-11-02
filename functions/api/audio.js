import {parseRef} from '../../public/assets/books.js';

const HEADERS={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const error=(status,code,message)=>new Response(JSON.stringify({code,message}),{status,headers:HEADERS});
// Crossway's redirect can point to its own sites or common audio CDNs.
const trustedHost=host=>['esv.org','crossway.org','cloudfront.net','amazonaws.com'].some(domain=>host===domain||host.endsWith('.'+domain));

export async function onRequestGet({request,env}){
 const url=new URL(request.url),q=url.searchParams.get('q')||'';
 if((url.searchParams.get('translation')||'ESV').toUpperCase()!=='ESV')return error(400,'esv_only','Audio is available only for the ESV.');
 const ref=parseRef(q);
 if(!ref||q.length>70||(ref.end!==null&&ref.end-ref.verse>29))return error(400,'invalid_reference','Choose a verse, a range up to 30 verses, or a chapter.');
 if(!env.ESV_API_KEY)return error(503,'not_configured','ESV audio is not configured.');
 const range=request.headers.get('range');
 if(range&&!/^bytes=(0|[1-9]\d*)-(0|[1-9]\d*)?$/.test(range))return error(416,'invalid_range','Only one audio byte range is supported.');
 try{
  const source=new URL('https://api.esv.org/v3/passage/audio/');
  source.searchParams.set('q',ref.formatted);
  let response=await fetch(source.href,{headers:{Authorization:'Token '+env.ESV_API_KEY,Accept:'audio/mpeg'},redirect:'manual',signal:AbortSignal.timeout(12000)});
  if([301,302,303,307,308].includes(response.status)){
   const location=response.headers.get('location');
   if(!location)return error(502,'audio_redirect','ESV audio is unavailable.');
   const target=new URL(location,source);
   if(target.protocol!=='https:'||target.username||target.password||target.port||!trustedHost(target.hostname))return error(502,'audio_redirect','ESV audio is unavailable.');
   // Do not send the token, cookies or any browser headers to the media host.
   // A short fetch timeout would abort an active MP3 stream before long chapters finish.
   response=await fetch(target.href,{headers:range?{Range:range}:{},redirect:'manual'});
  }
  if(response.status===429)return error(429,'rate_limited','Crossway audio request limit reached. Try again later.');
  if(response.status===404)return error(404,'unavailable','Audio for this passage is unavailable.');
  if(response.status===416)return error(416,'range_unavailable','The audio byte range is unavailable.');
  if(response.status!==200&&response.status!==206)return error(502,'upstream_failure','ESV audio is temporarily unavailable.');
  const type=(response.headers.get('content-type')||'').split(';')[0].trim().toLowerCase();
  if(!['audio/mpeg','audio/mp3','application/octet-stream'].includes(type)||!response.body)return error(502,'invalid_audio','ESV audio is temporarily unavailable.');
  const len=response.headers.get('content-length');
  if(len&&(!/^\d+$/.test(len)||Number(len)>75*1024*1024))return error(502,'invalid_audio','ESV audio is temporarily unavailable.');
  const headers=new Headers({'Content-Type':'audio/mpeg','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Cross-Origin-Resource-Policy':'same-origin','Content-Disposition':'inline'});
  for(const name of ['content-length','content-range','accept-ranges']){const value=response.headers.get(name);if(value)headers.set(name,value);}
  return new Response(response.body,{status:response.status,headers});
 }catch{return error(502,'upstream_unavailable','ESV audio is temporarily unavailable. Please try again.');}
}
