import {apiBibleTarget} from '../../public/assets/translations.js';

// The caller validates the edition and reference; neither can choose an upstream host.
export async function apiBiblePassage(ref,edition,env,reply){
 if(!env.API_BIBLE_KEY)return reply(503,{code:'not_configured',message:`${edition.code} reading is awaiting API.Bible configuration. Please try again later or select another translation.`});
 const target=apiBibleTarget(ref.formatted);
 const params=new URLSearchParams({
  'content-type':'html','include-notes':'false','include-titles':ref.verse===null?'true':'false',
  'include-chapter-numbers':'false','include-verse-numbers':'true','include-verse-spans':'true'
 });
 const url=`https://rest.api.bible/v1/bibles/${edition.bibleId}/${target.resource}/${target.id}?${params}`;
 try{
  const response=await fetch(url,{
   headers:{'api-key':env.API_BIBLE_KEY,Accept:'application/json'},
   redirect:'error',signal:AbortSignal.timeout(10000)
  });
  if(!response.ok){
   if(response.status===429)return reply(429,{code:'rate_limited',message:'API.Bible request limit reached. Please try again later.'});
   if(response.status===401||response.status===403)return reply(502,{code:'translation_unavailable',message:`API.Bible has not authorised this deployment to read ${edition.code}. Please select another translation or try again later.`});
   if(response.status===404)return reply(404,{code:'passage_unavailable',message:`This passage is not available in ${edition.code}. Verse numbering can differ between translations; try the full chapter.`});
   return reply(502,{code:'upstream_failure',message:'Could not retrieve this passage from API.Bible.'});
  }
  // One chapter at most, with a bounded response rather than an arbitrary upstream body.
  const reader=response.body?.getReader();
  if(!reader)throw new Error('Missing API.Bible response');
  const chunks=[];let size=0;
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>1024*1024){await reader.cancel();throw new Error('Oversized API.Bible response');}chunks.push(value);}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
  const body=JSON.parse(new TextDecoder().decode(bytes));
  const data=body.data;
  if(typeof data?.content!=='string'||!data.content.trim()||typeof data.copyright!=='string'||!data.copyright.trim()||data.bibleId!==edition.bibleId)throw new Error('Incomplete API.Bible passage');
  return reply(200,{
   canonical:ref.formatted,translation:edition.code,provider:edition.provider,
   passages:[data.content],copyright:data.copyright,
   fums:{token:typeof body.meta?.fumsToken==='string'?body.meta.fumsToken:null,id:typeof body.meta?.fumsId==='string'?body.meta.fumsId:null}
  });
 }catch{return reply(502,{code:'upstream_unavailable',message:'The API.Bible Scripture service is temporarily unavailable. Please try again later.'});}
}
