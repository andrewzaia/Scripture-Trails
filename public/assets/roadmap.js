/** Public roadmap: data-backed milestones with deliberately plain status labels. */
const statusLabels={delivered:'Delivered',next:'Up next',planned:'Planned',research:'Research / permission needed'};
const make=(tag,cls,body)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(body!==undefined)e.textContent=body;return e;};
export function validateRoadmap(data){
 if(!data||!Array.isArray(data.milestones)||!Array.isArray(data.phases))throw Error('Missing roadmap sections');
 const phaseIds=new Set(data.phases.map(p=>p.id)),ids=new Set();
 for(const m of data.milestones){if(ids.has(m.id)||!phaseIds.has(m.phase)||!statusLabels[m.status]||!m.title||!m.summary||!Array.isArray(m.capabilities)||!m.capabilities.length||!m.verification)throw Error('Invalid roadmap milestone: '+m.id);ids.add(m.id);}
 return true;
}
export function createRoadmap(root){
 let initial=null,data,filter='all';const $=id=>root.querySelector(`[data-roadmap="${id}"]`);
 function makeCard(m){const card=make('article','roadmap-card');card.dataset.status=m.status;
  const top=make('div','roadmap-card-top');top.append(make('span','roadmap-status',statusLabels[m.status]),make('span','roadmap-phase',data.phases.find(p=>p.id===m.phase)?.title||''));
  card.append(top,make('h3','',m.title),make('p','roadmap-summary',m.summary));
  const details=make('details','roadmap-details');details.append(make('summary','','What this includes'));
  const list=make('ul','');for(const item of m.capabilities)list.append(make('li','',item));
  details.append(list,make('p','roadmap-verification',m.verification));card.append(details);return card;}
 function render(){const list=$('list');list.replaceChildren();const items=data.milestones.filter(m=>filter==='all'||m.status===filter);
  for(const phase of data.phases){const subset=items.filter(m=>m.phase===phase.id);if(!subset.length)continue;
   const region=make('section','roadmap-phase-block');region.append(make('h2','',phase.title));const cards=make('div','roadmap-cards');for(const item of subset)cards.append(makeCard(item));region.append(cards);list.append(region);}
  $('result-count').textContent=`${items.length} milestones displayed`;
  root.querySelectorAll('[data-roadmap-filter]').forEach(b=>{const selected=b.dataset.roadmapFilter===filter;b.setAttribute('aria-pressed',String(selected));b.classList.toggle('selected',selected);});
 }
 function setup(){validateRoadmap(data);const counts=Object.groupBy?Object.groupBy(data.milestones,x=>x.status):null;
  $('delivered').textContent=String(counts?.delivered?.length||data.milestones.filter(x=>x.status==='delivered').length);
  $('planned').textContent=String(data.milestones.filter(x=>x.status!=='delivered').length);
  $('updated').textContent=new Date(data.updated+'T12:00:00Z').toLocaleDateString('en-AU',{year:'numeric',month:'long',day:'numeric',timeZone:'UTC'});
  $('focus').replaceChildren(...data.currentFocus.map((x,i)=>make('li','',`${i+1}. ${x}`)));
  root.querySelectorAll('[data-roadmap-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.roadmapFilter;render();}));render();
  root.dataset.ready='true';$('loading').hidden=true;}
 return {activate(){if(!initial)initial=fetch('/data/roadmap.json').then(r=>{if(!r.ok)throw Error('Roadmap data unavailable');return r.json();}).then(d=>{data=d;setup();}).catch(()=>{$('loading').textContent='Could not load the roadmap right now.';});}};
}
