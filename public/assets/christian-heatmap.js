// Interactive, locally hosted world map: report counts reflect the current catalogue filters.
// Country shading includes all reports; locality markers only use supplied gazetteer coordinates.
const SVG='http://www.w3.org/2000/svg';
const normalise=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const svg=(tag,attributes={})=>{const n=document.createElementNS(SVG,tag);for(const [key,value] of Object.entries(attributes))n.setAttribute(key,String(value));return n;};
const node=(tag,text='',className='')=>{const n=document.createElement(tag);n.textContent=text;if(className)n.className=className;return n;};
const position=(lat,lon)=>({x:(lon+180)*1000/360,y:(90-lat)*510/180});
export function aggregateIncidentLocations(reports,geography){
 const countries=new Map(),places=new Map();
 let located=0,withoutLocality=0,weighted=0;
 for(const report of reports){
  countries.set(report.country,(countries.get(report.country)||0)+1);
  const key=report.country+'|'+report.place;
  const entry=geography?.places?.[key];
  const locations=Array.isArray(report.locations)&&report.locations.length?report.locations:(entry?.points||[]);
  const valid=locations.filter(p=>p&&p.lat!==null&&p.lon!==null&&p.lat!==undefined&&p.lon!==undefined&&Number.isFinite(Number(p.lat))&&Math.abs(Number(p.lat))<=90&&Number.isFinite(Number(p.lon))&&Math.abs(Number(p.lon))<=180).slice(0,6);
  if(!valid.length){withoutLocality++;continue;}
  located++;
  for(const point of valid){
   const lat=Number(point.lat),lon=Number(point.lon),weight=1/valid.length;
   weighted+=weight;
   const locationKey=report.country+'|'+lat.toFixed(3)+'|'+lon.toFixed(3);
   let site=places.get(locationKey);
   if(!site){site={lat,lon,country:report.country,label:point.name||report.place,place:report.place,precision:point.precision||entry?.resolution||'city',weight:0,reports:0,places:new Set()};places.set(locationKey,site);}
   site.weight+=weight;site.reports++;site.places.add(report.place);
  }
 }
 return {countries,places:[...places.values()],located,withoutLocality,reportCount:reports.length,weight:weighted};
}
const intensity=count=>count>=16?5:count>=8?4:count>=4?3:count>=2?2:count>0?1:0;
function toPath(feature){
 const polygons=feature.type==='MultiPolygon'?feature.coordinates:[feature.coordinates];
 const commands=[];
 for(const poly of polygons)for(const ring of poly){
  if(!ring.length)continue;
  const pts=ring.map(([lon,lat])=>position(lat,lon));
  commands.push('M'+pts.map(p=>p.x.toFixed(2)+','+p.y.toFixed(2)).join('L')+'Z');
 }
 return commands.join(' ');
}
const countryCodeMap=geo=>new Map(Object.entries(geo.countries||{}).map(([name,info])=>[info.iso3,name]));
const featureCountry=(feature,counts,codes)=>{
 const mapped=codes.get(feature.id);
 if(mapped)return mapped;
 return [...counts.keys()].find(name=>normalise(name)===normalise(feature.name))||null;
};
function interaction(el,callback){
 el.addEventListener('click',callback);
 el.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();callback();}});
}
export function createChristianHeatmap(root,{onCountry=()=>{},onPlace=()=>{},onReset=()=>{}}={}){
 if(!root)throw Error('Missing heat map element');
 const surface=root.querySelector('[data-pc-map-surface]'),summary=root.querySelector('[data-pc-map-summary]');
 const layerControl=root.querySelector('[data-pc-map-layer]');
 const resetControl=root.querySelector('[data-pc-map-reset]');
 let features=null,geo=null,latest=[],pending=null;
 let plot=null,worldLayer=null,densityLayer=null,markersLayer=null;
 function buildWorld(){
  plot=svg('svg',{viewBox:'0 0 1000 510',role:'group','aria-label':'Interactive world heat map of published incident reports',preserveAspectRatio:'xMidYMid meet'});
  const defs=svg('defs');
  const gradient=svg('radialGradient',{id:'pc-world-heat',cx:'50%',cy:'50%',r:'50%'});
  for(const [offset,opacity] of [['0%','0.83'],['42%','0.45'],['100%','0']])gradient.append(svg('stop',{offset,'stop-color':'#f26735','stop-opacity':opacity}));
  defs.append(gradient);plot.append(defs);
  const grid=svg('g',{'class':'pc-heat-grid','aria-hidden':'true'});
  for(const lat of [-60,-30,0,30,60]){const y=position(lat,0).y;grid.append(svg('path',{d:'M0,'+y+'H1000'}));}
  for(const lon of [-120,-60,0,60,120]){const x=position(0,lon).x;grid.append(svg('path',{d:'M'+x+',0V510'}));}
  plot.append(grid);
  worldLayer=svg('g',{'class':'pc-world-countries'});
  densityLayer=svg('g',{'class':'pc-world-density','aria-hidden':'true'});
  markersLayer=svg('g',{'class':'pc-world-localities'});
  plot.append(worldLayer,densityLayer,markersLayer);
  surface.replaceChildren(plot);
 }
 function draw(){
  if(!features||!geo)return;
  const stats=aggregateIncidentLocations(latest,geo);
  const countryCodes=countryCodeMap(geo);
  const layer=layerControl.value;
  worldLayer.replaceChildren();densityLayer.replaceChildren();markersLayer.replaceChildren();
  for(const f of features){
   const country=featureCountry(f,stats.countries,countryCodes),count=country?(stats.countries.get(country)||0):0;
   const path=svg('path',{d:toPath(f),class:'pc-country','data-level':layer==='localities'?0:intensity(count),'fill-rule':'evenodd'});
   if(count){
    path.setAttribute('role','button');path.setAttribute('tabindex','0');
    path.setAttribute('aria-label',country+': '+count+' published '+(count===1?'report':'reports')+'. Filter catalogue by country.');
    const title=svg('title');title.textContent=country+': '+count+' published reports';path.append(title);
    interaction(path,()=>onCountry(country));
   }else path.setAttribute('aria-hidden','true');
   worldLayer.append(path);
  }
  if(layer!=='countries'){
   const sites=stats.places.sort((a,b)=>a.weight-b.weight);
   for(const point of sites){
    const {x,y}=position(point.lat,point.lon);
    const glow=svg('circle',{cx:x.toFixed(2),cy:y.toFixed(2),r:Math.min(36,15+6*Math.sqrt(point.weight)).toFixed(1),fill:'url(#pc-world-heat)'});
    densityLayer.append(glow);
    const mark=svg('circle',{cx:x.toFixed(2),cy:y.toFixed(2),r:point.reports>1?'4.4':'3.0',class:'pc-map-marker',role:'button',tabindex:'0'});
    const label=point.label+' ('+point.country+'): '+point.reports+' '+(point.reports===1?'report':'reports')+'; approximate '+point.precision+' location. Select to filter cases.';
    mark.setAttribute('aria-label',label);
    const title=svg('title');title.textContent=label;mark.append(title);
    interaction(mark,()=>onPlace(point.country,point.place));
    markersLayer.append(mark);
   }
  }
  summary.textContent=stats.reportCount+' matching reports across '+stats.countries.size+' countries. '+stats.located+' have approximate mapped localities; '+stats.withoutLocality+' are counted at country level only.';
  root.dataset.ready='true';
 }
 layerControl.addEventListener('change',draw);
 resetControl.addEventListener('click',()=>{layerControl.value='combined';onReset();});
 return {
  update(reports){latest=reports;draw();},
  async activate(){
   if(geo&&features)return;
   if(!pending){
    summary.textContent='Loading world map...';
    pending=Promise.all([
     fetch('/data/world-heatmap-110m.json?v=1.15.0').then(r=>{if(!r.ok)throw Error('Basemap unavailable');return r.json();}),
     fetch('/data/christian-heatmap-places.json?v=1.15.0').then(r=>{if(!r.ok)throw Error('Coordinates unavailable');return r.json();})
    ]).then(([world,locations])=>{
     if(!Array.isArray(world.features)||!locations.places||!locations.countries)throw Error('Invalid world map data');
     features=world.features;geo=locations;buildWorld();draw();
    }).catch(error=>{pending=null;surface.replaceChildren(node('p','World map unavailable. The incident reports below remain accessible.','persecution-map-error'));summary.textContent='Map data could not be loaded.';console.error(error);});
   }
   await pending;
  }
 };
}
