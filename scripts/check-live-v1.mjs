import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';

// Public, read-only release smoke. No API keys, private notes or Bible text are
// requested, stored or logged. The separate check:live-reader probes publishers.
export async function checkLiveV1({origin='https://www.scripturetrails.com',expectedVersion,fetcher=fetch}={}){
 if(!/^[0-9]+[.][0-9]+[.][0-9]+$/.test(expectedVersion||''))throw Error('Expected semantic release version required');
 const base=new URL(origin);
 if(base.protocol!=='https:'||base.username||base.password||base.search||base.hash||base.pathname!=='/')throw Error('Origin must be an HTTPS site root');
 async function get(path){
  const address=new URL(path,base);
  if(address.origin!==base.origin)throw Error('Cross-origin request rejected');
  const res=await fetcher(address,{method:'GET',redirect:'error',headers:{Accept:'text/html, application/json, text/javascript'},signal:AbortSignal.timeout(16000)});
  if(!res.ok)throw Error('Production '+address.pathname+' HTTP '+res.status);
  return res;
 }
 const page=(await (await get('/')).text());
 const versionMarker=new RegExp('id="site-version"[^>]*>v'+expectedVersion.replaceAll('.','[.]')+'<');
 if(!versionMarker.test(page))throw Error('Published footer version differs from expected '+expectedVersion);
 if(!page.includes('/assets/app.js?v='+expectedVersion))throw Error('Published entry-point cache version mismatch');
 for(const id of ['view-reader','view-connections','view-journeys','view-entities','view-city-studies','view-roadmap','view-notebook']){
  if(!page.includes('id="'+id+'"'))throw Error('Missing flagship app view '+id);
 }
 const releases=await (await get('/data/releases.json?v='+expectedVersion)).json();
 if(releases.releases?.[0]?.version!==expectedVersion)throw Error('Published changelog version mismatch');
 const roadmap=await (await get('/data/roadmap.json?v='+expectedVersion)).json();
 if(roadmap.v1Readiness?.target!=='1.0.0'||!Array.isArray(roadmap.v1Readiness.gates)||roadmap.v1Readiness.gates.length!==5)throw Error('Published roadmap readiness data invalid');
 const app=(await (await get('/assets/app.js?v='+expectedVersion)).text());
 if(!app.includes('import ')||!app.includes('?v='+expectedVersion))throw Error('Published main module is missing versioned dependencies');
 return {version:expectedVersion,viewsChecked:7,roadmapGates:5,releaseHistoryCount:releases.releases.length,origin:base.origin};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  const version=process.env.SCRIPTURE_TRAILS_EXPECTED_VERSION;
  const result=await checkLiveV1({origin:process.env.SCRIPTURE_TRAILS_ORIGIN||'https://www.scripturetrails.com',expectedVersion:version});
  console.log('Production release smoke passed: v'+result.version+'; '+result.viewsChecked+' view anchors, release history, five roadmap gates and versioned module. No Bible passage or private data requested.');
 }catch(error){console.error('Production release smoke FAILED: '+error.message);process.exitCode=1;}
}
