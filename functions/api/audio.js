import {parseRef} from '../../public/assets/books.js';

const ERRORS={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const reply=(status,code,message)=>new Response(JSON.stringify({code,message}),{status,headers:ERRORS});
const AUDIO_PATH=/^\/hw\/\d{8}-\d{8}\.mp3$/;

/** ESV's own documented audio endpoint redirects to audio.esv.org.
 * The token is used only with api.esv.org, never with the user's browser or MP3 host.
 */
export function validatedAudioDestination(raw){
 try{
  const link=new URL(raw);
  if(link.protocol!=='https:'||link.hostname!=='audio.esv.org'||link.port||link.username||link.password||link.search||link.hash||!AUDIO_PATH.test(link.pathname))return null;
  return link.href;
 }catch{return null;}
}
export async function onRequestGet({request,env}){
 const params=new URL(request.url).searchParams,q=params.get('q')||'';
 if((params.get('translation')||'ESV').toUpperCase()!=='ESV')return reply(400,'esv_only','Audio is available only for the ESV.');
 const ref=parseRef(q);
 if(!ref||q.length>70||(ref.end!==null&&ref.end-ref.verse>29))return reply(400,'invalid_reference','Choose a verse, a range up to 30 verses, or a chapter.');
 if(!env.ESV_API_KEY)return reply(503,'not_configured','ESV audio is not configured.');
 const range=request.headers.get('range');
 if(range&&!/^bytes=(0|[1-9]\d*)-(0|[1-9]\d*)?$/.test(range))return reply(416,'invalid_range','Only one audio byte range is supported.');
 const source=new URL('https://api.esv.org/v3/passage/audio/');
 source.searchParams.set('q',ref.formatted);
 try{
  const provider=await fetch(source.href,{
   headers:{Authorization:'Token '+env.ESV_API_KEY,Accept:'audio/mpeg'},
   redirect:'manual',signal:AbortSignal.timeout(12000)
  });
  if([301,302,303,307,308].includes(provider.status)){
   const target=validatedAudioDestination(provider.headers.get('location'));
   if(!target)return reply(502,'invalid_audio_redirect','The publisher returned an unrecognised audio destination.');
   return new Response(null,{status:302,headers:{
    Location:target,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'
   }});
  }
  if(provider.status===429)return reply(429,'rate_limited','The ESV audio request limit has been reached. Try again later.');
  if(provider.status===404)return reply(404,'audio_unavailable','Audio for this passage is unavailable.');
  if(provider.status!==200&&provider.status!==206)return reply(503,'audio_provider_unavailable','ESV audio is temporarily unavailable.');
  // Support an official direct MP3 response without assuming that all API responses redirect.
  const contentType=(provider.headers.get('content-type')||'').split(';')[0].trim().toLowerCase();
  if(!['audio/mpeg','audio/mp3'].includes(contentType)||!provider.body)return reply(502,'invalid_audio','ESV did not return an MP3.');
  const size=provider.headers.get('content-length');
  if(size&&(!/^\d+$/.test(size)||Number(size)>75*1024*1024))return reply(502,'invalid_audio','ESV audio is unavailable.');
  const headers=new Headers({'Content-Type':'audio/mpeg','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Content-Disposition':'inline'});
  for(const name of ['content-range','accept-ranges']){const value=provider.headers.get(name);if(value)headers.set(name,value);}
  return new Response(provider.body,{status:provider.status,headers});
 }catch{return reply(503,'upstream_unavailable','ESV audio is temporarily unavailable. Please try again.');}
}
