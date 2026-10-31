import {appendCitationReview} from './citation-review.js?v=0.44.11';
import {parseRef} from './books.js';
import {TRANSLATIONS,getTranslation} from './translations.js';
/** Licensed Scripture comes from the already authorised, server-side Bible reader endpoint. */
export function createPassageComparison(root,handlers={}){
 const $=id=>root.querySelector('[data-compare="'+id+'"]');
 let pair=null,revision=0,requests=[],currentEdition=null;
 const review=makeReview();
 function makeReview(){const el=document.createElement("div");root.append(el);return el;}
 const make=(tag,text,cls='')=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;};
 const list=$('edition');
 list.replaceChildren(...TRANSLATIONS.map(t=>{const o=make('option',t.code+' - '+t.name);o.value=t.code;return o;}));
 function cancel(){revision++;for(const controller of requests)controller.abort();requests=[];}
 function close(){cancel();root.hidden=true;pair=null;}
 async function renderSide(side,ref,edition,round){
  const body=$(side+'-passage'),status=$(side+'-status'),copyright=$(side+'-copyright');
  body.replaceChildren(make('p','Retrieving '+edition+' text from its licensed provider...','entity-muted'));
  copyright.replaceChildren();status.textContent='Loading...';
  const controller=new AbortController();requests.push(controller);
  try{
   const response=await fetch('/api/passage?q='+encodeURIComponent(ref)+'&translation='+encodeURIComponent(edition),{cache:'no-store',signal:controller.signal});
   const result=await response.json();
   if(round!==revision||root.hidden)return;
   if(!response.ok||!Array.isArray(result.passages)||!result.passages.length||result.passages.some(x=>typeof x!=='string'))throw Error(result.message||'Could not load this passage.');
   body.replaceChildren(...result.passages.map(html=>handlers.sanitize(html)));
   const provider=getTranslation(edition);
   status.textContent=edition+' via '+provider.provider;
   if(typeof result.copyright==='string'&&result.copyright.trim())copyright.append(handlers.sanitize(result.copyright));
   else copyright.textContent=edition==='ESV'?'ESV text supplied by Crossway. See About for translation copyright.':'Copyright information is available from the translation provider.';
   // Publisher links must accompany every visible quotation, including both
   // Atlas comparison columns. NIV specifically requires a direct Biblica link.
   if(provider?.publisherUrl){
    const link=make('a',provider.publisher+' - publisher information');
    link.href=provider.publisherUrl;link.target='_blank';link.rel='noopener noreferrer';
    copyright.append(make('span',' '),link);
   }
   if(result.fums)void handlers.onViewed?.(result.fums);
  }catch(error){
   if(round!==revision||root.hidden||controller.signal.aborted)return;
   body.replaceChildren(make('p',error.message&&error.message.length<220?error.message:'The passage could not be loaded. Choose another edition or retry.','entity-muted'));
   status.textContent='Unavailable';copyright.replaceChildren();
  }
 }
 function load(){
  if(!pair||root.hidden)return;
  cancel();const round=revision,edition=currentEdition;
  void Promise.all([renderSide('left',pair.from,edition,round),renderSide('right',pair.to,edition,round)]);
 }
 function open(from,to,evidence=null){
  const a=parseRef(from),b=parseRef(to);
  if(!a||!b||a.verse===null||b.verse===null)return false;
  pair={from:a.formatted,to:b.formatted,evidence};
  currentEdition=handlers.getEdition?.()||'ESV';
  if(!getTranslation(currentEdition))currentEdition='ESV';
  list.value=currentEdition;root.hidden=false;
  $('left-title').textContent=a.formatted;$('right-title').textContent=b.formatted;
  $('left-open').textContent='Open '+a.formatted+' in reader';$('right-open').textContent='Open '+b.formatted+' in reader';
  $('explanation').textContent=evidence?evidence.explanation+' '+evidence.caution:'Compare these passages in their original contexts; a thematic relationship has not been verified.';
  $('provenance').textContent=evidence?(evidence.review==='scripture-context-screened'?'Internal passage-context screening':'Editorial reading aid; detailed textual review pending')+'. No independent specialist certification.':'No scholarly evidence classification is attached.';
  $('context').hidden=!evidence?.context;
  $('context').textContent=evidence?.context?'Read wider context: '+evidence.context:'';
  review.replaceChildren();if(evidence)appendCitationReview(review,'connection',evidence.id);
  load();root.scrollIntoView({behavior:'smooth',block:'start'});return true;
 }
 list.addEventListener('change',()=>{if(!getTranslation(list.value))return;currentEdition=list.value;load();});
 $('close').addEventListener('click',close);
 $('retry').addEventListener('click',load);
 $('swap').addEventListener('click',()=>{if(!pair)return;open(pair.to,pair.from,pair.evidence);});
 $('left-open').addEventListener('click',()=>{if(pair)handlers.onRead?.(pair.from);});
 $('right-open').addEventListener('click',()=>{if(pair)handlers.onRead?.(pair.to);});
 $('context').addEventListener('click',()=>{if(pair?.evidence?.context)handlers.onRead?.(pair.evidence.context);});
 return {open,close,get isOpen(){return !root.hidden;}};
}
