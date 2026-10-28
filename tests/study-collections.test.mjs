import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateCollections,validDate,scheduleCollection,mergeCollections,localDate} from '../public/assets/study-collections.js';
import {validateBackup,mergeNotebook,persistNotebook} from '../public/assets/notebook-backup.js';
const counts=JSON.parse(readFileSync(new URL('../public/data/verse-counts.json',import.meta.url)));
const collection=()=>({id:'c-test',title:'Hope',refs:['John 1:1','Psalms 23','Romans 5:1-11'],completed:[],start:'2028-02-28',days:[1,2,3,4,5]});
const notebook=collections=>({bookmarks:[],notes:{},readingPlans:{},annotations:{notes:[],highlights:{}},collections});
test('collection references canonicalise and invalid, duplicate and excessive data is rejected',()=>{
 const c=collection();c.refs[0]='Jn 1:1';assert.equal(validateCollections([c],counts)[0].refs[0],'John 1:1');
 for(const mutate of [c=>c.refs=['John 1:99'],c=>c.refs=['John 1:1','Jn 1:1'],c=>c.completed=['Mark 1:1'],c=>c.days=[],c=>c.days=[7],c=>c.start='2027-02-29',c=>c.start='2027-13-01',c=>c.title='',c=>c.extra=true,c=>c.id='__proto__']){const c=collection();mutate(c);assert.throws(()=>validateCollections([c],counts));}
 assert.throws(()=>validateCollections([collection(),collection()],counts));assert.throws(()=>validateCollections(Array(51).fill(collection()),counts));
});
test('calendar handles leap days, year boundaries, skipped weekdays and fixed dates after completion',()=>{
 const c=collection();assert.deepEqual(scheduleCollection(c).map(x=>x.date),['2028-02-28','2028-02-29','2028-03-01']);
 c.start='2027-12-31';assert.deepEqual(scheduleCollection(c).map(x=>x.date),['2027-12-31','2028-01-03','2028-01-04']);
 c.days=[0];assert.deepEqual(scheduleCollection(c).map(x=>x.date),['2028-01-02','2028-01-09','2028-01-16']);c.completed=[c.refs[0]];assert.equal(scheduleCollection(c)[1].date,'2028-01-09');c.start=null;assert.ok(scheduleCollection(c).every(x=>x.date===null));
 assert.equal(validDate('2026-02-30'),false);assert.equal(validDate('no'),false);assert.equal(localDate(new Date(2026,0,2,23,59)),'2026-01-02');
});
test('matching collections union completion, conflicting definitions need explicit replacement',()=>{
 const a=collection(),b=collection();a.completed=[a.refs[0]];b.completed=[b.refs[1]];
 assert.deepEqual(mergeCollections([a],[b]).merged[0].completed,a.refs.slice(0,2));assert.deepEqual(a.completed,[a.refs[0]]);
 b.title='New name';const plan=mergeCollections([a],[b]);assert.equal(plan.conflicts.length,1);assert.equal(plan.merged[0].title,'Hope');assert.equal(mergeCollections([a],[b],new Set(['collection:c-test'])).merged[0].title,'New name');
});
test('schema 4 round trips collections and older backups preserve them',()=>{
 const c=collection(),base={format:'scripture-trails-notebook',schemaVersion:4,exportedAt:'2026-10-28T00:00:00Z',...notebook([c])};
 const result=validateBackup(JSON.parse(JSON.stringify(base)),counts);assert.deepEqual(result.collections,[c]);
 for(const schemaVersion of [1,2,3]){const old={...base,schemaVersion};delete old.collections;if(schemaVersion<3)delete old.annotations;if(schemaVersion<2)delete old.readingPlans;assert.deepEqual(mergeNotebook(result,validateBackup(old,counts)).merged.collections,[c]);}
});
test('collection-only cross-tab changes and quota failures cannot overwrite saved work',()=>{
 const current=notebook([collection()]);const values=new Map([['scripture-trails:notebook',JSON.stringify(current)]]);let writes=0;const storage={getItem:k=>values.get(k)||null,setItem:()=>{writes++;throw Error('Quota');}};
 assert.throws(()=>persistNotebook(storage,notebook([]),current),/Quota/);assert.equal(writes,1);assert.deepEqual(JSON.parse(values.get('scripture-trails:notebook')),current);
 assert.throws(()=>persistNotebook(storage,notebook([]),notebook([])),/another tab/);assert.equal(writes,1);
});
