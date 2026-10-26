import {BOOKS,findBook,parseRef,referenceFor,chapterRef,adjacentChapter} from './books.js';
import {PATHS,EDITORIAL_LINKS} from './studies.js';
import {ScriptureGraph} from './graph.js';
import {createJesusMap} from './jesus-map.js';
import {createRoadmap} from './roadmap.js';
import {buildAtlas} from './atlas-paths.js';

const $=id=>document.getElementById(id);
const pick=(s,root=document)=>root.querySelector(s);
const editorial=new Map();
for(const link of EDITORIAL_LINKS){const a=parseRef(link.from)?.formatted,b=parseRef(link.to)?.formatted;if(!a||!b)continue;for(const [from,to] of [[a,b],[b,a]]){if(!editorial.has(from))editorial.set(from,[]);editorial.get(from).push({...link,from,to});}}
const getSaved=(key,defaultValue)=>{try{const parsed=JSON.parse(localStorage.getItem(`scripture-trails:${key}`));return parsed===null?defaultValue:parsed;}catch{return defaultValue;}};
const putSaved=(key,value)=>{try{localStorage.setItem(`scripture-trails:${key}`,JSON.stringify(value));return true;}catch{return false;}};
const state={view:'discover',ref:'John 1:1',chapter:null,bookmarks:getSaved('bookmarks',[]),notes:getSaved('notes',{}),history:getSaved('history',[]),theme:getSaved('theme','dark'),filter:'all',journey:null,links:[],graph:null,graphDepth:3,graphLinks:{},graphRequestId:0,requestId:0,jesusMap:null};
const bookCache=new Map();let referenceManifest=null,verseCounts=null;let roadmapPage=null;let toastTimer;
async function hasImportedReferences(){if(referenceManifest===null){referenceManifest=fetch('/data/refs/manifest.json').then(r=>r.ok?r.json():{enabled:false}).catch(()=>({enabled:false}));}return (await referenceManifest).enabled===true;}
const create=(tag,className,text)=>{const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;};
function toast(message){const el=$('toast');el.textContent=message;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),2500);}
function esvUrl(ref){return `https://www.esv.org/${encodeURIComponent(ref.replace(/\s/g,'+')).replace(/%2B/g,'+')}/`;}
function bibleBookSlug(name){return name.toLowerCase().replace(/\s+/g,'-');}
function lsbUrl(ref){const p=parseRef(ref);return p?`https://read.lsbible.org/${bibleBookSlug(p.book.name)}/${p.chapter}/${p.verse||1}`:'https://read.lsbible.org/';}
function nasbUrl(ref){const p=parseRef(ref);return p?`https://bible.lockman.org/nasb2020/${bibleBookSlug(p.book.name)}/${p.chapter}`:'https://bible.lockman.org/nasb2020/';}
async function getCounts(){if(!verseCounts){verseCounts=fetch('/data/verse-counts.json').then(r=>r.ok?r.json():{}).catch(()=>({}));}return verseCounts;}
function nextReadingContext(ref,counts){const p=parseRef(ref);if(!p)return [];const count=counts?.[p.book.name]?.[p.chapter-1];if(!Number.isInteger(count)||!count)return [];const verse=p.verse||1;const to=[];if(verse>1)to.push(`${p.book.name} ${p.chapter}:${verse-1}`);if(verse<count)to.push(`${p.book.name} ${p.chapter}:${verse+1}`);return to.map(v=>({from:ref,to:v,type:'context',description:'Adjacent verse for reading context only - not an interpretative cross-reference',source:'Reading context'}));}
function updateUrl(){const url=new URL(window.location.href);url.searchParams.set('view',state.view);url.searchParams.set('ref',state.ref);history.pushState({},'',url);}
function closeSidebar(){$('sidebar').classList.remove('open');$('menu-toggle').setAttribute('aria-expanded','false');$('sidebar-shade').hidden=true;}
function showView(name,updateHistory=true){const valid=['discover','reader','connections','jesus-map','roadmap','journeys','notebook','about'];if(!valid.includes(name))name='discover';state.view=name;document.querySelectorAll('.view').forEach(v=>{v.classList.toggle('active-view',v.id===`view-${name}`);});document.querySelectorAll('[data-view].nav-link').forEach(v=>v.classList.toggle('selected',v.dataset.view===name));$('section-heading').textContent={discover:'Discover',reader:'Bible reader',connections:'Connection atlas','jesus-map':'Journeys of Jesus',roadmap:'Project roadmap',journeys:'Study journeys',notebook:'My notebook',about:'About the project'}[name];closeSidebar();if(name==='reader'){void renderReader();}if(name==='connections'){void renderGraph();}if(name==='jesus-map'){if(!state.jesusMap)state.jesusMap=createJesusMap(document.querySelector('[data-jesus-map]'),ref=>selectRef(ref,'reader'));state.jesusMap.activate();}else state.jesusMap?.pause();if(name==='roadmap'){if(!roadmapPage)roadmapPage=createRoadmap(document.querySelector('[data-roadmap]'));roadmapPage.activate();}if(name==='notebook')renderNotebook();if(name==='journeys')renderJourneys();if(updateHistory)updateUrl();window.scrollTo({top:0,behavior:'instant'});}
function selectRef(ref,view='reader',updateHistory=true){const parsed=parseRef(ref);if(!parsed){toast('Please enter a valid Bible reference.');return;}state.ref=(view==='connections'&&parsed.verse===null)?`${parsed.book.name} ${parsed.chapter}:1`:parsed.formatted;state.history=[state.ref,...state.history.filter(x=>x!==state.ref)].slice(0,12);putSaved('history',state.history);const sameView=state.view===view;if(sameView&&view==='reader'){void renderReader();}else if(sameView&&view==='connections'){void renderGraph();}else showView(view,false);if(updateHistory)updateUrl();}
function makeJourneyCard(path){const button=create('button','journey-card');button.type='button';button.setAttribute('aria-label',`Explore ${path.name}`);const meta=create('div','card-meta');meta.append(create('span','',path.label),create('span','card-number',path.number));const heading=create('h3','',path.name);const summary=create('p','',path.summary);const bottom=create('div','card-bottom');bottom.append(create('span','',`${path.refs.length} passages  ·  ${path.time}`),create('span','','↗'));button.append(meta,heading,summary,bottom);button.addEventListener('click',()=>openJourney(path.id));return button;}
function buildJourneys(){PATHS.slice(0,3).forEach(x=>$('home-journeys').append(makeJourneyCard(x)));PATHS.forEach(x=>$('all-journeys').append(makeJourneyCard(x)));}
function openJourney(id){const path=PATHS.find(x=>x.id===id);if(!path)return;state.journey=id;showView('journeys');const target=$('journey-detail');target.hidden=false;target.replaceChildren();target.append(create('p','eyebrow',path.label),create('h2','',path.name),create('p','',path.summary));const steps=create('div','journey-steps');path.refs.forEach((ref,i)=>{const b=create('button','journey-step');b.append(create('span','',String(i+1).padStart(2,'0')),create('strong','',ref));b.addEventListener('click',()=>selectRef(ref));steps.append(b);});const q=create('div','journey-question',path.question);target.append(steps,create('p','overline','QUESTION FOR REFLECTION'),q);target.scrollIntoView({behavior:'smooth',block:'start'});}
function renderJourneys(){const target=$('journey-detail');if(!state.journey){target.hidden=true;return;}target.hidden=false;}
function populateBookPicker(){const frag=document.createDocumentFragment();for(const [label,books] of [['OLD TESTAMENT',BOOKS.slice(0,39)],['NEW TESTAMENT',BOOKS.slice(39)]]){const group=create('optgroup');group.label=label;for(const book of books){const opt=create('option','',book.name);opt.value=book.name;group.append(opt);}frag.append(group);}$('side-book').replaceChildren(frag);$('side-book').value='John';populateChapters();}
function populateChapters(){const book=findBook($('side-book').value);if(!book)return;$('side-chapter').replaceChildren(...Array.from({length:book.chapters},(_,i)=>{const opt=create('option','',String(i+1));opt.value=i+1;return opt;}));$('side-chapter').value=1;}
async function loadBookData(book){if(!book||!(await hasImportedReferences()))return {};const id=book.abbr.toLowerCase();if(bookCache.has(id))return bookCache.get(id);const promise=fetch(`/data/refs/${id}.json`).then(x=>x.ok?x.json():{}).catch(()=>({}));bookCache.set(id,promise);return promise;}
async function connectionsFor(ref){const cur=parseRef(ref);if(!cur)return [];
 const canonical=cur.verse===null?`${cur.book.name} ${cur.chapter}:1`:cur.formatted;
 const base=[...(editorial.get(canonical)||[])];const archive=await loadBookData(cur.book);
 const extra=archive[`${cur.chapter}:${cur.verse||1}`]||archive[canonical]||[];
 const known=new Set(base.map(x=>x.to));
 for(const item of extra){const packed=Array.isArray(item);
  const to=packed?(BOOKS[item[0]]?`${BOOKS[item[0]].name} ${item[1]}:${item[2]}`:null):item.to;
  const parsed=parseRef(to);if(!parsed||known.has(parsed.formatted)||parsed.formatted===canonical)continue;
  const range=packed&&item.length>=6?`${BOOKS[item[6]??item[0]]?.name||BOOKS[item[0]].name} ${item[4]}:${item[5]}`:item.range;
  known.add(parsed.formatted);base.push({from:canonical,to:parsed.formatted,type:'dataset',description:range?`OpenBible.info reference range ending at ${range}, mapped by its first verse`:'OpenBible.info verse reference, ranked by community votes; connection type not independently verified',source:'OpenBible.info',votes:packed?item[3]:item.votes,range});}
 if(!base.length)return nextReadingContext(canonical,await getCounts());
 return base.sort((a,b)=>(a.type==='dataset'?1:0)-(b.type==='dataset'?1:0)||(b.votes||0)-(a.votes||0));
}
async function renderConnections(){const ref=state.ref;const connections=await connectionsFor(ref);if(ref!==state.ref)return;state.links=connections;const filter=state.filter;$('reference-count').textContent=String(connections.length);const list=$('reference-list');list.replaceChildren();let shown=connections.filter(x=>filter==='all'||x.type===filter);shown=shown.slice(0,80);if(!shown.length){list.append(create('p','empty-list',filter==='all'?'No references recorded for this verse. Try a neighbouring verse or view Crossway callouts in the reader.':'No connections in this category for the selected verse.'));return;}
 for(const item of shown){const button=create('button','reference-item');const left=create('span');left.append(create('strong','',item.to),create('small','',item.description));const right=create('span');right.append(create('em','',item.type==='dataset'?'DATA':item.type),create('span','arrow','↗'));button.append(left,right);button.title=item.source==='editorial'?'Curated study connection':item.source==='Reading context'?'Neighbouring verse (not a cross-reference)':'From OpenBible.info';button.addEventListener('click',()=>selectRef(item.to));list.append(button);}
}
function renderNote(){const note=state.notes[state.ref]||'';$('notes-text').value=note;}
function currentIsSaved(){return state.bookmarks.includes(state.ref);}
function setSaveButton(){$('bookmark-current').textContent=currentIsSaved()?'★ Saved':'☆ Save';}
function refreshCurrentUi(){const p=parseRef(state.ref);$('reader-title').textContent=state.ref;$('read-on-esv').href=esvUrl(state.ref);$('read-on-nasb').href=nasbUrl(state.ref);$('read-on-nasb').title=`Open ${state.ref} in the official NASB 2020 reader`; $('read-on-lsb').href=lsbUrl(state.ref);$('prev-chapter').disabled=!adjacentChapter(state.ref,-1);$('next-chapter').disabled=!adjacentChapter(state.ref,1);$('read-prev').disabled=!adjacentChapter(state.ref,-1);$('read-next').disabled=!adjacentChapter(state.ref,1);setSaveButton();renderNote();void renderConnections();if(p){$('side-book').value=p.book.name;populateChapters();$('side-chapter').value=String(p.chapter);}if(state.view==='reader')markSelectedVerse();}
function buildFallback(message,isError=false){const div=create('div','message-panel');div.append(create('h3','',isError?'Unable to load Scripture text':'Read this passage in the ESV'));div.append(create('p','',message));const a=create('a','',`Open ${state.ref} on ESV.org ↗`);a.href=esvUrl(state.ref);a.target='_blank';a.rel='noopener noreferrer';div.append(a);return div;}
function safeHtml(raw){const doc=new DOMParser().parseFromString(raw,'text/html');const allowed=new Set(['DIV','P','H2','H3','H4','H5','SPAN','B','STRONG','EM','I','SMALL','A','SUP','SUB','BR','UL','OL','LI','BLOCKQUOTE','HR','SECTION']);
 const walker=node=>{if(node.nodeType===Node.TEXT_NODE)return document.createTextNode(node.nodeValue);if(node.nodeType!==Node.ELEMENT_NODE)return document.createDocumentFragment();const name=allowed.has(node.tagName)?node.tagName.toLowerCase():'span';const el=document.createElement(name);
  const cls=(node.getAttribute('class')||'').split(/\s+/).filter(x=>/^[a-zA-Z0-9_-]{1,40}$/.test(x)).join(' ');if(cls)el.className=cls;
  if(node.id&&/^v\d{7,10}[-\d]*$/.test(node.id))el.id=node.id;
  if(name==='a'){const href=node.getAttribute('href')||'';try{const url=new URL(href,'https://www.esv.org/');if(url.protocol==='https:'&&url.hostname==='www.esv.org'){el.href=url.href;el.target='_blank';el.rel='noopener noreferrer';}}catch{}}
  for(const child of node.childNodes)el.append(walker(child));return el;};
 const out=document.createDocumentFragment();for(const child of doc.body.childNodes)out.append(walker(child));return out;}
function markSelectedVerse(){const p=parseRef(state.ref);document.querySelectorAll('#passage-content .verse-num[data-verse-ref]').forEach(el=>el.dataset.selected=String(el.dataset.verseRef===state.ref));}
function decorateReaderVerses(chapter){
 const box=$('passage-content');for(const verseEl of box.querySelectorAll('.verse-num')){
  const value=verseEl.textContent.match(/\d+/);const number=Number(value?.[0]);if(!number||number>176)continue;
  const ref=`${chapter}:${number}`;verseEl.dataset.verseRef=ref;
  if(verseEl.nextElementSibling?.classList.contains('verse-atlas-link'))continue;
  const action=create('button','verse-atlas-link','Atlas');action.type='button';action.title=`Explore connections for ${ref}`;
  action.setAttribute('aria-label',`Explore connections for ${ref}`);action.dataset.atlasRef=ref;verseEl.after(action);
 }
 markSelectedVerse();
}
async function renderAtlasPickers(){
 const p=parseRef(state.ref);if(!p)return;
 $('atlas-book').value=p.book.name;
 populateAtlasChapters(p.chapter);
 await populateAtlasVerses(p.verse||1);
}
function populateAtlasChapters(selected=1){const book=findBook($('atlas-book').value);if(!book)return;
 $('atlas-chapter').replaceChildren(...Array.from({length:book.chapters},(_,i)=>{const o=create('option','',String(i+1));o.value=String(i+1);return o;}));$('atlas-chapter').value=String(Math.max(1,Math.min(book.chapters,selected)));
}
async function populateAtlasVerses(selected=1){const pbook=$('atlas-book').value;const chapter=Number($('atlas-chapter').value)||1;const counts=await getCounts();if($('atlas-book').value!==pbook||Number($('atlas-chapter').value)!==chapter)return;
 const length=counts?.[pbook]?.[chapter-1]||30;
 $('atlas-verse').replaceChildren(...Array.from({length},(_,i)=>{const o=create('option','',String(i+1));o.value=String(i+1);return o;}));$('atlas-verse').value=String(Math.max(1,Math.min(length,selected)));
}
function initAtlasPicker(){const picker=$('atlas-book');const frag=document.createDocumentFragment();for(const [label,items] of [['OLD TESTAMENT',BOOKS.slice(0,39)],['NEW TESTAMENT',BOOKS.slice(39)]]){
 const group=create('optgroup');group.label=label;for(const book of items){const opt=create('option','',book.name);opt.value=book.name;group.append(opt);}frag.append(group);
}picker.replaceChildren(frag);
 picker.addEventListener('change',()=>{populateAtlasChapters();void populateAtlasVerses();});
 $('atlas-chapter').addEventListener('change',()=>void populateAtlasVerses());
 $('atlas-open').addEventListener('click',()=>selectRef(`${picker.value} ${$('atlas-chapter').value}:${$('atlas-verse').value}`,'connections'));
}
async function loadPassage(chapter){const requestId=++state.requestId;const content=$('passage-content');content.replaceChildren(create('div','message-panel','Retrieving the passage from Crossway...'));$('passage-status').textContent='Loading ESV';
 try{const res=await fetch(`/api/passage?q=${encodeURIComponent(chapter)}`);const payload=await res.json();if(requestId!==state.requestId)return;
  if(!res.ok){const configured=payload.code!=='not_configured';content.replaceChildren(buildFallback(configured?payload.message:'This site is ready for the ESV API. Until the site owner adds a Crossway API key, you can open the passage directly on ESV.org.',configured));$('passage-status').textContent=configured?'Service unavailable':'API key required';return;}
  if(!Array.isArray(payload.passages)||!payload.passages.length)throw Error('Crossway returned no passage text');
  content.replaceChildren(...payload.passages.map(html=>safeHtml(html)));decorateReaderVerses(chapter);$('passage-status').textContent='Official ESV text';
 }catch(e){if(requestId!==state.requestId)return;content.replaceChildren(buildFallback('The Scripture service is unavailable on this deployment. The ESV link remains available.',true));$('passage-status').textContent='Service unavailable';}
}
async function renderReader(){refreshCurrentUi();const chapter=chapterRef(state.ref);if(chapter===state.chapter){markSelectedVerse();return;}state.chapter=chapter;await loadPassage(chapter);}
async function searchBible(q){showView('reader');state.chapter=null;$('reader-title').textContent=`Search: ${q}`;const box=$('passage-content');box.replaceChildren(create('div','message-panel','Searching the ESV text...'));$('passage-status').textContent='Searching ESV';const requestId=++state.requestId;try{const res=await fetch(`/api/search?q=${encodeURIComponent(q)}`);const data=await res.json();if(requestId!==state.requestId)return;if(!res.ok){box.replaceChildren(buildFallback(data.message||'Bible search is not configured.'));return;}box.replaceChildren();box.append(create('h3','',`${data.total_results} matching verses`));for(const result of data.results){const row=create('div','search-result');const btn=create('button','search-result-link',result.reference+' ↗');btn.addEventListener('click',()=>selectRef(result.reference));row.append(btn,create('p','',result.content),create('small','search-esv','ESV'));box.append(row);}$('passage-status').textContent='ESV search results';}catch{box.replaceChildren(buildFallback('Could not search the ESV at this time.',true));}}
async function buildGraphData(requestId){
 const current=state.ref,depth=state.graphDepth;
 const result=await buildAtlas(current,depth,connectionsFor,{layerWidth:10,perSource:4,cancelled:()=>requestId!==state.graphRequestId||state.ref!==current||state.view!=='connections'});
 if(!result)return;
 state.graphLinks=result.linksByRef;state.graph.setData(result);
 $('graph-progress').textContent=`${result.depthReached} of ${result.depthRequested} hops reached | ${result.nodes} verses shown${result.truncated?' | top links selected':''}`;
 $('graph-empty').hidden=result.nodes>1;
 const layers=$('graph-layer-list');layers.replaceChildren();
 for(const [i,refs] of result.layers.entries()){
  if(!i)continue;
  const group=create('details','atlas-layer');const summary=create('summary','',`Hop ${i} | ${refs.length} verses`);group.append(summary);
  const links=create('div','atlas-layer-links');for(const ref of refs){const b=create('button','',ref);b.type='button';b.addEventListener('click',()=>selectRef(ref,'connections'));links.append(b);}group.append(links);layers.append(group);
 }
}
async function renderGraph(){
 const p=parseRef(state.ref);if(p?.verse===null){state.ref=`${p.book.name} ${p.chapter}:1`;}
 const ref=state.ref, requestId=++state.graphRequestId;
 $('graph-current').textContent=ref;$('graph-info-ref').textContent=ref;
 $('graph-info-type').textContent=p?`${p.book.testament} | ${p.book.name}`:'';
 $('atlas-nasb').href=nasbUrl(ref);$('atlas-nasb').title=`Open ${ref} in the official NASB 2020 reader`;$('atlas-lsb').href=lsbUrl(ref);
 $('graph-progress').textContent='Following Scripture references...';
 const list=$('graph-details-list');list.replaceChildren(create('p','soft-note','Loading connections...'));
 if(!state.graph)state.graph=new ScriptureGraph($('graph-canvas'),next=>selectRef(next,'connections'));
 state.graph.resize();void renderAtlasPickers();
 try{await buildGraphData(requestId);if(requestId!==state.graphRequestId||state.ref!==ref)return;
  list.replaceChildren();const links=await connectionsFor(ref);if(requestId!==state.graphRequestId)return;
  if(!links.length)list.append(create('p','empty-list','No verified cross-reference recorded. Choose a neighbouring verse to continue.'));
  for(const link of links.slice(0,80)){
   const row=create('div','atlas-reference-row');const b=create('button');b.append(create('span','',link.to),create('small','',link.type==='context'?'Reading context only':link.type==='dataset'?`OpenBible.info${link.votes===undefined?'':` | ${link.votes} votes`}`:link.type));
   b.addEventListener('click',()=>selectRef(link.to,'connections'));row.append(b);list.append(row);
  }
  if(links.length>80)list.append(create('p','soft-note',`Showing 80 of ${links.length} direct connections.`));
 }catch{if(requestId!==state.graphRequestId)return;$('graph-progress').textContent='Could not load reference data';list.replaceChildren(create('p','empty-list','Could not load reference data. Try again or open a different verse.'));}
}
function renderNotebook(){const b=$('bookmarks-list'),h=$('history-list'),n=$('notes-list');b.replaceChildren();h.replaceChildren();n.replaceChildren();$('bookmarks-count').textContent=`${state.bookmarks.length} saved`;
 function item(ref,parent,remove=null,snippet=null){const row=create('div','notebook-entry');const text=create('div');const open=create('button','',ref+' ↗');open.addEventListener('click',()=>selectRef(ref));text.append(open);if(snippet)text.append(create('small','',snippet.slice(0,110)));row.append(text);if(remove){const del=create('button','delete-button','Remove');del.setAttribute('aria-label',`Remove ${ref}`);del.addEventListener('click',()=>remove(ref));row.append(del);}parent.append(row);}
 for(const ref of state.bookmarks)item(ref,b,removeBookmark);for(const ref of state.history)item(ref,h);for(const [ref,note] of Object.entries(state.notes).filter(([_,value])=>value.trim()))item(ref,n,null,note);
 if(!state.bookmarks.length)b.append(create('p','empty-list','No saved verses yet. Open a passage and select Save to build your collection.'));if(!state.history.length)h.append(create('p','empty-list','Your recently visited passages will appear here.'));if(!n.children.length)n.append(create('p','empty-list','Notes added during reading will appear here.'));
}
function removeBookmark(ref){state.bookmarks=state.bookmarks.filter(x=>x!==ref);putSaved('bookmarks',state.bookmarks);renderNotebook();setSaveButton();}
function init(){document.body.classList.toggle('light',state.theme==='light');$('theme-toggle').textContent=state.theme==='light'?'☾':'☼';$('copyright-year').textContent=String(new Date().getFullYear());populateBookPicker();initAtlasPicker();buildJourneys();
 document.addEventListener('click',e=>{const button=e.target.closest('[data-view]');if(button){showView(button.dataset.view);return;}const ref=e.target.closest('[data-open]');if(ref)selectRef(ref.dataset.open);});
 $('hero-search').addEventListener('submit',e=>{e.preventDefault();const input=$('passage-input').value.trim();const parsed=parseRef(input);if(parsed)selectRef(parsed.formatted);else if(input.length>=2)void searchBible(input);else toast('Enter a reference or search term.');});
 $('side-book').addEventListener('change',populateChapters);$('side-open').addEventListener('click',()=>selectRef(`${$('side-book').value} ${$('side-chapter').value}`));
 $('menu-toggle').addEventListener('click',()=>{const open=$('sidebar').classList.toggle('open');$('sidebar-shade').hidden=!open;$('menu-toggle').setAttribute('aria-expanded',String(open));});$('sidebar-shade').addEventListener('click',closeSidebar);
 $('theme-toggle').addEventListener('click',()=>{state.theme=state.theme==='dark'?'light':'dark';document.body.classList.toggle('light',state.theme==='light');$('theme-toggle').textContent=state.theme==='light'?'☾':'☼';putSaved('theme',state.theme);state.graph?.draw();});$('focus-search').addEventListener('click',()=>{showView('discover');$('passage-input').focus();});
 for(const id of ['prev-chapter','read-prev'])$(id).addEventListener('click',()=>{const ref=adjacentChapter(state.ref,-1);if(ref)selectRef(ref);});
 for(const id of ['next-chapter','read-next'])$(id).addEventListener('click',()=>{const ref=adjacentChapter(state.ref,1);if(ref)selectRef(ref);});
 $('bookmark-current').addEventListener('click',()=>{if(currentIsSaved())removeBookmark(state.ref);else{state.bookmarks=[state.ref,...state.bookmarks].slice(0,300);putSaved('bookmarks',state.bookmarks);setSaveButton();toast('Passage saved.');}});
 $('copy-link').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(location.href);toast('Link copied to clipboard.');}catch{toast('Copy the address from your browser.');}});
 $('ref-filter').addEventListener('change',()=>{state.filter=$('ref-filter').value;void renderConnections();});
 $('save-notes').addEventListener('click',()=>{const text=$('notes-text').value.trim();if(text)state.notes[state.ref]=text;else delete state.notes[state.ref];if(putSaved('notes',state.notes))toast(text?'Note saved on this device.':'Note cleared.');else toast('Your browser could not save this note.');});
 $('view-in-map').addEventListener('click',()=>showView('connections'));$('graph-read').addEventListener('click',()=>showView('reader'));
 $('graph-depth').addEventListener('change',()=>{state.graphDepth=Number($('graph-depth').value);void renderGraph();});$('graph-reset').addEventListener('click',()=>state.graph?.reset());$('graph-zoom-in').addEventListener('click',()=>state.graph?.zoom(1.2));$('graph-zoom-out').addEventListener('click',()=>state.graph?.zoom(.8));
 $('random-verse').addEventListener('click',()=>selectRef(PATHS[Math.floor(Math.random()*PATHS.length)].refs[0]));
 $('passage-content').addEventListener('click',e=>{const mapLink=e.target.closest('[data-atlas-ref]');if(mapLink){selectRef(mapLink.dataset.atlasRef,'connections');e.preventDefault();return;}const verse=e.target.closest('.verse-num');if(verse){const num=Number(verse.textContent.trim().match(/\d+/)?.[0]);if(num>0&&num<=176){selectRef(`${chapterRef(state.ref)}:${num}`);e.preventDefault();return;}}const link=e.target.closest('a');if(link){const match=link.textContent.match(/(?:[1-3]\s*)?[A-Za-z ]+\d{1,3}:\d{1,3}/);const parsed=parseRef(match?.[0]||link.getAttribute('title')||'');if(parsed){e.preventDefault();selectRef(parsed.formatted);}}});
 const params=new URLSearchParams(location.search);const ref=parseRef(params.get('ref'));if(ref)state.ref=ref.formatted;showView(params.get('view')||'discover',false);window.addEventListener('popstate',()=>{const p=new URLSearchParams(location.search);const parsed=parseRef(p.get('ref'));if(parsed)state.ref=parsed.formatted;showView(p.get('view')||'discover',false);});
}
init();
