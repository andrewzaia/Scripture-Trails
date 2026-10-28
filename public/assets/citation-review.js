import {CITATION_REVIEW} from './citation-review-data.js?v=0.24.0';
import {validateCanonicalReference} from './reference-integrity.js';
export {CITATION_REVIEW};

export const REVIEW_DECISIONS=Object.freeze({
 'warning-retained':'Qualification retained',
 'access-gap-retained':'Source access gap retained',
 'sources-added':'Supporting sources added',
 'passage-checked':'Selected passage checked',
 'context-clarified':'Reading context clarified'
});
const scopeKeys={issue:'issues',place:'places',trail:'trailReadings',connection:'connections'};
export function citationReviews(kind,target,data=CITATION_REVIEW){return data.records.filter(r=>r.kind===kind&&r.target===target);}
const safeUrl=value=>{try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password;}catch{return false;}};
const date=value=>/^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;
export function validateCitationReview(data,counts,targets){
 if(data?.schema!==1||data.status!=='declared-batch-assessed'||!date(data.updated)||!data.method?.includes('AI-assisted')||!data.method.includes('No independent specialist signoff')||!data.deferred?.length||!Array.isArray(data.records)||!data.sources)throw Error('Invalid citation review metadata');
 const sourceKinds=new Set(['primary-scripture','publisher-note','scholarly-commentary','excavation-report','publisher-abstract','project-summary','access-limited']);
 for(const [id,s] of Object.entries(data.sources)){
  if(!id||!s.title||!s.author||!s.publisher||!sourceKinds.has(s.kind)||!safeUrl(s.url)||!date(s.checkedOn)||s.checkedOn>data.updated||!s.access||!s.rights?.startsWith('Linked only;'))throw Error('Invalid citation source '+id);
 }
 const seen=new Set(),totals={issues:0,places:0,trailReadings:0,connections:0};
 for(const r of data.records){
  const k=r.kind+':'+r.target;
  if(!scopeKeys[r.kind]||seen.has(k)||!r.title||!REVIEW_DECISIONS[r.decision]||!r.note||!r.limitation||!date(r.reviewedOn)||r.reviewedOn>data.updated||!r.passages?.length||r.passages.some(ref=>!validateCanonicalReference(ref,counts)))throw Error('Invalid citation assessment '+k);
  if(targets&&!targets[r.kind]?.has(r.target))throw Error('Unknown citation target '+k);
  if(!r.citations?.length||r.citations.some(c=>!data.sources[c.sourceId]||!c.locator||!c.supports))throw Error('Missing claim-level source '+k);
  if(new Set(r.citations.map(c=>c.sourceId)).size!==r.citations.length)throw Error('Duplicate claim source '+k);
  if(r.kind==='place'&&r.decision==='sources-added'&&!r.citations.some(c=>['excavation-report','publisher-abstract','project-summary'].includes(data.sources[c.sourceId].kind)))throw Error('Place support needs a historical source '+k);
  totals[scopeKeys[r.kind]]++;seen.add(k);
 }
 for(const [k,n] of Object.entries(totals))if(data.scope[k]!==n)throw Error('Citation scope count mismatch '+k);
 const batchIds=new Set();
 for(const batch of data.batches||[]){
  if(!batch.id||batchIds.has(batch.id)||!batch.title||!batch.method||!Number.isInteger(batch.count)||batch.count<1||batch.targets?.length!==batch.count||new Set(batch.targets).size!==batch.count)throw Error('Invalid citation batch '+batch.id);
  for(const id of batch.targets)if(!data.records.some(r=>r.kind==='connection'&&r.target===id&&(r.batch===batch.id||r.supportBatch===batch.id)))throw Error('Unresolved citation batch target '+id);
  batchIds.add(batch.id);
 }
 for(const r of data.records)for(const key of ['batch','supportBatch'])if(r[key]&&!batchIds.has(r[key]))throw Error('Unknown citation batch '+r[key]);
 return true;
}

const make=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
export function appendCitationReview(parent,kind,target){
 for(const record of citationReviews(kind,target)){
  const detail=make('details',undefined,'citation-review');
  detail.append(make('summary','Citation review: '+REVIEW_DECISIONS[record.decision]));
  detail.append(make('p',record.note),make('p',record.limitation),make('p','Reviewed '+record.reviewedOn+' | AI-assisted editorial check. Independent specialist review pending.','soft-note'));
  const list=make('ul');
  for(const c of record.citations){
   const s=CITATION_REVIEW.sources[c.sourceId],item=make('li'),link=make('a',s.title);
   link.href=s.url;link.target='_blank';link.rel='noopener noreferrer';
   item.append(link,make('p',s.author+' | '+s.publisher+' | '+s.kind.replaceAll('-',' ')),make('p','Checked: '+c.locator+'. Supports: '+c.supports+'.'),make('p','Access on '+s.checkedOn+': '+s.access,'soft-note'));list.append(item);
  }
  detail.append(list);parent.append(detail);
 }
}

export function renderCitationSummary(root){
 if(!root)return;
 const scope=CITATION_REVIEW.scope;
 const commentaryCount=CITATION_REVIEW.records.filter(r=>r.kind==='connection'&&r.citations.some(c=>['scholarly-commentary','publisher-note','publisher-abstract'].includes(CITATION_REVIEW.sources[c.sourceId].kind))).length;
 root.replaceChildren(make('p',`Reviewed coverage: ${scope.issues} Gospel issues, ${scope.places} place dossiers, ${scope.trailReadings} Nehemiah readings and ${scope.connections} selected passage comparisons. ${commentaryCount} comparisons include named scholarly commentary or limited publisher-summary support; other comparisons rely on selected passage checks. Each assessment records a decision, checked source scope and remaining limitations.`));
 root.append(make('p','The Bible is the authoritative foundation of Scripture Trails. Archaeological and historical publications supply supporting context within their stated scope. This AI-assisted editorial review does not constitute independent specialist signoff.'));
 for(const [kind,title] of [['issue','Gospel issue assessments'],['place','Place citation assessments'],['trail','Nehemiah passage checks'],['connection','Selected passage comparisons']]){
  const group=make('details',undefined,'citation-review-group');group.append(make('summary',title));
  for(const r of CITATION_REVIEW.records.filter(r=>r.kind===kind)){
   const article=make('article');article.append(make('h3',r.title));
   if(kind==='issue'||kind==='place'||kind==='trail'){
    const a=make('a','Open related study');a.href=kind==='issue'?'/?view=jesus-map':kind==='place'?'/?view=entities&type=place&id='+encodeURIComponent(r.target):'/?view=entities&type=person&id=nehemiah-governor';article.append(a);
   }
   if(kind==='connection'){const a=make('a','Open in Atlas');a.href='/?view=connections&ref='+encodeURIComponent(r.anchor||r.passages[0].replace(/-.*$/,''));article.append(a);}
   appendCitationReview(article,kind,r.target);group.append(article);
  }
  root.append(group);
 }
 root.append(make('h3','Remaining source work'));
 const list=make('ul');for(const text of CITATION_REVIEW.deferred)list.append(make('li',text));root.append(list);
 const download=make('a','Download the dated citation review register (JSON)');download.href='/data/citation-review.json?v=0.24.0';download.download='scripture-trails-citation-review-'+CITATION_REVIEW.updated+'.json';root.append(download);
}
