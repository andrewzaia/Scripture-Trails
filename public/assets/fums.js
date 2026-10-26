// Report only passages actually shown, using API.Bible's official trackers.
const scripts=new Map();
function loadTracker(src){
 if(!scripts.has(src))scripts.set(src,new Promise((resolve,reject)=>{
  const script=document.createElement('script');script.src=src;script.async=true;
  script.onload=resolve;script.onerror=()=>{scripts.delete(src);script.remove();reject(new Error('Usage tracker unavailable'));};document.head.append(script);
 }));
 return scripts.get(src);
}
export async function reportScriptureView(meta){
 try{
  if(typeof meta?.token==='string'&&meta.token.length>0&&meta.token.length<8192){
   window.fumsData=window.fumsData||[];
   window.fums=window.fums||function(){window.fumsData.push(arguments);};
   await loadTracker('https://pkg.api.bible/fumsV3.min.js');
   window.fums('trackView',meta.token);
  }else if(typeof meta?.id==='string'&&/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(meta.id)){
   await loadTracker('https://cdn.scripture.api.bible/fums/fumsv2.min.js');
   window._BAPI.t(meta.id);
  }
 }catch{/* A blocked tracker must not remove the passage the user is reading. */}
}
