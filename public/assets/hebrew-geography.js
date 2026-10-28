import {parseRef} from './books.js';
import {validateCanonicalReference} from './reference-integrity.js';

const VERSION=new URL(import.meta.url).searchParams.get('v')||'local';
const STATUS={regional:'Regional setting',disputed:'Identification debated',unresolved:'Exact setting unassigned'};
const PEOPLE={moses:'Moses','aaron-moses':'Aaron','miriam-moses':'Miriam','joshua-nun':'Joshua son of Nun'};
const make=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
const action=(text,run)=>{const n=make('button','hb-action',text);n.type='button';n.addEventListener('click',run);return n;};
const text=value=>typeof value==='string'&&value.trim().length>0;
const https=value=>{try{return new URL(value).protocol==='https:';}catch{return false;}};
const dated=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;
export function passageAnchor(ref){const p=parseRef(ref);return p?`${p.book.name} ${p.chapter}:${p.verse||1}`:null;}

export function validateHebrewGeography(data,counts,entityIds=null){
 if(data?.schema!==1||!dated(data.updated)||data.collection?.id!=='exodus'||!['title','scope','method','review','geography','chronology'].every(k=>text(data.collection[k])))throw Error('Missing Hebrew Bible collection metadata');
 const unique=(items,label)=>{if(!Array.isArray(items)||!items.length)throw Error('Missing '+label);const ids=new Set();for(const i of items){if(!/^[a-z0-9-]+$/.test(i.id)||ids.has(i.id))throw Error('Duplicate or invalid '+label+' ID');ids.add(i.id);}return ids;};
 const phases=unique(data.phases,'phase'),places=unique(data.places,'setting'),stages=unique(data.stages,'stage'),comparisons=unique(data.comparisons,'comparison');
 if(!data.sources||Array.isArray(data.sources)||!Object.keys(data.sources).length)throw Error('Missing source registry');
 for(const [id,s] of Object.entries(data.sources))if(!/^[a-z0-9-]+$/.test(id)||!['title','author','kind','scope','limitation','access','rights'].every(k=>text(s[k]))||!https(s.url)||!dated(s.accessed))throw Error('Invalid supporting source '+id);
 const sourceIds=ids=>{if(!Array.isArray(ids)||new Set(ids).size!==ids.length||ids.some(id=>!data.sources[id]))throw Error('Unknown or repeated supporting source');};
 const references=(refs,narrative=false)=>{if(!Array.isArray(refs)||!refs.length||new Set(refs).size!==refs.length)throw Error('Missing or duplicate primary references');for(const ref of refs){const r=validateCanonicalReference(ref,counts);if(!r||r.startVerse===null||r.startChapter!==r.endChapter||r.endVerse-r.startVerse+1>30||narrative&&!['Exodus','Numbers','Deuteronomy'].includes(r.book))throw Error('Invalid or oversized primary reference '+ref);}};
 for(const phase of data.phases)if(!text(phase.title))throw Error('Invalid phase');
 for(const place of data.places){
  if(!text(place.name)||!text(place.note)||!STATUS[place.status]||place.coordinates!==null||!Array.isArray(place.related))throw Error('Invalid or unqualified geography '+place.id);
  sourceIds(place.sourceIds);
  for(const e of place.related)if(!['person','place'].includes(e.type)||!text(e.label)||!/^[a-z0-9-]+$/.test(e.id)||entityIds&&!entityIds.has(e.type+':'+e.id))throw Error('Unknown related entity');
 }
 let previousPhase=-1;
 for(const [index,stage] of data.stages.entries()){
  const pi=data.phases.findIndex(p=>p.id===stage.phase);
  if(stage.order!==index+1||!phases.has(stage.phase)||pi<previousPhase||!places.has(stage.place)||!text(stage.title)||!text(stage.summary)||!text(stage.caution)||stage.review!=='editorial-reading-aid'||stage.date!==null)throw Error('Invalid reading stage '+stage.id);
  previousPhase=pi;references(stage.passages,true);
  if(!Array.isArray(stage.people)||new Set(stage.people).size!==stage.people.length||stage.people.some(id=>!PEOPLE[id]||entityIds&&!entityIds.has('person:'+id)))throw Error('Unknown study profile');
  if(!Array.isArray(stage.comparisonIds)||new Set(stage.comparisonIds).size!==stage.comparisonIds.length||stage.comparisonIds.some(id=>!comparisons.has(id)))throw Error('Unknown comparison');
  const checked=stage.primaryCheck;
  if(!checked||!https(checked.url)||!dated(checked.date)||checked.method!=='AI-assisted primary chapter reading'||!['bible.usccb.org','www.esv.org'].includes(new URL(checked.url).hostname))throw Error('Missing primary reading check');
 }
 if(data.phases.some(p=>!data.stages.some(s=>s.phase===p.id))||data.places.some(p=>!data.stages.some(s=>s.place===p.id)))throw Error('Unused phase or setting');
 for(const c of data.comparisons){
  if(!text(c.title)||!text(c.summary)||!text(c.caution)||!Array.isArray(c.candidates)||c.candidates.length<2||new Set(c.candidates.map(x=>x.title)).size!==c.candidates.length)throw Error('Incomplete comparison');
  references(c.passages);
  for(const candidate of c.candidates){if(!text(candidate.title)||!text(candidate.basis)||!text(candidate.note)||!candidate.sourceIds?.length)throw Error('Unattributed candidate');sourceIds(candidate.sourceIds);}
 }
 return true;
}

export function filterHebrewStages(data,phase='all',query=''){
 const q=String(query).trim().toLocaleLowerCase();const places=new Map(data.places.map(p=>[p.id,p]));
 return data.stages.filter(s=>(phase==='all'||s.phase===phase)&&(!q||[s.title,s.summary,s.caution,places.get(s.place)?.name,...s.passages].join(' ').toLocaleLowerCase().includes(q)));
}
export function restoreHebrewSelection(data,params){
 let phase=data.phases.some(p=>p.id===params.get('hb-phase'))?params.get('hb-phase'):'all';
 const query=(params.get('hb-q')||'').slice(0,150),stageId=params.get('hb-stage');
 const matches=filterHebrewStages(data,phase,query);
 return {phase,query,stageId:matches.some(s=>s.id===stageId)?stageId:matches[0]?.id||null};
}

export function createHebrewGeography(root,handlers={}){
 const $=id=>root.querySelector(`[data-hb="${id}"]`);
 let data,places,selected=null,phase='all',query='',loading=null,active=false;
 const current=()=>filterHebrewStages(data,phase,query);
 function link(label,url){const a=make('a','hb-source-link',label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;}
 function passageRow(ref){const row=make('div','hb-passage');row.append(make('strong','',ref),action('Read',()=>handlers.onRead?.(ref)),action('Atlas',()=>handlers.onAtlas?.(passageAnchor(ref))));return row;}
 function sourceLinks(ids){const n=make('div','hb-source-links');for(const id of ids){const source=data.sources[id];n.append(link(source.title,source.url),make('p','hb-muted',source.scope));}return n;}
 function save(){if(!active)return;const url=new URL(location.href);url.searchParams.set('hb-phase',phase);if(query)url.searchParams.set('hb-q',query);else url.searchParams.delete('hb-q');if(selected)url.searchParams.set('hb-stage',selected.id);else url.searchParams.delete('hb-stage');history.replaceState(history.state,'',url);}
 function renderList(){
  const items=current();$('list').replaceChildren();$('result-count').textContent=`${items.length} of ${data.stages.length} selected readings`;
  for(const stage of items){const b=action(`${String(stage.order).padStart(2,'0')}  ${stage.title}`,()=>choose(stage,true));b.className='hb-stage';b.dataset.hbStage=stage.id;b.append(make('small','',places.get(stage.place).name+' | '+stage.passages.join('; ')));if(selected?.id===stage.id)b.setAttribute('aria-current','step');$('list').append(b);}
  if(!items.length)$('list').append(make('p','hb-muted','No readings match these filters. Clear the search or choose another section.'));
  for(const b of $('phases').querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.hbPhase===phase));
 }
 function renderDetail(){
  $('detail').hidden=!selected;if(!selected)return;const s=selected,p=places.get(s.place),items=current(),position=items.findIndex(i=>i.id===s.id);
  $('stage-label').textContent=`READING ${s.order} OF ${data.stages.length} | ${data.phases.find(x=>x.id===s.phase).title}`;
  $('heading').textContent=s.title;$('summary').textContent=s.summary;$('place-name').textContent=p.name;$('place-status').textContent=STATUS[p.status];$('place-note').textContent=p.note;$('caution').textContent=s.caution;
  $('passages').replaceChildren(...s.passages.map(passageRow));$('location-sources').replaceChildren(sourceLinks(p.sourceIds));
  if(!p.sourceIds.length)$('location-sources').append(make('p','hb-muted','The cited Bible passage supplies this setting. No independently checked site identification is attached to this record.'));
  $('primary-check').replaceChildren(link('Primary chapter used for the editorial reading check',s.primaryCheck.url),make('p','hb-muted','AI-assisted primary-text check, '+s.primaryCheck.date+'. Read the selected passage in your chosen reader edition above.'));
  $('related').replaceChildren(...s.people.map(id=>action(PEOPLE[id],()=>handlers.onEntity?.('person',id))),...p.related.map(e=>action(e.label,()=>handlers.onEntity?.(e.type,e.id))));
  $('related-index').onclick=()=>handlers.onIndex?.(s.passages[0]);
  $('stage-comparisons').replaceChildren(...s.comparisonIds.map(id=>action(data.comparisons.find(c=>c.id===id).title,()=>{const panel=$('comparisons').querySelector(`[data-hb-comparison="${id}"]`);panel.open=true;panel.scrollIntoView({block:'start',behavior:'smooth'});panel.querySelector('summary').focus({preventScroll:true});})));
  $('previous').disabled=position<=0;$('next').disabled=position>=items.length-1;
 }
 function choose(stage,focus=false){selected=stage;renderList();renderDetail();save();if(focus){$('heading').focus({preventScroll:true});if(window.matchMedia('(max-width:900px)').matches)$('detail').scrollIntoView({block:'start',behavior:'smooth'});}}
 function applyFilters(){phase=$('phase').value;query=$('search').value.trim().slice(0,150);const items=current();choose(items.find(s=>s.id===selected?.id)||items[0]||null);}
 function renderResearch(){
  $('comparisons').replaceChildren();for(const c of data.comparisons){const details=make('details','hb-comparison');details.dataset.hbComparison=c.id;details.append(make('summary','',c.title),make('p','',c.summary));const candidates=make('div','hb-candidates');for(const p of c.candidates){const n=make('article','hb-candidate');n.append(make('h3','',p.title),make('p','hb-basis',p.basis),make('p','',p.note),sourceLinks(p.sourceIds));candidates.append(n);}details.append(candidates,...c.passages.map(passageRow),make('p','hb-caution',c.caution));$('comparisons').append(details);}
  $('sources').replaceChildren();for(const s of Object.values(data.sources)){const d=make('details','hb-source');d.append(make('summary','',s.title),make('p','hb-basis',s.author),make('p','',s.scope),make('p','hb-caution',s.limitation),make('p','hb-muted',s.access),make('p','hb-muted','Accessed '+s.accessed+'. '+s.rights),link('Open '+s.title,s.url));$('sources').append(d);}
  for(const key of ['scope','method','review','geography','chronology'])$(key).textContent=data.collection[key];
 }
 function restore(params){const state=restoreHebrewSelection(data,params);phase=state.phase;query=state.query;$('phase').value=phase;$('search').value=query;choose(data.stages.find(s=>s.id===state.stageId)||null);}
 function bind(){
  for(const p of [{id:'all',title:'All sections'},...data.phases]){const o=make('option','',p.title);o.value=p.id;$('phase').append(o);const b=action(p.title,()=>{$('phase').value=p.id;applyFilters();});b.className='hb-phase';b.dataset.hbPhase=p.id;if(p.id!=='all')b.append(make('strong','',String(data.stages.filter(s=>s.phase===p.id).length)));$('phases').append(b);}
  $('search').addEventListener('input',applyFilters);$('phase').addEventListener('change',applyFilters);$('clear').addEventListener('click',()=>{$('phase').value='all';$('search').value='';applyFilters();$('search').focus();});
  for(const [id,delta] of [['previous',-1],['next',1]])$(id).addEventListener('click',()=>{const items=current(),index=items.findIndex(s=>s.id===selected?.id),next=items[index+delta];if(next)choose(next);});
 }
 async function load(){
  const [collection,counts]=await Promise.all(['hebrew-geography.json','verse-counts.json'].map(file=>fetch('/data/'+file+'?v='+encodeURIComponent(VERSION)).then(r=>{if(!r.ok)throw Error('Collection unavailable');return r.json();})));
  validateHebrewGeography(collection,counts);data=collection;places=new Map(data.places.map(p=>[p.id,p]));bind();renderResearch();restore(new URLSearchParams(location.search));
  $('reading-total').textContent=String(data.stages.length);$('setting-total').textContent=String(data.places.length);$('comparison-total').textContent=String(data.comparisons.length);$('loading').hidden=true;root.dataset.ready='true';
 }
 return {activate(params=new URLSearchParams(location.search)){active=true;if(data){restore(params);return Promise.resolve();}if(!loading){$('loading').hidden=false;loading=load().catch(()=>{loading=null;$('loading').replaceChildren(make('p','','The collection could not load. Try again.'),action('Retry',()=>{void this.activate();}));});}return loading;},suspend(){active=false;}};
}
