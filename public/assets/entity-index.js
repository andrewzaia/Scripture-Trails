import {buildEntityCatalog,findEntities,ENTITY_TYPES} from './entity-index-data.js';
import {validateCanonicalReference} from './reference-integrity.js';

const make=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
const titleMap={person:'People',place:'Places',event:'Events'};
const key=(type,id)=>type+':'+id;
/** Indexed entities reuse local source datasets. Source text is not rehosted. */
export function createEntityIndex(root,handlers={}){
 const $=id=>root.querySelector('[data-entity="'+id+'"]')||root.closest('section')?.querySelector('[data-entity="'+id+'"]');
 let initial=null,catalog,counts,filter='all',period='all',query='',selected=null,shown=32,pendingReference=null;
 const label=record=>record.type==='person'?'Person':record.type==='place'?'Place':'Event';
 const by=(type,id)=>catalog.byKey.get(key(type,id));
 const btn=(text,click,cls='entity-action')=>{const b=make('button',cls,text);b.type='button';b.addEventListener('click',click);return b;};
 const nav=(record)=>{if(!record)return;selected=key(record.type,record.id);const url=new URL(location.href);url.searchParams.set('view','entities');url.searchParams.set('type',record.type);url.searchParams.set('id',record.id);history.pushState({},'',url);renderDetail();renderList();root.querySelector('.entity-detail')?.scrollIntoView({behavior:'smooth',block:'nearest'});};
 const sourcePassage=(ref)=>{const parsed=validateCanonicalReference(ref,counts);return parsed?parsed.book+' '+parsed.startChapter+':'+(parsed.startVerse||1):ref;};
 const referenceList=(refs,cap=12)=>{const fragment=make('div','entity-ref-grid');for(const ref of [...new Set(refs)].slice(0,cap)){const item=make('div','entity-reference');item.append(make('span','',ref),btn('Read',()=>handlers.onRead?.(sourcePassage(ref))),btn('Atlas',()=>handlers.onAtlas?.(sourcePassage(ref))));fragment.append(item);}if(refs.length>cap)fragment.append(make('p','entity-muted','Additional passages exist in this index; use the related entries for further study.'));return fragment;};
 function pills(records,limit=15){
  const list=make('div','entity-pill-list');for(const record of records.slice(0,limit))list.append(btn(record.title,()=>nav(record),'entity-pill'));
  if(records.length>limit)list.append(make('span','entity-muted',`+ ${records.length-limit} more indexed entries. Use search to locate them.`));
  return list;
 }
 const relatedEvents=person=>person.events.map(id=>by('event',id)).filter(Boolean);
 function renderDetail(){
  const panel=$('detail');panel.replaceChildren();const record=selected&&catalog.byKey.get(selected);
  if(!record){panel.append(make('h2','','Choose an entry'),make('p','entity-muted','Select a person, place or event to inspect its references and related entries.'));return;}
  panel.append(make('p','eyebrow',label(record)+' / SOURCE-LINKED INDEX'),make('h2','',record.title));
  panel.append(make('p','entity-disambiguation',record.disambiguation),make('p','entity-lead',record.summary));
  if(record.aliases.length)panel.append(make('p','entity-muted','Alternative names or search terms: '+record.aliases.join(', ')+'. These are search aids, not proof that differing historical names identify the same person or location.'));
  if(record.type==='person'){
   panel.append(make('h3','','Relationships described in Scripture'));
   if(!record.relationships.length)panel.append(make('p','entity-muted','No relationship is registered for this initial profile.'));
   for(const edge of record.relationships){const row=make('div','entity-relationship');row.append(btn(by('person',edge.to)?.title||edge.to,()=>nav(by('person',edge.to)),'entity-text-button'),make('span','',edge.label),btn(edge.ref,()=>handlers.onRead?.(sourcePassage(edge.ref)),'entity-link-ref'));panel.append(row);}
  }
  if(record.type==='place'){
   panel.append(make('h3','','Location and historical evidence'),make('p','entity-muted',record.caution),make('p','entity-muted','Record type: '+(record.kind||'Gospel setting')+'. '+record.sourceStatus+'. No event-level archaeological coordinate is implied.'));
   if(record.cityStudy)panel.append(btn('Open detailed city study',()=>handlers.onCity?.(record.cityStudy)));
   const mappedEvent=record.events.find(id=>by('event',id)?.isJourney);if(mappedEvent)panel.append(btn('Locate on the Gospel map',()=>handlers.onJourney?.(mappedEvent)));
   panel.append(make('h3','','Bibliography and provenance'));
   if(!record.sourceLinks.length)panel.append(make('p','entity-muted','No independent external place study linked yet. This absence is a documented research gap.'));
   for(const source of record.sourceLinks){const link=make('a','entity-external',source.title+' - '+source.kind);link.href=source.url;link.target='_blank';link.rel='noopener noreferrer';panel.append(link);}
   if(record.oldTestament?.length)panel.append(make('h3','','Earlier biblical associations'),referenceList(record.oldTestament.map(x=>x.ref),8),make('p','entity-muted','An Old Testament place association does not imply Jesus visited that event.'));
  }
  if(record.type==='event'){
   const place=by('place',record.place);panel.append(make('h3','','Narrative setting'),pills(place?[place]:[]));
   panel.append(make('p','entity-muted','Evidence note: '+(record.evidence||'Biblical narrative')+'. '+(record.qualification||'No additional site qualification attached to this episode.')));
   if(record.issues?.length){panel.append(make('h3','','Evidence issues'));for(const issue of record.issues){panel.append(make('p','entity-muted',issue.status+': '+issue.description));for(const url of issue.links){const a=make('a','entity-external','Research source: '+new URL(url).hostname);a.href=url;a.target='_blank';a.rel='noopener noreferrer';panel.append(a);}}}
   if(record.isJourney)panel.append(btn('Open this episode on the Gospel map',()=>handlers.onJourney?.(record.id)));
   else panel.append(make('p','entity-muted','This Hebrew Bible entry is a sourced study record and does not appear on the Jesus journey map.'));
  }
  if(record.sourceLinks?.length&&record.type!=='place'){
   panel.append(make('h3','','Independent historical context'));
   for(const source of record.sourceLinks){const a=make('a','entity-external',source.title+' - '+source.kind);a.href=source.url;a.target='_blank';a.rel='noopener noreferrer';panel.append(a,make('p','entity-muted',source.scope));}
   panel.append(make('p','entity-muted','The linked source does not independently certify the entire biblical narrative.'));
  }
  panel.append(make('h3','','Primary Scripture passages'),referenceList(record.passages,record.type==='place'?8:15));
  if(record.type==='person'){
   const events=relatedEvents(record);panel.append(make('h3','','Associated biblical events'),pills(events,18));
   const places=[...new Map(events.map(e=>[e.place,by('place',e.place)]).filter(x=>x[1])).values()];panel.append(make('h3','','Places and regions in associated entries'),pills(places,15));
  }
  if(record.type==='place')panel.append(make('h3','','Indexed narratives at this place or region'),pills(record.events.map(id=>by('event',id)).filter(Boolean),18));
  if(record.type==='event'){
   const people=catalog.records.filter(x=>x.type==='person'&&x.events.includes(record.id));panel.append(make('h3','','People linked to this study entry'),pills(people,18));
   panel.append(make('p','entity-muted','These associations are index pointers. They do not establish that everyone was mentioned by name in every cited verse.'));
  }
  panel.append(make('p','entity-source-status',record.sourceStatus));
 }
 function renderList(){
  const all=findEntities(catalog,query,filter,counts,period);const list=$('list');list.replaceChildren();
  $('result-count').textContent=all.length+' matching entries'+(all.length>shown?' | showing '+shown:'');
  if(!all.length)list.append(make('p','entity-muted','No catalogued entries match this search. The index remains selective rather than exhaustive; try a different name or period.'));
  for(const record of all.slice(0,shown)){
   const item=btn('',()=>nav(record),'entity-result'+(selected===key(record.type,record.id)?' selected':''));
   item.setAttribute('aria-pressed',String(selected===key(record.type,record.id)));
   item.append(make('span','entity-item-kind',label(record)),make('strong','',record.title),make('small','',record.disambiguation));
   list.append(item);
  }
  $('more').hidden=all.length<=shown;
 }
 function renderTabs(){root.querySelectorAll('[data-entity-type]').forEach(b=>{const on=b.dataset.entityType===filter;b.setAttribute('aria-pressed',String(on));b.classList.toggle('selected',on);});}
 function setup(){
  root.dataset.ready='true';$('loading').hidden=true;
  $('totals').textContent=catalog.count.person+' people | '+catalog.count.place+' places | '+catalog.count.event+' events';
  $('search').addEventListener('input',()=>{query=$('search').value.trim();shown=32;renderList();});
  $('period').addEventListener('change',()=>{period=$('period').value;shown=32;renderList();});
  root.querySelectorAll('[data-entity-type]').forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.entityType;shown=32;renderTabs();renderList();}));
  $('more').addEventListener('click',()=>{shown+=32;renderList();});
  activate(new URLSearchParams(location.search));if(pendingReference){const ref=pendingReference;pendingReference=null;thisFocus(ref);}
 }
 function activate(params){
  if(!catalog)return;
  const type=params?.get?.('type'),id=params?.get?.('id');
  if(type&&id&&by(type,id))selected=key(type,id);
  else if(!selected)selected='person:jesus';
  renderTabs();renderList();renderDetail();
 }
 const thisFocus=ref=>{if(!catalog){pendingReference=ref;return;}filter='all';period='all';$('period').value='all';query=ref;shown=32;$('search').value=ref;renderTabs();renderList();};
 return {
  activate(params=new URLSearchParams(location.search)){
   if(initial){if(catalog)activate(params);return;}
   initial=Promise.all(['biblical-people.json','jesus-journeys.json','jesus-geography.json','jesus-audit.json','city-studies.json','verse-counts.json','biblical-history.json'].map(name=>fetch('/data/'+name).then(r=>{if(!r.ok)throw Error('Missing '+name);return r.json();}))).then(([people,j,g,a,c,vs,history])=>{counts=vs;catalog=buildEntityCatalog(people,j,g,a,c,counts,history);setup();}).catch(error=>{$('loading').textContent='The index could not be loaded. Please retry later.';console.error(error);});
  },
  focusReference(ref){thisFocus(ref);}
 };
}
