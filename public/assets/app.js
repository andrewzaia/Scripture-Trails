import {appendCitationReview,renderCitationSummary} from './citation-review.js?v=0.31.0';
import {PERSON_TRAILS,findPersonTrails} from './person-trails.js?v=0.31.0';
import {createStudyCollections} from './study-collections.js?v=0.31.0';
import {createAnnotations,applyHighlights,canonicalVerse,validateAnnotations,emptyAnnotations} from './annotations.js?v=0.31.0';
import {renderReadingPlan} from './reading-plans.js?v=0.31.0';
import {createNotebookBackup,persistNotebook} from './notebook-backup.js?v=0.31.0';
import {BOOKS,findBook,parseRef,referenceFor,chapterRef,adjacentChapter,readerScope} from './books.js';
import {PATHS,EDITORIAL_LINKS} from './studies.js';
import {ScriptureGraph} from './graph.js?v=0.31.0';
import {createJesusMap} from './jesus-map.js?v=0.31.0';
import {createPaulMap} from './paul-map.js?v=0.31.0';
import {createHebrewGeography} from './hebrew-geography.js?v=0.31.0';
import {createRoadmap} from './roadmap.js?v=0.31.0';
import {createCityStudies} from './city-studies.js?v=0.31.0';
import {createEntityIndex} from './entity-index.js?v=0.31.0';
import {buildAtlas} from './atlas-paths.js';
import {initPublicReleases} from './release-notes.js?v=0.31.0';
import {maxDatasetVotes,relativeVoteBars} from './atlas-strength.js';
import {CONNECTION_EVIDENCE,CONNECTION_KINDS,explainConnection,REVIEW_LABELS} from './connection-evidence.js?v=0.31.0';
import {createPassageComparison} from './atlas-comparison.js?v=0.31.0';
import {TRANSLATIONS,getTranslation} from './translations.js';
import {reportScriptureView} from './fums.js';
import {TRANSLATION_STATUS,statusForResponse} from './translation-status.js?v=20261027-indicators';

const $=id=>document.getElementById(id);
const pick=(s,root=document)=>root.querySelector(s);
const editorial=new Map();
for(const link of EDITORIAL_LINKS){const a=parseRef(link.from)?.formatted,b=parseRef(link.to)?.formatted;if(!a||!b)continue;for(const [from,to] of [[a,b],[b,a]]){if(!editorial.has(from))editorial.set(from,[]);editorial.get(from).push({...link,from,to});}}
const getSaved=(key,defaultValue)=>{try{if(key==='notes'||key==='bookmarks'||key==='readingPlans'||key==='annotations'||key==='collections'){const notebook=JSON.parse(localStorage.getItem('scripture-trails:notebook'));if(notebook&&Object.prototype.hasOwnProperty.call(notebook,key))return notebook[key];}const parsed=JSON.parse(localStorage.getItem(`scripture-trails:${key}`));return parsed===null?defaultValue:parsed;}catch{return defaultValue;}};
const putSaved=(key,value)=>{try{if(key==='notes'||key==='bookmarks'||key==='readingPlans'||key==='annotations'||key==='collections'){const notebook={notes:getSaved('notes',{}),bookmarks:getSaved('bookmarks',[]),readingPlans:getSaved('readingPlans',{}),annotations:getSaved('annotations',emptyAnnotations()),collections:getSaved('collections',[]),[key]:value};localStorage.setItem('scripture-trails:notebook',JSON.stringify(notebook));}else localStorage.setItem(`scripture-trails:${key}`,JSON.stringify(value));return true;}catch{return false;}};
const state={translation:getTranslation(getSaved('translation','ESV'))?.code||'ESV',loadedTranslation:null,pendingTranslation:null,fums:null,view:'discover',ref:'John 1:1',loadedPassage:null,pendingPassage:null,bookmarks:getSaved('bookmarks',[]),notes:getSaved('notes',{}),readingPlans:getSaved('readingPlans',{}),annotations:getSaved('annotations',emptyAnnotations()),collections:getSaved('collections',[]),history:getSaved('history',[]),theme:getSaved('theme','dark'),filter:'all',journey:null,links:[],graph:null,graphDepth:3,graphLinks:{},graphRequestId:0,graphEvidenceFilter:'all',atlasPreviewRef:null,atlasPreviewRequestId:0,requestId:0,jesusMap:null};
const translationStatuses=new Map(TRANSLATIONS.map(edition=>[edition.code,'available']));
const translationRequests=new Map();
function renderTranslationStatuses(){
 for(const button of document.querySelectorAll('#translation-statuses [data-translation]')){
  const code=button.dataset.translation,status=translationStatuses.get(code)||'available';
  const detail=TRANSLATION_STATUS[status];
  button.dataset.status=status;
  button.dataset.selected=String(code===state.translation);
  button.title=`${getTranslation(code).name}: ${detail.label}. ${detail.description}`;
  button.setAttribute('aria-label',`${code}: ${detail.label}`);
 }
}
function setTranslationStatus(code,status){
 if(!getTranslation(code)||!TRANSLATION_STATUS[status])return;
 translationStatuses.set(code,status);renderTranslationStatuses();
}
function selectTranslation(code){
 const edition=getTranslation(code);if(!edition)return;
 state.translation=edition.code;putSaved('translation',state.translation);renderTranslationStatuses();
 if(state.view==='connections')void renderAtlasPreview(state.atlasPreviewRef||state.ref);
 else void renderReader();
 updateUrl();
}
const bookCache=new Map();let referenceManifest=null,verseCounts=null;let roadmapPage=null,cityStudiesPage=null,entityIndexPage=null,passageComparison=null,paulMapPage=null,hebrewGeographyPage=null;let toastTimer;
async function hasImportedReferences(){if(referenceManifest===null){referenceManifest=fetch('/data/refs/manifest.json?v=20261027-local').then(r=>r.ok?r.json():{enabled:false}).catch(()=>({enabled:false}));}return (await referenceManifest).enabled===true;}
const create=(tag,className,text)=>{const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;};
function toast(message){const el=$('toast');el.textContent=message;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),2500);}
function esvUrl(ref){return `https://www.esv.org/${encodeURIComponent(ref.replace(/\s/g,'+')).replace(/%2B/g,'+')}/`;}
function bibleBookSlug(name){return name.toLowerCase().replace(/\s+/g,'-');}
function nasbUrl(ref){const p=parseRef(ref);return p?`https://bible.lockman.org/nasb2020/${bibleBookSlug(p.book.name)}/${p.chapter}`:'https://bible.lockman.org/nasb2020/';}
async function getCounts(){if(!verseCounts){verseCounts=fetch('/data/verse-counts.json').then(r=>r.ok?r.json():{}).catch(()=>({}));}return verseCounts;}
function nextReadingContext(ref,counts){const p=parseRef(ref);if(!p)return [];const count=counts?.[p.book.name]?.[p.chapter-1];if(!Number.isInteger(count)||!count)return [];const verse=p.verse||1;const to=[];if(verse>1)to.push(`${p.book.name} ${p.chapter}:${verse-1}`);if(verse<count)to.push(`${p.book.name} ${p.chapter}:${verse+1}`);return to.map(v=>({from:ref,to:v,type:'context',description:'Adjacent verse for reading context only - not an interpretative cross-reference',source:'Reading context'}));}
function updateUrl(){const url=new URL(window.location.href);url.searchParams.set('view',state.view);url.searchParams.set('ref',state.ref);url.searchParams.set('translation',state.translation);history.pushState({},'',url);}
function updateThemeControl(){const label=state.theme==='light'?'Switch to dark theme':'Switch to light theme';$('theme-toggle').textContent=state.theme==='light'?'☾':'☼';$('theme-toggle').setAttribute('aria-label',label);$('theme-toggle').title=label;}
const mobileNavigation=window.matchMedia('(max-width:760px)');
let navigationBackground=[];
let navigationHadFocus=false;
function closeSidebar(restoreFocus=false){
 $('sidebar').classList.remove('open');$('sidebar').removeAttribute('role');$('sidebar').removeAttribute('aria-modal');
 $('menu-toggle').setAttribute('aria-expanded','false');$('sidebar-shade').hidden=true;document.body.classList.remove('navigation-open');
 for(const [element,inert] of navigationBackground)element.inert=inert;navigationBackground=[];
 if(restoreFocus&&mobileNavigation.matches)$('menu-toggle').focus();
}
function openSidebar(){
 if(!mobileNavigation.matches||$('sidebar').classList.contains('open'))return;
 $('sidebar').classList.add('open');$('sidebar').setAttribute('role','dialog');$('sidebar').setAttribute('aria-modal','true');
 $('menu-toggle').setAttribute('aria-expanded','true');$('sidebar-shade').hidden=false;document.body.classList.add('navigation-open');
 navigationBackground=[...document.querySelectorAll('.main-column,.skip-link,#analytics-consent,#toast')].map(element=>[element,element.inert]);
 for(const [element] of navigationBackground)element.inert=true;
 $('navigation-close').focus();
}
function navigationKeydown(event){
 if(!$('sidebar').classList.contains('open'))return;
 if(event.key==='Escape'){event.preventDefault();closeSidebar(true);return;}
 if(event.key!=='Tab')return;
 const items=[...$('sidebar').querySelectorAll('a[href],button,summary,input,select,textarea,[tabindex="0"]')].filter(element=>!element.disabled&&element.getClientRects().length&&getComputedStyle(element).visibility!=='hidden');
 const first=items[0],last=items.at(-1);if(!first)return;
 if(event.shiftKey&&(document.activeElement===first||!$('sidebar').contains(document.activeElement))){event.preventDefault();last.focus();}
 else if(!event.shiftKey&&(document.activeElement===last||!$('sidebar').contains(document.activeElement))){event.preventDefault();first.focus();}
}
function showView(name,updateHistory=true,moveFocus=updateHistory){const valid=['discover','reader','connections','jesus-map','paul-map','hebrew-geography','city-studies','entities','roadmap','journeys','notebook','about'];if(!valid.includes(name))name='discover';state.view=name;document.querySelectorAll('.view').forEach(v=>{v.classList.toggle('active-view',v.id===`view-${name}`);});document.querySelectorAll('[data-view].nav-link').forEach(v=>{const current=v.dataset.view===name;v.classList.toggle('selected',current);if(current)v.setAttribute('aria-current','page');else v.removeAttribute('aria-current');});$('section-heading').textContent={discover:'Discover',reader:'Bible reader',connections:'Connection atlas','jesus-map':'Journeys of Jesus','paul-map':'Journeys of Paul','hebrew-geography':'Hebrew Bible geography','city-studies':'Historical cities',entities:'People, places and events',roadmap:'Project roadmap',journeys:'Study journeys',notebook:'My notebook',about:'About the project'}[name];document.title='Scripture Trails | '+(name==='discover'?'Discover the connections':$('section-heading').textContent);closeSidebar();if(name==='reader'){void renderReader();}if(name==='connections'){void renderGraph();}if(name==='jesus-map'){if(!state.jesusMap)state.jesusMap=createJesusMap(document.querySelector('[data-jesus-map]'),ref=>selectRef(ref,'reader'),cityId=>openCityStudy(cityId));state.jesusMap.activate();}else state.jesusMap?.pause();if(name==='paul-map'){if(!paulMapPage)paulMapPage=createPaulMap(document.querySelector('[data-paul-map]'),{onRead:ref=>selectRef(ref,'reader'),onAtlas:ref=>selectRef(ref,'connections'),onIndex:ref=>{showView('entities');entityIndexPage?.focusReference(ref);},onPerson:id=>{const url=new URL(location.href);url.searchParams.set('type','person');url.searchParams.set('id',id);history.replaceState(history.state,'',url);showView('entities');}});paulMapPage.activate(new URLSearchParams(location.search));}else paulMapPage?.pause();if(name==='hebrew-geography'){if(!hebrewGeographyPage)hebrewGeographyPage=createHebrewGeography(document.querySelector('[data-hebrew-geography]'),{onRead:ref=>selectRef(ref,'reader'),onAtlas:ref=>selectRef(ref,'connections'),onEntity:(type,id)=>{const url=new URL(location.href);url.searchParams.set('type',type);url.searchParams.set('id',id);history.replaceState(history.state,'',url);showView('entities');},onIndex:ref=>{showView('entities');entityIndexPage?.focusReference(ref);}});hebrewGeographyPage.activate(new URLSearchParams(location.search));}else hebrewGeographyPage?.suspend();if(name==='city-studies'){if(!cityStudiesPage)cityStudiesPage=createCityStudies(document.querySelector('[data-city-studies]'),{onRead:ref=>selectRef(ref,'reader'),onAtlas:ref=>selectRef(ref,'connections'),onJourney:cityId=>{const first={jerusalem:'j002',nazareth:'j005',capernaum:'j013',bethlehem:'j001',jericho:'j058'}[cityId];if(first){window.location.assign(`/?view=jesus-map&stop=${first}`);}}});cityStudiesPage.activate(new URLSearchParams(location.search).get('city'));}if(name==='entities'){if(!entityIndexPage)entityIndexPage=createEntityIndex(document.querySelector('[data-entity-index]'),{onNotes:id=>{showView('notebook');annotationPage?.focusPlace(id);},onRead:ref=>selectRef(ref,'reader'),onAtlas:ref=>selectRef(ref,'connections'),onJourney:id=>{window.location.assign('/?view=jesus-map&stop='+encodeURIComponent(id));},onCity:id=>openCityStudy(id),onCompare:(from,to,evidence)=>comparePassages(from,to,evidence)});entityIndexPage.activate(new URLSearchParams(location.search));}if(name==='roadmap'){if(!roadmapPage)roadmapPage=createRoadmap(document.querySelector('[data-roadmap]'));roadmapPage.activate();}if(name==='about')renderCitationSummary(document.getElementById('citation-review-summary'));if(name==='notebook')renderNotebook();if(name==='journeys')renderJourneys();if(updateHistory)updateUrl();if(moveFocus)$('main').focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});document.dispatchEvent(new CustomEvent('scripturetrails:view-change',{detail:{view:name}}));}
function comparePassages(from,to,evidence=null){
 if(state.view!=='connections')selectRef(from,'connections');
 if(!passageComparison)passageComparison=createPassageComparison($('atlas-compare'),{
  sanitize:safeHtml,onViewed:reportScriptureView,getEdition:()=>state.translation,
  onRead:ref=>selectRef(ref,'reader')
 });
 return passageComparison.open(from,to,evidence||explainConnection(from,to));
}
function openCityStudy(cityId){const url=new URL(location.href);url.searchParams.set('city',cityId);history.replaceState(history.state,'',url);showView('city-studies');cityStudiesPage?.activate(cityId);}
function selectRef(ref,view='reader',updateHistory=true){const parsed=parseRef(ref);if(!parsed){toast('Please enter a valid Bible reference.');return;}state.ref=(view==='connections'&&parsed.verse===null)?`${parsed.book.name} ${parsed.chapter}:1`:parsed.formatted;state.history=[state.ref,...state.history.filter(x=>x!==state.ref)].slice(0,12);putSaved('history',state.history);const sameView=state.view===view;if(sameView&&view==='reader'){if($('passage-content').contains(document.activeElement))$('main').focus({preventScroll:true});void renderReader();}else if(sameView&&view==='connections'){void renderGraph();}else showView(view,false,true);if(updateHistory)updateUrl();}
function makeJourneyCard(path){const button=create('button','journey-card');button.type='button';const meta=create('div','card-meta');meta.append(create('span','',path.label),create('span','card-number',path.number));const heading=create('h3','',path.name);const summary=create('p','',path.summary);const bottom=create('div','card-bottom');bottom.append(create('span','',`${path.chapters.length} stages | ${(state.readingPlans[path.id]||[]).length}/${path.refs.length} passages read`),create('span','','↗'));button.append(meta,heading,summary,bottom);button.addEventListener('click',()=>openJourney(path.id));return button;}
function openPersonTrail(id){if(!PERSON_TRAILS.some(t=>t.personId===id))return;const url=new URL(location.href);url.searchParams.set('type','person');url.searchParams.set('id',id);history.replaceState(history.state,'',url);showView('entities');}
function renderPersonTrailDirectory(){
 const list=$('person-trail-list'),items=findPersonTrails($('person-trail-search').value,$('person-trail-corpus').value);list.replaceChildren();
 for(const trail of items){const card=create('article','person-trail-card'),button=create('button','small-action',trail.title);button.type='button';button.addEventListener('click',()=>openPersonTrail(trail.personId));card.append(button,create('p','',trail.corpus+' | '+trail.stages.length+' selected passages'),create('p','soft-note','Primary Scripture; editorial reading aid. Specialist review pending.'));list.append(card);}
 if(!items.length)list.append(create('p','empty-list','No person trails match these filters. Try another name, passage or topic.'));
 $('person-trail-count').textContent=items.length+' of '+PERSON_TRAILS.length+' person trails';
}
function buildJourneys(){renderPersonTrailDirectory();PATHS.slice(0,3).forEach(x=>$('home-journeys').append(makeJourneyCard(x)));PATHS.forEach(x=>$('all-journeys').append(makeJourneyCard(x)));}
function openJourney(id){if(!PATHS.some(p=>p.id===id))return;state.journey=id;showView('journeys');$('journey-detail').scrollIntoView({behavior:'smooth',block:'start'});}
function drawJourney(id){
 const path=PATHS.find(p=>p.id===id);if(!path)return;
 const target=$('journey-detail');target.hidden=false;target.replaceChildren();
 target.append(create('p','eyebrow',path.label),create('h2','',path.name),create('p','',path.summary));
 const intro=create('div','journal-intro');
 intro.append(create('p','journal-intro-count',`${path.chapters.length} guided stages | ${path.refs.length} distinct reading references | Self-paced`),
  create('p','', 'Each stage follows a thematic reading route: begin with the passages, compare the stated connection, then consider the question and contextual caution. These are editorial guides, not independent historical proofs or a substitute for reading the full chapters.'));
 target.append(intro);
 const anchorSection=create('section','journal-foundations');
 anchorSection.append(create('h3','','Starting passages'),create('p','', 'The original anchor references remain available, and previously saved reading progress is preserved.'));
 const anchorLinks=create('div','journal-reading-links');
 for(const ref of path.anchors){
  const b=create('button','journey-step');b.type='button';b.append(create('span','','\u25c7'),create('strong','',ref));
  b.setAttribute('aria-label','Read '+ref);b.addEventListener('click',()=>selectRef(ref));anchorLinks.append(b);
 }
 anchorSection.append(anchorLinks);target.append(anchorSection);
 const route=create('section','journal-route');
 route.append(create('h3','','Guided reading pathway'),create('p','', 'Open a stage for its passages, reading rationale, cross-reference and reflection. Passage buttons open the Bible reader; the Atlas link explores the first reference in the connection map.'));
 const cards=create('div','journal-chapters');
 path.chapters.forEach((stage,i)=>{
  const item=create('details','journal-chapter');item.open=i===0;
  const heading=create('summary');heading.append(create('span','journal-chapter-number',String(i+1).padStart(2,'0')),create('strong','',stage.title),create('span','journal-chapter-count',stage.readings.length+' readings'));item.append(heading);
  const body=create('div','journal-chapter-body');
  body.append(create('p','journal-chapter-focus',stage.focus),create('p','overline','READ IN THIS ORDER'));
  const links=create('div','journal-reading-links');
  stage.readings.forEach((ref,j)=>{
   const b=create('button','journey-step');b.type='button';
   b.append(create('span','',String(j+1).padStart(2,'0')),create('strong','',ref));
   b.setAttribute('aria-label','Read '+ref);b.addEventListener('click',()=>selectRef(ref));links.append(b);
  });
  body.append(links);
  const atlas=create('button','small-action journal-atlas-link','Explore the first passage in the Atlas');
  atlas.type='button';atlas.addEventListener('click',()=>selectRef(stage.readings[0],'connections'));body.append(atlas);
  const bridge=create('div','journal-bridge');bridge.append(create('h4','','CONNECTION TO EXAMINE'),create('p','',stage.connection));
  const question=create('div','journal-reflection');question.append(create('h4','','REFLECTION QUESTION'),create('p','',stage.question));
  const caution=create('div','journal-caution');caution.append(create('h4','','READING CONTEXT'),create('p','',stage.context));
  body.append(bridge,question,caution);item.append(body);cards.append(item);
 });
 route.append(cards);target.append(route);
 target.append(create('p','overline','JOURNEY-WIDE QUESTION'),create('div','journey-question',path.question));
 renderReadingPlan(target,path,{current:()=>state.readingPlans,read:ref=>selectRef(ref),save:progress=>{
  persistNotebook(localStorage,{...currentNotebook(),readingPlans:progress},currentNotebook());
  state.readingPlans=progress;
  $('all-journeys').replaceChildren(...PATHS.map(makeJourneyCard));
  $('home-journeys').replaceChildren(...PATHS.slice(0,3).map(makeJourneyCard));
 }});
}
function renderJourneys(){renderPersonTrailDirectory();$('all-journeys').replaceChildren(...PATHS.map(makeJourneyCard));const target=$('journey-detail');if(!state.journey){target.hidden=true;return;}target.hidden=false;drawJourney(state.journey);}
function populateBookPicker(){const frag=document.createDocumentFragment();for(const [label,books] of [['OLD TESTAMENT',BOOKS.slice(0,39)],['NEW TESTAMENT',BOOKS.slice(39)]]){const group=create('optgroup');group.label=label;for(const book of books){const opt=create('option','',book.name);opt.value=book.name;group.append(opt);}frag.append(group);}$('side-book').replaceChildren(frag);$('side-book').value='John';populateChapters();}
function populateChapters(){const book=findBook($('side-book').value);if(!book)return;$('side-chapter').replaceChildren(...Array.from({length:book.chapters},(_,i)=>{const opt=create('option','',String(i+1));opt.value=i+1;return opt;}));$('side-chapter').value=1;}
async function loadBookData(book){if(!book||!(await hasImportedReferences()))return {};const id=book.abbr.toLowerCase();if(bookCache.has(id))return bookCache.get(id);const promise=fetch(`/data/refs/${id}.json?v=20261027-local`).then(x=>x.ok?x.json():{}).catch(()=>({}));bookCache.set(id,promise);return promise;}
async function connectionsFor(ref){const cur=parseRef(ref);if(!cur)return [];
 const canonical=cur.verse===null?`${cur.book.name} ${cur.chapter}:1`:cur.formatted;
 const base=[...(editorial.get(canonical)||[])];const listed=new Set(base.map(link=>link.to));
 for(const entry of CONNECTION_EVIDENCE){
  const matched=entry.from===canonical?entry.to:entry.to===canonical?entry.from:null;
  if(!matched||listed.has(matched))continue;
  base.push({from:canonical,to:matched,type:entry.kind,description:entry.explanation,source:'passage-evidence'});listed.add(matched);
 }
 for(const link of base){const detail=explainConnection(canonical,link.to);if(detail){link.evidence=detail;link.type=detail.kind;link.description=detail.explanation;}}
 const archive=await loadBookData(cur.book);
 const extra=archive[`${cur.chapter}:${cur.verse||1}`]||archive[canonical]||[];
 const known=new Set(base.map(x=>x.to));
 for(const item of extra){const packed=Array.isArray(item);
  const to=packed?(BOOKS[item[0]]?`${BOOKS[item[0]].name} ${item[1]}:${item[2]}`:null):item.to;
  const parsed=parseRef(to);if(!parsed||known.has(parsed.formatted)||parsed.formatted===canonical)continue;
  const range=packed&&item.length>=6?`${BOOKS[item[6]??item[0]]?.name||BOOKS[item[0]].name} ${item[4]}:${item[5]}`:item.range;
  known.add(parsed.formatted);base.push({from:canonical,to:parsed.formatted,type:'dataset',description:range?`OpenBible.info reference range ending at ${range}, mapped by its first verse`:'OpenBible.info community-ranked link; connection type not independently verified',source:'OpenBible.info',votes:packed?item[3]:item.votes,range,evidence:explainConnection(canonical,parsed.formatted)});}
 if(!base.length)return nextReadingContext(canonical,await getCounts());
 return base.sort((a,b)=>(a.type==='dataset'?1:0)-(b.type==='dataset'?1:0)||(b.votes||0)-(a.votes||0));
}
async function renderConnections(){const ref=state.ref;const connections=await connectionsFor(ref);if(ref!==state.ref)return;state.links=connections;const filter=state.filter;$('reference-count').textContent=String(connections.length);const list=$('reference-list');list.replaceChildren();let shown=connections.filter(x=>filter==='all'||x.type===filter);shown=shown.slice(0,80);if(!shown.length){list.append(create('p','empty-list',filter==='all'?'No references recorded for this verse. Try a neighbouring verse or view Crossway callouts in the reader.':'No connections in this category for the selected verse.'));return;}
 for(const item of shown){const button=create('button','reference-item');const left=create('span');left.append(create('strong','',item.to),create('small','',item.description));const right=create('span');right.append(create('em','',item.evidence?CONNECTION_KINDS[item.evidence.kind]:item.type==='dataset'?'UNCLASSIFIED':item.type==='context'?'CONTEXT':'EDITORIAL'),create('span','arrow','↗'));button.append(left,right);button.title=item.evidence?'Editorial passage comparison, not external peer review':item.source==='Reading context'?'Neighbouring verse, not a cross-reference':item.type==='dataset'?'Community-voted link, not classified':'Editorial study suggestion without an evidence check';button.addEventListener('click',()=>selectRef(item.to));list.append(button);}
}
function renderNote(){$('highlight-ref').value=state.ref;const note=state.notes[state.ref]||'';$('notes-text').value=note;}
function currentIsSaved(){return state.bookmarks.includes(state.ref);}
function setSaveButton(){$('bookmark-current').textContent=currentIsSaved()?'★ Saved':'☆ Save';}
function refreshCurrentUi(){$('reader-translation').value=state.translation;renderTranslationStatuses();$('reader-source-name').textContent=state.translation+' via '+getTranslation(state.translation).provider;const scope=readerScope(state.ref);const p=parseRef(state.ref);$('reader-chapter-access').hidden=!scope?.focused;$('reader-scope-note').textContent=scope?.focused?`Showing only ${scope.query}`:'';$('reader-title').textContent=state.ref;$('read-on-esv').href=esvUrl(state.ref);$('read-on-nasb').href=nasbUrl(state.ref);$('read-on-nasb').title=`Open ${state.ref} in the official NASB 2020 reader`;$('prev-chapter').disabled=!adjacentChapter(state.ref,-1);$('next-chapter').disabled=!adjacentChapter(state.ref,1);$('read-prev').disabled=!adjacentChapter(state.ref,-1);$('read-next').disabled=!adjacentChapter(state.ref,1);setSaveButton();renderNote();void renderConnections();if(p){$('side-book').value=p.book.name;populateChapters();$('side-chapter').value=String(p.chapter);}if(state.view==='reader')markSelectedVerse();}
function buildFallback(message,isError=false){const div=create('div','message-panel');div.append(create('h3','',isError?'Unable to load Scripture text':`Read this passage in ${state.translation}`));div.append(create('p','',message));if(state.translation==='ESV'||state.translation==='NASB20'){const esv=state.translation==='ESV';const a=create('a','',`Open ${state.ref} in the official ${state.translation} reader ↗`);a.href=esv?esvUrl(state.ref):nasbUrl(state.ref);a.target='_blank';a.rel='noopener noreferrer';div.append(a);}return div;}
function safeHtml(raw){const doc=new DOMParser().parseFromString(raw,'text/html');const allowed=new Set(['DIV','P','H2','H3','H4','H5','SPAN','B','STRONG','EM','I','SMALL','A','SUP','SUB','BR','UL','OL','LI','BLOCKQUOTE','HR','SECTION']);
 const walker=node=>{if(node.nodeType===Node.TEXT_NODE)return document.createTextNode(node.nodeValue);if(node.nodeType!==Node.ELEMENT_NODE||['SCRIPT','STYLE','IFRAME','OBJECT','TEMPLATE'].includes(node.tagName))return document.createDocumentFragment();const name=allowed.has(node.tagName)?node.tagName.toLowerCase():'span';const el=document.createElement(name);
  const cls=(node.getAttribute('class')||'').split(/\s+/).filter(x=>/^[a-zA-Z0-9_-]{1,40}$/.test(x)).join(' ');if(cls)el.className=cls;
  if(node.id&&/^v\d{7,10}[-\d]*$/.test(node.id))el.id=node.id;
  if(name==='a'){const href=node.getAttribute('href')||'';try{const url=new URL(href,'https://www.esv.org/');if(url.protocol==='https:'&&['www.esv.org','api.bible','www.lockman.org','lockman.org','www.biblica.com','biblica.com','www.harpercollinschristian.com','www.thomasnelson.com'].includes(url.hostname)){el.href=url.href;el.target='_blank';el.rel='noopener noreferrer';}}catch{}}
  for(const child of node.childNodes)el.append(walker(child));return el;};
 const out=document.createDocumentFragment();for(const child of doc.body.childNodes)out.append(walker(child));return out;}
function markSelectedVerse(){applyHighlights($('passage-content'),state.annotations.highlights);const p=parseRef(state.ref);document.querySelectorAll('#passage-content .verse-num[data-verse-ref]').forEach(el=>el.dataset.selected=String(el.dataset.verseRef===state.ref));}
function decorateReaderVerses(chapter){
 const box=$('passage-content');for(const verseEl of box.querySelectorAll('.verse-num,.v')){
  verseEl.classList.add('verse-num');
  const value=verseEl.textContent.match(/\d+/);const number=Number(value?.[0]);if(!number||number>176)continue;
  const ref=`${chapter}:${number}`;verseEl.dataset.verseRef=ref;
  if(verseEl.nextElementSibling?.classList.contains('verse-atlas-link'))continue;
  const action=create('button','verse-atlas-link','Atlas');action.type='button';action.title=`Explore connections for ${ref}`;
  action.setAttribute('aria-label',`Atlas: Explore connections for ${ref}`);action.dataset.atlasRef=ref;verseEl.after(action);
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
function renderPassageAttribution(payload,edition){
 const box=$('passage-attribution');box.replaceChildren();box.hidden=edition.provider!=='API.Bible';
 if(edition.provider!=='API.Bible')return;
 const notice=create('div','translation-copyright');notice.append(safeHtml(payload.copyright));
 const links=create('div','translation-attribution-links');
 for(const [label,url] of [[edition.publisher,edition.publisherUrl],['Scripture supplied by API.Bible','https://api.bible/']]){const a=create('a','',label+' ↗');a.href=url;a.target='_blank';a.rel='noopener noreferrer';links.append(a);}
 const full=create('button','','Full translation attributions');full.type='button';full.dataset.view='about';links.append(full);box.append(notice,links);
 // Retain the returned notice in the About view for this page session only.
 $('copyright-'+edition.code.toLowerCase()).replaceChildren(safeHtml(payload.copyright));
}
async function loadPassage(reference){
 const requestId=++state.requestId,translation=state.translation,edition=getTranslation(translation);
 translationRequests.set(translation,requestId);
 const updateStatus=status=>{if(translationRequests.get(translation)===requestId)setTranslationStatus(translation,status);};
 state.pendingPassage=reference;state.pendingTranslation=translation;state.fums=null;
 const content=$('passage-content');
 content.replaceChildren(create('div','message-panel',`Retrieving the passage from ${edition.provider}...`));
 content.setAttribute('aria-busy','true');$('passage-attribution').hidden=true;$('passage-attribution').replaceChildren();$('passage-status').textContent=`Loading ${translation}`;
 try{
  const res=await fetch(`/api/passage?q=${encodeURIComponent(reference)}&translation=${encodeURIComponent(translation)}`,{cache:'no-store'});
  const payload=await res.json();
  if(!res.ok){
   updateStatus(statusForResponse(res.status));
   if(requestId!==state.requestId)return;
   const configured=payload.code!=='not_configured';
   content.replaceChildren(buildFallback(payload.message||'This translation is temporarily unavailable.',configured));
   $('passage-status').textContent=configured?'Service unavailable':'Translation unavailable';return;
  }
  if(!Array.isArray(payload.passages)||!payload.passages.length||payload.passages.some(p=>typeof p!=='string'))throw Error('The provider returned no passage text');
  updateStatus('available');
  if(requestId!==state.requestId)return;
  content.replaceChildren(...payload.passages.map(html=>safeHtml(html)));decorateReaderVerses(chapterRef(reference));renderPassageAttribution(payload,edition);
  $('passage-status').textContent=`Official ${translation} text`;state.loadedPassage=reference;state.loadedTranslation=translation;
  state.fums=payload.fums;if(state.view==='reader'){void reportScriptureView(state.fums);state.fums=null;}
 }catch{
  updateStatus('unavailable');
  if(requestId!==state.requestId)return;
  content.replaceChildren(buildFallback('The Scripture service is temporarily unavailable. Please try again later or choose another translation.',true));$('passage-status').textContent='Service unavailable';
 }finally{
  if(requestId===state.requestId){state.pendingPassage=null;state.pendingTranslation=null;content.setAttribute('aria-busy','false');}
 }
}
async function renderReader(){refreshCurrentUi();const requested=readerScope(state.ref)?.query;if(!requested)return;if((requested===state.loadedPassage&&state.loadedTranslation===state.translation)||(requested===state.pendingPassage&&state.pendingTranslation===state.translation)){markSelectedVerse();if(state.fums){void reportScriptureView(state.fums);state.fums=null;}return;}state.loadedPassage=null;await loadPassage(requested);}
async function searchBible(q){
 showView('reader',false,true);updateUrl();state.loadedPassage=null;state.pendingPassage=null;state.pendingTranslation=null;state.fums=null;
 $('passage-attribution').hidden=true;$('reader-source-name').textContent='Keyword search via Crossway (ESV)';$('reader-title').textContent=`Search ESV: ${q}`;
 const box=$('passage-content');box.setAttribute('aria-busy','true');box.replaceChildren(create('div','message-panel','Searching the ESV text...'));$('passage-status').textContent='Searching ESV';
 const requestId=++state.requestId;translationRequests.set('ESV',requestId);
 const updateStatus=status=>{if(translationRequests.get('ESV')===requestId)setTranslationStatus('ESV',status);};
 try{
  const res=await fetch(`/api/search?q=${encodeURIComponent(q)}`,{cache:'no-store'}),data=await res.json();
  updateStatus(statusForResponse(res.status));
  if(requestId!==state.requestId)return;
  if(!res.ok){box.replaceChildren(buildFallback(data.message||'Bible search is not configured.'));return;}
  box.replaceChildren();box.append(create('h3','',`${data.total_results} matching verses`));
  for(const result of data.results){const row=create('div','search-result');const btn=create('button','search-result-link',result.reference+' ↗');btn.addEventListener('click',()=>selectRef(result.reference));row.append(btn,create('p','',result.content),create('small','search-esv','ESV'));box.append(row);}
  $('passage-status').textContent='ESV search results';
 }catch{
  updateStatus('unavailable');if(requestId!==state.requestId)return;box.replaceChildren(buildFallback('Could not search the ESV at this time.',true));
 }finally{if(requestId===state.requestId)box.setAttribute('aria-busy','false');}
}
async function buildGraphData(requestId){
 const current=state.ref,depth=state.graphDepth;
 const result=await buildAtlas(current,depth,connectionsFor,{layerWidth:10,perSource:4,cancelled:()=>requestId!==state.graphRequestId||state.ref!==current||state.view!=='connections'});
 if(!result)return;
 state.graphLinks=result.linksByRef;state.graph.setData(result);state.graph.setPreviewRef(state.atlasPreviewRef||result.center);
 $('graph-progress').textContent=`${result.depthReached} of ${result.depthRequested} hops reached | ${result.nodes} verses shown${result.truncated?' | top links selected':''}`;
 $('graph-empty').hidden=result.nodes>1;
 const layers=$('graph-layer-list');layers.replaceChildren();
 for(const [i,refs] of result.layers.entries()){
  if(!i)continue;
  const group=create('details','atlas-layer');const summary=create('summary','',`Hop ${i} | ${refs.length} verses`);group.append(summary);
  const links=create('div','atlas-layer-links');for(const ref of refs){const b=create('button','',ref);b.type='button';b.addEventListener('click',()=>activateAtlasNode(ref,ref===state.atlasPreviewRef&&ref!==state.ref?'focus':'preview'));links.append(b);}group.append(links);layers.append(group);
 }
}
function createAtlasVoteMeter(link,highestVotes){
 const hasVotes=link.votes!==undefined&&link.votes!==null&&link.votes!==''&&Number.isFinite(Number(link.votes))&&Number(link.votes)>=0;
 const votes=hasVotes?Number(link.votes):null;
 const level=hasVotes?relativeVoteBars(votes,highestVotes):0;
 const label=hasVotes
  ?`OpenBible.info source score: ${votes} votes. Relative ranking: ${level} of 7 bars against the highest listed score (${highestVotes}). Votes include source-seeded weights and reader feedback; they are not a scholarly confidence measure.`
  :'OpenBible.info source score unavailable. This connection has not been independently reviewed.';
 const meter=create('span','atlas-vote-meter');
 meter.setAttribute('role','img');meter.setAttribute('aria-label',label);meter.title=label;
 for(let i=0;i<7;i++){const bar=create('i',`atlas-vote-bar${i<level?' filled':''}`);bar.style.height=`${5+i*2}px`;meter.append(bar);}
 return {meter,label};
}

/** A preview changes neither the Atlas centre nor the browser's passage reference. */
async function renderAtlasPreview(reference){
 const parsed=parseRef(reference);if(!parsed)return;
 const ref=parsed.formatted,translation=state.translation,edition=getTranslation(translation),requestId=++state.atlasPreviewRequestId;
 state.atlasPreviewRef=ref;
 state.graph?.setPreviewRef(ref);
 $('atlas-preview-ref').textContent=ref;
 $('atlas-preview-translation').value=translation;
 $('atlas-preview-focus').disabled=ref===state.ref;
 $('atlas-preview-help').textContent=ref===state.ref
  ?'This is the current Atlas centre. Select another node to read its passage.'
  :'Click the same node again, or choose Focus Atlas here, to explore connections from this verse.';
 const content=$('atlas-preview-content'),credit=$('atlas-preview-credit');
 content.replaceChildren(create('p','soft-note','Loading '+translation+' passage...'));
 content.setAttribute('aria-busy','true');credit.replaceChildren();
 const fresh=()=>requestId===state.atlasPreviewRequestId&&state.atlasPreviewRef===ref&&state.translation===translation&&state.view==='connections';
 try{
  const response=await fetch('/api/passage?q='+encodeURIComponent(ref)+'&translation='+encodeURIComponent(translation),{cache:'no-store'});
  const payload=await response.json();
  if(!fresh())return;
  if(!response.ok){
   content.replaceChildren(create('p','soft-note',payload.message||'This passage could not be loaded. Try a different translation or try again.'));
   return;
  }
  if(!Array.isArray(payload.passages)||!payload.passages.length||payload.passages.some(p=>typeof p!=='string'))throw Error('Missing passage text');
  content.replaceChildren(...payload.passages.map(safeHtml));
  if(edition.provider==='API.Bible'){
   if(typeof payload.copyright==='string'){
    credit.append(safeHtml(payload.copyright));
    $('copyright-'+edition.code.toLowerCase()).replaceChildren(safeHtml(payload.copyright));
   }
   for(const [label,url] of [[edition.publisher,edition.publisherUrl],['Scripture supplied by API.Bible','https://api.bible/']]){
    const link=create('a','',label);link.href=url;link.target='_blank';link.rel='noopener noreferrer';credit.append(link);
   }
   void reportScriptureView(payload.fums);
  }else{
   const link=create('a','','ESV passage text supplied by Crossway');
   link.href=esvUrl(ref);link.target='_blank';link.rel='noopener noreferrer';credit.append(link);
  }
 }catch{
  if(fresh())content.replaceChildren(create('p','soft-note','Could not retrieve this passage. Please try again or choose another translation.'));
 }finally{if(fresh())content.setAttribute('aria-busy','false');}
}
function activateAtlasNode(ref,action='preview'){
 if(action==='focus')selectRef(ref,'connections');
 else void renderAtlasPreview(ref);
}

async function renderGraph(){
 const p=parseRef(state.ref);if(p?.verse===null){state.ref=`${p.book.name} ${p.chapter}:1`;}
 const ref=state.ref, requestId=++state.graphRequestId;
 $('graph-current').textContent=ref;$('graph-info-ref').textContent=ref;
 $('graph-info-type').textContent=p?`${p.book.testament} | ${p.book.name}`:'';
 $('atlas-nasb').href=nasbUrl(ref);$('atlas-nasb').title=`Open ${ref} in the official NASB 2020 reader`;
 $('graph-progress').textContent='Following Scripture references...';
 const list=$('graph-details-list');list.replaceChildren(create('p','soft-note','Loading connections...'));
 if(!state.graph)state.graph=new ScriptureGraph($('graph-canvas'),activateAtlasNode);
 state.graph.resize();void renderAtlasPickers();void renderAtlasPreview(ref);
 try{await buildGraphData(requestId);if(requestId!==state.graphRequestId||state.ref!==ref)return;
  list.replaceChildren();const links=await connectionsFor(ref);if(requestId!==state.graphRequestId)return;
  if(!links.length)list.append(create('p','empty-list','No cross-reference listed in the available data. Try a neighbouring verse for reading context.'));
  const highestVotes=maxDatasetVotes(links);
  const filtered=links.filter(link=>state.graphEvidenceFilter==='explained'?!!link.evidence:state.graphEvidenceFilter==='unclassified'?!link.evidence:true);
  $('graph-visible-count').textContent=filtered.length+' of '+links.length+' links shown in list';
  for(const link of filtered.slice(0,80)){
   const row=create('div','atlas-reference-row');const b=create('button');b.append(create('span','',link.to));
   if(link.type==='dataset'){
    const {meter,label}=createAtlasVoteMeter(link,highestVotes);
    b.append(meter);b.title=label;
   }
   const status=link.evidence?CONNECTION_KINDS[link.evidence.kind]:link.type==='context'?'Reading context':link.type==='dataset'?'OpenBible suggestion - unclassified':'Editorial suggestion - unreviewed';
   b.append(create('small','atlas-edge-status',status));
   b.addEventListener('click',()=>activateAtlasNode(link.to,link.to===state.atlasPreviewRef&&link.to!==state.ref?'focus':'preview'));row.append(b);
   if(link.evidence){
    const e=link.evidence,note=create('details','atlas-evidence-detail');
    note.append(create('summary','','Why these passages connect'),create('p','atlas-evidence-explain',e.explanation),create('p','atlas-evidence-caution',e.caution),create('p','atlas-evidence-caution','Status: '+REVIEW_LABELS[e.review]+'. Independent specialist review pending.'),create('p','atlas-evidence-caution','Provenance: '+e.basis));appendCitationReview(note,'connection',e.id);
    const actions=create('div','atlas-evidence-actions');
    for(const [label,reference,view] of [['Read '+e.from,e.from,'reader'],['Read '+e.to,e.to,'reader'],['Read context: '+e.context,e.context,'reader'],['Atlas '+e.to,e.to,'connections']]){
     const action=create('button','small-action',label);action.type='button';action.addEventListener('click',()=>selectRef(reference,view));actions.append(action);
    }
    const compare=create('button','small-action','Compare passages side by side');compare.type='button';compare.addEventListener('click',()=>comparePassages(e.from,e.to,e));actions.append(compare);
    note.append(actions);row.append(note);
   }
   list.append(row);
  }
  if(filtered.length>80)list.append(create('p','soft-note',`Showing 80 of ${filtered.length} matching connections.`));
  if(!filtered.length)list.append(create('p','soft-note','No links match this list filter. Other links remain available and unclassified.'));
 }catch{if(requestId!==state.graphRequestId)return;$('graph-progress').textContent='Could not load reference data';list.replaceChildren(create('p','empty-list','Could not load reference data. Try again or open a different verse.'));}
}
function currentNotebook(){return {bookmarks:[...state.bookmarks],notes:{...state.notes},readingPlans:{...state.readingPlans},annotations:structuredClone(state.annotations),collections:structuredClone(state.collections)};}
let annotationPage=null,collectionPage=null;
function saveAnnotations(next){persistNotebook(localStorage,{...currentNotebook(),annotations:next},currentNotebook());state.annotations=next;applyHighlights($('passage-content'),next.highlights);}
function renderNotebook(){collectionPage?.render();annotationPage?.render();const b=$('bookmarks-list'),h=$('history-list'),n=$('notes-list');b.replaceChildren();h.replaceChildren();n.replaceChildren();$('bookmarks-count').textContent=`${state.bookmarks.length} saved`;
 function item(ref,parent,remove=null,snippet=null){const row=create('div','notebook-entry');const text=create('div');const open=create('button','',ref+' ↗');open.addEventListener('click',()=>selectRef(ref));text.append(open);if(snippet)text.append(create('small','',snippet.slice(0,110)));row.append(text);if(remove){const del=create('button','delete-button','Remove');del.setAttribute('aria-label',`Remove ${ref}`);del.addEventListener('click',()=>remove(ref));row.append(del);}parent.append(row);}
 for(const ref of state.bookmarks)item(ref,b,removeBookmark);for(const ref of state.history)item(ref,h);for(const [ref,note] of Object.entries(state.notes).filter(([_,value])=>value.trim()))item(ref,n,null,note);
 if(!state.bookmarks.length)b.append(create('p','empty-list','No saved verses yet. Open a passage and select Save to build your collection.'));if(!state.history.length)h.append(create('p','empty-list','Your recently visited passages will appear here.'));if(!n.children.length)n.append(create('p','empty-list','Notes added during reading will appear here.'));
}
function removeBookmark(ref){try{const bookmarks=state.bookmarks.filter(x=>x!==ref);persistNotebook(localStorage,{...currentNotebook(),bookmarks},currentNotebook());state.bookmarks=bookmarks;renderNotebook();setSaveButton();}catch(error){toast(error.message.replace('before importing.','before saving.'));}}
function init(){collectionPage=createStudyCollections(document.querySelector('[data-study-collections]'),{current:()=>structuredClone(state.collections),counts:getCounts,read:ref=>selectRef(ref),save:next=>{persistNotebook(localStorage,{...currentNotebook(),collections:next},currentNotebook());state.collections=next;}});annotationPage=createAnnotations(document.querySelector('[data-annotations]'),{current:()=>structuredClone(state.annotations),save:saveAnnotations,counts:getCounts,read:ref=>selectRef(ref),place:id=>{const url=new URL(location.href);url.searchParams.set('type','place');url.searchParams.set('id',id);history.replaceState(history.state,'',url);showView('entities');}});$('save-highlight').addEventListener('click',async()=>{try{const ref=canonicalVerse($('highlight-ref').value,await getCounts()),colour=$('highlight-colour').value,next=structuredClone(state.annotations);if(colour==='none')delete next.highlights[ref];else next.highlights[ref]=colour;saveAnnotations(validateAnnotations(next,await getCounts()));$('highlight-status').textContent=colour==='none'?'Highlight removed.':'Verse highlighted: '+colour+'.';}catch(e){$('highlight-status').textContent=e.message;}});createNotebookBackup(document.querySelector('[data-notebook-backup]'),{counts:getCounts,current:currentNotebook,apply:notebook=>{try{persistNotebook(localStorage,notebook,currentNotebook());}catch(error){throw Error(error.message==='Notebook changed in another tab. Reload before importing.'?error.message:'The browser could not save the import. Your existing notebook is unchanged.');}state.bookmarks=notebook.bookmarks;state.notes=notebook.notes;state.readingPlans=notebook.readingPlans||{};state.annotations=notebook.annotations||emptyAnnotations();state.collections=notebook.collections||[];renderNotebook();applyHighlights($('passage-content'),state.annotations.highlights);renderNote();setSaveButton();}});void initPublicReleases();document.body.classList.toggle('light',state.theme==='light');updateThemeControl();$('copyright-year').textContent=String(new Date().getFullYear());populateBookPicker();initAtlasPicker();buildJourneys();$('person-trail-search').addEventListener('input',renderPersonTrailDirectory);$('person-trail-corpus').addEventListener('change',renderPersonTrailDirectory);
 $('reader-translation').replaceChildren(...TRANSLATIONS.map(edition=>{const option=create('option','',`${edition.code} - ${edition.name}`);option.value=edition.code;return option;}));
 $('reader-translation').addEventListener('change',()=>selectTranslation($('reader-translation').value));
 document.addEventListener('click',e=>{const button=e.target.closest('[data-view]');if(button){showView(button.dataset.view);return;}const ref=e.target.closest('[data-open]');if(ref)selectRef(ref.dataset.open);});
 $('hero-search').addEventListener('submit',e=>{e.preventDefault();const input=$('passage-input').value.trim();const parsed=parseRef(input);if(parsed)selectRef(parsed.formatted);else if(input.length>=2)void searchBible(input);else toast('Enter a reference or search term.');});
 $('side-book').addEventListener('change',populateChapters);$('side-open').addEventListener('click',()=>selectRef(`${$('side-book').value} ${$('side-chapter').value}`));
 $('read-full-chapter').addEventListener('click',()=>{const scope=readerScope(state.ref);if(scope?.focused)selectRef(scope.chapter);});
 $('menu-toggle').addEventListener('click',()=>{$('sidebar').classList.contains('open')?closeSidebar(true):openSidebar();});$('navigation-close').addEventListener('click',()=>closeSidebar(true));$('sidebar-shade').addEventListener('click',()=>closeSidebar(true));
 document.addEventListener('keydown',navigationKeydown);document.addEventListener('focusin',event=>{if(event.target!==document.body)navigationHadFocus=$('sidebar').contains(event.target);});mobileNavigation.addEventListener('change',()=>{const wasOpen=$('sidebar').classList.contains('open'),sidebarFocused=$('sidebar').contains(document.activeElement)||navigationHadFocus;closeSidebar();if(mobileNavigation.matches&&sidebarFocused)$('menu-toggle').focus();else if(wasOpen)$('sidebar').querySelector('[aria-current="page"]')?.focus();});
 $('theme-toggle').addEventListener('click',()=>{state.theme=state.theme==='dark'?'light':'dark';document.body.classList.toggle('light',state.theme==='light');updateThemeControl();putSaved('theme',state.theme);state.graph?.draw();});$('focus-search').addEventListener('click',()=>{showView('discover');$('passage-input').focus();});
 for(const id of ['prev-chapter','read-prev'])$(id).addEventListener('click',()=>{const ref=adjacentChapter(state.ref,-1);if(ref)selectRef(ref);});
 for(const id of ['next-chapter','read-next'])$(id).addEventListener('click',()=>{const ref=adjacentChapter(state.ref,1);if(ref)selectRef(ref);});
 $('bookmark-current').addEventListener('click',()=>{if(currentIsSaved())removeBookmark(state.ref);else{try{const bookmarks=[state.ref,...state.bookmarks].slice(0,300);persistNotebook(localStorage,{...currentNotebook(),bookmarks},currentNotebook());state.bookmarks=bookmarks;setSaveButton();toast('Passage saved.');}catch(error){toast(error.message.replace('before importing.','before saving.'));}}});
 $('copy-link').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(location.href);toast('Link copied to clipboard.');}catch{toast('Copy the address from your browser.');}});
 $('ref-filter').addEventListener('change',()=>{state.filter=$('ref-filter').value;void renderConnections();});
 $('save-notes').addEventListener('click',()=>{const text=$('notes-text').value.trim(),notes={...state.notes};if(text)notes[state.ref]=text;else delete notes[state.ref];try{persistNotebook(localStorage,{...currentNotebook(),notes},currentNotebook());state.notes=notes;toast(text?'Note saved on this device.':'Note cleared.');}catch(error){toast(error.message.replace('before importing.','before saving.'));}});
 $('view-in-map').addEventListener('click',()=>showView('connections'));$('open-entity-index').addEventListener('click',()=>showView('entities'));$('reader-related-index').addEventListener('click',()=>{showView('entities');entityIndexPage?.focusReference(state.ref);});$('graph-read').addEventListener('click',()=>selectRef(state.atlasPreviewRef||state.ref,'reader'));
 $('atlas-preview-focus').addEventListener('click',()=>{if(state.atlasPreviewRef&&state.atlasPreviewRef!==state.ref)selectRef(state.atlasPreviewRef,'connections');});
 $('atlas-preview-translation').replaceChildren(...TRANSLATIONS.map(edition=>{const option=create('option','',edition.code);option.value=edition.code;return option;}));
 $('atlas-preview-translation').value=state.translation;
 $('atlas-preview-translation').addEventListener('change',()=>selectTranslation($('atlas-preview-translation').value));
 $('graph-evidence-filter').addEventListener('change',()=>{state.graphEvidenceFilter=$('graph-evidence-filter').value;void renderGraph();});
  $('graph-depth').addEventListener('change',()=>{state.graphDepth=Number($('graph-depth').value);void renderGraph();});$('graph-reset').addEventListener('click',()=>state.graph?.reset());$('graph-zoom-in').addEventListener('click',()=>state.graph?.zoom(1.2));$('graph-zoom-out').addEventListener('click',()=>state.graph?.zoom(.8));
 $('random-verse').addEventListener('click',()=>selectRef(PATHS[Math.floor(Math.random()*PATHS.length)].refs[0]));
 $('passage-content').addEventListener('click',e=>{const mapLink=e.target.closest('[data-atlas-ref]');if(mapLink){selectRef(mapLink.dataset.atlasRef,'connections');e.preventDefault();return;}const verse=e.target.closest('.verse-num');if(verse){const num=Number(verse.textContent.trim().match(/\d+/)?.[0]);if(num>0&&num<=176){selectRef(`${chapterRef(state.ref)}:${num}`);e.preventDefault();return;}}const link=e.target.closest('a');if(link){const match=link.textContent.match(/(?:[1-3]\s*)?[A-Za-z ]+\d{1,3}:\d{1,3}/);const parsed=parseRef(match?.[0]||link.getAttribute('title')||'');if(parsed){e.preventDefault();selectRef(parsed.formatted);}}});
 const params=new URLSearchParams(location.search);state.translation=getTranslation(params.get('translation'))?.code||state.translation;renderTranslationStatuses();const ref=parseRef(params.get('ref'));if(ref)state.ref=ref.formatted;showView(params.get('view')||'discover',false);window.addEventListener('popstate',()=>{const p=new URLSearchParams(location.search);state.translation=getTranslation(p.get('translation'))?.code||getTranslation(getSaved('translation','ESV'))?.code||'ESV';renderTranslationStatuses();const parsed=parseRef(p.get('ref'));if(parsed)state.ref=parsed.formatted;showView(p.get('view')||'discover',false,true);});
}
init();
