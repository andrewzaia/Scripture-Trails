import {parseRef} from './books.js';
import {validateCanonicalReference} from './reference-integrity.js';

// Narrative stages and geographic markers have separate evidence requirements.
const NS='http://www.w3.org/2000/svg';
const BOUNDS={west:10,east:38,south:29,north:43,width:1100,height:850};
const VERSION=new URL(import.meta.url).searchParams.get('v')||'local';
const CERTAINTY={approximate:'Approximate ancient site',uncertain:'Provisional site identification',island:'Island-scale orientation',region:'Regional stage - no pin',offshore:'Offshore passage - no landing pin',unlocated:'Unnamed setting - no pin'};
const element=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
const graphic=(tag,attrs={},text)=>{const n=document.createElementNS(NS,tag);for(const [key,value] of Object.entries(attrs))n.setAttribute(key,String(value));if(text!==undefined)n.textContent=text;return n;};
const button=(text,run,cls='jesus-reading-action')=>{const n=element('button',cls,text);n.type='button';n.addEventListener('click',run);return n;};
export const projectPaulLocation=([lon,lat])=>[(lon-BOUNDS.west)/(BOUNDS.east-BOUNDS.west)*BOUNDS.width,(BOUNDS.north-lat)/(BOUNDS.north-BOUNDS.south)*BOUNDS.height];
export const journeyEvents=(data,journey='all')=>data.events.filter(e=>journey==='all'||e.journey===journey);
export function narrativeConnections(data,events){
 const places=new Map(data.places.map(p=>[p.id,p]));
 return events.slice(1).flatMap((to,i)=>{
  const from=events[i],a=places.get(from.place),b=places.get(to.place);
  return from.journey===to.journey&&a?.coordinates&&b?.coordinates&&a.id!==b.id?[{from:from.id,to:to.id,coordinates:[a.coordinates,b.coordinates]}]:[];
 });
}
export function validatePaulineData(data,counts){
 if(!data?.method||!data.scope||!data.review||!data.chronology||!Array.isArray(data.journeys)||data.journeys.length!==4||!Array.isArray(data.places)||!Array.isArray(data.events)||!data.events.length||!Array.isArray(data.issues)||!data.sources)throw Error('Incomplete Pauline itinerary');
 const ids=items=>{const result=new Set();for(const item of items){if(!/^[a-z0-9-]+$/.test(item.id)||result.has(item.id))throw Error('Duplicate or invalid identifier '+item.id);result.add(item.id);}return result;};
 const journeys=ids(data.journeys),places=ids(data.places);ids(data.events);ids(data.issues);
 const refs=items=>{if(!Array.isArray(items)||!items.length||items.some(ref=>!ref.startsWith('Acts ')||!validateCanonicalReference(ref,counts)))throw Error('Invalid primary Acts reference');};
 for(const journey of data.journeys){if(!journey.title||!journey.scope||!journey.note||!data.events.some(e=>e.journey===journey.id))throw Error('Missing journey metadata');refs(journey.passages);}
 for(const place of data.places){
  const allowed={site:['approximate','uncertain'],island:['island'],region:['region'],offshore:['offshore'],unlocated:['unlocated']};
  if(!place.name||!place.note||!CERTAINTY[place.certainty]||!allowed[place.kind]?.includes(place.certainty))throw Error('Invalid place '+place.id);
  const mapped=['site','island'].includes(place.kind);
  if(mapped){
   const c=place.coordinates;if(!Array.isArray(c)||c.length!==2||!c.every(Number.isFinite)||c[0]<10||c[0]>38||c[1]<29||c[1]>43||!place.sourceId||!/^https:\/\/pleiades\.stoa\.org\/places\/\d+$/.test(place.sourceUrl)||!place.sourceTitle)throw Error('Unsourced or invalid marker '+place.id);
  }else if(place.coordinates!==null)throw Error('An unlocated or offshore stage must not receive a pin');
 }
 const closed=new Set();let previous=null;
 for(const event of data.events){
  if(!journeys.has(event.journey)||!places.has(event.place)||!event.title||!event.summary||typeof event.qualification!=='string'||event.reviewStatus!=='editorial-reading-aid')throw Error('Invalid stage '+event.id);
  if(event.study!==undefined){const n=event.study;if(!n||n.method!=='editorial-scripture-context'||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(n.reviewedOn)||typeof n.context!=='string'||n.context.trim().length<100||!Array.isArray(n.crossReferences)||n.crossReferences.length<1||n.crossReferences.length>3||new Set(n.crossReferences).size!==n.crossReferences.length||n.crossReferences.some(ref=>!validateCanonicalReference(ref,counts)))throw Error('Invalid Scripture study note '+event.id);}
  if(event.journey!==previous){if(closed.has(event.journey))throw Error('Journey stages must remain contiguous');if(previous)closed.add(previous);previous=event.journey;}refs(event.passages);
 }
 if(data.places.some(place=>!data.events.some(e=>e.place===place.id)))throw Error('Unused itinerary place');
 for(const issue of data.issues){if(!issue.title||!issue.description||(issue.sourceLinks||[]).some(s=>!s.title||!s.scope||!/^https:\/\//.test(s.url)))throw Error('Invalid research issue');refs(issue.passages);}
 return true;
}
export function validatePaulineCoast(data){
 if(data?.licence!=='Public domain'||!data.sourceUrl||!data.sourceSha256||JSON.stringify(data.bounds)!=='[10,29,38,43]'||!Array.isArray(data.rings)||!data.rings.length)throw Error('Missing coastal provenance');
 for(const ring of data.rings)if(!Array.isArray(ring)||ring.length<4||ring.some(c=>!Array.isArray(c)||c.length!==2||!c.every(Number.isFinite)||c[0]<10||c[0]>38||c[1]<29||c[1]>43))throw Error('Invalid coastal geometry');
 return true;
}

export function createPaulMap(root,handlers={}){
 const $=id=>root.querySelector(`[data-paul="${id}"]`),svg=$('map');
 let data,coast,places,journeys,loading=null,journey='first',selected=null,timer=null,enabled=true,view={x:0,y:0,w:1100,h:850};
 const layers={};for(const id of ['geography','paths','pins']){layers[id]=graphic('g',{'data-paul-layer':id});svg.append(layers[id]);}
 const path=ring=>ring.map((c,i)=>(i?'L':'M')+projectPaulLocation(c).map(n=>n.toFixed(2)).join(' ')).join(' ');
 const items=()=>journeyEvents(data,journey);
 function pause(){if(timer!==null){clearInterval(timer);timer=null;}$('play').textContent='Play journey';$('play').setAttribute('aria-pressed','false');}
 function setView(){view.w=Math.max(165,Math.min(1100,view.w));view.h=view.w*850/1100;view.x=Math.max(0,Math.min(1100-view.w,view.x));view.y=Math.max(0,Math.min(850-view.h,view.y));svg.setAttribute('viewBox',`${view.x} ${view.y} ${view.w} ${view.h}`);$('zoom-in').disabled=view.w<=165;$('zoom-out').disabled=view.w>=1100;}
 function zoom(factor){const cx=view.x+view.w/2,cy=view.y+view.h/2;view.w=Math.max(165,Math.min(1100,view.w*factor));view.h=view.w*850/1100;view.x=cx-view.w/2;view.y=cy-view.h/2;setView();}
 function fitJourney(){
  if(journey==='all'){view={x:0,y:0,w:1100,h:850};setView();return;}
  const points=items().map(e=>places.get(e.place).coordinates).filter(Boolean).map(projectPaulLocation),xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
  const west=Math.min(...xs),east=Math.max(...xs),north=Math.min(...ys),south=Math.max(...ys);
  view.w=Math.min(1100,Math.max(360,east-west+170,(south-north+150)*1100/850));view.h=view.w*850/1100;view.x=(west+east-view.w)/2;view.y=(north+south-view.h)/2;setView();
 }
 function focus(place){if(!place.coordinates)return;const [x,y]=projectPaulLocation(place.coordinates);if(x<view.x+30||x>view.x+view.w-30||y<view.y+30||y>view.y+view.h-30){view.x=x-view.w/2;view.y=y-view.h/2;setView();}}
 function saveUrl(){if(!enabled)return;const url=new URL(location.href);url.searchParams.set('paul-journey',journey);url.searchParams.set('paul-stop',selected.id);history.replaceState(history.state,'',url);}
 function background(){
  layers.geography.replaceChildren(graphic('rect',{width:1100,height:850,fill:'#a1bac1'}));
  for(const ring of coast.rings)layers.geography.append(graphic('path',{d:path(ring)+' Z',fill:'#dedaca',stroke:'#8eaaa7','stroke-width':1}));
  for(let lon=20;lon<=36;lon+=4){const [x]=projectPaulLocation([lon,40]);layers.geography.append(graphic('path',{d:`M${x} 0V850`,stroke:'#edf1e7','stroke-width':.5,opacity:.5}));}
  for(let lat=30;lat<=42;lat+=3){const [,y]=projectPaulLocation([25,lat]);layers.geography.append(graphic('path',{d:`M0 ${y}H1100`,stroke:'#edf1e7','stroke-width':.5,opacity:.5}));}
  for(const [label,c] of [['ITALY',[13,42.3]],['SICILY',[14,37.8]],['MALTA',[14.4,35.3]],['MACEDONIA',[22.3,41.9]],['ACHAIA',[20.5,38.1]],['ANATOLIA',[31,40.8]],['CYPRUS',[33.3,34.2]],['SYRIA',[36.5,35.1]],['JUDEA',[36.3,31.3]],['AEGEAN SEA',[24.2,36.7]],['MEDITERRANEAN SEA',[29.8,32.7]]]){const [x,y]=projectPaulLocation(c);layers.geography.append(graphic('text',{x,y,'text-anchor':'middle',class:'jesus-geo-label'},label));}
 }
 function draw(){
  const focusedPin=document.activeElement?.getAttribute('data-paul-place');
  const entries=items();layers.paths.replaceChildren();layers.pins.replaceChildren();
  const rect=svg.getBoundingClientRect(),unit=Math.max(view.w/(rect.width||1100),view.h/(rect.height||850));
  if($('routes').checked)for(const link of narrativeConnections(data,entries)){
   const n=graphic('path',{d:path(link.coordinates),fill:'none',stroke:link.to===selected.id?'#9b4c22':'#5f7972','stroke-width':link.to===selected.id?3.5:1.8,'stroke-dasharray':'7 5',opacity:link.to===selected.id?1:.6});
   n.append(graphic('title',{},'Narrative connector, not a known road or sailing track'));layers.paths.append(n);
  }
  const visible=new Set(entries.map(e=>e.place));
  for(const place of data.places.filter(p=>p.coordinates&&visible.has(p.id))){
   const [x,y]=projectPaulLocation(place.coordinates),active=place.id===selected.place;
   const pin=graphic('g',{transform:`translate(${x},${y})`,class:'jesus-place-pin'+(active?' selected':'')+(place.certainty==='uncertain'||place.certainty==='island'?' region':''),role:'button',tabindex:0,'aria-label':`${place.name}, ${CERTAINTY[place.certainty]}, show recorded visits`,'aria-pressed':String(active),'data-paul-place':place.id});
   pin.append(graphic('title',{},place.name+' - '+CERTAINTY[place.certainty]),graphic('circle',{r:22*unit,fill:'transparent'}),graphic('circle',{r:(active?9:6)*unit,class:'jesus-pin-ring','vector-effect':'non-scaling-stroke'}),graphic('circle',{r:2.5*unit,class:'jesus-pin-core'}));
   // Keep the overview legible; every pin has a tooltip and a matching place selector.
   if(active)pin.append(graphic('text',{x:x>view.x+view.w*.66?-14*unit:14*unit,y:-13*unit,'text-anchor':x>view.x+view.w*.66?'end':'start',class:'jesus-pin-label',style:`font-size:${12*unit}px;stroke-width:${3*unit}px`},place.name));
   const choose=()=>{pause();const target=entries.find(e=>e.place===place.id);if(target)select(target);};
   pin.addEventListener('click',choose);pin.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose();}});layers.pins.append(pin);
  }
  if(focusedPin)layers.pins.querySelector(`[data-paul-place="${focusedPin}"]`)?.focus({preventScroll:true});
 }
 function passageActions(ref){const row=element('div','jesus-passage-row'),p=parseRef(ref);row.append(element('span','',ref),button('Read',()=>handlers.onRead?.(ref)),button('Atlas',()=>handlers.onAtlas?.(`${p.book.name} ${p.chapter}:${p.verse||1}`)));return row;}
 function showList(){
  const entries=items();
  if($('list').dataset.journey===journey){for(const b of $('list').children){if(b.dataset.paulStop===selected.id)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');}return;}
  $('list').dataset.journey=journey;$('list').replaceChildren();
  for(const [i,event] of entries.entries()){
   const place=places.get(event.place),b=button(`${String(i+1).padStart(2,'0')}  ${event.title}`,()=>{pause();select(event);},'paul-stage');
   b.dataset.paulStop=event.id;b.append(element('small','',journeys.get(event.journey).title+' | '+place.name+(place.coordinates?'':' | No pin')));if(event.id===selected.id)b.setAttribute('aria-current','step');$('list').append(b);
  }
 }
 function renderDetail(){
  const event=selected,place=places.get(event.place),entries=items(),pos=entries.findIndex(e=>e.id===event.id),j=journeys.get(event.journey);
  $('heading').textContent=event.title;$('event-number').textContent=`STAGE ${pos+1} / ${entries.length}`;$('place-name').textContent=place.name;$('summary').textContent=event.summary;
  $('basis').textContent=place.kind==='offshore'?'Acts travel passage':place.kind==='unlocated'?'Unnamed setting in Acts':place.kind==='region'?'Region named in Acts':'Named setting in Acts';
  $('location-grade').textContent=CERTAINTY[place.certainty];$('site-note').textContent=place.note;$('qualification').textContent=event.qualification;$('qualification').hidden=!event.qualification;
  $('passages').replaceChildren(...event.passages.map(passageActions));
  const hasStudy=Boolean(event.study);$('study-section').hidden=!hasStudy;$('study-context').textContent=hasStudy?event.study.context:'';$('study-links').replaceChildren(...(hasStudy?event.study.crossReferences.map(passageActions):[]));
  $('source').replaceChildren();if(place.sourceUrl){const a=element('a','',`Pleiades: ${place.sourceTitle}`);a.href=place.sourceUrl;a.target='_blank';a.rel='noopener noreferrer';$('source').append(a,element('p','jesus-map-muted','Ancient place geography, not independent evidence of this visit. CC BY 3.0; contributor credits are retained in the local source snapshot.'));}else $('source').append(element('p','jesus-map-muted','The linked Acts passage supplies the setting. No point coordinate or precise boundary has been assigned.'));
  $('status').textContent=place.coordinates?'Approximate marker selected. Dashed lines show narrative connections only.':'This stage has no pin. Its location is regional, unnamed or offshore; the map remains available for orientation.';
  $('timeline').max=String(entries.length-1);$('timeline').value=String(pos);$('timeline').setAttribute('aria-valuetext',`${pos+1} of ${entries.length}: ${event.title}, ${place.name}`);
  $('step').textContent=`${pos+1} / ${entries.length}`;$('year').textContent=j.title;$('previous').disabled=pos===0;$('next').disabled=pos===entries.length-1;$('place').value=place.id;
  $('journey-note').textContent=journey==='all'?data.chronology:j.scope+' '+j.note+' Narrative stages, not calendar dates.';
  const focusedVisit=document.activeElement?.dataset.paulVisit;
  $('visits').replaceChildren();const visits=data.events.filter(e=>e.place===place.id);$('visit-count').textContent=`${visits.length} ${visits.length===1?'entry':'entries'} across the journey collection`;
  for(const visit of visits){const b=button(journeys.get(visit.journey).title+' | '+visit.title,()=>{pause();journey=visit.journey;refreshSelectors();select(visit);},'jesus-visit');b.dataset.paulVisit=visit.id;if(visit.id===event.id)b.setAttribute('aria-current','step');$('visits').append(b);}
  if(focusedVisit)$('visits').querySelector(`[data-paul-visit="${focusedVisit}"]`)?.focus({preventScroll:true});
 }
 function refreshSelectors(){
  $('journey').value=journey;const visible=new Set(items().map(e=>e.place));$('place').replaceChildren();
  for(const place of data.places.filter(p=>visible.has(p.id)).sort((a,b)=>a.name.localeCompare(b.name))){const o=element('option','',place.name+(place.coordinates?'':' (no pin)'));o.value=place.id;$('place').append(o);}
 }
 function select(event){if(!event)return;selected=event;focus(places.get(event.place));renderDetail();draw();showList();saveUrl();}
 function move(delta){const entries=items(),pos=entries.findIndex(e=>e.id===selected.id),next=entries[pos+delta];if(!next){pause();return;}select(next);if(delta>0&&pos+delta===entries.length-1)pause();}
 function play(){if(timer!==null){pause();return;}const entries=items();if(selected.id===entries.at(-1).id)select(entries[0]);$('play').textContent='Pause journey';$('play').setAttribute('aria-pressed','true');timer=setInterval(()=>move(1),2400);}
 function evidence(){
  $('method').textContent=data.method;$('review').textContent=data.review;$('chronology').textContent=data.chronology;$('issues').replaceChildren();
  for(const issue of data.issues){const item=element('article','jesus-audit-issue');item.append(element('h3','',issue.title),element('p','',issue.description),...issue.passages.map(passageActions));for(const source of issue.sourceLinks||[]){const a=element('a','',source.title);a.href=source.url;a.target='_blank';a.rel='noopener noreferrer';item.append(a,element('p','',source.scope));}$('issues').append(item);}
 }
 function bind(){
  $('journey').replaceChildren();for(const j of [...data.journeys,{id:'all',title:'All journeys and voyage'}]){const o=element('option','',j.title);o.value=j.id;$('journey').append(o);}
  $('journey').addEventListener('change',()=>{pause();journey=$('journey').value;refreshSelectors();fitJourney();select(items()[0]);});
  $('place').addEventListener('change',()=>{pause();select(items().find(e=>e.place===$('place').value));});
  $('timeline').addEventListener('input',()=>{pause();select(items()[Number($('timeline').value)]);});
  $('routes').addEventListener('change',draw);$('previous').addEventListener('click',()=>{pause();move(-1);});$('next').addEventListener('click',()=>{pause();move(1);});$('play').addEventListener('click',play);
  $('zoom-in').addEventListener('click',()=>{zoom(.75);draw();});$('zoom-out').addEventListener('click',()=>{zoom(1.34);draw();});$('fit').addEventListener('click',()=>{view={x:0,y:0,w:1100,h:850};setView();draw();});
  $('paul-profile').addEventListener('click',()=>handlers.onPerson?.('paul-apostle'));$('related-index').addEventListener('click',()=>handlers.onIndex?.(selected.passages[0]));
  let drag=null;svg.addEventListener('pointerdown',e=>{if(e.button!==0||e.target.closest('.jesus-place-pin'))return;svg.setPointerCapture(e.pointerId);drag={x:e.clientX,y:e.clientY,vx:view.x,vy:view.y,w:view.w,h:view.h};});
  svg.addEventListener('pointermove',e=>{if(!drag)return;const r=svg.getBoundingClientRect(),scale=Math.min(r.width/drag.w,r.height/drag.h);if(!scale)return;view.x=drag.vx-(e.clientX-drag.x)/scale;view.y=drag.vy-(e.clientY-drag.y)/scale;setView();});
  for(const name of ['pointerup','pointercancel','lostpointercapture'])svg.addEventListener(name,()=>{drag=null;});
  svg.addEventListener('keydown',e=>{if(e.target!==svg)return;const d={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];if(d){e.preventDefault();view.x+=d[0]*view.w*.12;view.y+=d[1]*view.h*.12;setView();}else if(e.key==='+'||e.key==='-'){e.preventDefault();zoom(e.key==='+'?.75:1.34);draw();}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
  if(typeof ResizeObserver!=='undefined')new ResizeObserver(()=>{if(selected&&enabled&&svg.getBoundingClientRect().width)draw();}).observe(svg);
 }
 function restore(params){
  pause();const requested=data.events.find(e=>e.id===params.get('paul-stop')),j=params.get('paul-journey');
  if(j==='all'||journeys.has(j))journey=j;else if(requested)journey=requested.journey;
  if(requested&&journey!=='all'&&requested.journey!==journey)journey=requested.journey;
  refreshSelectors();fitJourney();select(requested||items().find(e=>e.id===selected?.id)||items()[0]);
 }
 async function load(){
  const responses=await Promise.all(['pauline-journeys.json','pauline-coast.json','verse-counts.json'].map(name=>fetch(`/data/${name}?v=${encodeURIComponent(VERSION)}`).then(r=>{if(!r.ok)throw Error('Unable to load '+name);return r.json();})));
  const counts=responses[2];[data,coast]=responses;validatePaulineData(data,counts);validatePaulineCoast(coast);places=new Map(data.places.map(p=>[p.id,p]));journeys=new Map(data.journeys.map(j=>[j.id,j]));
  $('event-total').textContent=String(data.events.length);$('place-total').textContent=String(data.places.filter(p=>p.coordinates).length);$('unmapped-total').textContent=String(data.events.filter(e=>!places.get(e.place).coordinates).length);
  background();bind();evidence();setView();restore(new URLSearchParams(location.search));$('loading').hidden=true;root.dataset.ready='true';
 }
 return {activate(params=new URLSearchParams(location.search)){enabled=true;if(data&&root.dataset.ready==='true'){restore(params);return loading;}if(!loading)loading=load().catch(error=>{loading=null;$('loading').replaceChildren(element('span','','The Pauline journeys could not be loaded. '),button('Retry',()=>this.activate()));console.error('Pauline journeys:',error);});return loading;},pause(){enabled=false;pause();}};
}
