const HEADERS={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const json=(status,data)=>new Response(JSON.stringify(data),{status,headers:HEADERS});
export async function onRequestGet({request,env}){
 if(!env.ESV_API_KEY)return json(503,{code:'not_configured',message:'ESV search is not yet configured on this deployment.'});
 const q=(new URL(request.url).searchParams.get('q')||'').trim();
 if(q.length<2||q.length>100||/[<>\r\n]/.test(q))return json(400,{code:'invalid_query',message:'Search query must contain 2 to 100 ordinary characters.'});
 const params=new URLSearchParams({q,'page-size':'10',page:'1'});
 try{
   const result=await fetch(`https://api.esv.org/v3/passage/search/?${params}`,{headers:{Authorization:`Token ${env.ESV_API_KEY}`,Accept:'application/json'}});
   if(!result.ok)return json(result.status===429?429:502,{code:'upstream_failure',message:'Could not search the ESV right now.'});
   const data=await result.json();
   return json(200,{total_results:data.total_results||0,results:(data.results||[]).slice(0,10).map(x=>({reference:x.reference,content:x.content}))});
 }catch{return json(502,{code:'upstream_unavailable',message:'Search is temporarily unavailable.'});}
}
