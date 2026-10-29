import {PATHS} from './studies.js?v=0.31.0';
export function validateReadingPlans(value){
 if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Invalid reading progress.');
 const result=Object.create(null);
 for(const [id,refs] of Object.entries(value)){const path=PATHS.find(p=>p.id===id);if(!path||!Array.isArray(refs)||new Set(refs).size!==refs.length||refs.some(r=>!path.refs.includes(r)))throw Error('Unknown plan or invalid completed passage.');result[id]=path.refs.filter(r=>refs.includes(r));}
 return result;
}
export function mergeReadingPlans(current={},incoming={}){
 const a=validateReadingPlans(current),b=validateReadingPlans(incoming),result=Object.create(null);
 for(const id of new Set([...Object.keys(a),...Object.keys(b)])){const refs=new Set([...(a[id]||[]),...(b[id]||[])]);result[id]=PATHS.find(p=>p.id===id).refs.filter(r=>refs.has(r));}return result;
}
export function renderReadingPlan(root,path,handlers){
 const make=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;};
 const section=make('section');section.className='reading-plan';section.setAttribute('aria-label','Reading progress');section.append(make('h3','Your reading progress'),make('p','Optional progress for the complete reading pathway, saved on this device. Reading a passage does not mark it complete. Notebook backups include progress.'));
 const summary=make('p'),bar=make('progress');bar.max=path.refs.length;bar.setAttribute('aria-label',path.name+' completion');section.append(summary,bar);
 const status=make('p');status.setAttribute('role','status');let completed=new Set(handlers.current()[path.id]||[]);
 const rows=make('details');rows.className='reading-plan-checklist';rows.append(make('summary','Show the full passage checklist ('+path.refs.length+' references)'));const inputs=[];const resume=make('button','Resume next unread passage');resume.type='button';resume.className='small-action';resume.addEventListener('click',()=>{const ref=path.refs.find(r=>!completed.has(r));if(ref)handlers.read(ref);});
 const refresh=()=>{summary.textContent=`${completed.size} of ${path.refs.length} passages marked read`;bar.value=completed.size;resume.disabled=completed.size===path.refs.length;for(const [input,ref] of inputs)input.checked=completed.has(ref);};
 const save=next=>{try{handlers.save({...handlers.current(),[path.id]:path.refs.filter(r=>next.has(r))});completed=next;status.textContent='Reading progress saved on this device.';}catch{status.textContent='Could not save progress. Your saved progress has not changed. Reload if another tab changed your notebook.';}refresh();};
 for(const ref of path.refs){const row=make('div'),label=make('label'),input=make('input');row.className='reading-plan-row';input.type='checkbox';input.addEventListener('change',()=>{const next=new Set(completed);if(input.checked)next.add(ref);else next.delete(ref);save(next);});label.append(input,document.createTextNode(' '+ref));const read=make('button','Read');read.type='button';read.className='small-action';read.addEventListener('click',()=>handlers.read(ref));row.append(label,read);rows.append(row);inputs.push([input,ref]);}
 const reset=make('button','Reset this plan'),confirm=make('button','Confirm reset'),cancel=make('button','Keep progress');for(const b of [reset,confirm,cancel]){b.type='button';b.className='small-action';}confirm.hidden=cancel.hidden=true;
 reset.addEventListener('click',()=>{confirm.hidden=cancel.hidden=false;});confirm.addEventListener('click',()=>{save(new Set());confirm.hidden=cancel.hidden=true;});cancel.addEventListener('click',()=>{confirm.hidden=cancel.hidden=true;});section.append(resume,rows,reset,confirm,cancel,status);refresh();root.append(section);
}
