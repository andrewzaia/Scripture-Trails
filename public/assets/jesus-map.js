/** Journeys of Jesus: self-hosted schematic SVG atlas. No tiles or external JavaScript. */
const SVG_NS='http://www.w3.org/2000/svg';
const PROJECT={west:30.3,east:36.2,north:33.85,south:30.05,width:1100,height:780};
export const projectLocation=([lon,lat])=>[
  (lon-PROJECT.west)/(PROJECT.east-PROJECT.west)*PROJECT.width,
  (PROJECT.north-lat)/(PROJECT.north-PROJECT.south)*PROJECT.height
];
export const passageStart=reference=>{
 const m=String(reference).match(/^((?:[1-3]\s*)?[A-Za-z ]+)\s+(\d+)(?::(\d+))?/);
 return m?`${m[1].trim()} ${m[2]}${m[3]?`:${m[3]}`:''}`:null;
};
const g=(tag,attrs={},label)=>{const e=document.createElementNS(SVG_NS,tag);for(const [key,value] of Object.entries(attrs))e.setAttribute(key,String(value));if(label!==undefined)e.textContent=label;return e;};
const el=(tag,cl,text)=>{const e=document.createElement(tag);if(cl)e.className=cl;if(text!==undefined)e.textContent=text;return e;};
const svgPath=(coords)=>coords.map((p,i)=>`${i?'L':'M'}${projectLocation(p).map(v=>v.toFixed(1)).join(' ')}`).join(' ');
// Broad modern coastline sketch: Levant coast south, then the Nile Delta coast westward.
// It exists for geographic orientation only. It does not reconstruct first-century shores.
const centreLine=[
 [35.10,33.83],[35.17,33.58],[35.20,33.27],[35.09,33.06],
 [34.98,32.91],[34.94,32.76],[34.88,32.60],[34.85,32.44],
 [34.78,32.22],[34.75,32.03],[34.75,31.86],[34.68,31.67],
 [34.55,31.54],[34.43,31.38],[34.31,31.26],[34.19,31.23],
 [33.94,31.20],[33.55,31.15],[33.10,31.24],[32.75,31.27],
 [32.35,31.27],[31.85,31.33],[31.43,31.38],[30.75,31.27],[30.30,31.11]
];
const coastPolygon=[...centreLine,[30.3,30.05],[36.2,30.05],[36.2,33.85],[35.10,33.83]];
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
export function validateJourneyData(data){
 if(!data||!Array.isArray(data.places)||!Array.isArray(data.events)||!Array.isArray(data.phases))throw Error('Malformed journey dataset');
 const sites=new Set(data.places.map(x=>x.id)),phases=new Set(data.phases.map(x=>x.id));
 if(sites.size!==data.places.length||phases.size!==data.phases.length)throw Error('Duplicate place or phase');
 for(const p of data.places)if(!p.name||!Array.isArray(p.coordinates)||p.coordinates.length!==2||!p.coordinates.every(Number.isFinite)||!['identified','approximate','uncertain','traditional','region'].includes(p.certainty))throw Error(`Invalid place ${p.id}`);
 const ids=new Set();for(const e of data.events){if(ids.has(e.id)||!sites.has(e.place)||!phases.has(e.phase)||!e.title||!e.summary||!e.passages?.length||!e.passages.every(passageStart))throw Error(`Invalid journey event ${e.id}`);ids.add(e.id);}
 return true;
}
export function createJesusMap(root,onOpenPassage){
 let data,phaseMap,placeMap,index=0,visited=[],timer=null,view={x:0,y:0,w:1100,h:780},phase='all',mode='stage';
 const $=name=>root.querySelector(`[data-jesus="${name}"]`);
 const svg=$('map');const duration=2300;
 const layer={};for(const id of ['geography','paths','pins']){layer[id]=g('g',{'data-layer':id});svg.append(layer[id]);}
 function stop(){if(timer!==null){clearInterval(timer);timer=null;}$('play').textContent='Play journey';$('play').setAttribute('aria-pressed','false');}
 function setView(){view.w=Math.max(115,Math.min(1100,view.w));view.h=view.w*780/1100;view.x=Math.max(0,Math.min(1100-view.w,view.x));view.y=Math.max(0,Math.min(780-view.h,view.y));svg.setAttribute('viewBox',`${view.x} ${view.y} ${view.w} ${view.h}`);$('zoom-out').disabled=view.w>=1099;$('zoom-in').disabled=view.w<=115;}
 function focus(coords,force=false){const [x,y]=projectLocation(coords);if(force||x<view.x+view.w*.15||x>view.x+view.w*.85||y<view.y+view.h*.13||y>view.y+view.h*.87){view.x=x-view.w/2;view.y=y-view.h/2;setView();}}
 function zoom(value){const [cx,cy]=[view.x+view.w/2,view.y+view.h/2];view.w*=value;view.x=cx-view.w/2;view.y=cy-view.w*780/1100/2;setView();}
 const background=()=>{
  layer.geography.append(g('rect',{width:1100,height:780,fill:'#a1bac1'}));
  const defs=g('defs');const pattern=g('pattern',{id:'jesus-map-grid',width:100,height:100,patternUnits:'userSpaceOnUse'});pattern.append(g('path',{d:'M 100 0 L 0 0 0 100',fill:'none',stroke:'#e5ebdd','stroke-width':0.6,opacity:'.38'}));defs.append(pattern);layer.geography.append(defs);
  layer.geography.append(g('path',{d:svgPath(coastPolygon)+' Z',fill:'#dcd8c6',stroke:'#b9c4b4','stroke-width':2}));
  layer.geography.append(g('rect',{width:1100,height:780,fill:'url(#jesus-map-grid)'}));
  const coast=g('path',{d:svgPath(centreLine),fill:'none',stroke:'#8eaca9','stroke-width':2});layer.geography.append(coast);
  // Lake and river locations are schematic only. Shapes are not archaeological reconstructions.
  const lake=projectLocation([35.58,32.84]);layer.geography.append(g('ellipse',{cx:lake[0],cy:lake[1]+11,rx:13,ry:33,fill:'#8baeb4',stroke:'#6c999f','stroke-width':2}));
  const dead=projectLocation([35.49,31.5]);layer.geography.append(g('ellipse',{cx:dead[0],cy:dead[1],rx:12,ry:56,fill:'#88a9af',stroke:'#6c999f','stroke-width':2}));
  layer.geography.append(g('path',{d:svgPath([[35.59,32.69],[35.57,32.55],[35.57,32.32],[35.54,32.17],[35.56,32.03],[35.56,31.83],[35.51,31.69]]),fill:'none',stroke:'#83acb1','stroke-width':3,'stroke-dasharray':'6 4'}));
  for(const [label,coords,klass] of [
   ['MEDITERRANEAN SEA',[33.1,32.35],'water'],['EGYPT',[31.0,30.57],'land'],['JUDEA',[34.83,31.45],'land'],['SAMARIA',[34.96,32.19],'land'],['GALILEE',[35.27,33.01],'land'],['PHOENICIA',[34.90,33.6],'land'],['PEREA',[35.93,31.75],'land'],['DECAPOLIS',[35.90,32.58],'land'],['SEA OF GALILEE',[35.58,32.58],'water'],['DEAD SEA',[35.50,31.13],'water']]){
   const [x,y]=projectLocation(coords);layer.geography.append(g('text',{x,y,'text-anchor':'middle',class:`jesus-geo-label ${klass}`},label));
  }
 };
 function getList(){return phase==='all'?data.events:data.events.filter(e=>e.phase===phase);}
 function setTimeline(){const items=getList(),e=data.events[index];let position=items.findIndex(it=>it.id===e.id);if(position<0){position=0;index=data.events.indexOf(items[0]);}
  $('timeline').max=String(items.length-1);$('timeline').value=String(position);$('timeline').setAttribute('aria-valuetext',`${position+1} of ${items.length}: ${data.events[index].title}`);
  $('step').textContent=`${position+1} / ${items.length}`;$('previous').disabled=position===0;$('next').disabled=position===items.length-1;
  $('year').textContent=phaseMap.get(data.events[index].phase).title;
 }
 function route(){layer.paths.replaceChildren();if(mode==='off')return;
  let chosen=mode==='all'?data.events.slice(0,index+1):data.events.slice(0,index+1).filter(e=>e.phase===data.events[index].phase);
  let d='';let prev=null;for(const e of chosen){const p=placeMap.get(e.place);const xy=projectLocation(p.coordinates);if(prev&&dist(xy,prev)>2){d+=` M${prev[0].toFixed(1)} ${prev[1].toFixed(1)} L${xy[0].toFixed(1)} ${xy[1].toFixed(1)}`;}prev=xy;}
  layer.paths.append(g('path',{d,fill:'none',stroke:'#f0d3a4','stroke-width':4,'stroke-linecap':'round',opacity:'.94','stroke-dasharray':'8 7','vector-effect':'non-scaling-stroke'}));
  if(index>0){const prev=placeMap.get(data.events[index-1].place);const cur=placeMap.get(data.events[index].place);if(prev.id!==cur.id)layer.paths.append(g('path',{d:svgPath([prev.coordinates,cur.coordinates]),fill:'none',stroke:'#8c5936','stroke-width':3,'stroke-linecap':'round','vector-effect':'non-scaling-stroke'}));}
 }
 function drawPins(){layer.pins.replaceChildren();const active=data.events[index].place;const visitedSites=new Set(data.events.slice(0,index+1).map(e=>e.place));
  for(const p of data.places){const [x,y]=projectLocation(p.coordinates);const pin=g('g',{transform:`translate(${x.toFixed(1)} ${y.toFixed(1)})`,class:`jesus-place-pin ${p.id===active?'selected':''} ${p.certainty==='region'?'region':''}`,role:'button',tabindex:0,'aria-label':`Show all recorded episodes at ${p.name}`});
   pin.append(g('circle',{r:p.id===active?14:9,class:'jesus-pin-ring'}),g('circle',{r:p.id===active?6:4,class:'jesus-pin-core'}));
   if(visitedSites.has(p.id))pin.append(g('circle',{cx:9,cy:-9,r:3.2,fill:'#d8b47e'}));
   pin.append(g('title',{},p.name));
   if(p.id===active){const label=g('text',{x:17,y:-14,class:'jesus-pin-label'},p.name);pin.append(label);}
   const open=()=>{stop();jumpToPlace(p.id);};
   pin.addEventListener('click',open);pin.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});
   layer.pins.append(pin);
  }
 }
 function sourceButtons(event){const div=$('passages');div.replaceChildren();for(const ref of event.passages){const wrapper=el('div','jesus-passage-row');const title=el('span','',ref);const b=el('button','jesus-reading-action','Read in Bible reader');b.type='button';b.addEventListener('click',()=>{const v=passageStart(ref);if(v)onOpenPassage(v);});wrapper.append(title,b);div.append(wrapper);}}
 function selectEvent(next,autoFocus=true){if(!data)return;index=Math.max(0,Math.min(data.events.length-1,next));const e=data.events[index],p=placeMap.get(e.place);$('place').value=p.id;
  $('event-heading').textContent=e.title;$('place-name').textContent=p.name;$('summary').textContent=e.summary;$('site-note').textContent=p.note;$('qualification').textContent=e.qualification||'This event is documented in the cited Gospel passages; the overall journey order remains a harmonised study sequence.';
  $('basis').textContent=e.evidence==='named'?'Place named in passage':e.evidence==='region'?'Region only / schematic pin':'Location inferred from context';
  $('location-grade').textContent=p.certainty==='identified'?'Location broadly identified':p.certainty==='region'?'Regional placement only':p.certainty==='traditional'?'Traditional site':p.certainty==='approximate'?'Approximate identification':'Site identification disputed';
  $('event-number').textContent=`STOP ${String(index+1).padStart(2,'0')} / ${data.events.length}`;
  sourceButtons(e);setTimeline();route();drawPins();if(autoFocus)focus(p.coordinates);
  $('map').setAttribute('aria-label',`Schematic map of Jesus' journeys, selected ${p.name}: ${e.title}`);
  const qp=new URL(window.location.href);qp.searchParams.set('stop',e.id);history.replaceState(history.state,'',qp);
 }
 function jumpToPlace(id){const matching=data.events.find(e=>e.place===id);if(!matching)return;phase='all';$('phase').value='all';selectEvent(data.events.indexOf(matching));selectPlace(id,true);}
 function selectPlace(id,move=false){const place=placeMap.get(id);if(!place)return;
 const matches=data.events.filter(e=>e.place===id);const list=$('visits');list.replaceChildren();$('visit-count').textContent=`${matches.length} recorded ${matches.length===1?'episode':'episodes'}`;
 for(const e of matches){const b=el('button','jesus-visit',`${String(data.events.indexOf(e)+1).padStart(2,'0')}  ${e.title}`);b.type='button';b.classList.toggle('active',e.id===data.events[index].id);b.addEventListener('click',()=>{stop();phase='all';$('phase').value='all';selectEvent(data.events.indexOf(e));selectPlace(id);});list.append(b);}
 $('place-caption').textContent=`${place.name} | ${place.region}`;if(move)focus(place.coordinates,true);
 }
 function move(delta){const items=getList();let pos=items.findIndex(e=>e.id===data.events[index].id);const next=items[pos+delta];if(!next){stop();return;}selectEvent(data.events.indexOf(next));selectPlace(next.place);}
 function start(){if(timer!==null){stop();return;}const items=getList();if(items.length===0)return;let pos=items.findIndex(e=>e.id===data.events[index].id);if(pos===items.length-1){selectEvent(data.events.indexOf(items[0]));selectPlace(items[0].place);}
  $('play').textContent='Pause journey';$('play').setAttribute('aria-pressed','true');timer=setInterval(()=>move(1),duration);
 }
 function bind(){
  $('phase').replaceChildren();for(const a of [{id:'all',title:'All Gospel episodes'},...data.phases]){const o=el('option','',a.title);o.value=a.id;$('phase').append(o);}
  $('place').replaceChildren();for(const p of [...data.places].sort((a,b)=>a.name.localeCompare(b.name))){const o=el('option','',p.name);o.value=p.id;$('place').append(o);}
  $('timeline').addEventListener('input',()=>{stop();const target=getList()[Number($('timeline').value)];if(!target)return;selectEvent(data.events.indexOf(target));selectPlace(target.place);});
  $('phase').addEventListener('change',()=>{stop();phase=$('phase').value;const first=getList()[0];if(first){selectEvent(data.events.indexOf(first));selectPlace(first.place);}});
  $('route').addEventListener('change',()=>{mode=$('route').value;route();});
  $('place').addEventListener('change',()=>{stop();jumpToPlace($('place').value);});
  $('previous').addEventListener('click',()=>{stop();move(-1);});$('next').addEventListener('click',()=>{stop();move(1);});$('play').addEventListener('click',start);
  $('zoom-in').addEventListener('click',()=>zoom(.75));$('zoom-out').addEventListener('click',()=>zoom(1.33));$('fit').addEventListener('click',()=>{view={x:0,y:0,w:1100,h:780};setView();});
  let drag=null;svg.addEventListener('pointerdown',e=>{if(e.target.closest('.jesus-place-pin'))return;if(e.button!==0)return;svg.setPointerCapture(e.pointerId);drag={x:e.clientX,y:e.clientY,vx:view.x,vy:view.y};});
  svg.addEventListener('pointermove',e=>{if(!drag)return;const r=svg.getBoundingClientRect();view.x=drag.vx-(e.clientX-drag.x)/r.width*view.w;view.y=drag.vy-(e.clientY-drag.y)/r.height*view.h;setView();});
  for(const ev of ['pointerup','pointercancel','lostpointercapture'])svg.addEventListener(ev,()=>{drag=null;});
  svg.addEventListener('wheel',e=>{e.preventDefault();zoom(e.deltaY<0?.9:1.1);},{passive:false});
  svg.addEventListener('keydown',e=>{if(e.target!==svg)return;const directions={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};if(directions[e.key]){e.preventDefault();view.x+=directions[e.key][0]*view.w*.12;view.y+=directions[e.key][1]*view.h*.12;setView();}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
 }
 async function load(){
  const response=await fetch('/data/jesus-journeys.json');if(!response.ok)throw Error('Cannot retrieve the itinerary');
  data=await response.json();validateJourneyData(data);$('event-total').textContent=String(data.events.length);$('place-total').textContent=String(data.places.length);$('source-total').textContent=String(data.events.reduce((n,e)=>n+e.passages.length,0));placeMap=new Map(data.places.map(p=>[p.id,p]));phaseMap=new Map(data.phases.map(p=>[p.id,p]));
  background();bind();view={x:520,y:56,w:580,h:411};setView();const initial=new URLSearchParams(location.search).get('stop');const chosen=data.events.findIndex(e=>e.id===initial);selectEvent(chosen<0?0:chosen,true);selectPlace(data.events[index].place);$('loading').hidden=true;root.dataset.ready='true';
 }
 let loading=null;return {activate(){if(!loading)loading=load().catch(e=>{$('loading').textContent='Unable to load the Gospel itinerary. Please try refreshing this page.';console.error('Journeys map:',e);});},pause:stop};
}
