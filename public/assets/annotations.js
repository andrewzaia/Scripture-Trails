import {NOTE_PLACES,notePlace} from './note-places.js?v=0.21.0';
import {parseRef} from './books.js';
import {validateCanonicalReference} from './reference-integrity.js';
export const COLOURS=['amber','green','blue'];
export function canonicalVerse(ref,counts){const p=validateCanonicalReference(ref,counts),parsed=parseRef(ref);if(!p||!parsed||p.startVerse===null||p.endChapter!==p.startChapter||p.endVerse!==p.startVerse)throw Error('Use a single verse reference.');return parsed.formatted;}
export function validateAnnotations(value,counts,{allowPlaces=true}={}){
 if(!value||typeof value!=='object'||Array.isArray(value)||!Array.isArray(value.notes)||value.notes.length>1000||!value.highlights||typeof value.highlights!=='object'||Array.isArray(value.highlights)||Object.keys(value.highlights).length>2000||Object.keys(value).some(k=>!['notes','highlights'].includes(k)))throw Error('Invalid annotations.');
 const ids=new Set(),notes=value.notes.map(n=>{if(!n||typeof n.id!=='string'||!/^a-[a-zA-Z0-9-]{8,80}$/.test(n.id)||ids.has(n.id)||typeof n.text!=='string'||!n.text.trim()||n.text.length>50000||!Array.isArray(n.refs)||n.refs.length>20||!Array.isArray(n.tags)||n.tags.length>10||n.tags.some(t=>typeof t!=='string'||!t.trim()||t.length>40)||Object.keys(n).some(k=>!['id','text','refs','tags',...(allowPlaces?['places']:[])].includes(k)))throw Error('Invalid linked note.');ids.add(n.id);const places=n.places===undefined?[]:n.places;if(!Array.isArray(places)||places.length>20||new Set(places).size!==places.length||places.some(id=>typeof id!=='string'||!notePlace(id))||!n.refs.length&&!places.length)throw Error('Link the note to at least one valid passage or indexed place.');const refs=n.refs.map(r=>{const p=parseRef(r);if(!p||!validateCanonicalReference(r,counts))throw Error('Invalid linked passage.');return p.formatted;});if(new Set(refs).size!==refs.length)throw Error('Duplicate linked verse.');return {id:n.id,text:n.text,refs,tags:[...new Set(n.tags.map(t=>t.trim()))],...(places.length?{places:[...places]}:{})};});
 const highlights=Object.create(null);for(const [ref,colour] of Object.entries(value.highlights)){const key=canonicalVerse(ref,counts);if(!COLOURS.includes(colour)||Object.hasOwn(highlights,key))throw Error('Invalid highlight.');highlights[key]=colour;}return {notes,highlights};
}
export const emptyAnnotations=()=>({notes:[],highlights:{}});
export function mergeAnnotations(current=emptyAnnotations(),incoming=emptyAnnotations(),replace=new Set()){
 const notes=current.notes.map(n=>({...n})),highlights={...current.highlights},conflicts=[];let added=0;
 for(const n of incoming.notes){const old=notes.find(x=>x.id===n.id);if(!old){notes.push(n);added++;}else if(JSON.stringify([old.text,old.refs,old.tags,old.places||[]])!==JSON.stringify([n.text,n.refs,n.tags,n.places||[]])){const key='annotation:'+n.id;conflicts.push({ref:key,label:'Linked note: '+([...old.refs,...(old.places||[]).map(id=>notePlace(id)?.name||id)].join(', ')),current:old.text+'\nPassages: '+old.refs.join('; ')+'\nTags: '+old.tags.join(', ')+'\nPlaces: '+(old.places||[]).map(id=>notePlace(id)?.name||id).join('; '),incoming:n.text+'\nPassages: '+n.refs.join('; ')+'\nTags: '+n.tags.join(', ')+'\nPlaces: '+(n.places||[]).map(id=>notePlace(id)?.name||id).join('; ')});if(replace.has(key))notes[notes.indexOf(old)]=n;}}
 for(const [ref,colour] of Object.entries(incoming.highlights)){if(!Object.hasOwn(highlights,ref)){highlights[ref]=colour;added++;}else if(highlights[ref]!==colour){const key='highlight:'+ref;conflicts.push({ref:key,label:'Highlight: '+ref,current:highlights[ref],incoming:colour});if(replace.has(key))highlights[ref]=colour;}}
 if(notes.length>1000||Object.keys(highlights).length>2000)throw Error('Combined annotation limits exceeded.');return {merged:{notes,highlights},conflicts,added};
}
export function applyHighlights(box,highlights){
 box.querySelectorAll('.personal-highlight').forEach(n=>n.replaceWith(...n.childNodes));box.querySelectorAll('.verse-highlight-label').forEach(n=>n.remove());
 const walker=document.createTreeWalker(box,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT),work=[];let ref=null,node;
 while((node=walker.nextNode())){if(node.nodeType===1&&node.matches('.verse-num[data-verse-ref]'))ref=node.dataset.verseRef;else if(node.nodeType===3&&node.textContent.trim()&&COLOURS.includes(highlights[ref])&&!node.parentElement.closest('.verse-num,.verse-atlas-link,h2,h3,h4,h5,.footnotes,.copyright,a'))work.push([node,highlights[ref]]);}
 for(const [text,colour] of work){const span=document.createElement('span');span.className='personal-highlight';span.dataset.colour=colour;text.replaceWith(span);span.append(text);}
 for(const marker of box.querySelectorAll('.verse-num[data-verse-ref]')){const colour=highlights[marker.dataset.verseRef];if(COLOURS.includes(colour)){const label=document.createElement('small');label.className='verse-highlight-label';label.textContent=' Highlight: '+colour+' ';marker.after(label);}}
}
export function filteredAnnotations(data,{query='',tag='',colour='all',place='all',kind='all'}={}){
 const q=query.trim().toLowerCase(),t=tag.trim().toLowerCase();
 const notes=data.notes.map(n=>({...n,kind:'note'})),highlights=Object.entries(data.highlights).map(([ref,c])=>({kind:'highlight',refs:[ref],tags:[],text:'Highlight: '+c,colour:c}));
 return [...notes,...highlights].filter(n=>{
  const places=n.places||[];
  if(kind!=='all'&&n.kind!==kind||place==='none'&&places.length||!['all','none'].includes(place)&&!places.includes(place)||t&&!n.tags.some(x=>x.toLowerCase()===t)||colour!=='all'&&!n.refs.some(r=>data.highlights[r]===colour))return false;
  return [n.text,...n.refs,...n.tags,...places.flatMap(id=>{const p=notePlace(id);return p?[p.name,p.context,...p.aliases]:[id];})].some(x=>x.toLowerCase().includes(q));
 });
}
export function createAnnotations(root,handlers){
 const $=key=>root.querySelector(`[data-annotation="${key}"]`);let editing=null,selectedPlaces=[];
 const make=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;};
 const button=(text,action)=>{const b=make('button',text);b.type='button';b.className='small-action';b.addEventListener('click',action);return b;};
 const status=text=>{$('status').textContent=text;};
 const placeLabel=p=>p.name+' - '+p.context;
 for(const p of NOTE_PLACES){for(const key of ['place-choice','place-filter']){const o=make('option',placeLabel(p));o.value=p.id;$(key).append(o);}}
 function renderSelected(){const list=$('places');list.replaceChildren();for(const id of selectedPlaces){const p=notePlace(id);const row=make('div');row.className='annotation-place-chip';row.append(make('span',placeLabel(p)),button('Remove '+p.name,()=>{selectedPlaces=selectedPlaces.filter(x=>x!==id);renderSelected();$('place-choice').focus();}));list.append(row);}if(!selectedPlaces.length)list.append(make('small','No places linked to this draft.'));}
 function addPlace(id){if(!notePlace(id))return status('Choose an indexed place.');if(selectedPlaces.includes(id))return status('This place is already linked.');if(selectedPlaces.length>=20)return status('Use no more than 20 places per note.');selectedPlaces.push(id);renderSelected();status('Place linked to the draft. Save the note to keep it.');}
 $('add-place').addEventListener('click',()=>addPlace($('place-choice').value));
 $('use-place').addEventListener('click',()=>addPlace($('place-filter').value));
 const save=next=>{handlers.save(next);render();};
 function clear(){editing=null;selectedPlaces=[];$('text').value='';$('refs').value='';$('tags').value='';$('place-choice').value='';$('save').textContent='Save linked note';renderSelected();}
 $('save').addEventListener('click',async()=>{$('save').disabled=true;try{
  const counts=await handlers.counts(),current=handlers.current(),note={id:editing||'a-'+crypto.randomUUID(),text:$('text').value.trim(),refs:$('refs').value.split(';').map(r=>r.trim()).filter(Boolean),tags:$('tags').value.split(',').map(t=>t.trim()).filter(Boolean),...(selectedPlaces.length?{places:[...selectedPlaces]}:{})};
  if(editing&&!current.notes.some(n=>n.id===editing))throw Error('This note was removed. Cancel editing before creating a new note.');
  const notes=editing?current.notes.map(n=>n.id===editing?note:n):[...current.notes,note];save(validateAnnotations({notes,highlights:current.highlights},counts));clear();status('Linked note saved on this device.');
 }catch(e){status(e.message);}finally{$('save').disabled=false;}});
 $('cancel').addEventListener('click',()=>{clear();status('Editing cancelled.');});
 for(const key of ['filter','colour','tag','place-filter','kind'])$(key).addEventListener(['colour','place-filter','kind'].includes(key)?'change':'input',render);
 function render(){
  const data=handlers.current(),items=filteredAnnotations(data,{query:$('filter').value,colour:$('colour').value,tag:$('tag').value,place:$('place-filter').value,kind:$('kind').value});$('list').replaceChildren();$('use-place').hidden=!notePlace($('place-filter').value);
  for(const n of items){const item=make('article');item.className='annotation-entry';item.append(make('p',n.text));
   for(const ref of n.refs)item.append(button(ref,()=>handlers.read(ref)));
   for(const id of n.places||[]){const p=notePlace(id);item.append(button('Place: '+placeLabel(p),()=>handlers.place(id)));}
   if(n.tags.length)item.append(make('small','Tags: '+n.tags.join(', ')));
   if(n.kind==='note'){
    item.append(button('Edit note',()=>{editing=n.id;selectedPlaces=[...(n.places||[])];$('text').value=n.text;$('refs').value=n.refs.join('; ');$('tags').value=n.tags.join(', ');$('save').textContent='Update linked note';renderSelected();$('text').focus();}));
    const cancel=button('Keep note',()=>{confirm.hidden=cancel.hidden=true;}),confirm=button('Confirm delete note',()=>{try{save({...handlers.current(),notes:handlers.current().notes.filter(x=>x.id!==n.id)});if(editing===n.id)clear();status('Linked note deleted.');}catch(e){status(e.message);}});confirm.hidden=cancel.hidden=true;
    item.append(button('Delete note',()=>{confirm.hidden=cancel.hidden=false;}),confirm,cancel);
   }else item.append(button('Remove highlight',()=>{try{const next=handlers.current(),highlights={...next.highlights};delete highlights[n.refs[0]];save({...next,highlights});status('Highlight removed.');}catch(e){status(e.message);}}));
   $('list').append(item);
  }
  if(!items.length)$('list').append(make('p','No annotations match these filters.'));
  $('count').textContent=items.length+' matching annotations';
 }
 clear();
 return {render,focusPlace(id){if(!notePlace(id))return;$('place-filter').value=id;$('filter').value='';$('tag').value='';$('colour').value='all';$('kind').value='all';render();root.scrollIntoView({block:'start'});$('place-filter').focus();status('Showing private notes for '+notePlace(id).name+'. Your draft has been kept.');}};
}
