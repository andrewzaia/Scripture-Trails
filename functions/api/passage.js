import {parseRef} from '../../public/assets/books.js';

const JSON_HEADERS={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const reply=(status,data)=>new Response(JSON.stringify(data),{status,headers:JSON_HEADERS});
export async function onRequestGet({request,env}){
  if(!env.ESV_API_KEY)return reply(503,{code:'not_configured',message:'The ESV integration is not configured on this deployment.'});
  const query=new URL(request.url).searchParams.get('q')||'';
  const ref=parseRef(query);
  if(!ref||query.length>70||ref.end!==null&&ref.end-ref.verse>29)return reply(400,{code:'invalid_reference',message:'Enter one book, chapter or a range of up to 30 verses.'});
  const p=new URLSearchParams({q:ref.formatted,'include-passage-references':'true','include-verse-numbers':'true','include-footnotes':'true','include-headings':'true','include-crossrefs':'true','include-verse-anchors':'true','include-audio-link':'false','include-short-copyright':'true','include-css-link':'false','inline-styles':'false','wrapping-div':'false'});
  try{
    const response=await fetch(`https://api.esv.org/v3/passage/html/?${p}`,{headers:{Authorization:`Token ${env.ESV_API_KEY}`,Accept:'application/json'}});
    if(!response.ok)return reply(response.status===429?429:502,{code:'upstream_failure',message:response.status===429?'ESV request limit reached. Try again later.':'Could not retrieve the passage from Crossway.'});
    const body=await response.json();
    return reply(200,{canonical:body.canonical||ref.formatted,passages:body.passages||[]});
  }catch{return reply(502,{code:'upstream_unavailable',message:'The Scripture text service is temporarily unreachable.'});}
}
