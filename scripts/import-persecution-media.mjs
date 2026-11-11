import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {setTimeout as delay} from 'node:timers/promises';
const entries=JSON.parse(readFileSync('scripts/persecution-media-import-sources.json','utf8'));
const dest='public/assets/persecution-media';
mkdirSync(dest,{recursive:true});
async function download(entry){
 const path=join(dest,entry.file);
 if(existsSync(path)){console.log('Already stored '+entry.file);return;}
 const uri='https://commons.wikimedia.org/wiki/Special:Redirect/file/'+encodeURIComponent(entry.commons_file)+'?width=640';
 const abort=AbortSignal.timeout(35000);
 const response=await fetch(uri,{headers:{'User-Agent':'ScriptureTrailsAcademicArchive/1.0 (media reuse attribution; Wikimedia Commons)'} ,signal:abort});
 if(!response.ok)throw Error('Cannot download '+entry.commons_file+' (HTTP '+response.status+')');
 const mime=response.headers.get('content-type')||'';
 if(!mime.startsWith('image/jpeg'))throw Error('Invalid image MIME '+mime+' for '+entry.file+' at '+response.url);
 const raw=Buffer.from(await response.arrayBuffer());
 if(raw.length<8000||raw.length>1250000||raw[0]!==0xff||raw[1]!==0xd8)throw Error('Image size/type mismatch '+entry.file+' bytes='+raw.length);
 writeFileSync(path,raw);
 console.log('Stored '+entry.file+' '+raw.length+' bytes');
}
for(const item of entries){await download(item);await delay(300);}
