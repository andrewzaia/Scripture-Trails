/** Account-text order, not reconstructed dates or historical travel. */
export const GOSPEL_BOOKS=Object.freeze(['Matthew','Mark','Luke','John']);
export function gospelPassages(event,book){
 if(!GOSPEL_BOOKS.includes(book))throw Error('Unknown Gospel account: '+book);
 return event.passages.filter(ref=>ref.startsWith(book+' '));
}
export function gospelSequence(journeys,book){
 if(!GOSPEL_BOOKS.includes(book))throw Error('Unknown Gospel account: '+book);
 const indexed=journeys.events.flatMap((event,i)=>{
  const refs=gospelPassages(event,book);if(!refs.length)return [];
  const positions=refs.map(ref=>{const m=new RegExp('^'+book+' (\\d+)(?::(\\d+))?').exec(ref);
   if(!m)throw Error('Unrecognised account passage: '+ref);
   return [Number(m[1]),Number(m[2]||0)];
  }).sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
  return [{event,chapter:positions[0][0],verse:positions[0][1],original:i}];
 });
 indexed.sort((a,b)=>a.chapter-b.chapter||a.verse-b.verse||a.original-b.original);
 return indexed.map(entry=>entry.event);
}
export function validateGospelChronology(catalogue,journeys,audit){
 if(!catalogue||!Array.isArray(catalogue.sources)||!catalogue.sources.length||!Array.isArray(catalogue.comparisons)||!catalogue.comparisons.length||!catalogue.methodology||!catalogue.scope)throw Error('Invalid Gospel comparison catalogue');
 const events=new Map(journeys.events.map(e=>[e.id,e]));
 const issues=new Set(audit.issues.map(issue=>issue.id));
 const sources=new Map(catalogue.sources.map(s=>[s.id,s]));
 if(sources.size!==catalogue.sources.length||sources.size===0||catalogue.sources.some(s=>!s.title||!s.claim||!s.kind||!/^https:\/\//.test(s.url)))throw Error('Unverified comparison source metadata');
 const ids=new Set();
 for(const c of catalogue.comparisons){
  if(ids.has(c.id)||!c.title||!c.analysis||!c.status||!issues.has(c.issueId)||c.events?.length<2||!c.events.every(id=>events.has(id))||!c.passages?.length||!c.passages.every(ref=>c.events.some(id=>events.get(id).passages.includes(ref)))||!c.sourceIds?.length||!c.sourceIds.every(id=>sources.has(id)))throw Error('Invalid comparison: '+c.id);
  ids.add(c.id);
 }
 for(const gospel of GOSPEL_BOOKS){
  const selection=gospelSequence(journeys,gospel);if(!selection.length||new Set(selection.map(e=>e.id)).size!==selection.length||!selection.every(e=>gospelPassages(e,gospel).length))throw Error('Invalid '+gospel+' narrative sequence');
 }
 return true;
}
