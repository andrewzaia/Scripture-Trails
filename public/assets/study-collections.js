import {parseRef} from './books.js';
import {validateCanonicalReference} from './reference-integrity.js';
import {PATHS} from './studies.js?v=0.44.3';

const fields=['id','title','refs','completed','start','days'];
export function validDate(value){return typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&value>='1900-01-01'&&value<='9997-12-31'&&Number.isFinite(Date.parse(value+'T12:00:00Z'))&&new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value;}
export function localDate(now=new Date()){return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;}
export function validateCollections(value,counts){
 if(!Array.isArray(value)||value.length>50)throw Error('Use no more than 50 study collections.');
 const ids=new Set();
 return value.map(c=>{
  if(!c||typeof c!=='object'||Array.isArray(c)||Object.keys(c).length!==fields.length||Object.keys(c).some(k=>!fields.includes(k))||typeof c.id!=='string'||!/^c-[a-zA-Z0-9-]{1,80}$/.test(c.id)||ids.has(c.id)||typeof c.title!=='string'||!c.title.trim()||c.title.length>120)throw Error('Invalid or duplicate study collection.');
  ids.add(c.id);
  if(!Array.isArray(c.refs)||!c.refs.length||c.refs.length>100||c.refs.some(r=>typeof r!=='string'||!validateCanonicalReference(r,counts)||!parseRef(r)))throw Error('Each collection needs 1 to 100 valid passages.');
  const refs=c.refs.map(r=>parseRef(r).formatted);
  if(new Set(refs).size!==refs.length||!Array.isArray(c.completed)||new Set(c.completed).size!==c.completed.length||c.completed.some(r=>!refs.includes(r)))throw Error('Duplicate passages or invalid collection progress.');
  if(c.start!==null&&!validDate(c.start))throw Error('Choose a valid start date from 1900 to 9997.');
  if(!Array.isArray(c.days)||!c.days.length||new Set(c.days).size!==c.days.length||c.days.some(d=>!Number.isInteger(d)||d<0||d>6))throw Error('Choose at least one reading day.');
  return {id:c.id,title:c.title.trim(),refs,completed:refs.filter(r=>c.completed.includes(r)),start:c.start,days:[...c.days].sort()};
 });
}
export function scheduleCollection(c){
 if(c.start===null)return c.refs.map(ref=>({ref,date:null}));
 if(!validDate(c.start)||!c.days?.length||c.days.some(d=>!Number.isInteger(d)||d<0||d>6)||c.refs.length>100)throw Error('Invalid reading schedule.');
 const day=new Date(c.start+'T12:00:00Z');
 return c.refs.map(ref=>{while(!c.days.includes(day.getUTCDay()))day.setUTCDate(day.getUTCDate()+1);const date=day.toISOString().slice(0,10);day.setUTCDate(day.getUTCDate()+1);return {ref,date};});
}
export function mergeCollections(current=[],incoming=[],replace=new Set()){
 const merged=structuredClone(current),conflicts=[];let added=0;
 for(const c of incoming){const index=merged.findIndex(x=>x.id===c.id);if(index<0){merged.push(structuredClone(c));added++;continue;}
  const existing=merged[index],shape=x=>JSON.stringify([x.title,x.refs,x.start,[...x.days].sort()]);
  if(shape(existing)===shape(c)){const completed=new Set([...existing.completed,...c.completed]);existing.completed=existing.refs.filter(r=>completed.has(r));}
  else{const ref='collection:'+c.id;conflicts.push({ref,label:'Study collection: '+existing.title,current:JSON.stringify(existing),incoming:JSON.stringify(c)});if(replace.has(ref))merged[index]=structuredClone(c);}
 }
 if(merged.length>50)throw Error('The combined notebook exceeds 50 study collections.');
 return {merged,conflicts,added};
}
export function createStudyCollections(root,handlers){
 const $=key=>root.querySelector(`[data-collection="${key}"]`);let editing=null,editingSnapshot=null;
 const make=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;};
 const button=(text,action)=>{const b=make('button',text);b.type='button';b.className='small-action';b.addEventListener('click',action);return b;};
 const status=text=>{$('status').textContent=text;};
 const days=()=>[...root.querySelectorAll('[data-reading-day]:checked')].map(x=>Number(x.value));
 const reset=()=>{editing=null;editingSnapshot=null;$('form').reset();$('save').textContent='Save collection';$('cancel').hidden=true;};
 for(const path of PATHS){const option=make('option',path.name);option.value=path.id;$('seed').append(option);}
 $('seed').addEventListener('change',()=>{const path=PATHS.find(p=>p.id===$('seed').value);if(path){$('title').value=path.name;$('refs').value=path.refs.join('; ');}});
 $('cancel').addEventListener('click',()=>{reset();status('Editing cancelled.');});
 $('form').addEventListener('submit',async event=>{event.preventDefault();$('save').disabled=true;try{
  const counts=await handlers.counts(),current=handlers.current(),previous=current.find(c=>c.id===editing);
  const refs=$('refs').value.split(';').map(r=>r.trim()).filter(Boolean).map(r=>{if(!validateCanonicalReference(r,counts)||!parseRef(r))throw Error('Invalid passage: '+r);return parseRef(r).formatted;});
  if(editing&&!previous)throw Error('This collection changed. Reload before saving.');
  if(editing&&JSON.stringify(previous)!==editingSnapshot)throw Error('This collection changed after editing began. Your draft is kept here. Cancel editing and reopen the current collection before saving.');
  const collection={id:editing||'c-'+crypto.randomUUID(),title:$('title').value,refs,completed:(previous?.completed||[]).filter(r=>refs.includes(r)),start:$('start').value||null,days:days()};
  const next=validateCollections(editing?current.map(c=>c.id===editing?collection:c):[...current,collection],counts);
  handlers.save(next);reset();render();status('Collection saved on this device.');
 }catch(error){status(error.message||'Could not save this collection.');}finally{$('save').disabled=false;}});
 function render(){const list=$('list'),opened=new Set([...list.querySelectorAll('details[open]')].map(x=>x.dataset.collectionId));list.replaceChildren();const today=localDate();
  for(const c of handlers.current()){
   const card=make('article');card.className='study-collection';card.append(make('h3',c.title));const complete=new Set(c.completed),schedule=scheduleCollection(c),due=schedule.filter(s=>s.date&&s.date<=today&&!complete.has(s.ref));
   card.append(make('p',`${complete.size} of ${c.refs.length} passages marked read${c.start?`; ${due.length} due through today`:''}.`));
   const next=c.refs.find(r=>!complete.has(r));if(next)card.append(button('Resume next unread passage',()=>handlers.read(next)));
   card.append(button('Edit collection',()=>{editing=c.id;editingSnapshot=JSON.stringify(c);$('title').value=c.title;$('refs').value=c.refs.join('; ');$('start').value=c.start||'';root.querySelectorAll('[data-reading-day]').forEach(i=>i.checked=c.days.includes(Number(i.value)));$('seed').value='';$('save').textContent='Save changes';$('cancel').hidden=false;$('title').focus();status('Editing '+c.title+'. Removing a passage also removes its completion from this collection.');}));
   const remove=button('Delete collection',()=>{confirm.hidden=cancel.hidden=false;});const confirm=button('Confirm deletion',()=>{try{handlers.save(handlers.current().filter(x=>x.id!==c.id));if(editing===c.id)reset();render();status('Collection deleted.');}catch(e){status(e.message);}}),cancel=button('Keep collection',()=>{confirm.hidden=cancel.hidden=true;});confirm.hidden=cancel.hidden=true;card.append(remove,confirm,cancel);
   const details=make('details'),summary=make('summary','Passages and schedule');details.dataset.collectionId=c.id;details.open=opened.has(c.id);details.append(summary);
   for(const {ref,date} of schedule){const row=make('div');row.className='reading-plan-row';const label=make('label'),input=make('input');input.type='checkbox';input.dataset.collectionId=c.id;input.dataset.completionRef=ref;input.checked=complete.has(ref);input.addEventListener('change',()=>{try{const next=handlers.current().map(x=>x.id!==c.id?x:{...x,completed:x.refs.filter(r=>r===ref?input.checked:x.completed.includes(r))});handlers.save(next);render();[...root.querySelectorAll('[data-completion-ref]')].find(x=>x.dataset.collectionId===c.id&&x.dataset.completionRef===ref)?.focus();status('Reading progress saved.');}catch(e){input.checked=complete.has(ref);status(e.message);}});label.append(input,document.createTextNode(' '+ref+(date?' - '+date:'')));row.append(label,button('Read '+ref,()=>handlers.read(ref)));details.append(row);}
   card.append(details);list.append(card);
  }
  if(!list.children.length)list.append(make('p','No collections yet. Choose a study journey or add your own passages.'));
 }
 return {render};
}
