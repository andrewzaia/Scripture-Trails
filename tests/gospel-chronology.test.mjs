import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gospelSequence,gospelPassages,validateGospelChronology,GOSPEL_BOOKS} from '../public/assets/gospel-chronology.js';
import {validateRoadmap} from '../public/assets/roadmap.js';
const read=name=>JSON.parse(readFileSync(new URL('../public/data/'+name,import.meta.url),'utf8'));
const journeys=read('jesus-journeys.json'),audit=read('jesus-audit.json'),notes=read('gospel-chronology.json'),roadmap=read('roadmap.json');
const position=(book,id)=>gospelSequence(journeys,book).findIndex(e=>e.id===id);

test('all four narrative sequences are derived from explicit Gospel passages',()=>{
 assert.deepEqual(GOSPEL_BOOKS,['Matthew','Mark','Luke','John']);
 assert.equal(validateGospelChronology(notes,journeys,audit),true);
 for(const book of GOSPEL_BOOKS){const sequence=gospelSequence(journeys,book);
  assert.ok(sequence.length>10);assert.equal(new Set(sequence.map(e=>e.id)).size,sequence.length);
  assert.ok(sequence.every(e=>gospelPassages(e,book).length));
 }
 assert.throws(()=>gospelSequence(journeys,'Acts'));
});
test('sequences differ where cited Gospel texts arrange parallel material differently',()=>{
 assert.ok(position('Mark','j022')<position('Mark','j023'));
 assert.ok(position('Luke','j023')<position('Luke','j022'));
 assert.ok(position('Luke','j020')<position('Luke','j022'));
 assert.ok(position('Mark','j033')>position('Mark','j022'));
 assert.ok(position('Matthew','j033')>position('Matthew','j022'));
 assert.equal(position('John','j033'),-1);
 assert.ok(position('Mark','j065')<position('Mark','j064'));
});
test('disputed parallels have explicit source-linked cautions, not additional dated trips',()=>{
 for(const id of ['nazareth-rejection','temple-action','bethany-anointing','fishermen-call'])assert.ok(notes.comparisons.some(x=>x.id===id));
 assert.match(notes.methodology,/not historical time stamps/i);
 const invalid=structuredClone(notes);invalid.comparisons[0].events.push('missing-event');
 assert.throws(()=>validateGospelChronology(invalid,journeys,audit));
 const noSource=structuredClone(notes);noSource.comparisons[0].sourceIds=['unknown'];
 assert.throws(()=>validateGospelChronology(noSource,journeys,audit));
});
test('account control, cautions and next roadmap status are visible',()=>{
 const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
 for(const key of ['gospel','chronology-note','chronology-comparisons'])assert.ok(html.includes('data-jesus="'+key+'"'));
 assert.equal(validateRoadmap(roadmap),true);
 assert.equal(roadmap.milestones.find(m=>m.id==='timeline-evidence').status,'delivered');
 assert.equal(roadmap.milestones.find(m=>m.id==='independent-audit').status,'research');
});
