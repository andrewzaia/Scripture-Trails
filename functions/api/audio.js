import {parseRef} from '../../public/assets/books.js';

const HEADERS={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const problem=(status,code,message)=>new Response(JSON.stringify({code,message}),{status,headers:HEADERS});
const MAX_PUBLISHER_BYTES=1024*1024;

/** Validate the Crossway API's canonical 8-digit book/chapter/verse range.
 * No MP3 is downloaded, generated from user-controlled URLs or stored by Scripture Trails.
 */
export function audioUrlFromMetadata(payload,reference){
 // Crossway formats canonical verse ranges with a Unicode range separator.
 // Normalise formatting only; numeric book/chapter/verse validation stays strict.
 const canonical=parseRef(typeof payload?.canonical==='string'?payload.canonical.replace(/\u2013/g,'-'):null);
 if(!canonical||canonical.formatted!==reference.formatted)return null;
 const ranges=payload?.parsed;
 if(!Array.isArray(ranges)||ranges.length!==1||!Array.isArray(ranges[0])||ranges[0].length!==2)return null;
 const [start,end]=ranges[0];
 if(!Number.isInteger(start)||!Number.isInteger(end)||start<10000000||end>99999999||start>end)return null;
 const s=String(start),e=String(end);
 const from={book:Number(s.slice(0,2)),chapter:Number(s.slice(2,5)),verse:Number(s.slice(5))};
 const to={book:Number(e.slice(0,2)),chapter:Number(e.slice(2,5)),verse:Number(e.slice(5))};
 const expectedBook=reference.book.index+1,expectedChapter=reference.chapter;
 if(from.book!==expectedBook||to.book!==expectedBook||from.chapter!==expectedChapter||to.chapter!==expectedChapter)return null;
 if(from.verse<1||to.verse>176||to.verse<from.verse)return null;
 if(reference.verse===null){
  if(from.verse!==1)return null;
 }else if(from.verse!==reference.verse||to.verse!==(reference.end??reference.verse))return null;
 return 'https://audio.esv.org/hw/'+s+'-'+e+'.mp3';
}
async function readBounded(response){
 if(!response.body)throw Error('Missing ESV response body');
 const reader=response.body.getReader(),chunks=[];let size=0;
 try{
  while(true){
   const {done,value}=await reader.read();if(done)break;
   size+=value.byteLength;if(size>MAX_PUBLISHER_BYTES)throw Error('ESV metadata response too large');
   chunks.push(value);
  }
 }finally{await reader.cancel().catch(()=>{});}
 const data=new Uint8Array(size);let offset=0;
 for(const chunk of chunks){data.set(chunk,offset);offset+=chunk.byteLength;}
 return JSON.parse(new TextDecoder().decode(data));
}
/** The documented v3/passage/audio/ endpoint redirects to publisher MP3 media.
 * Match that media URL to the requested reference before returning any redirect.
 */
export function validatedPublisherRedirect(location,reference){
 if(typeof location!=='string')return null;
 try{
  const url=new URL(location);
  if(url.protocol!=='https:'||url.hostname!=='audio.esv.org'||url.port||url.username||url.password||url.search||url.hash)return null;
  const match=/^\/hw\/(\d{8})-(\d{8})\.mp3$/.exec(url.pathname);
  if(!match)return null;
  const expected=audioUrlFromMetadata({
   canonical:reference.formatted,
   parsed:[[Number(match[1]),Number(match[2])]]
  },reference);
  return expected===url.href?expected:null;
 }catch{return null;}
}
const responseRedirect=location=>new Response(null,{status:302,headers:{
 Location:location,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'
}});
async function fallbackFromPassageText(ref,key){
 const api=new URL('https://api.esv.org/v3/passage/text/');
 api.searchParams.set('q',ref.formatted);
 for(const name of ['include-passage-references','include-verse-numbers','include-footnotes','include-headings','include-short-copyright'])api.searchParams.set(name,'false');
 try{
  const publisher=await fetch(api.href,{
   headers:{Authorization:'Token '+key,Accept:'application/json'},
   redirect:'manual',signal:AbortSignal.timeout(12000)
  });
  if(publisher.status===429)return problem(429,'rate_limited','ESV request limit reached. Try again later.');
  if(publisher.status===404)return problem(404,'audio_unavailable','Audio for this passage is unavailable.');
  if(publisher.status!==200)return problem(503,'publisher_metadata_unavailable','ESV passage metadata is temporarily unavailable.');
  const payload=await readBounded(publisher);
  const location=audioUrlFromMetadata(payload,ref);
  if(!location)return problem(503,'publisher_reference_invalid','ESV did not return a matching passage reference for audio.');
  return responseRedirect(location);
 }catch{return problem(503,'publisher_metadata_unreachable','ESV passage metadata is temporarily unavailable. Please try again.');}
}
export async function onRequestGet({request,env}){
 const params=new URL(request.url).searchParams,q=params.get('q')||'';
 if((params.get('translation')||'ESV').toUpperCase()!=='ESV')return problem(400,'esv_only','Audio is available only for the ESV.');
 const ref=parseRef(q);
 if(!ref||q.length>70||(ref.end!==null&&ref.end-ref.verse>29))return problem(400,'invalid_reference','Choose a verse, a range up to 30 verses, or a chapter.');
 if(!env.ESV_API_KEY)return problem(503,'not_configured','ESV audio is not configured.');
 const range=request.headers.get('range');
 if(range&&!/^bytes=(0|[1-9]\d*)-(0|[1-9]\d*)?$/.test(range))return problem(416,'invalid_range','Only one audio byte range is supported.');
 // First choice: Crossway's documented audio endpoint (not reconstructed media URLs).
 const official=new URL('https://api.esv.org/v3/passage/audio/');
 official.searchParams.set('q',ref.formatted);
 let provider;
 try{
  provider=await fetch(official.href,{
   headers:{Authorization:'Token '+env.ESV_API_KEY,Accept:'audio/mpeg'},
   redirect:'manual',signal:AbortSignal.timeout(12000)
  });
 }catch{
  // An upstream connection failure does not invalidate the working, strictly
  // checked ESV text-metadata route.
  return fallbackFromPassageText(ref,env.ESV_API_KEY);
 }
 if([301,302,303,307,308].includes(provider.status)){
  const location=validatedPublisherRedirect(provider.headers.get('location'),ref);
  await provider.body?.cancel().catch(()=>{});
  if(!location)return problem(502,'invalid_audio_redirect','Crossway returned an unrecognised audio location.');
  return responseRedirect(location);
 }
 // Respect publisher rate limiting and entitlement errors; don't sidestep them.
 if(provider.status===429)return problem(429,'rate_limited','The ESV audio request limit has been reached.');
 if(provider.status===404)return problem(404,'audio_unavailable','Audio for this passage is unavailable.');
 if(provider.status===401||provider.status===403)return problem(503,'publisher_audio_access_denied','ESV audio access is unavailable for this application.');
 // The documented audio endpoint should redirect. When it is temporarily
 // unavailable, use authenticated, validated text metadata as a fallback.
 if(provider.status>=500&&provider.status<=599){
  await provider.body?.cancel().catch(()=>{});
  return fallbackFromPassageText(ref,env.ESV_API_KEY);
 }
 return problem(502,'unexpected_audio_response','Crossway did not redirect to an ESV MP3 recording.');
}
