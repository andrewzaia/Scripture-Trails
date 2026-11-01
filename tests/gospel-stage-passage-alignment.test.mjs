import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateJourneyData} from '../public/assets/jesus-map.js';

const data=JSON.parse(readFileSync(new URL('../public/data/jesus-journeys.json',import.meta.url),'utf8'));
const event=id=>data.events.find(x=>x.id===id);

test('Nazareth rejection stages are textual presentations, not proven extra visits',()=>{
 const luke=event('j020'),synoptic=event('j033');
 assert.ok(luke&&synoptic);
 assert.deepEqual(luke.passages,['Luke 4:16-30']);
 assert.deepEqual(synoptic.passages,['Mark 6:1-6','Matthew 13:53-58']);
 assert.equal(luke.place,'nazareth');
 assert.equal(synoptic.place,'nazareth');
 assert.match(synoptic.title,/Hometown rejection.*Mark and Matthew/);
 assert.doesNotMatch(synoptic.title,/return|second|another/i);
 assert.doesNotMatch(synoptic.summary,/\bagain\b|another visit|a second visit/i);
 assert.match(synoptic.qualification,/not a proven second historical visit/);
 assert.equal(synoptic.review.status,'needs-further-review');
 assert.ok(synoptic.review.issueIds.includes('nazareth-order'));
});

test('Golgotha summary does not anticipate burial beyond its canonical readings',()=>{
 const death=event('j072'),burial=event('j073');
 assert.ok(death&&burial);
 assert.deepEqual(death.passages,['Matthew 27:32-56','Mark 15:21-41','Luke 23:26-49','John 19:17-30']);
 assert.doesNotMatch(death.summary,/burial|preparations|tomb/i);
 assert.match(death.summary,/Golgotha/);
 assert.match(death.summary,/death/);
 assert.equal(burial.title,'Burial in a tomb');
 assert.deepEqual(burial.passages,['Matthew 27:57-66','Mark 15:42-47','Luke 23:50-56','John 19:38-42']);
 assert.match(burial.summary,/tomb/);
 assert.equal(death.place,'jerusalem');
 assert.equal(burial.place,'jerusalem');
});

test('Gospel itinerary and every stage study remain structurally valid after scoped corrections',()=>{
 assert.equal(validateJourneyData(data),true);
 assert.equal(data.events.length,79);
 assert.equal(new Set(data.events.map(x=>x.id)).size,79);
 for(const item of data.events){
  assert.ok(item.passages.length>0);
  assert.ok(item.study.context.length>=120);
  assert.ok(['qualified','screened','needs-further-review'].includes(item.review.status));
 }
});
