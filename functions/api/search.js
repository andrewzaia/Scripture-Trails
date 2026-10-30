const HEADERS={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const json=(status,data)=>new Response(JSON.stringify(data),{status,headers:HEADERS});
const MAX_SEARCH_BYTES=256*1024;
export async function onRequestGet({request,env}){
 if(!env.ESV_API_KEY)return json(503,{code:'not_configured',message:'ESV search is not yet configured on this deployment.'});
 const q=(new URL(request.url).searchParams.get('q')||'').trim();
 if(q.length<2||q.length>100||/[<>\x00-\x1f\x7f]/.test(q))return json(400,{code:'invalid_query',message:'Search query must contain 2 to 100 ordinary characters.'});
 const params=new URLSearchParams({q,'page-size':'10',page:'1'});
 try{
   const result=await fetch(`https://api.esv.org/v3/passage/search/?${params}`,{
     headers:{Authorization:`Token ${env.ESV_API_KEY}`,Accept:'application/json'},
     redirect:'manual',signal:AbortSignal.timeout(10000)
   });
   if(!result.ok)return json(result.status===429?429:502,{code:'upstream_failure',message:result.status===429?'ESV search request limit reached. Try again later.':'Could not search the ESV right now.'});
   const reader=result.body?.getReader();if(!reader)throw Error('Missing ESV search response');
   const chunks=[];let size=0;
   while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;
     if(size>MAX_SEARCH_BYTES){await reader.cancel();throw Error('Oversized ESV search response');}
     chunks.push(value);
   }
   const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
   const data=JSON.parse(new TextDecoder().decode(bytes));
   if(!data||typeof data!=='object'||!Array.isArray(data.results)||data.results.length>100)throw Error('Invalid ESV search response');
   const results=data.results.slice(0,10).map(x=>{
     if(typeof x?.reference!=='string'||!x.reference.trim()||x.reference.length>120||typeof x.content!=='string'||x.content.length>10000)throw Error('Invalid ESV search result');
     return {reference:x.reference,content:x.content};
   });
   return json(200,{total_results:Number.isSafeInteger(data.total_results)&&data.total_results>=0?data.total_results:0,results});
 }catch{return json(502,{code:'upstream_unavailable',message:'Search is temporarily unavailable.'});}
}
