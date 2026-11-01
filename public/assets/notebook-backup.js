import {validateCollections,mergeCollections} from './study-collections.js?v=0.44.17';
import {validateAnnotations,mergeAnnotations,emptyAnnotations} from './annotations.js?v=0.44.17';
import {validateReadingPlans,mergeReadingPlans} from './reading-plans.js?v=0.44.17';
import {parseRef} from './books.js';
import {validateCanonicalReference} from './reference-integrity.js';
export const BACKUP_LIMIT=2*1024*1024;
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
export function validateBackup(value,counts){
 if(!value||typeof value!=='object'||Array.isArray(value)||value.format!=='scripture-trails-notebook'||![1,2,3,4,5].includes(value.schemaVersion)||typeof value.exportedAt!=='string'||!Number.isFinite(Date.parse(value.exportedAt))||Object.keys(value).some(k=>!['format','schemaVersion','exportedAt','bookmarks','notes',...(value.schemaVersion>=2?['readingPlans']:[]),...(value.schemaVersion>=3?['annotations']:[]),...(value.schemaVersion>=4?['collections']:[])].includes(k)))throw Error('Unsupported or malformed notebook backup.');
 if(!Array.isArray(value.bookmarks)||value.bookmarks.length>300||!value.notes||typeof value.notes!=='object'||Array.isArray(value.notes)||Object.keys(value.notes).length>2000)throw Error('Invalid notebook contents or entry limits exceeded.');
 const ref=x=>{if(!validateCanonicalReference(x,counts))throw Error('Backup contains an invalid passage reference.');const parsed=parseRef(x);if(!parsed)throw Error('Unsupported passage reference.');return parsed.formatted;};
 const bookmarks=value.bookmarks.map(ref);if(new Set(bookmarks).size!==bookmarks.length)throw Error('Duplicate saved passage references.');
 const notes=Object.create(null);for(const [key,text] of Object.entries(value.notes)){const canonical=ref(key);if(typeof text!=='string'||!text.trim()||text.length>50000||own(notes,canonical))throw Error('Invalid, empty, oversized or duplicate note.');notes[canonical]=text;}
 if(new TextEncoder().encode(JSON.stringify(value)).length>BACKUP_LIMIT)throw Error('Backup exceeds the 2 MiB limit.');
 return {bookmarks,notes,readingPlans:value.schemaVersion>=2?validateReadingPlans(value.readingPlans):{},annotations:value.schemaVersion>=3?validateAnnotations(value.annotations,counts,{allowPlaces:value.schemaVersion>=5}):emptyAnnotations(),collections:value.schemaVersion>=4?validateCollections(value.collections,counts):[]};
}
export function mergeNotebook(current,incoming,replace=new Set()){
 const bookmarks=[...new Set([...current.bookmarks,...incoming.bookmarks])];if(bookmarks.length>300)throw Error('The combined notebook exceeds 300 saved passages. Remove some passages before importing.');
 const notes=Object.assign(Object.create(null),current.notes),conflicts=[],added=[],duplicates=[];
 for(const [ref,text] of Object.entries(incoming.notes)){
  if(!own(notes,ref)){notes[ref]=text;added.push(ref);}else if(notes[ref]===text)duplicates.push(ref);else{conflicts.push({ref,current:notes[ref],incoming:text});if(replace.has(ref))notes[ref]=text;}
 }
 if(Object.keys(notes).length>2000)throw Error('The combined notebook exceeds 2,000 notes.');
 const readingPlans=mergeReadingPlans(current.readingPlans,incoming.readingPlans);const newCompleted=Object.entries(readingPlans).reduce((n,[id,refs])=>n+refs.filter(r=>!(current.readingPlans?.[id]||[]).includes(r)).length,0);const annotationPlan=mergeAnnotations(current.annotations,incoming.annotations,replace);conflicts.push(...annotationPlan.conflicts);const collectionPlan=mergeCollections(current.collections,incoming.collections,replace);conflicts.push(...collectionPlan.conflicts);const merged={bookmarks,notes,readingPlans,annotations:annotationPlan.merged,collections:collectionPlan.merged};if(new TextEncoder().encode(JSON.stringify(merged)).length>BACKUP_LIMIT)throw Error('The combined notebook exceeds the 2 MiB limit.');
 return {merged,collectionAdded:collectionPlan.added,annotationAdded:annotationPlan.added,conflicts,added,duplicates,newCompleted,newBookmarks:incoming.bookmarks.filter(x=>!current.bookmarks.includes(x)).length,duplicateBookmarks:incoming.bookmarks.filter(x=>current.bookmarks.includes(x)).length};
}
const STORAGE_KEY='scripture-trails:notebook';
/** A denied browser Storage property must not prevent the rest of the site initialising. */
export function safeBrowserStorage(access=()=>globalThis.localStorage){
 try{const storage=access();if(!storage||typeof storage.getItem!=='function'||typeof storage.setItem!=='function')throw Error('Browser storage missing');return storage;}catch{return {getItem(){throw Error('Browser storage denied');},setItem(){throw Error('Browser storage denied');}};}
}

/** Detect unreadable notebook snapshots without clearing or rewriting the original bytes. */
export function inspectNotebookStorage(storage){
 let raw;
 try{raw=storage.getItem(STORAGE_KEY);}catch{return {kind:'unavailable',raw:null};}
 if(raw===null)return {kind:'ready',raw:null};
 try{
  const value=JSON.parse(raw);
  if(!value||typeof value!=='object'||Array.isArray(value)||!Array.isArray(value.bookmarks)||!value.notes||typeof value.notes!=='object'||Array.isArray(value.notes)||value.readingPlans!==undefined&&(!value.readingPlans||typeof value.readingPlans!=='object'||Array.isArray(value.readingPlans))||value.annotations!==undefined&&(!value.annotations||typeof value.annotations!=='object'||Array.isArray(value.annotations))||value.collections!==undefined&&!Array.isArray(value.collections))return {kind:'corrupt',raw};
  return {kind:'ready',raw};
 }catch{return {kind:'corrupt',raw};}
}
/** Explicit one-write recovery only after an imported backup has been validated and reviewed. */
export function replaceUnreadableNotebook(storage,notebook,expectedRaw){
 if(typeof expectedRaw!=='string'||!expectedRaw)throw Error('A damaged notebook snapshot is required for recovery.');
 const state=inspectNotebookStorage(storage);
 if(state.kind==='unavailable')throw Error('Browser storage is unavailable. Your backup has not been imported.');
 if(state.raw!==expectedRaw)throw Error('Notebook changed in another tab. Choose the file again before recovering.');
 if(state.kind!=='corrupt')throw Error('The stored notebook is readable. Reload and review current data before importing.');
 storage.setItem(STORAGE_KEY,JSON.stringify(notebook));
}
export function persistNotebook(storage,notebook,expected){
 const snapshot=storage.getItem('scripture-trails:notebook');
 const stored=snapshot?JSON.parse(snapshot):{bookmarks:JSON.parse(storage.getItem('scripture-trails:bookmarks')||'[]'),notes:JSON.parse(storage.getItem('scripture-trails:notes')||'{}')};
 const comparable=n=>({bookmarks:n.bookmarks,notes:n.notes,readingPlans:n.readingPlans||{},annotations:n.annotations||emptyAnnotations(),collections:n.collections||[]});
 if(JSON.stringify(comparable(stored))!==JSON.stringify(comparable(expected)))throw Error('Notebook changed in another tab. Reload before importing.');
 storage.setItem('scripture-trails:notebook',JSON.stringify(notebook));
}
export function createNotebookBackup(root,handlers){
 const $=key=>root.querySelector(`[data-backup="${key}"]`);let incoming=null,baseline=null,baselineRaw=null,request=0;
 const storage=handlers.storage||safeBrowserStorage();
 const status=text=>{$('status').textContent=text;};
 function refreshRecovery(){
  const issue=inspectNotebookStorage(storage);
  $('recovery').hidden=issue.kind==='ready';
  $('recovery-download').hidden=issue.kind!=='corrupt';
  $('recovery-confirm').disabled=issue.kind!=='corrupt';
  if(issue.kind!=='corrupt')$('recovery-confirm').checked=false;
  $('recovery-description').textContent=issue.kind==='corrupt'
   ?'The saved notebook data on this device is unreadable. Scripture Trails has not erased or replaced it. Download the original raw data for safekeeping, then choose a valid backup and explicitly approve recovery. Notes not present in that backup cannot be automatically reconstructed.'
   :'Browser storage is inaccessible. Check the browser settings and storage permissions before importing or saving. Your backup has not been changed.';
  return issue;
 }
 $('recovery-download').addEventListener('click',()=>{
  const issue=inspectNotebookStorage(storage);
  if(issue.kind!=='corrupt')return status('Raw recovery data is no longer available. Reload and review the notebook.');
  try{
   const url=URL.createObjectURL(new Blob([issue.raw],{type:'application/octet-stream'}));
   const a=document.createElement('a');a.href=url;a.download='scripture-trails-unreadable-notebook-'+new Date().toISOString().slice(0,10)+'.txt';a.click();
   setTimeout(()=>URL.revokeObjectURL(url),1000);status('Raw notebook data download started. Keep this private recovery copy before replacing damaged storage.');
  }catch{status('Could not start the raw recovery download. The original stored data has not been changed.');}
 });
 refreshRecovery();

 function reset(){incoming=null;baseline=null;baselineRaw=null;$('preview').hidden=true;$('conflicts').replaceChildren();$('file').value='';}
 $('export').addEventListener('click',async()=>{try{const snapshot=handlers.current(),value={format:'scripture-trails-notebook',schemaVersion:5,exportedAt:new Date().toISOString(),bookmarks:snapshot.bookmarks,notes:snapshot.notes,readingPlans:snapshot.readingPlans||{},annotations:snapshot.annotations||emptyAnnotations(),collections:snapshot.collections||[]};validateBackup(value,await handlers.counts());const text=JSON.stringify(value,null,2)+'\n';if(new TextEncoder().encode(text).length>BACKUP_LIMIT)throw Error('Backup is too large.');const url=URL.createObjectURL(new Blob([text],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='scripture-trails-notebook-'+value.exportedAt.slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status('Backup download started. Keep it somewhere private.');}catch{status('Could not export this notebook. Check the saved entries and available browser storage.');}});
 $('file').addEventListener('change',async()=>{const id=++request,file=$('file').files[0];reset();if(!file)return;try{if(file.size>BACKUP_LIMIT)throw Error('Choose a JSON backup no larger than 2 MiB.');const [text,counts]=await Promise.all([file.text(),handlers.counts()]);if(id!==request)return;incoming=validateBackup(JSON.parse(text),counts);const current=handlers.current(),plan=mergeNotebook(current,incoming);baseline=JSON.stringify(current);$('recovery-confirm').checked=false;baselineRaw=refreshRecovery().raw;$('summary').textContent=`${plan.newBookmarks} new saved passages, ${plan.duplicateBookmarks} already saved; ${plan.added.length} new notes, ${plan.duplicates.length} identical notes, ${plan.conflicts.length} conflicting entries; ${plan.newCompleted} additional passages marked read; ${plan.annotationAdded} new linked notes or highlights; ${plan.collectionAdded} new study collections. Matching collection schedules combine completed passages; changed collections are kept unless replacement is selected. Matching plans preserve completed passages. A selected collection replacement uses its backup progress.`;
 for(const conflict of plan.conflicts){const row=document.createElement('fieldset'),legend=document.createElement('legend');legend.textContent=conflict.label||conflict.ref;row.append(legend);for(const [label,text] of [['Existing value',conflict.current],['Backup value',conflict.incoming]]){const p=document.createElement('p');p.textContent=label+': '+text;row.append(p);}const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.dataset.ref=conflict.ref;label.append(input,document.createTextNode(' Use the backup value for this conflict'));row.append(label);$('conflicts').append(row);}
 $('preview').hidden=false;status('Preview ready. Existing notes are kept unless you select a replacement. Nothing has been imported yet.');
 }catch(error){if(id!==request)return;reset();status(error instanceof SyntaxError?'This file is not valid JSON.':error.message);}});
 $('cancel').addEventListener('click',()=>{request++;reset();status('Import cancelled. Your notebook has not changed.');});
 $('apply').addEventListener('click',()=>{if(!incoming)return;try{const current=handlers.current();if(JSON.stringify(current)!==baseline){reset();throw Error('Your notebook changed after the preview. Choose the file again to review the latest conflicts.');}const replace=new Set([...$('conflicts').querySelectorAll('input:checked')].map(i=>i.dataset.ref));const result=mergeNotebook(current,incoming,replace);
 const issue=inspectNotebookStorage(storage);
 if(issue.kind==='unavailable')throw Error('Browser storage is unavailable. The original notebook was not changed.');
 if(issue.kind==='corrupt'&&!$('recovery-confirm').checked)throw Error('The stored notebook is unreadable. Download the raw copy and tick the recovery confirmation before importing.');
 handlers.apply(result.merged,issue.kind==='corrupt'?{recoverCorrupt:baselineRaw}:undefined);
 reset();refreshRecovery();status('Notebook imported and saved on this device. Existing notes were kept unless you selected replacements.');}catch(error){status(error.message||'Import could not be saved. Your existing notebook is unchanged.');}});
}
