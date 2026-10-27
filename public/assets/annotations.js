import {parseRef} from './books.js';
import {validateCanonicalReference} from './reference-integrity.js';
export const COLOURS=['amber','green','blue'];
export function canonicalVerse(ref,counts){const p=validateCanonicalReference(ref,counts),parsed=parseRef(ref);if(!p||!parsed||p.startVerse===null||p.endChapter!==p.startChapter||p.endVerse!==p.startVerse)throw Error('Use a single verse reference.');return parsed.formatted;}
export function validateAnnotations(value,counts){
 if(!value||typeof value!=='object'||Array.isArray(value)||!Array.isArray(value.notes)||value.notes.length>1000||!value.highlights||typeof value.highlights!=='object'||Array.isArray(value.highlights)||Object.keys(value.highlights).length>2000||Object.keys(value).some(k=>!['notes','highlights'].includes(k)))throw Error('Invalid annotations.');
 const ids=new Set(),notes=value.notes.map(n=>{if(!n||typeof n.id!=='string'||!/^a-[a-zA-Z0-9-]{8,80}$/.test(n.id)||ids.has(n.id)||typeof n.text!=='string'||!n.text.trim()||n.text.length>50000||!Array.isArray(n.refs)||!n.refs.length||n.refs.length>20||!Array.isArray(n.tags)||n.tags.length>10||n.tags.some(t=>typeof t!=='string'||!t.trim()||t.length>40)||Object.keys(n).some(k=>!['id','text','refs','tags'].includes(k)))throw Error('Invalid linked note.');ids.add(n.id);const refs=n.refs.map(r=>{const p=parseRef(r);if(!p||!validateCanonicalReference(r,counts))throw Error('Invalid linked passage.');return p.formatted;});if(new Set(refs).size!==refs.length)throw Error('Duplicate linked verse.');return {id:n.id,text:n.text,refs,tags:[...new Set(n.tags.map(t=>t.trim()))]};});
 const highlights=Object.create(null);for(const [ref,colour] of Object.entries(value.highlights)){const key=canonicalVerse(ref,counts);if(!COLOURS.includes(colour)||Object.hasOwn(highlights,key))throw Error('Invalid highlight.');highlights[key]=colour;}return {notes,highlights};
}
export const emptyAnnotations=()=>({notes:[],highlights:{}});
export function mergeAnnotations(current=emptyAnnotations(),incoming=emptyAnnotations(),replace=new Set()){
 const notes=current.notes.map(n=>({...n})),highlights={...current.highlights},conflicts=[];let added=0;
 for(const n of incoming.notes){const old=notes.find(x=>x.id===n.id);if(!old){notes.push(n);added++;}else if(JSON.stringify(old)!==JSON.stringify(n)){const key='annotation:'+n.id;conflicts.push({ref:key,label:'Linked note: '+old.refs.join(', '),current:old.text+'\nPassages: '+old.refs.join('; ')+'\nTags: '+old.tags.join(', '),incoming:n.text+'\nPassages: '+n.refs.join('; ')+'\nTags: '+n.tags.join(', ')});if(replace.has(key))notes[notes.indexOf(old)]=n;}}
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
export function createAnnotations(root,handlers){
 const $=key=>root.querySelector(`[data-annotation="${key}"]`);let editing=null;
 const status=text=>{$('status').textContent=text;};
 const save=next=>{handlers.save(next);render();};
 function clear(){editing=null;$('text').value='';$('refs').value='';$('tags').value='';$('save').textContent='Save linked note';}
 $('save').addEventListener('click',async()=>{$('save').disabled=true;try{const counts=await handlers.counts(),current=handlers.current(),note={id:editing||'a-'+crypto.randomUUID(),text:$('text').value.trim(),refs:$('refs').value.split(';').map(r=>r.trim()).filter(Boolean),tags:$('tags').value.split(',').map(t=>t.trim()).filter(Boolean)};const notes=current.notes.filter(n=>n.id!==note.id);notes.push(note);const validated=validateAnnotations({notes,highlights:current.highlights},counts);save(validated);clear();status('Linked note saved on this device.');}catch(e){status(e.message);}finally{$('save').disabled=false;}});
 $('cancel').addEventListener('click',clear);
 for(const key of ['filter','colour','tag'])$(key).addEventListener(key==='colour'?'change':'input',render);
 function render(){const data=handlers.current(),query=$('filter').value.trim().toLowerCase(),colour=$('colour').value,tag=$('tag').value.trim().toLowerCase();$('list').replaceChildren();let count=0;
 const matches=(refs,tags,text)=>refs.some(r=>r.toLowerCase().includes(query))||text.toLowerCase().includes(query)||tags.some(t=>t.toLowerCase().includes(query));
 const row=(refs,tags,text,extra)=>{if(!matches(refs,tags,text)||tag&&!tags.some(t=>t.toLowerCase()===tag)||colour!=='all'&&!refs.some(r=>data.highlights[r]===colour))return;count++;const item=document.createElement('article');item.className='annotation-entry';const p=document.createElement('p');p.textContent=text;item.append(p);for(const ref of refs){const b=document.createElement('button');b.type='button';b.className='small-action';b.textContent=ref;b.addEventListener('click',()=>handlers.read(ref));item.append(b);}if(tags.length){const t=document.createElement('small');t.textContent='Tags: '+tags.join(', ');item.append(t);}extra(item);$('list').append(item);};
 for(const n of data.notes)row(n.refs,n.tags,n.text,item=>{const edit=document.createElement('button');edit.type='button';edit.className='small-action';edit.textContent='Edit note';edit.addEventListener('click',()=>{editing=n.id;$('text').value=n.text;$('refs').value=n.refs.join('; ');$('tags').value=n.tags.join(', ');$('save').textContent='Update linked note';$('text').focus();});item.append(edit);const del=document.createElement('button');del.type='button';del.className='small-action';del.textContent='Delete note';del.addEventListener('click',()=>{del.textContent='Confirm delete note';del.onclick=()=>{try{save({...handlers.current(),notes:handlers.current().notes.filter(x=>x.id!==n.id)});if(editing===n.id)clear();status('Linked note deleted.');}catch(e){status(e.message);}};},{once:true});item.append(del);});
 for(const [ref,c] of Object.entries(data.highlights))row([ref],[],'Highlight: '+c,item=>{const del=document.createElement('button');del.type='button';del.className='small-action';del.textContent='Remove highlight';del.addEventListener('click',()=>{try{const next=handlers.current(),highlights={...next.highlights};delete highlights[ref];save({...next,highlights});status('Highlight removed.');}catch(e){status(e.message);}});item.append(del);});
 $('count').textContent=count+' matching annotations';
 }
 return {render};
}
