import {validateCanonicalReference} from './reference-integrity.js';

/** A sourced reading index: Gospel episodes and selected Hebrew Bible narratives. Historical verification is kept separate. */
export const ENTITY_TYPES=['person','place','event'];
const fold=s=>String(s||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’']/g,"").replace(/[^a-z0-9]+/g,' ').trim();
const listed=(items)=>[...new Set(items)];
export function buildEntityCatalog(peopleData,journeys,geography,audit,cityData,counts,historyData=null,expandedPeopleData=null){
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
 if(historyData){
  if(!historyData.scope||!historyData.sourcePolicy||!Array.isArray(historyData.people)||!Array.isArray(historyData.events)||!Array.isArray(historyData.places)||!historyData.sources)throw Error('Incomplete Hebrew Bible history dataset');
  const allPersonIds=new Set([...personById.keys()]);
  const allPlaceIds=new Set([...placeById.keys()]);
  const allEventIds=new Set([...eventById.keys()]);
  for(const p of historyData.people){if(allPersonIds.has(p.id))throw Error('Duplicate person ID '+p.id);allPersonIds.add(p.id);}
  for(const p of historyData.places){if(allPlaceIds.has(p.id))throw Error('Duplicate place ID '+p.id);allPlaceIds.add(p.id);}
  for(const e of historyData.events){if(allEventIds.has(e.id))throw Error('Duplicate event ID '+e.id);allEventIds.add(e.id);}
  const usedSource=ids=>{
   if(!Array.isArray(ids))throw Error('Source IDs must be an array');
   return ids.map(id=>{const source=historyData.sources[id];if(!source||!source.scope||!source.title||!/^https:\/\//.test(source.url))throw Error('Invalid historical source '+id);return {...source,id};});
  };
  for(const place of historyData.places){
   if(!/^[a-z0-9-]+$/.test(place.id)||!place.name||!['site','region','polity'].includes(place.kind)||!place.summary||!place.caution||!place.region||!Array.isArray(place.aliases)||!Array.isArray(place.passages)||!place.passages.length||!Array.isArray(place.events))throw Error('Invalid historical place '+place.id);
   for(const ref of place.passages)validateRef(ref,'historical place '+place.id);
   for(const id of place.events)if(!allEventIds.has(id))throw Error('Invalid event for place '+place.id+': '+id);
   records.push({id:place.id,type:'place',title:place.name,kind:place.kind,corpus:'Hebrew Bible',aliases:place.aliases,disambiguation:place.region+' - '+place.kind,summary:place.summary,caution:place.caution,passages:place.passages,events:listed(place.events),oldTestament:[],sourceLinks:usedSource(place.sourceIds),sourceStatus:place.sourceIds.length?'Independent context sources attached; claims have limited scope':'Biblical narrative references only; independent bibliography not linked'});
  }
  for(const event of historyData.events){
   if(!/^[a-z0-9-]+$/.test(event.id)||!event.title||!event.summary||!event.qualification||!event.category||!allPlaceIds.has(event.place)||!event.passages?.length||!Array.isArray(event.people)||!event.people.length)throw Error('Invalid Hebrew Bible event '+event.id);
   for(const ref of event.passages)validateRef(ref,'Hebrew Bible event '+event.id);
   for(const id of event.people)if(!allPersonIds.has(id))throw Error('Unknown participant for '+event.id+': '+id);
   records.push({id:event.id,type:'event',corpus:'Hebrew Bible',isJourney:false,title:event.title,aliases:[],disambiguation:'Hebrew Bible - '+event.category,summary:event.summary,passages:event.passages,place:event.place,people:event.people,qualification:event.qualification,sourceLinks:usedSource(event.sourceIds),issues:[],events:[],evidence:'Narrative source and editorial regional assignment',sourceStatus:'Biblical passage indexed; historical and archaeological claims require separately scoped evidence'});
   const existing=records.find(x=>x.type==='place'&&x.id===event.place);
   if(existing){existing.events=listed([...existing.events,event.id]);existing.passages=listed([...existing.passages,...event.passages]);existing.corpus=existing.corpus==='Gospels'?'Both':existing.corpus;}
  }
  for(const person of historyData.people){
   if(!/^[a-z0-9-]+$/.test(person.id)||!person.name||!person.summary||!person.disambiguation||!Array.isArray(person.aliases)||!person.passages?.length||!Array.isArray(person.events)||!Array.isArray(person.relationships))throw Error('Invalid Hebrew Bible person '+person.id);
   for(const ref of person.passages)validateRef(ref,'Hebrew Bible person '+person.id);
   for(const id of person.events)if(!allEventIds.has(id))throw Error('Unknown event for person '+person.id+': '+id);
   for(const edge of person.relationships){if(!allPersonIds.has(edge.to)||edge.to===person.id||!edge.label)throw Error('Unknown person relation '+person.id);validateRef(edge.ref,'relation '+person.id);}
   records.push({id:person.id,type:'person',corpus:'Hebrew Bible',title:person.name,aliases:person.aliases,disambiguation:person.disambiguation,summary:person.summary,passages:person.passages,events:listed(person.events),relationships:person.relationships,sourceLinks:usedSource(person.sourceIds||[]),sourceStatus:'Hebrew Bible passage testimony; museum evidence cited only for its independently attested claims'});
  }
  for(const person of historyData.people){
   for(const id of person.events){const event=records.find(x=>x.type==='event'&&x.id===id);if(event?.corpus==='Hebrew Bible'&&!event.people.includes(person.id))throw Error('Person event associations not reciprocal: '+person.id+' '+id);}
  }
  for(const event of historyData.events){
   for(const id of event.people){const p=records.find(x=>x.type==='person'&&x.id===id);if(p?.corpus==='Hebrew Bible'&&!p.events.includes(event.id))throw Error('Event person associations not reciprocal: '+event.id+' '+id);}
  }
 }
 if(expandedPeopleData){
  if(!expandedPeopleData.scope||expandedPeopleData.sourcePolicy?.length<25||!Array.isArray(expandedPeopleData.people))throw Error('Expanded biographies need an editorial source policy');
  const knownPeople=new Set(records.filter(x=>x.type==='person').map(x=>x.id));
  const knownEvents=new Set(records.filter(x=>x.type==='event').map(x=>x.id));
  for(const person of expandedPeopleData.people){
   if(!/^[a-z0-9-]+$/.test(person.id)||knownPeople.has(person.id))throw Error('Duplicate or invalid extended person '+person.id);
   knownPeople.add(person.id);
  }
  for(const person of expandedPeopleData.people){
   if(!person.name||!person.summary||!person.disambiguation||!['Hebrew Bible','Gospels'].includes(person.corpus)||!Array.isArray(person.aliases)||!Array.isArray(person.passages)||!person.passages.length||!Array.isArray(person.relationships)||!Array.isArray(person.events))throw Error('Incomplete extended person '+person.id);
   for(const ref of person.passages)validateRef(ref,'extended person '+person.id);
   for(const id of person.events)if(!knownEvents.has(id))throw Error('Unknown extended event '+person.id+': '+id);
   for(const edge of person.relationships){
    if(!edge.label||!edge.ref||!knownPeople.has(edge.to)||person.id===edge.to)throw Error('Invalid extended relationship '+person.id);
    validateRef(edge.ref,'extended relationship '+person.id);
   }
   records.push({id:person.id,type:'person',corpus:person.corpus,title:person.name,aliases:person.aliases,disambiguation:person.disambiguation,summary:person.summary,passages:person.passages,events:listed(person.events),relationships:person.relationships,sourceLinks:[],sourceStatus:'Indexed Scripture testimony; independent biographical corroboration not implied'});
  }
 }
 for(const entry of records){entry.corpus??='Gospels';if(entry.type==='event')entry.isJourney??=true;}
 const byKey=new Map(records.map(x=>[x.type+':'+x.id,x]));
 if(byKey.size!==records.length)throw Error('Colliding index keys');
 const personMap=new Map([...personById,...(historyData?.people||[]).map(x=>[x.id,x]),...(expandedPeopleData?.people||[]).map(x=>[x.id,x])]);
 const placeMap=new Map([...placeById,...(historyData?.places||[]).map(x=>[x.id,x])]);
 const eventMap=new Map([...eventById,...(historyData?.events||[]).map(x=>[x.id,x])]);
 return {records,byKey,byId:{person:personMap,place:placeMap,event:eventMap},count:{person:personMap.size,place:placeMap.size,event:eventMap.size}};
}
export function referenceOverlaps(query,citation,counts){
 const q=validateCanonicalReference(query,counts),c=validateCanonicalReference(citation,counts);
 if(!q||!c||q.book!==c.book)return false;
 const start=x=>x.startChapter*1000+(x.startVerse??1);
 const end=x=>x.endChapter*1000+(x.endVerse??counts[x.book][x.endChapter-1]);
 return start(q)<=end(c)&&start(c)<=end(q);
}
/** Matches source passages and indexed episode context (not a claim of a person's presence in every verse). */
export function findEntities(catalog,query='',type='all',counts=null,period='all'){
 if(!catalog?.records||!['all',...ENTITY_TYPES].includes(type)||!['all','Gospels','Hebrew Bible'].includes(period))return [];
 const q=fold(query),words=q.split(' ').filter(Boolean),isRef=counts&&validateCanonicalReference(query,counts);
 return catalog.records.filter(x=>(type==='all'||x.type===type)&&(period==='all'||x.corpus===period||x.corpus==='Both')).map(record=>{
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
