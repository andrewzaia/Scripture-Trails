/** Sourced biblical geography. Archaeological dates and event citations deliberately separate. */
import {parseRef} from './books.js';
import {passageStart} from './jesus-map.js';
const SVG='http://www.w3.org/2000/svg';
const kindNames={excavation:'Excavated material',heritage:'Heritage record',tradition:'Later tradition','peer-reviewed':'Peer-reviewed analysis',research:'Scholarly interpretation','academic-inventory':'Academic site record','biblical-narrative':'Biblical narrative'};
const make=(tag,cl,txt)=>{const e=document.createElement(tag);if(cl)e.className=cl;if(txt!==undefined)e.textContent=txt;return e;};
const icon=(tag,attrs,text)=>{const e=document.createElementNS(SVG,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,String(v));if(text!==undefined)e.textContent=text;return e;};
// Link directly to the published Wikimedia media files. Redirect endpoint URLs are unreliable in some browsers.
export const isApprovedPhotoUrl=url=>typeof url==='string'&&/^https:\/\/(?:upload\.wikimedia\.org\/wikipedia\/commons\/|commons\.wikimedia\.org\/wiki\/Special:Redirect\/file\/)/.test(url);
export const cityPhotoCandidates=image=>[image.url,image.fallbackUrl].filter(isApprovedPhotoUrl).filter((url,i,all)=>all.indexOf(url)===i);
export function validateCityStudies(data){
 if(!data||data.version!==1||!data.sources||!Array.isArray(data.cities)||data.cities.length<5||!Array.isArray(data.disputed))throw Error('City studies schema');
 const cityIds=new Set();const parse=(ref,who)=>{if(!parseRef(passageStart(ref)))throw Error(`Invalid Bible citation in ${who}: ${ref}`);};
 for(const city of data.cities){
  if(cityIds.has(city.id)||!city.name||!city.lead||!city.status||city.timeline?.length<4||city.findings?.length<4||city.biblical?.length<5||city.mapPoints?.length<2)throw Error('Incomplete city study '+city.id);cityIds.add(city.id);
  if(!Array.isArray(city.location)||city.location.length!==2||!city.location.every(Number.isFinite))throw Error('Invalid city coordinates '+city.id);
  for(const ref of city.biblical)parse(ref.ref,city.id);
  for(const era of city.timeline){if(!era.dates||!era.description||!['historical-context','biblical-and-historical','biblical-narrative','archaeology-versus-narrative'].includes(era.classification))throw Error('Invalid timeline '+city.id);for(const ref of era.passages)parse(ref,city.id);for(const source of era.sourceIds)if(!data.sources[source])throw Error('Missing source '+source);}
  for(const finding of city.findings){if(!finding.limitation||!finding.claim||!kindNames[finding.kind])throw Error('Unsourced finding '+city.id);for(const ref of finding.passages)parse(ref,city.id);for(const source of finding.sourceIds)if(!data.sources[source])throw Error('Missing finding source '+source);if(!finding.sourceIds.length&&!finding.passages.length)throw Error('Finding without evidence '+city.id);}
  if(!city.image?.page?.startsWith('https://commons.wikimedia.org/')||!city.image?.author||!city.image?.licenseUrl||!isApprovedPhotoUrl(city.image.url)||!isApprovedPhotoUrl(city.image.fallbackUrl))throw Error('Missing legal photo attribution or approved image source '+city.id);
  for(const id of city.sourceIds)if(!data.sources[id])throw Error('Missing source '+id);
  const pids=new Set();for(const point of city.mapPoints){if(pids.has(point.id)||!point.coordinates?.every(Number.isFinite)||!['site','city','context','tradition'].includes(point.kind))throw Error('Map point invalid '+city.id);pids.add(point.id);for(const s of point.sourceIds)if(!data.sources[s])throw Error('Source missing '+s);}
 }
 if(!['jerusalem','nazareth','capernaum','bethlehem','jericho'].every(x=>cityIds.has(x)))throw Error('Missing flagship city');
 for(const s of Object.values(data.sources))if(!s.title||!s.publisher||!/^https:\/\//.test(s.url))throw Error('Invalid source URL');
 for(const d of data.disputed){if(!d.id||d.candidates?.length<2||!d.statement)throw Error('Missing site comparisons');parse(d.ref,d.id);for(const candidate of d.candidates)if(!candidate.point?.every(Number.isFinite)||!candidate.note)throw Error('Invalid candidate '+d.id);for(const id of d.sourceIds)if(!data.sources[id])throw Error('Missing candidate source '+id);}
 return true;
}
export function createCityStudies(root,{onRead,onAtlas,onJourney}={}){
 let data,selected='jerusalem',selectedPoint='',selectedDebate='cana',selectedCandidate=0,pending;
 const $=id=>root.querySelector(`[data-city="${id}"]`);
 const linked=(ref,caption,callback)=>{const b=make('button','city-verse-link',caption||ref);b.type='button';b.title=`Read ${ref}`;b.addEventListener('click',()=>callback?.(passageStart(ref)));return b;};
 const sourceAnchor=(key)=>{const src=data.sources[key];const a=make('a','city-source-link',src.title);a.href=src.url;a.target='_blank';a.rel='noopener noreferrer';const small=make('small','',src.publisher+' | '+src.kind);return {a,small};};
 const sourceList=(keys,target)=>{target.replaceChildren();for(const key of new Set(keys)){const li=make('li');const {a,small}=sourceAnchor(key);li.append(a,small);target.append(li);}};
 const tag=(kind)=>make('span','city-type city-type-'+kind,kindNames[kind]||kind);
 const tinyMap=(target,points,selectedId,onSelect,help)=>{
  target.replaceChildren();const w=760,h=345;
  const lons=points.map(p=>p.coordinates[0]),lats=points.map(p=>p.coordinates[1]);let xMin=Math.min(...lons),xMax=Math.max(...lons),yMin=Math.min(...lats),yMax=Math.max(...lats);
  // Expand narrow coordinates enough that points can be clicked and labels remain legible.
  const rangeX=Math.max(.009,xMax-xMin),rangeY=Math.max(.008,yMax-yMin);xMin-=(rangeX*.25);xMax+=(rangeX*.25);yMin-=(rangeY*.32);yMax+=(rangeY*.32);
  const xy=p=>[55+(p[0]-xMin)/(xMax-xMin)*(w-110),42+(yMax-p[1])/(yMax-yMin)*(h-85)];
  const svg=icon('svg',{viewBox:`0 0 ${w} ${h}`,role:'group','aria-label':help,class:'city-location-svg'});svg.append(icon('rect',{width:w,height:h,fill:'var(--city-map-bg)'}));
  for(let i=1;i<7;i++)svg.append(icon('path',{d:`M${i*w/7} 0V${h}`,class:'city-map-gridline'}));for(let i=1;i<5;i++)svg.append(icon('path',{d:`M0 ${i*h/5}H${w}`,class:'city-map-gridline'}));
  svg.append(icon('text',{x:w-52,y:32,class:'city-map-compass'},'N ↑'));
  for(const p of points){const [x,y]=xy(p.coordinates);const selected=p.id===selectedId;const group=icon('g',{transform:`translate(${x.toFixed(1)} ${y.toFixed(1)})`,class:`city-map-pin ${selected?'active':''} ${p.kind==='tradition'?'traditional':''}`,role:'button',tabindex:'0','aria-label':`View ${p.title}`});group.append(icon('circle',{r:selected?12:9,class:'city-map-dot'}),icon('text',{x:16,y:-13,class:'city-map-label'},p.title));const fn=()=>onSelect(p.id);group.addEventListener('click',fn);group.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();fn();}});svg.append(group);}
  target.append(svg);
 };
 function showMap(city){const points=city.mapPoints;const active=points.find(x=>x.id===selectedPoint)||points[0];selectedPoint=active.id;
  tinyMap($('map'),points,active.id,id=>{selectedPoint=id;showMap(city);},`Orientation diagram for ${city.name}: drawn from approximate modern coordinates, not an excavated plan or route.`);
  const list=$('map-choices');list.replaceChildren();for(const p of points){const b=make('button','city-marker-option',p.title);b.type='button';b.classList.toggle('selected',p.id===active.id);b.setAttribute('aria-pressed',String(p.id===active.id));b.addEventListener('click',()=>{selectedPoint=p.id;showMap(city);});list.append(b);}
  $('map-description').textContent=active.note;
  $('map-source').textContent=active.sourceIds.length?`Supporting material: ${active.sourceIds.map(k=>data.sources[k].publisher).join('; ')}.`:'Orientation marker only; no exact ancient position asserted.';
 }
 function renderDebate(){const d=data.disputed.find(x=>x.id===selectedDebate)||data.disputed[0];selectedDebate=d.id;
  const buttons=$('debate-tabs');buttons.replaceChildren();for(const v of data.disputed){const b=make('button','city-debate-tab',v.name);b.type='button';b.setAttribute('aria-pressed',String(v.id===d.id));b.classList.toggle('selected',v.id===d.id);b.addEventListener('click',()=>{selectedDebate=v.id;selectedCandidate=0;renderDebate();});buttons.append(b);}
  $('debate-title').textContent=d.name;$('debate-desc').textContent=d.statement;
  const list=$('debate-list');list.replaceChildren();for(const [i,v] of d.candidates.entries()){const div=make('article','city-debate-candidate');div.classList.toggle('selected',i===selectedCandidate);div.append(tag(v.type==='traditional'?'tradition':'research'),make('h4','',v.name),make('p','',v.note));const button=make('button','city-verse-link','Highlight on comparison map');button.type='button';button.addEventListener('click',()=>{selectedCandidate=i;renderDebate();});div.append(button);list.append(div);}
  tinyMap($('debate-map'),d.candidates.map((p,i)=>({id:String(i),title:p.name,coordinates:p.point,kind:p.type})),String(selectedCandidate),id=>{selectedCandidate=Number(id);renderDebate();},`Illustrative geographical comparison for ${d.name}`);$('debate-active').textContent=`Highlighted proposal: ${d.candidates[selectedCandidate]?.name}. ${d.candidates[selectedCandidate]?.note}`;
  const refs=$('debate-refs');refs.replaceChildren(linked(d.ref,d.ref,onRead));sourceList(d.sourceIds,$('debate-sources'));
 }
 function renderCity(){if(!data)return;const city=data.cities.find(c=>c.id===selected)||data.cities[0];selected=city.id;selectedPoint=city.mapPoints[0].id;
  root.querySelectorAll('[data-city-select]').forEach(b=>{const active=b.dataset.citySelect===city.id;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));});
  $('city-title').textContent=city.name;$('strapline').textContent=city.strapline;$('city-location').textContent=city.modern;$('city-status').textContent=city.status;$('city-intro').textContent=city.lead;$('ancient').textContent=city.ancient.join(' | ');
  const photo=$('photo'),credit=$('photo-credit'),meta=city.image;
  const candidates=cityPhotoCandidates(meta);
  let photoIndex=0;
  // Avoid displaying an old city image or a broken-photo credit during slow network requests.
  photo.onload=null;photo.onerror=null;photo.hidden=true;
  photo.removeAttribute('src');
  photo.alt=meta.title+' - modern photograph, not a scene from antiquity';
  photo.loading='eager';
  credit.replaceChildren();credit.hidden=true;
  const showCredit=()=>{credit.replaceChildren();const photoLink=make('a','',`Photo: ${meta.author}`);photoLink.href=meta.page;photoLink.target='_blank';photoLink.rel='noopener noreferrer';const license=make('a','',meta.license);license.href=meta.licenseUrl;license.target='_blank';license.rel='noopener noreferrer';credit.append(photoLink,make('span','', ' | '),license,make('span','', ' | Current-day site, not a Gospel-era reconstruction'));credit.hidden=false;};
  const fallbackIllustration=()=>{photo.hidden=true;credit.replaceChildren();credit.hidden=false;credit.textContent='Illustrative landscape - image source unavailable';};
  photo.onload=()=>{if(photo.naturalWidth>0){photo.hidden=false;showCredit();}else photo.onerror?.();};
  photo.onerror=()=>{photoIndex++;if(photoIndex<candidates.length)photo.src=candidates[photoIndex];else fallbackIllustration();};
  if(candidates.length)photo.src=candidates[0];else fallbackIllustration();
  const n=city.biblical.length; $('bible-total').textContent=String(n);$('finding-total').textContent=String(city.findings.length);$('era-total').textContent=String(city.timeline.length);
  const verses=$('bible-refs');verses.replaceChildren();for(const item of city.biblical){const row=make('div','city-bible-row');row.append(linked(item.ref,item.ref,onRead),make('p','',item.note),tag(item.kind==='old-testament'?'old-testament':'new-testament'));verses.append(row);}
  const eras=$('periods');eras.replaceChildren();for(const item of city.timeline){const wrap=make('article','city-era');const left=make('div','city-era-marker');left.append(make('small','',item.dates),make('h3','',item.period));const right=make('div','city-era-body');right.append(tag(item.classification),make('p','',item.description));const refs=make('div','city-era-refs');for(const ref of item.passages)refs.append(linked(ref,ref,onRead));right.append(refs);if(item.sourceIds.length){const ul=make('ul','city-mini-sources');sourceList(item.sourceIds,ul);right.append(ul);}wrap.append(left,right);eras.append(wrap);}
  const finds=$('findings');finds.replaceChildren();for(const item of city.findings){const wrap=make('article','city-finding');wrap.append(tag(item.kind),make('h3','',item.title),make('p','',item.claim));const limit=make('div','city-limitation');limit.append(make('strong','','Evidence limit'),make('p','',item.limitation));wrap.append(limit);if(item.passages.length){const refs=make('div','city-find-refs');for(const ref of item.passages)refs.append(linked(ref,ref,onRead));wrap.append(refs);}if(item.sourceIds.length){const ul=make('ul','city-mini-sources');sourceList(item.sourceIds,ul);wrap.append(ul);}finds.append(wrap);}
  const caution=$('cautions');caution.replaceChildren();for(const x of city.debates)caution.append(make('li','',x));sourceList(city.sourceIds,$('references'));
  $('open-atlas').onclick=()=>onAtlas?.(city.biblical.find(x=>x.kind!=='old-testament')?.ref||city.biblical[0].ref);
  $('open-journey').onclick=()=>onJourney?.(city.id);
  showMap(city);
  const address=new URL(location.href);address.searchParams.set('city',city.id);history.replaceState(history.state,'',address);
 }
 function drawTabs(){const target=$('city-tabs');target.replaceChildren();for(const city of data.cities){const b=make('button','city-tab',city.name);b.type='button';b.dataset.citySelect=city.id;b.addEventListener('click',()=>{selected=city.id;renderCity();});target.append(b);}}
 async function load(){const resp=await fetch('/data/city-studies.json');if(!resp.ok)throw Error('Cannot load city research');data=await resp.json();validateCityStudies(data);drawTabs();renderDebate();root.dataset.ready='true';$('loading').hidden=true;renderCity();}
 return {activate(city){if(city&&/^[a-z-]+$/.test(city))selected=city;if(!pending)pending=load().catch(e=>{$('loading').textContent='City studies could not load. Please refresh this page.';console.error('City studies:',e);});else if(data)renderCity();}};
}
