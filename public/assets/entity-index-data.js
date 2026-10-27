import {validateCanonicalReference} from './reference-integrity.js';

/** Catalogued Gospel narrative entries with stable cross-links, not historical proof. */
export const ENTITY_TYPES=['person','place','event'];
const fold=s=>String(s||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’']/g,"").replace(/[^a-z0-9]+/g,' ').trim();
const listed=(items)=>[...new Set(items)];
export function buildEntityCatalog(peopleData,journeys,geography,audit,cityData,counts){
 if(!peopleData?.people?.length||!journeys?.events?.length||!journeys?.places?.length||!geography?.places||!audit?.issues||!cityData?.cities)throw Error('Incomplete index datasets');
 if(peopleData.sourcePolicy?.length<20||!peopleData.scope)throw Error('Index source policy missing');
 const eventById=new Map(journeys.events.map(x=>[x.id,x]));
 const placeById=new Map(journeys.places.map(x=>[x.id,x]));
 const issueById=new Map(audit.issues.map(x=>[x.id,x]));
 const personById=new Map(peopleData.people.map(x=>[x.id,x]));
 if(eventById.size!==journeys.events.length||placeById.size!==journeys.places.length||personById.size!==peopleData.people.length)throw Error('Duplicate source identifiers');
 const cities=new Map(cityData.cities.map(x=>[x.id,x]));
 const validateRef=(ref,label)=>{if(!validateCanonicalReference(ref,counts))throw Error('Invalid '+label+' reference: '+ref);};
 const records=[];
 for(const person of peopleData.people){
  if(!/^[a-z0-9-]+$/.test(person.id)||!person.name||!person.summary||!person.disambiguation||!Array.isArray(person.aliases)||!Array.isArray(person.passages)||!person.passages.length||!Array.isArray(person.events)||!Array.isArray(person.relationships))throw Error('Invalid person '+person.id);
  for(const ref of person.passages)validateRef(ref,person.id);
  for(const id of person.events)if(!eventById.has(id))throw Error('Unknown person event '+person.id+': '+id);
  for(const edge of person.relationships){if(!personById.has(edge.to)||edge.to===person.id||!edge.label)throw Error('Unknown person relation '+person.id);validateRef(edge.ref,'relation '+person.id);}
  records.push({id:person.id,type:'person',title:person.name,aliases:person.aliases,disambiguation:person.disambiguation,summary:person.summary,passages:person.passages,events:listed(person.events),relationships:person.relationships,sourceStatus:'Gospel primary text; independent biography review pending'});
 }
 for(const place of journeys.places){
  const d=geography.places[place.id];
  if(!d||!d.caution||!d.historicalContext||!d.evidenceLevel||!Array.isArray(d.literature))throw Error('Missing place dossier '+place.id);
  for(const source of d.literature)if(!geography.sources[source]||!/^https:\/\//.test(geography.sources[source].url))throw Error('Missing place source '+place.id);
  const episodes=journeys.events.filter(e=>e.place===place.id);
  if(!episodes.length)throw Error('No episodes indexed for place '+place.id);
  const references=d.oldTestament.map(x=>x.ref);
  for(const ref of references)validateRef(ref,'place '+place.id);
  records.push({id:place.id,type:'place',title:place.name,aliases:listed(d.ancientNames.filter(x=>x!==place.name)),disambiguation:place.region+' - '+d.modernSetting,summary:d.historicalContext,caution:d.caution,coordinates:place.coordinates,evidenceLevel:d.evidenceLevel,passages:listed([...references,...episodes.flatMap(e=>e.passages)]),events:episodes.map(x=>x.id),oldTestament:d.oldTestament,sourceLinks:d.literature.map(key=>({...geography.sources[key],id:key})),cityStudy:cities.has(place.id)?place.id:null,sourceStatus:d.review?.status==='source-linked'?'External place literature attached; it does not prove individual Gospel events':'No linked independent place bibliography; geographic status provisional'});
 }
 for(const event of journeys.events){
  if(!placeById.has(event.place)||!Array.isArray(event.passages)||!event.passages.length)throw Error('Unmatched journey event '+event.id);
  for(const ref of event.passages)validateRef(ref,'event '+event.id);
  const issues=(event.review?.issueIds||[]).map(id=>{const issue=issueById.get(id);if(!issue)throw Error('Missing event issue '+id);return {id,status:issue.status,description:issue.description,links:issue.references};});
  records.push({id:event.id,type:'event',title:event.title,aliases:[],disambiguation:'Gospel itinerary episode - '+(placeById.get(event.place)?.name||event.place),summary:event.summary,qualification:event.qualification||'',evidence:event.evidence,passages:event.passages,place:event.place,issues,events:[],sourceStatus:'Primary Gospel or Acts passages; chronology and location are editorially qualified'});
 }
 return {records,byKey:new Map(records.map(x=>[x.type+':'+x.id,x])),byId:{person:personById,place:placeById,event:eventById},count:{person:peopleData.people.length,place:journeys.places.length,event:journeys.events.length}};
}
export function referenceOverlaps(query,citation,counts){
 const q=validateCanonicalReference(query,counts),c=validateCanonicalReference(citation,counts);
 if(!q||!c||q.book!==c.book)return false;
 const start=x=>x.startChapter*1000+(x.startVerse??1);
 const end=x=>x.endChapter*1000+(x.endVerse??counts[x.book][x.endChapter-1]);
 return start(q)<=end(c)&&start(c)<=end(q);
}
/** Matches source passages and indexed episode context (not a claim of a person's presence in every verse). */
export function findEntities(catalog,query='',type='all',counts=null){
 if(!catalog?.records||!['all',...ENTITY_TYPES].includes(type))return [];
 const q=fold(query),words=q.split(' ').filter(Boolean),isRef=counts&&validateCanonicalReference(query,counts);
 return catalog.records.filter(x=>type==='all'||x.type===type).map(record=>{
  if(!q)return {record,score:0};
  if(isRef){
   const own=record.passages.some(ref=>referenceOverlaps(query,ref,counts));
   const linked=record.type==='person'&&record.events.some(id=>catalog.byKey.get('event:'+id)?.passages.some(ref=>referenceOverlaps(query,ref,counts)));
   return {record,score:own?4:linked?1:-1};
  }
  const heading=fold(record.title),aliases=record.aliases.map(fold);
  const corpus=fold([record.title,...record.aliases,record.disambiguation,record.summary,...record.passages].join(' '));
  if(!words.every(w=>corpus.includes(w)))return {record,score:-1};
  return {record,score:heading===q?8:aliases.includes(q)?7:heading.includes(q)?6:record.passages.some(x=>fold(x)===q)?5:1};
 }).filter(x=>x.score>=0).sort((a,b)=>b.score-a.score||a.record.title.localeCompare(b.record.title)||a.record.id.localeCompare(b.record.id)).map(x=>x.record);
}
