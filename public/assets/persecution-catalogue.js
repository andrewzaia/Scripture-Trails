import {createChristianHeatmap} from "./christian-heatmap.js?v=1.6.0";
// This collection links published accounts without independently adjudicating them.
const norm=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function reportKind(category){
 const v=norm(category);
 if(/bomb|arson|fire|explosi/.test(v))return 'Fire and explosions';
 if(/kill|murder|shoot|stab|assault|attack|violence|massacre|lynch/.test(v))return 'Physical violence';
 if(/vandal|desecr|theft|stolen|grave|relic|statue|damage|defac|graffiti|burgl|cross/.test(v))return 'Sacred sites and property';
 if(/arrest|deten|abduc|kidnap|imprison|restrict|ban|prosecut|harass|discrimin|persecut|expel|displac|forced|closure|raid/.test(v))return 'Coercion and restrictions';
 return 'Other reports';
}
export function filterPersecutionReports(rows,options={}){
 const tokens=norm(options.query).split(/\s+/).filter(Boolean);
 return rows.filter(r=>{
  if(options.country&&options.country!==r.country)return false;
  if(options.year&&options.year!==r.date.slice(0,4))return false;
  if(options.kind&&options.kind!==reportKind(r.category))return false;
  if(options.media&&!r.media_url&&!r.media_type&&!options.localMediaIds?.has(r.id))return false;
  const haystack=norm([r.id,r.title,r.country,r.place,r.category,r.published_account,r.reported_actor,r.publisher,r.notes].join(' '));
  return tokens.every(t=>haystack.includes(t));
 }).sort((a,b)=>(options.sort==='oldest'?1:-1)*a.date.localeCompare(b.date)||a.id.localeCompare(b.id));
}
const el=(tag,value='',cls='')=>{const n=document.createElement(tag);n.textContent=value;if(cls)n.className=cls;return n;};
const link=(url,label)=>{if(!url)return null;let u;try{u=new URL(url);}catch{return null;}if(u.protocol!=='https:')return null;const a=el('a',label);a.href=u.href;a.target='_blank';a.rel='noopener noreferrer';return a;};
export function formatReportDate(value){
 const input=String(value||'');
 if(/^\d{4}$/.test(input))return input;
 if(/^\d{4}-\d{2}$/.test(input)){
  const [year,month]=input.split('-').map(Number);
  if(month<1||month>12)return input;
  return new Intl.DateTimeFormat('en-AU',{month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(Date.UTC(year,month-1,1,12)));
 }
 if(/^\d{4}-\d{2}-\d{2}$/.test(input)){
  const [year,month,day]=input.split('-').map(Number);
  const date=new Date(Date.UTC(year,month-1,day,12));
  if(month<1||month>12||day<1||date.getUTCMonth()!==month-1||date.getUTCDate()!==day)return input;
  return new Intl.DateTimeFormat('en-AU',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(date);
 }
 return input;
}
const date=formatReportDate;
function caseCard(r,photos){
 const c=el('article','','persecution-case');
 const pic=photos.get(r.id);
 const header=el('div','','persecution-case-header'+(pic?' has-media':''));
 if(pic){
  const figure=el('figure','','persecution-photo');
  const image=el('img');image.src=pic.path;image.alt=pic.alt;image.loading='lazy';image.decoding='async';
  figure.append(image);
  const credit=el('figcaption','','persecution-photo-credit');
  credit.append(el('span',pic.author+' | '));
  const licence=link(pic.licence,pic.licence_label),source=link(pic.source,'Photo source');
  if(licence)credit.append(licence);if(source)credit.append(el('span',' | '),source);
  figure.append(credit);header.append(figure);
 }
 const heading=el('div','','persecution-case-heading');
 heading.append(el('p',date(r.date)+' | '+r.country+' | '+r.category+' | '+r.id,'persecution-meta'),el('h3',r.title),el('p',r.place||r.country,'persecution-meta'));
 if(pic)heading.append(el('p',pic.caption,'persecution-photo-context'));
 header.append(heading);c.append(header);
 c.append(el('p',r.published_account,'persecution-account'),el('p','Published by '+r.publisher,'persecution-meta'));
 if(r.reported_actor)c.append(el('p','Reported actor: '+r.reported_actor,'persecution-meta'));
 const links=el('div','','persecution-links');
 for(const [url,label] of [[r.source_url,'Original report'],[r.second_source_url,'Additional source'],[r.media_url,'Media or coverage']]){
  if(label==='Media or coverage'&&(url===r.source_url||url===r.second_source_url))continue;
  const a=link(url,label);if(a)links.append(a);
 }
 c.append(links);
 if(r.media_type||r.media_note)c.append(el('p','Media: '+(r.media_type||'Publisher coverage')+(r.media_note?' - '+r.media_note:''),'persecution-meta'));
 if(r.notes||r.incident_group){const d=el('details','','persecution-notes');d.append(el('summary','Source and catalogue notes'));if(r.notes)d.append(el('p',r.notes));if(r.incident_group)d.append(el('p',r.incident_group));c.append(d);}
 return c;
}
function mediaCard(r){
 const c=el('article','','persecution-media-card');
 c.append(el('p',date(r.date)+' | '+r.country,'persecution-meta'),el('h3',r.linked_incident),el('p',r.media_kind+' | '+r.publisher_or_owner));
 if(r.description)c.append(el('p',r.description,'persecution-meta'));
 const a=link(r.media_url,'View publisher media');if(a)c.append(a);
 if(r.rights_and_reuse)c.append(el('p',r.rights_and_reuse,'persecution-meta'));
 return c;
}
export function createPersecutionCatalogue(root){
 if(!root)throw Error('Missing catalogue container');
 const q=name=>root.querySelector('[data-pc-'+name+']');
 const search=q('search'),country=q('country'),year=q('year'),kind=q('kind'),sort=q('sort'),mediaOnly=q('media-only');
 const listing=q('list'),count=q('count'),status=q('status'),more=q('more'),mediaDetails=q('media-details'),mediaList=q('media-list');
 const map=createChristianHeatmap(q('map'),{onCountry:selected=>{country.value=selected;search.value='';refresh();},onPlace:(selected,place)=>{country.value=selected;search.value=place;refresh();},onReset:()=>resetControls()});
 let rows=[],media=[],photoMap=new Map(),limit=20,pending=null,ready=false;
 const options=(select,items)=>{for(const item of items){const o=el('option',item);o.value=item;select.append(o);}};
 function draw(){
  const found=filterPersecutionReports(rows,{query:search.value,country:country.value,year:year.value,kind:kind.value,sort:sort.value,media:mediaOnly.checked,localMediaIds:new Set(photoMap.keys())});
  listing.replaceChildren(...found.slice(0,limit).map(r=>caseCard(r,photoMap)));
  if(!found.length)listing.append(el('p','No reports match these filters.','persecution-empty'));
  count.textContent='Showing '+Math.min(limit,found.length)+' of '+found.length+' matching reports';
  status.textContent=found.length+' matching reports';more.hidden=limit>=found.length;
  map.update(found);
 }
 function refresh(){limit=20;draw();}
 function resetControls({focusSearch=false}={}){search.value='';country.value='';year.value='';kind.value='';sort.value='newest';mediaOnly.checked=false;refresh();if(focusSearch)search.focus();}
 function initialise(){
  q('total').textContent=rows.length;q('countries').textContent=new Set(rows.map(r=>r.country)).size;q('media-total').textContent=media.length;
  options(country,[...new Set(rows.map(r=>r.country))].sort());
  options(year,[...new Set(rows.map(r=>r.date.slice(0,4)))].sort().reverse());
  options(kind,[...new Set(rows.map(r=>reportKind(r.category)))].sort());
  search.addEventListener('input',refresh);
  for(const input of [country,year,kind,sort,mediaOnly])input.addEventListener('change',refresh);
  q('reset').addEventListener('click',()=>resetControls({focusSearch:true}));
  more.addEventListener('click',()=>{limit+=20;draw();});
  mediaDetails.addEventListener('toggle',()=>{if(mediaDetails.open&&!mediaList.childElementCount)mediaList.replaceChildren(...media.map(mediaCard));});
  ready=true;draw();void map.activate();
 }
 return {async activate(){
  if(ready)return;
  if(!pending){
   status.textContent='Loading reports...';
   pending=Promise.all([
    fetch('/data/christian-persecution.json?v=1.6.0').then(r=>{if(!r.ok)throw Error('Reports unavailable');return r.json();}),
    fetch('/data/christian-persecution-media.json?v=1.6.0').then(r=>{if(!r.ok)throw Error('Media unavailable');return r.json();}),
    fetch('/data/christian-persecution-images.json?v=1.6.0').then(r=>{if(!r.ok)throw Error('Image credits unavailable');return r.json();})
   ]).then(([a,b,c])=>{if(!Array.isArray(a.reports)||!Array.isArray(b.media)||!Array.isArray(c.images))throw Error('Invalid data');rows=a.reports;media=b.media;
    photoMap=new Map(c.images.filter(x=>/^\/assets\/persecution-media\/[a-z0-9-]+\.jpg$/.test(x.path)).map(x=>[x.report_id,x]));
    initialise();})
    .catch(error=>{pending=null;status.textContent='Catalogue unavailable. Revisit this page to retry.';console.error(error);});
  }
  await pending;
 }};
}
