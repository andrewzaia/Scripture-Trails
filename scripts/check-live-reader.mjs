import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {TRANSLATIONS} from '../public/assets/translations.js';

// Optional production smoke check. Never print or store licenced passage text.
export const READER_PROBES=Object.freeze([
  'John 3:16','Psalm 23:1','Romans 8:28'
]);
const codes=new Set(TRANSLATIONS.map(edition=>edition.code));
export async function checkLiveReader({fetcher=fetch,origin='https://www.scripturetrails.com',references=READER_PROBES,editions=TRANSLATIONS.map(x=>x.code)}={}){
  const base=new URL(origin);
  if(base.protocol!=='https:'||base.username||base.password||base.search||base.hash||base.pathname!=='/')throw Error('Production reader origin must be an HTTPS site root');
  const results=[];
  for(const code of editions){
    if(!codes.has(code))throw Error('Unexpected translation code');
    for(const reference of references){
      const url=new URL('/api/passage',base);
      url.searchParams.set('q',reference);url.searchParams.set('translation',code);
      const response=await fetcher(url,{method:'GET',redirect:'error',signal:AbortSignal.timeout(16000),headers:{Accept:'application/json'}});
      if(!response.ok)throw Error('Production reader '+code+' '+reference+' HTTP '+response.status);
      const cache=response.headers.get('cache-control')||'';
      if(!/(?:^|[, ]+)no-store(?:$|[, ]+)/i.test(cache))throw Error('Missing no-store on '+code+' '+reference);
      const body=await response.json();
      if(!Array.isArray(body.passages)||!body.passages.length||body.passages.some(p=>typeof p!=='string'||!p.trim()))throw Error('Missing official text for '+code+' '+reference);
      if(typeof body.canonical!=='string'||!body.canonical.trim())throw Error('Missing canonical passage for '+code+' '+reference);
      const api=code!=='ESV';
      if(api&&(body.translation!==code||body.provider!=='API.Bible'||typeof body.copyright!=='string'||!body.copyright.trim()))throw Error('Missing edition identity or publisher notice for '+code+' '+reference);
      results.push({code,reference,status:response.status,publisherNotice:api?'returned by publisher API':'Crossway response (copyright separately reviewed)'});
    }
  }
  return results;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{
    const entries=await checkLiveReader({origin:process.env.SCRIPTURE_TRAILS_ORIGIN||'https://www.scripturetrails.com'});
    console.log('Production Scripture reader smoke passed: '+entries.length+' scoped requests across '+new Set(entries.map(x=>x.code)).size+' editions. No passage text stored or logged.');
  }catch(error){console.error('Production Scripture reader smoke FAILED: '+error.message);process.exitCode=1;}
}
