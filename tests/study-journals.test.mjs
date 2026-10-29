import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PATHS} from '../public/assets/studies.js';
import {parseRef} from '../public/assets/books.js';
import {validateCanonicalReference} from '../public/assets/reference-integrity.js';
import {validateReadingPlans,mergeReadingPlans} from '../public/assets/reading-plans.js';

const counts=JSON.parse(readFileSync(new URL('../public/data/verse-counts.json',import.meta.url)));
const expectedIds=['creation','messiah','shepherd','covenant','grace','comfort'];
const initialAnchors={
 creation:['Genesis 1:1','Genesis 2:9','John 1:1','Colossians 1:15','Romans 8:21','Revelation 21:1','Revelation 22:2'],
 messiah:['Genesis 12:3','Isaiah 7:14','Micah 5:2','Isaiah 40:3','Isaiah 53:5','Luke 4:18','John 1:14'],
 shepherd:['Psalm 23:1','Ezekiel 34:11','John 10:11','Luke 15:4','1 Peter 5:4'],
 covenant:['Genesis 12:3','Genesis 15:6','Exodus 12:13','Jeremiah 31:31','Luke 22:20','Galatians 3:8','Hebrews 8:8'],
 grace:['Genesis 15:6','Romans 3:23','Romans 4:3','Galatians 3:8','Ephesians 2:8','James 2:23'],
 comfort:['Psalm 23:1','Psalm 46:1','Isaiah 40:31','Matthew 6:25','Romans 8:28','Philippians 4:6','Revelation 21:4']
};

test('all six journals have substantial, purposeful and contextual reading pathways',()=>{
 assert.deepEqual(PATHS.map(p=>p.id),expectedIds);
 let totalStages=0,totalReadings=0;
 for(const path of PATHS){
  assert.equal(path.chapters.length,6,path.id);
  assert.ok(path.refs.length>=35,path.id+' lacks sufficient reading depth');
  assert.equal(new Set(path.refs).size,path.refs.length,path.id+' has duplicate progress references');
  assert.deepEqual(path.anchors,initialAnchors[path.id],path.id+' original progress anchors changed');
  assert.deepEqual(path.refs.slice(0,path.anchors.length),path.anchors,path.id+' original progress ordering changed');
  assert.ok(path.chapters.every(stage=>stage.title&&stage.focus&&stage.connection&&stage.question&&stage.context),path.id+' missing contextual material');
  for(const stage of path.chapters){
   totalStages++;
   assert.ok(stage.readings.length>=6,stage.title+' has too few passages');
   assert.equal(new Set(stage.readings).size,stage.readings.length,stage.title+' repeats a reference');
   for(const ref of stage.readings){
    totalReadings++;
    assert.ok(parseRef(ref),ref+' cannot be opened by the reader');
    assert.ok(validateCanonicalReference(ref,counts),ref+' fails verse-count integrity');
    assert.ok(path.refs.includes(ref),ref+' omitted from reading progress');
   }
  }
 }
 assert.equal(totalStages,36);
 assert.ok(totalReadings>=200);
});

test('reading progress saved against the earlier short journeys remains valid',()=>{
 const earlier=Object.fromEntries(PATHS.map(path=>[path.id,[path.anchors[0]]]));
 const validated=validateReadingPlans(earlier);
 assert.deepEqual(Object.fromEntries(Object.entries(validated).map(([key,value])=>[key,[...value]])),earlier);
 const later=PATHS.find(p=>p.id==='creation').chapters[0].readings[0];
 const merged=mergeReadingPlans(earlier,{creation:[later]});
 assert.ok(merged.creation.includes(earlier.creation[0]));
 assert.ok(merged.creation.includes(later));
});
