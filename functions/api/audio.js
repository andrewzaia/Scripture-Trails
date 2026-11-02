import {parseRef} from '../../public/assets/books.js';

const HEADERS={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const error=(status,code,message)=>new Response(JSON.stringify({code,message}),{status,headers:HEADERS});
const MAX_PUBLISHER_BYTES=1024*1024;
// Crossway's HTML API publishes an audio URL for the exact requested passage.
// Only that official media origin and expected MP3 filename format are accepted.
function audioLink(payload,ref){
 if(parseRef(payload?.canonical)?.formatted!==ref.formatted||!Array.isArray(payload.passages)||payload.passages.length!==1||typeof payload.passages[0]!=='string')return null;
 const markup=payload.passages[0];
 const links=[...markup.matchAll(/href=["'](https:\/\/audio\.esv\.org\/hw\/\d{8}-\d{8}\.mp3)["']/g)].map(x=>x[1]);
 if(links.length===1)return links[0];
 // An unexpected publisher link must never be replaced with a guessed URL.
 if(links.length>1||/mp3link|audio\.esv\.org|\.mp3/i.test(markup))return null;
 // Crossway publishes the canonical start/end IDs in its parsed range metadata.
 // Only one contiguous, validated 8-digit passage range is eligible.
 const parsed=payload.parsed;
 if(!Array.isArray(parsed)||parsed.length!==1||!Array.isArray(parsed[0])||parsed[0].length!==2)return null;
 const [start,end]=parsed[0];
 if(!Number.isInteger(start)||!Number.isInteger(end)||start<10000000||end>99999999||end<start)return null;
 return 'https://audio.esv.org/hw/'+start+'-'+end+'.mp3';
}
async function boundedJson(response){
 if(!response.body)throw Error('Missing publisher body');
 const reader=response.body.getReader(),chunks=[];let size=0;
 try{
  while(true){
   const {done,value}=await reader.read();if(done)break;
   size+=value.byteLength;if(size>MAX_PUBLISHER_BYTES)throw Error('Oversized publisher passage');
   chunks.push(value);
  }
 }finally{await reader.cancel().catch(()=>{});}
 const bytes=new Uint8Array(size);let off=0;for(const chunk of chunks){bytes.set(chunk,off);off+=chunk.byteLength;}
 return JSON.parse(new TextDecoder().decode(bytes));
}
export async function onRequestGet({request,env}){
 const url=new URL(request.url),q=url.searchParams.get('q')||'';
 if((url.searchParams.get('translation')||'ESV').toUpperCase()!=='ESV')return error(400,'esv_only','Audio is available only for the ESV.');
 const ref=parseRef(q);
 if(!ref||q.length>70||(ref.end!==null&&ref.end-ref.verse>29))return error(400,'invalid_reference','Choose a verse, a range up to 30 verses, or a chapter.');
 if(!env.ESV_API_KEY)return error(503,'not_configured','ESV audio is not configured.');
 const range=request.headers.get('range');
 if(range&&!/^bytes=(0|[1-9]\d*)-(0|[1-9]\d*)?$/.test(range))return error(416,'invalid_range','Only one audio byte range is supported.');
 try{
  const source=new URL('https://api.esv.org/v3/passage/html/');
  source.searchParams.set('q',ref.formatted);
  source.searchParams.set('include-audio-link','true');
  source.searchParams.set('include-passage-references','true');
  source.searchParams.set('include-verse-numbers','false');
  source.searchParams.set('include-footnotes','false');
  // Preserve the passage reference heading that Crossway uses for audio links.
  source.searchParams.set('include-headings','true');
  source.searchParams.set('include-short-copyright','false');
  const publisher=await fetch(source.href,{headers:{Authorization:'Token '+env.ESV_API_KEY,Accept:'application/json'},redirect:'manual',signal:AbortSignal.timeout(12000)});
  if(publisher.status===429)return error(429,'rate_limited','Crossway request limit reached. Please try again later.');
  if(publisher.status===404)return error(404,'unavailable','Audio for this passage is unavailable.');
  if(publisher.status!==200)return error(503,'publisher_unavailable','Crossway could not provide passage audio.');
  const payload=await boundedJson(publisher);
  const link=audioLink(payload,ref);
  if(!link)return error(503,'audio_link_invalid','Crossway did not provide an audio recording for this reference.');
  // The browser never sees the publisher token and the media host receives no token.
  // Avoid a short timeout on the ongoing stream, which could interrupt long chapters.
  const response=await fetch(link,{headers:range?{Range:range}:{},redirect:'manual'});
  if(response.status===429)return error(429,'rate_limited','ESV audio request limit reached. Please try again later.');
  if(response.status===404)return error(404,'unavailable','Audio for this passage is unavailable.');
  if(response.status===416)return error(416,'range_unavailable','The requested audio byte range is unavailable.');
  if(response.status!==200&&response.status!==206)return error(503,'media_unavailable','The ESV audio recording is temporarily unavailable.');
  const type=(response.headers.get('content-type')||'').split(';')[0].trim().toLowerCase();
  if(!['audio/mpeg','audio/mp3','application/octet-stream'].includes(type)||!response.body)return error(503,'invalid_audio','ESV audio is temporarily unavailable.');
  const len=response.headers.get('content-length');
  if(len&&(!/^\d+$/.test(len)||Number(len)>75*1024*1024))return error(503,'invalid_audio','ESV audio is temporarily unavailable.');
  const headers=new Headers({'Content-Type':'audio/mpeg','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Cross-Origin-Resource-Policy':'same-origin','Content-Disposition':'inline'});
  // Cloudflare calculates stream length. Do not propagate publisher Content-Length.
  for(const name of ['content-range','accept-ranges']){const value=response.headers.get(name);if(value)headers.set(name,value);}
  return new Response(response.body,{status:response.status,headers});
 }catch{return error(503,'upstream_unavailable','ESV audio is temporarily unavailable. Please try again.');}
}
