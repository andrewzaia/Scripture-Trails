/** Public roadmap: data-backed milestones with deliberately plain status labels. */
/** The public gate descriptions are commitments, not automatic academic certification. */
export function validateV1Readiness(readiness){
 if(!readiness||readiness.target!=='1.0.0'||!/^0\.\d+\.\d+$/.test(readiness.baseline)||!/^\d{4}-\d{2}-\d{2}$/.test(readiness.updated)||!readiness.note)throw Error('Invalid v1 readiness header');
 if(!Array.isArray(readiness.stages)||readiness.stages.length!==5||!Array.isArray(readiness.gates)||readiness.gates.length!==5)throw Error('Expected five readiness stages and gates');
 const stageIds=new Set(),gateIds=new Set(),criteriaIds=new Set();
 for(const stage of readiness.stages){if(!stage.id||stageIds.has(stage.id)||!stage.title||!stage.goal)throw Error('Invalid readiness stage');stageIds.add(stage.id);}
 for(const gate of readiness.gates){
  if(!gate.id||gateIds.has(gate.id)||!gate.title||!gate.summary||!gate.next||!Array.isArray(gate.criteria)||!gate.criteria.length)throw Error('Invalid readiness gate');gateIds.add(gate.id);
  for(const item of gate.criteria){
   if(!item.id||criteriaIds.has(item.id)||!item.title||!item.acceptance||!item.evidence||!['met','accepted-risk','open'].includes(item.status)||!['automated','editorial','manual','specialist'].includes(item.mode))throw Error('Invalid readiness criterion '+item.id);
   if(item.status==='accepted-risk'&&(!['screen-readers','cross-browser-zoom'].includes(item.id)||item.mode!=='manual'||!item.risk?.trim()||!item.reviewedOn||!item.reviewer))throw Error('Unsupported or undocumented launch risk acceptance for '+item.id);
   if(['met','accepted-risk'].includes(item.status)&&item.mode!=='automated'&&(!item.reviewedOn||!item.reviewer))throw Error('Missing human verification for '+item.id);
   criteriaIds.add(item.id);
  }
 }
 return true;
}
export function v1ReadinessCounts(readiness){
 validateV1Readiness(readiness);
 const items=readiness.gates.flatMap(g=>g.criteria);
 return {met:items.filter(x=>x.status==='met').length,acceptedRisk:items.filter(x=>x.status==='accepted-risk').length,open:items.filter(x=>x.status==='open').length,total:items.length,ready:items.every(x=>x.status!=='open')};
}


const statusLabels={delivered:'Delivered',next:'Up next',planned:'Planned',research:'Research / permission needed'};
const make=(tag,cls,body)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(body!==undefined)e.textContent=body;return e;};
export function validateRoadmap(data){
 if(!data||!Array.isArray(data.milestones)||!Array.isArray(data.phases))throw Error('Missing roadmap sections');
 validateV1Readiness(data.v1Readiness);
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
 function renderReadiness(){
  const readiness=data.v1Readiness,counts=v1ReadinessCounts(readiness),summary=$('v1-summary'),steps=$('v1-stages'),gates=$('v1-gates');
  summary.replaceChildren();
  summary.append(make('strong','',counts.met+' verified, '+counts.acceptedRisk+' accepted with limitations, '+counts.open+' open ('+counts.total+' total)'),make('span','',counts.ready?'No remaining launch criteria open. Final release still requires CI, deployment verification and owner go/no-go.':counts.open+' release criterion remains open. v1.0 is not yet approved.'));
  steps.replaceChildren();
  for(const [i,stage] of readiness.stages.entries()){
   const li=make('li');li.append(make('strong','',(i+1)+'. '+stage.title),make('span','',stage.goal));steps.append(li);
  }
  gates.replaceChildren();
  for(const gate of readiness.gates){
   const met=gate.criteria.filter(c=>c.status==='met').length,accepted=gate.criteria.filter(c=>c.status==='accepted-risk').length;
   const card=make('article','v1-gate');const top=make('div','v1-gate-top');
   top.append(make('h3','',gate.title),make('span','v1-gate-count',met+' verified'+(accepted?', '+accepted+' accepted risk':'')+' / '+gate.criteria.length));
   card.append(top,make('p','v1-gate-summary',gate.summary));
   const detail=make('details','v1-gate-detail');detail.append(make('summary','','Review acceptance criteria'));
   const ul=make('ul','v1-criteria');
   for(const criterion of gate.criteria){
    const li=make('li');li.dataset.readiness=criterion.status;
    const state=make('strong','v1-criterion-state',criterion.status==='met'?'Met (scoped)':criterion.status==='accepted-risk'?'Accepted risk':'Open');
    li.append(state,make('span','v1-criterion-title',criterion.title),make('p','v1-criterion-acceptance',criterion.acceptance),make('small','v1-criterion-evidence','Evidence: '+criterion.evidence+(criterion.status==='accepted-risk'?' | Untested: '+criterion.risk:'')));
    ul.append(li);
   }
   detail.append(ul);card.append(detail,make('p','v1-gate-next','Next: '+gate.next));gates.append(card);
  }
 }
 function render(){const list=$('list');list.replaceChildren();const items=data.milestones.filter(m=>filter==='all'||m.status===filter);
  for(const phase of data.phases){const subset=items.filter(m=>m.phase===phase.id);if(!subset.length)continue;
   const region=make('section','roadmap-phase-block');region.append(make('h2','',phase.title));const cards=make('div','roadmap-cards');for(const item of subset)cards.append(makeCard(item));region.append(cards);list.append(region);}
  $('result-count').textContent=`${items.length} milestones displayed`;
  root.querySelectorAll('[data-roadmap-filter]').forEach(b=>{const selected=b.dataset.roadmapFilter===filter;b.setAttribute('aria-pressed',String(selected));b.classList.toggle('selected',selected);});
 }
 function setup(){validateRoadmap(data);renderReadiness();const counts=Object.groupBy?Object.groupBy(data.milestones,x=>x.status):null;
  $('delivered').textContent=String(counts?.delivered?.length||data.milestones.filter(x=>x.status==='delivered').length);
  $('planned').textContent=String(data.milestones.filter(x=>x.status!=='delivered').length);
  $('updated').textContent=new Date(data.updated+'T12:00:00Z').toLocaleDateString('en-AU',{year:'numeric',month:'long',day:'numeric',timeZone:'UTC'});
  $('focus').replaceChildren(...data.currentFocus.map((x,i)=>make('li','',`${i+1}. ${x}`)));
  root.querySelectorAll('[data-roadmap-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.roadmapFilter;render();}));render();
  root.dataset.ready='true';$('loading').hidden=true;}
 return {activate(){if(!initial)initial=fetch('/data/roadmap.json?v='+encodeURIComponent(new URL(import.meta.url).searchParams.get('v')||'local')).then(r=>{if(!r.ok)throw Error('Roadmap data unavailable');return r.json();}).then(d=>{data=d;setup();}).catch(()=>{$('loading').textContent='Could not load the roadmap right now.';});}};
}
