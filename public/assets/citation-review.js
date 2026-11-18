import {CITATION_REVIEW} from './citation-review-data.js?v=1.18.0';
import {validateCanonicalReference} from './reference-integrity.js';
import {parseRef} from './books.js';
export {CITATION_REVIEW};

export const REVIEW_DECISIONS=Object.freeze({
 'warning-retained':'Qualification retained',
 'access-gap-retained':'Source access gap retained',
 'sources-added':'Supporting sources added',
 'passage-checked':'Selected passage checked',
 'context-clarified':'Reading context clarified'
});
export const IMPORTED_QUOTATION_KINDS=Object.freeze({
 'quotation':'Explicit quotation',
 'composite-quotation':'Combined scriptural quotation',
 'adapted-quotation':'Adapted scriptural quotation',
 'greek-dependent-quotation':'Greek-version-dependent quotation'
});
const scopeKeys={issue:'issues',place:'places',trail:'trailReadings',connection:'connections'};
const importedPairKey=(from,to)=>{const a=parseRef(from)?.formatted,b=parseRef(to)?.formatted;return a&&b?[a,b].sort().join('|'):null;};
const importedLookup=new Map((CITATION_REVIEW.importedReviews?.entries||[]).map(e=>[importedPairKey(e.from,e.to),e]));
export function importedQuotationReview(from,to,data=CITATION_REVIEW){
 const key=importedPairKey(from,to);
 if(!key)return null;
 if(data===CITATION_REVIEW)return importedLookup.get(key)||null;
 return data.importedReviews?.entries?.find(e=>importedPairKey(e.from,e.to)===key)||null;
}
export function citationReviews(kind,target,data=CITATION_REVIEW){return data.records.filter(r=>r.kind===kind&&r.target===target);}
export const reviewCitations=record=>[...record.citations,...(record.supplement?.citations||[]),...(record.textualFollowUp?.citations||[])];
export function commentaryCoverage(data=CITATION_REVIEW){return data.records.filter(r=>r.kind==='connection'&&reviewCitations(r).some(c=>['scholarly-commentary','publisher-note','publisher-abstract'].includes(data.sources[c.sourceId]?.kind))).length;}
const safeUrl=value=>{try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password;}catch{return false;}};
const date=value=>/^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;
export function validateCitationReview(data,counts,targets){
 if(data?.schema!==1||data.status!=='declared-batch-assessed'||!date(data.updated)||!data.method?.includes('project owner has reviewed and accepted')||!data.method.includes('No independent specialist signoff')||!data.deferred?.length||!Array.isArray(data.records)||!data.sources)throw Error('Invalid citation review metadata');
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
  if(r.supplement){
   const s=r.supplement;
   if(r.kind!=='connection'||!s.batch||!date(s.reviewedOn)||s.reviewedOn<r.reviewedOn||s.reviewedOn>data.updated||!s.note||!s.limitation||!s.citations?.length||s.citations.some(c=>data.sources[c.sourceId]?.kind!=='scholarly-commentary'||data.sources[c.sourceId].checkedOn>s.reviewedOn||!c.locator||!c.supports))throw Error('Invalid commentary follow-up '+k);
   if(new Set(reviewCitations(r).map(c=>c.sourceId)).size!==reviewCitations(r).length)throw Error('Duplicate follow-up source '+k);
  }
  if(r.textualFollowUp){
   const f=r.textualFollowUp;
   if(r.kind!=='connection'||!date(f.reviewedOn)||f.reviewedOn<r.reviewedOn||f.reviewedOn>data.updated||!f.topic||!f.finding||!f.limitation||!f.citations?.length||f.citations.some(c=>!data.sources[c.sourceId]||data.sources[c.sourceId].checkedOn>f.reviewedOn||!c.locator||!c.supports))throw Error('Invalid textual source follow-up '+k);
   if(new Set(reviewCitations(r).map(c=>c.sourceId)).size!==reviewCitations(r).length)throw Error('Duplicate follow-up source '+k);
  }
  if(r.kind==='place'&&r.decision==='sources-added'&&!r.citations.some(c=>['excavation-report','publisher-abstract','project-summary'].includes(data.sources[c.sourceId].kind)))throw Error('Place support needs a historical source '+k);
  totals[scopeKeys[r.kind]]++;seen.add(k);
 }
 for(const [k,n] of Object.entries(totals))if(data.scope[k]!==n)throw Error('Citation scope count mismatch '+k);
 const imported=data.importedReviews;
 if(imported){
  if(!date(imported.reviewedOn)||imported.reviewedOn>data.updated||!imported.method?.includes('OpenBible.info')||!Array.isArray(imported.entries)||!imported.entries.length)throw Error('Invalid imported quotation batch');
  const ids=new Set(),pairs=new Set();
  for(const r of imported.entries){
   const key=importedPairKey(r.from,r.to),from=validateCanonicalReference(r.from,counts),to=validateCanonicalReference(r.to,counts);
   if(!/^xr\d{3}$/.test(r.id)||ids.has(r.id)||!key||pairs.has(key)||!from||!to||from.startVerse===null||to.startVerse===null||from.book===to.book||!IMPORTED_QUOTATION_KINDS[r.kind]||!r.summary||!r.limitation||!date(r.reviewedOn)||r.reviewedOn>imported.reviewedOn||!Array.isArray(r.sources)||r.sources.length!==2||r.sources.some(src=>src.publisher!=='USCCB'||!src.title||!src.locator||!safeUrl(src.url)||!src.url.startsWith('https://bible.usccb.org/bible/')))throw Error('Invalid imported quotation '+r.id);
   ids.add(r.id);pairs.add(key);
  }
 }
 const batchIds=new Set();
 for(const batch of data.batches||[]){
  if(!batch.id||batchIds.has(batch.id)||!batch.title||!batch.method||!Number.isInteger(batch.count)||batch.count<1||batch.targets?.length!==batch.count||new Set(batch.targets).size!==batch.count)throw Error('Invalid citation batch '+batch.id);
  for(const id of batch.targets)if(!data.records.some(r=>r.kind==='connection'&&r.target===id&&(r.batch===batch.id||r.supportBatch===batch.id||r.supplement?.batch===batch.id)))throw Error('Unresolved citation batch target '+id);
  batchIds.add(batch.id);
 }
 for(const r of data.records)for(const key of ['batch','supportBatch'])if(r[key]&&!batchIds.has(r[key]))throw Error('Unknown citation batch '+r[key]);
 for(const r of data.records)if(r.supplement&&!data.batches?.some(b=>b.id===r.supplement.batch&&b.targets.includes(r.target)))throw Error('Unknown commentary follow-up batch or target');
 return true;
}

const make=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
export function appendCitationReview(parent,kind,target){
 for(const record of citationReviews(kind,target)){
  const detail=make('details',undefined,'citation-review');
  detail.append(make('summary','Citation review: '+REVIEW_DECISIONS[record.decision]));
  detail.append(make('p',record.note),make('p',record.limitation),make('p','Source assessment recorded '+record.reviewedOn+'. Study content reviewed and accepted by the project owner. Independent specialist review not claimed.','soft-note'));
  if(record.supplement){const s=record.supplement;detail.append(make('h4','Commentary follow-up'),make('p',s.note),make('p',s.limitation),make('p','Follow-up reviewed '+s.reviewedOn+' | Earlier assessment retained above.','soft-note'));}
  if(record.textualFollowUp){const f=record.textualFollowUp;detail.append(make('h4','Textual-source follow-up: '+f.topic),make('p',f.finding),make('p',f.limitation),make('p','Additional evidence assessed '+f.reviewedOn+'. Earlier editorial review and limitations are retained. No independent manuscript collation is claimed.','soft-note'));}
  const list=make('ul');
  for(const c of reviewCitations(record)){
   const s=CITATION_REVIEW.sources[c.sourceId],item=make('li'),link=make('a',s.title);
   link.href=s.url;link.target='_blank';link.rel='noopener noreferrer';
   item.append(link,make('p',s.author+' | '+s.publisher+' | '+s.kind.replaceAll('-',' ')),make('p','Checked: '+c.locator+'. Supports: '+c.supports+'.'),make('p','Access on '+s.checkedOn+': '+s.access,'soft-note'));list.append(item);
  }
  detail.append(list);parent.append(detail);
 }
}

export function appendImportedQuotationReview(parent,from,to){
 const record=importedQuotationReview(from,to);
 if(!record)return false;
 const detail=make('details',undefined,'citation-review');
 detail.append(make('summary','Source-classified: '+IMPORTED_QUOTATION_KINDS[record.kind]),make('p',record.summary),make('p',record.limitation),make('p','Primary Scripture citation review recorded '+record.reviewedOn+'. First-pass imported reference classification, not a complete Atlas explanation or independent manuscript review.','soft-note'));
 const sources=make('ul');
 for(const source of record.sources){const item=make('li'),link=make('a',source.title);link.href=source.url;link.target='_blank';link.rel='noopener noreferrer';item.append(link,make('p','Source: '+source.publisher+' | Locator: '+source.locator));sources.append(item);}
 detail.append(sources);parent.append(detail);return true;
}

export function renderCitationSummary(root){
 if(!root)return;
 const scope=CITATION_REVIEW.scope;
 const commentaryCount=commentaryCoverage();
 const remaining=scope.connections-commentaryCount;
 const newReviews=Math.max(0,scope.connections-115);
 const pending=Math.max(0,46-newReviews);
 root.replaceChildren(make('p',`Reviewed coverage: ${scope.issues} Gospel issues, ${scope.places} place dossiers, ${scope.trailReadings} Nehemiah readings and ${scope.connections} selected passage comparisons. ${commentaryCount} comparisons include named scholarly commentary or limited publisher-summary support. ${remaining?remaining+' comparisons rely on selected passage checks.':'All assessed pairs have at least one scoped secondary citation; this does not imply scholarly agreement with every link.'} Of the 46 explanations introduced in v0.32.0, ${newReviews} have dated assessments and ${pending} remain pending. Each assessment records a decision, checked source scope and limitations.`));
 root.append(make('p',`The original 115 explained pairs retain their earlier dated assessments and commentary follow-ups. ${newReviews} of the 46 newer pairs now have source assessments; ${pending} remain editorial reading aids pending review. The Bible is the authoritative foundation of Scripture Trails. Archaeological and historical publications supply supporting context within their stated scope. The published study content has been reviewed and accepted by the project owner. The cited material is limited to its recorded source scope; independent specialist signoff is not claimed.`));
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
 const textual=CITATION_REVIEW.records.filter(r=>r.textualFollowUp);
 root.append(make('h3','Completed citation milestones'));
 const done=make('ul');
 for(const line of [`All ${scope.connections} explained Atlas pairs have dated contextual source assessments.`,`All 46 explanations introduced in v0.32.0 have scoped source assessments; 0 remain pending.`,`The 32 previously passage-based assessments have dated commentary follow-ups.`,`All six earlier named-place bibliography gaps have scoped citations; their site-identification cautions remain.`])done.append(make('li',line));
 root.append(done);
 root.append(make('h3','Focused textual-source follow-ups'));
 const focused=make('ul');
 for(const r of textual){const item=make('li'),a=make('a',r.title+' - '+r.textualFollowUp.topic);a.href='/?view=connections&ref='+encodeURIComponent(r.anchor||r.passages[0].replace(/-.*$/,''));item.append(a);focused.append(item);}
 root.append(make('p',`${textual.length} further source-specific comparisons recorded. Follow-ups explain candidate readings and remaining limitations; they do not imply a complete manuscript collation.`));root.append(focused);
 const imported=CITATION_REVIEW.importedReviews?.entries||[];
 if(imported.length){
  root.append(make('h3','First-pass imported quotation classifications'));
  root.append(make('p',`${imported.length} additional imported Atlas pairs have been classified by their Scripture quotation form and given source links and limitations. They are separate from the ${scope.connections} fully explained connections. The remaining imported corpus has not been exhaustively classified.`));
  const group=make('details',undefined,'citation-review-group');group.append(make('summary',`Imported Scripture quotation reviews (${imported.length})`));
  for(const review of imported){
   const article=make('article');article.append(make('h3',review.from+' and '+review.to));
   const link=make('a','Open in Atlas');link.href='/?view=connections&ref='+encodeURIComponent(review.from);article.append(link);
   appendImportedQuotationReview(article,review.from,review.to);group.append(article);
  }
  root.append(group);
 }
 root.append(make('h3','Remaining source work'));
 const list=make('ul');for(const text of CITATION_REVIEW.deferred)list.append(make('li',text));root.append(list);
 const download=make('a','Download the dated citation review register (JSON)');download.href='/data/citation-review.json?v=1.18.0';download.download='scripture-trails-citation-review-'+CITATION_REVIEW.updated+'.json';root.append(download);
}
