import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PERSON_TRAILS,personTrail,findPersonTrails,validatePersonTrails} from '../public/assets/person-trails.js';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const counts=JSON.parse(read('public/data/verse-counts.json'));
const ids=new Set(['biblical-people.json','biblical-history.json','biblical-people-expanded.json'].flatMap(n=>JSON.parse(read('public/data/'+n)).people.map(p=>p.id)));
const added=['ruth-moabite','hannah-samuel','samuel-prophet','elijah','elisha','jeremiah','daniel','nehemiah-governor','mary-mother','peter','john-baptist','barnabas'];
test('twelve further figures have contextual, source-labelled trails and all twenty remain indexed',()=>{
 assert.equal(validatePersonTrails(counts,ids),true);assert.equal(PERSON_TRAILS.length,20);
 assert.equal(PERSON_TRAILS.reduce((n,t)=>n+t.stages.length,0),88);
 for(const id of added){const t=personTrail(id);assert.equal(t.stages.length,4,id);assert.ok(t.caution.length>60);for(const step of t.stages){assert.match(step.ref,/:\d+-\d+$/);assert.equal(step.source,'primary-scripture');assert.equal(step.review,'editorial-reading-aid');}}
});
test('invalid identity, provenance, oversized readings and duplicate stages fail validation',()=>{
 for(const mutate of [t=>t.personId='unknown',t=>t.review='peer-reviewed',t=>delete t.caution,t=>t.stages[0].source='archaeology',t=>t.stages[0].ref='Ruth 1:99',t=>t.stages[0].ref='John 1:1-31',t=>t.stages[1]={...t.stages[0]}]){const t=structuredClone(personTrail('ruth-moabite'));mutate(t);assert.throws(()=>validatePersonTrails(counts,ids,[t]));}
 assert.throws(()=>validatePersonTrails(counts,ids,[PERSON_TRAILS[0],PERSON_TRAILS[0]]));
});
test('directory search combines passage or topic text with the selected Scripture collection',()=>{
 assert.equal(findPersonTrails().length,20);assert.equal(findPersonTrails('','Hebrew Bible').length,14);assert.equal(findPersonTrails('','New Testament').length,6);
 assert.deepEqual(findPersonTrails('Ruth').map(t=>t.personId),['ruth-moabite']);assert.deepEqual(findPersonTrails('Ruth','New Testament'),[]);
 assert.ok(findPersonTrails('Acts 15').some(t=>t.personId==='barnabas'));assert.deepEqual(findPersonTrails('not-a-real-name'),[]);
});
test('identity and chronology cautions preserve the specific editorial limits',()=>{
 assert.match(personTrail('daniel').caution,/not named.*chapter 3/);assert.ok(!personTrail('daniel').stages.some(s=>s.ref.startsWith('Daniel 3:')));
 assert.match(personTrail('john-baptist').caution,/earlier execution/);assert.match(personTrail('mary-mother').caution,/distinct from Mary Magdalene/);
 assert.match(personTrail('jeremiah').caution,/exiled community/);assert.match(personTrail('peter').caution,/does not settle interpretations/);
});
test('directory and profiles wire review labels, reader ranges and starting-verse Atlas navigation',()=>{
 const app=read('public/assets/app.js'),index=read('public/assets/entity-index.js'),html=read('public/index.html'),version=JSON.parse(read('package.json')).version;
 assert.ok(app.includes('person-trails.js?v='+version));assert.match(html,/id="person-trail-search"/);assert.match(html,/id="person-trail-corpus"/);
 assert.match(app,/findPersonTrails\(\$\('person-trail-search'\)/);assert.match(app,/openPersonTrail\(trail.personId\)/);
 assert.match(index,/TRAIL_SOURCE_LABELS\[step.source\]/);assert.match(index,/TRAIL_REVIEW_LABELS\[step.review\]/);
 assert.match(index,/onRead\?\.\(step.ref\)/);assert.match(index,/onAtlas\?\.\(sourcePassage\(step.ref\)\)/);
});
