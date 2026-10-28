import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {NOTE_PLACES} from '../public/assets/note-places.js';
import {validateAnnotations,mergeAnnotations,filteredAnnotations} from '../public/assets/annotations.js';
import {validateBackup,mergeNotebook,persistNotebook} from '../public/assets/notebook-backup.js';
const counts=JSON.parse(readFileSync(new URL('../public/data/verse-counts.json',import.meta.url)));
const note=()=>({id:'a-12345678',text:'My observation',refs:[],tags:['history'],places:['jerusalem','assyria-empire']});
const annotations=()=>({notes:[note()],highlights:{'John 3:16':'green'}});
const notebook=()=>({notes:{},bookmarks:[],readingPlans:{},annotations:annotations(),collections:[]});
const backup=()=>({format:'scripture-trails-notebook',schemaVersion:5,exportedAt:'2026-10-28T00:00:00Z',...notebook()});
test('place registry matches all existing Gospel and Hebrew Bible index records',()=>{
 execFileSync(process.execPath,['scripts/build-note-places.mjs','--check']);
 assert.equal(NOTE_PLACES.length,49);assert.equal(new Set(NOTE_PLACES.map(p=>p.id)).size,49);
});
test('notes accept indexed places with or without passages and reject unknown or duplicate links',()=>{
 assert.deepEqual(validateAnnotations(annotations(),counts).notes[0].places,note().places);
 for(const places of [['unknown'],['jerusalem','jerusalem'],null,Array(21).fill('jerusalem'),[{}]])assert.throws(()=>validateAnnotations({notes:[{...note(),places}],highlights:{}},counts));
 assert.throws(()=>validateAnnotations({notes:[{...note(),places:[]}],highlights:{}},counts));
 assert.equal(validateAnnotations({notes:[{...note(),refs:['Jn 3:16']}],highlights:{}},counts).notes[0].refs[0],'John 3:16');
});
test('notebook filters combine place names, aliases, type, tags and highlight colour',()=>{
 const data=annotations();assert.equal(filteredAnnotations(data,{place:'jerusalem'}).length,1);assert.equal(filteredAnnotations(data,{place:'none'}).length,1);
 assert.equal(filteredAnnotations(data,{query:'Assyria',kind:'note',tag:'history'}).length,1);
 assert.equal(filteredAnnotations(data,{place:'jerusalem',kind:'highlight'}).length,0);
 assert.equal(filteredAnnotations(data,{colour:'green'}).length,1);
 assert.equal(filteredAnnotations(data,{place:'jerusalem',tag:'missing'}).length,0);
});
test('schema 5 round trips place-only notes; older schemas preserve existing linked notes',()=>{
 assert.deepEqual(validateBackup(JSON.parse(JSON.stringify(backup())),counts).annotations.notes[0],note());
 for(const schemaVersion of [1,2,3,4]){const b={...backup(),schemaVersion};b.annotations={notes:[],highlights:{}};if(schemaVersion<4)delete b.collections;if(schemaVersion<3)delete b.annotations;if(schemaVersion<2)delete b.readingPlans;
  assert.deepEqual(mergeNotebook(notebook(),validateBackup(b,counts)).merged.annotations.notes[0],note());
 }
 assert.throws(()=>validateBackup({...backup(),schemaVersion:4},counts));
});
test('changing only place links is a reviewable conflict; omitted and empty legacy links match',()=>{
 const a=annotations(),b=annotations();b.notes[0].places=['bethlehem'];const plan=mergeAnnotations(a,b);assert.equal(plan.conflicts.length,1);assert.match(plan.conflicts[0].current,/Jerusalem/);assert.deepEqual(plan.merged.notes[0].places,note().places);
 assert.deepEqual(mergeAnnotations(a,b,new Set(['annotation:a-12345678'])).merged.notes[0].places,['bethlehem']);
 const legacy={id:'a-87654321',text:'Old note',refs:['John 3:16'],tags:[]};assert.equal(mergeAnnotations({notes:[legacy],highlights:{}},{notes:[{...legacy,places:[]}],highlights:{}}).conflicts.length,0);
});
test('place-link writes respect quota failures and cross-tab changes',()=>{
 const current=notebook();let writes=0;const storage={getItem:()=>JSON.stringify(current),setItem:()=>{writes++;throw Error('Quota');}};
 assert.throws(()=>persistNotebook(storage,{...current,annotations:{notes:[],highlights:{}}},current),/Quota/);assert.equal(writes,1);
 assert.throws(()=>persistNotebook(storage,current,{...current,annotations:{notes:[],highlights:{}}}),/another tab/);assert.equal(writes,1);
});
