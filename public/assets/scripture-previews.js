import {BOOKS,parseRef} from './books.js';

// Match real Bible book names only; never infer references from arbitrary numbers.
const aliases=['Psalm','Song of Songs','Jn','Matt','Mk','Lk','Rom','Rev','Gen','Exod','1 Jn','2 Jn','3 Jn'];
const names=[...new Set([...BOOKS.flatMap(book=>[book.name,book.abbr]),...aliases])].sort((a,b)=>b.length-a.length);
const bookPattern=names.map(name=>name.replace(/[|\\{}()[\]^$+*?.]/g,'\\$&').replace(/\s+/g,'\\s*')+'\\.?').join('|');
const expression=new RegExp('(?<![A-Za-z0-9])('+bookPattern+')\\s+(\\d{1,3})(?::(\\d{1,3})(?:\\s*[-\\u2013\\u2014]\\s*(\\d{1,3}))?)?(?![\\d:])','gi');
const MAX_PREVIEW=6,MAX_VERSES=120,MAX_PER_BOOK=6,MAX_ITEMS=36,TTL=180000;
const excluded='script,style,svg,textarea,select,option,pre,code,[contenteditable],#passage-content,#atlas-preview-content,#atlas-compare,.scripture-preview,.scripture-preview-trigger,.public-release-history,.translation-rights,.site-footer,h1,h2,h3,h4,h5,h6,summary';

export function findScriptureReferences(text){
 const matches=[];expression.lastIndex=0;let match;
 while((match=expression.exec(String(text)))!==null){
  const label=match[0].trim();
  const parsed=parseRef(label.replace(/[\u2013\u2014]/g,'-').replace(/\s+/g,' '));
  if(!parsed||parsed.end!==null&&parsed.end-parsed.verse>99)continue;
  const offset=match[0].indexOf(label);
  matches.push({start:match.index+offset,end:match.index+offset+label.length,ref:parsed.formatted});
 }
 return matches;
}
export function previewQuery(value){
 const p=parseRef(value);if(!p)return null;
 if(p.verse===null)return {query:p.book.name+' '+p.chapter+':1-'+MAX_PREVIEW,partial:true};
 if(p.end!==null&&p.end-p.verse+1>MAX_PREVIEW)return {query:p.book.name+' '+p.chapter+':'+p.verse+'-'+(p.verse+MAX_PREVIEW-1),partial:true};
 return {query:p.formatted,partial:false};
}
export function createScripturePreviews({onRead}){
 const main=document.getElementById('main');if(!main)return {seed(){}};
 const cache=new Map(),inflight=new Map();let cachedVerses=0,active=null,hoverTimer=0,hideTimer=0,scanFrame=0;
 const panel=document.createElement('aside');panel.className='scripture-preview';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-label','ESV passage preview');
 panel.innerHTML='<div class="scripture-preview-heading"><strong data-preview-title></strong><span>ESV</span></div><p data-preview-text role="status"></p><p data-preview-scope hidden></p><div class="scripture-preview-actions"><button type="button" data-preview-read>Read passage</button><a data-preview-source target="_blank" rel="noopener noreferrer">ESV.org</a><button type="button" data-preview-close aria-label="Close preview">Close</button></div><small>ESV text supplied by Crossway. See About for copyright and permissions.</small>';
 document.body.append(panel);
 const title=panel.querySelector('[data-preview-title]'),message=panel.querySelector('[data-preview-text]'),scope=panel.querySelector('[data-preview-scope]'),source=panel.querySelector('[data-preview-source]');
 const countFor=ref=>{const p=parseRef(ref);return p?.end!==null?p.end-p.verse+1:p?.verse!==null?1:MAX_PREVIEW;};
 let countsPromise=null;
 const getCounts=()=>countsPromise||(countsPromise=fetch('/data/verse-counts.json').then(r=>r.ok?r.json():{}).catch(()=>({})));
 async function boundedQuery(ref){
  const query=previewQuery(ref),p=parseRef(ref);if(!query||p.verse!==null)return query;
  const counts=await getCounts(),last=counts?.[p.book.name]?.[p.chapter-1];
  return Number.isInteger(last)&&last>0&&last<MAX_PREVIEW?{query:p.book.name+' '+p.chapter+':1-'+last,partial:true}:query;
 }
 const esvUrl=ref=>'https://www.esv.org/'+encodeURIComponent(ref.replace(/\s/g,'+')).replace(/%2B/g,'+')+'/';
 function prune(){for(const [key,item] of cache)if(item.expiry<=Date.now()){cachedVerses-=item.count;cache.delete(key);}}
 function store(key,passages,count){
  if(!Array.isArray(passages)||!passages.length||passages.some(x=>typeof x!=='string'||!x.trim())||count>MAX_VERSES)return;
  prune();if(cache.has(key)){cachedVerses-=cache.get(key).count;cache.delete(key);}
  const book=parseRef(key)?.book.name;
  let bookEntries=[...cache].filter(([ref])=>parseRef(ref)?.book.name===book);
  while(bookEntries.reduce((n,[,value])=>n+value.count,0)+count>MAX_PER_BOOK){
   const [old]=bookEntries.shift()||[];if(!old)return;cachedVerses-=cache.get(old).count;cache.delete(old);
  }
  while(cache.size>=MAX_ITEMS||cachedVerses+count>MAX_VERSES){const first=cache.keys().next().value;if(!first)break;cachedVerses-=cache.get(first).count;cache.delete(first);}
  cache.set(key,{passages,count,expiry:Date.now()+TTL});cachedVerses+=count;
 }
 function hide(){clearTimeout(hoverTimer);clearTimeout(hideTimer);active=null;panel.hidden=true;}
 function hideSoon(){clearTimeout(hideTimer);hideTimer=setTimeout(hide,220);}
 function position(anchor){
  panel.hidden=false;
  const rect=anchor.getBoundingClientRect(),width=panel.getBoundingClientRect().width,height=panel.getBoundingClientRect().height;
  const x=Math.max(12,Math.min(rect.left,window.innerWidth-width-12)),below=rect.bottom+9;
  const y=below+height>window.innerHeight-12&&rect.top>height+16?rect.top-height-9:below;
  panel.style.left=x+'px';panel.style.top=Math.max(12,Math.min(y,window.innerHeight-height-12))+'px';
 }
 function display(ref,passages){
  const html=new DOMParser().parseFromString(passages.join(' '),'text/html');
  html.querySelectorAll('script,style,iframe,object,template').forEach(node=>node.remove());
  const text=(html.body.textContent||'').replace(/\s+/g,' ').trim();
  message.textContent=text.length>950?text.slice(0,947).replace(/\s+\S*$/,'')+'...':text||'No passage text returned.';
  scope.hidden=!previewQuery(ref).partial;
  if(!scope.hidden)scope.textContent='First verses only. Read the full passage in the Bible reader.';
  if(active)position(active.anchor);
 }
 async function get(key){
  prune();if(cache.has(key))return cache.get(key).passages;
  if(inflight.has(key))return inflight.get(key);
  // Avoid a rapid sweep over references generating a surge of API calls.
  if(inflight.size>=2)await Promise.race([...inflight.values()].map(job=>job.catch(()=>null)));
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),8500);
  const task=(async()=>{try{
   const r=await fetch('/api/passage?q='+encodeURIComponent(key)+'&translation=ESV',{cache:'no-store',signal:controller.signal});
   const body=await r.json();if(!r.ok)throw Error(body.code==='not_configured'?'ESV is not configured.':'ESV is temporarily unavailable.');
   if(!Array.isArray(body.passages)||!body.passages.length)throw Error('The publisher returned no text.');
   store(key,body.passages,countFor(key));return body.passages;
  }finally{clearTimeout(timeout);}})();
  inflight.set(key,task);try{return await task;}finally{inflight.delete(key);}
 }
 function open(trigger,immediate=false){
  hide();const ref=trigger.dataset.scripturePreview;if(!previewQuery(ref))return;
  const token={trigger,anchor:trigger,ref};active=token;title.textContent=ref;source.href=esvUrl(ref);scope.hidden=true;message.textContent='Loading ESV passage...';
  const start=async()=>{if(active!==token)return;position(trigger);try{
   const query=await boundedQuery(ref);if(active!==token)return;
   const passages=await get(query.query);if(active===token)display(ref,passages);
  }catch(error){if(active===token){message.textContent=error.name==='AbortError'?'The passage timed out. Try again.':error.message;position(trigger);}}};
  if(immediate)void start();else hoverTimer=setTimeout(start,180);
 }
 const triggerAt=event=>event.target instanceof Element?event.target.closest('.scripture-preview-trigger[data-scripture-preview]'):null;
 main.addEventListener('pointerover',event=>{
  if(event.pointerType==='touch')return;
  const trigger=triggerAt(event);
  if(trigger&&!(event.relatedTarget instanceof Node&&trigger.contains(event.relatedTarget)))open(trigger);
 });
 main.addEventListener('pointerout',event=>{
  const trigger=triggerAt(event);if(trigger&&!(event.relatedTarget instanceof Node&&trigger.contains(event.relatedTarget)))hideSoon();
 });
 main.addEventListener('focusin',event=>{
  const trigger=triggerAt(event)||(event.target instanceof Element?event.target.querySelector('.scripture-preview-trigger'):null);
  if(trigger)open(trigger,true);
 });
 main.addEventListener('focusout',event=>{if(!panel.contains(event.relatedTarget))hideSoon();});
 main.addEventListener('click',event=>{
  const trigger=triggerAt(event);if(!trigger)return;
  if(matchMedia('(hover: none)').matches&&!trigger.parentElement.closest('a,button,[role=button]')){event.preventDefault();event.stopPropagation();open(trigger,true);}
  else if(!trigger.parentElement.closest('a,button,[role=button]')){event.preventDefault();onRead(trigger.dataset.scripturePreview);hide();}
 },true);
 main.addEventListener('keydown',event=>{
  const trigger=triggerAt(event);
  if(trigger&&!trigger.parentElement.closest('a,button,[role=button]')&&['Enter',' '].includes(event.key)){
   event.preventDefault();onRead(trigger.dataset.scripturePreview);hide();
  }
 });
 panel.addEventListener('pointerenter',()=>clearTimeout(hideTimer));
 panel.addEventListener('pointerleave',hideSoon);
 panel.querySelector('[data-preview-read]').addEventListener('click',()=>{const ref=active?.ref;hide();if(ref)onRead(ref);});
 panel.querySelector('[data-preview-close]').addEventListener('click',hide);
 document.addEventListener('pointerdown',event=>{if(active&&!panel.contains(event.target)&&!active.trigger.contains(event.target))hide();},true);
 document.addEventListener('keydown',event=>{if(active&&event.key==='Escape')hide();});
 window.addEventListener('scroll',event=>{if(active&&!panel.contains(event.target))hide();},true);
 window.addEventListener('resize',hide);
 function allowed(node){
  return node.parentElement&&!node.parentElement.closest(excluded)&&!node.parentElement.closest('.view:not(.active-view)')&&node.nodeValue?.length>=5&&node.nodeValue?.length<=2200;
 }
 function scan(root){
  if(!(root instanceof Element)||!root.isConnected||root.closest(excluded))return;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes=[];
  while(walker.nextNode())if(allowed(walker.currentNode))nodes.push(walker.currentNode);
  for(const node of nodes){
   if(!node.isConnected||!allowed(node))continue;const matches=findScriptureReferences(node.nodeValue||'');if(!matches.length)continue;
   const fragment=document.createDocumentFragment(),interactive=node.parentElement.closest('a,button,[role=button]');let from=0;
   for(const match of matches){
    if(match.start<from)continue;
    if(match.start>from)fragment.append(document.createTextNode(node.nodeValue.slice(from,match.start)));
    const span=document.createElement('span');span.className='scripture-preview-trigger';span.dataset.scripturePreview=match.ref;
    span.textContent=node.nodeValue.slice(match.start,match.end);
    if(!interactive){span.tabIndex=0;span.setAttribute('role','button');span.setAttribute('aria-label','Preview '+span.textContent+' in ESV; press Enter to open the passage');}
    fragment.append(span);from=match.end;
   }
   if(from<node.nodeValue.length)fragment.append(document.createTextNode(node.nodeValue.slice(from)));
   node.replaceWith(fragment);
  }
 }
 const queued=new Set();
 function schedule(root){
  if(!(root instanceof Element)||root.closest(excluded))return;queued.add(root);
  if(scanFrame)return;scanFrame=requestAnimationFrame(()=>{scanFrame=0;for(const node of queued)scan(node);queued.clear();});
 }
 const observer=new MutationObserver(records=>{
  for(const item of records)for(const node of item.addedNodes){
   if(node.nodeType===Node.ELEMENT_NODE)schedule(node);
   else if(node.nodeType===Node.TEXT_NODE)schedule(node.parentElement);
  }
 });
 observer.observe(main,{childList:true,subtree:true});
 document.addEventListener('scripturetrails:view-change',()=>{hide();schedule(main.querySelector('.active-view'));});
 schedule(main.querySelector('.active-view'));
 return {
  seed(ref,passages){const p=parseRef(ref);if(p?.verse!==null&&p?.verse!==undefined&&(p.end===null||p.end-p.verse+1<=MAX_PREVIEW))store(p.formatted,passages,countFor(p.formatted));},
  destroy(){observer.disconnect();hide();panel.remove();}
 };
}
