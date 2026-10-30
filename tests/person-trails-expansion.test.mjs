import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PERSON_TRAILS,personTrail,findPersonTrails,validatePersonTrails} from '../public/assets/person-trails.js';
import {validateCanonicalReference} from '../public/assets/reference-integrity.js';
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


test('all twenty people have substantive individual readings and validated extended Scripture links',()=>{
 assert.equal(PERSON_TRAILS.length,20);
 let words=0,refs=0;
 for(const trail of PERSON_TRAILS){
  assert.ok(trail.study.overview.split(/\s+/).length>=65,trail.personId+' context too thin');
  assert.ok(trail.study.comparison.length>=65&&trail.study.question.length>=65&&trail.study.limits.length>=65,trail.personId);
  assert.equal(trail.study.furtherRefs.length,3,trail.personId);
  for(const ref of trail.study.furtherRefs)assert.ok(validateCanonicalReference(ref,counts),trail.personId+': '+ref);
  words+=trail.study.overview.split(/\s+/).length;refs+=trail.study.furtherRefs.length;
 }
 assert.ok(words>=1400);assert.equal(refs,60);
 assert.match(personTrail('esther').study.limits,/historical status|composition/);
 assert.match(personTrail('daniel').study.overview,/chapter 3/);
 assert.match(personTrail('jeremiah').study.overview,/Jeremiah 29:11/);
 const entity=read('public/assets/entity-index.js');
 assert.match(entity,/entity-trail-context/);
 assert.match(entity,/trail.study.furtherRefs/);
 assert.match(entity,/handlers.onRead\?\.\(ref\)/);
 assert.match(entity,/handlers.onAtlas\?\.\(sourcePassage\(ref\)\)/);
});

test('missing original person study content and invalid extended references are rejected',()=>{
 for(const mutate of [
  t=>delete t.study.overview,
  t=>t.study.comparison='Too short',
  t=>t.study.furtherRefs[0]='Genesis 1:999',
  t=>t.study.furtherRefs[1]=t.study.furtherRefs[0],
  t=>t.study.furtherRefs=[]
 ]){
  const trail=structuredClone(personTrail('abraham'));
  mutate(trail);
  assert.throws(()=>validatePersonTrails(counts,ids,[trail]));
 }
});

test('historically sensitive profiles attribute limits to named academic works',()=>{
 const esther=personTrail('esther'),daniel=personTrail('daniel');
 assert.equal(esther.study.research.length,1);
 assert.equal(daniel.study.research.length,2);
 for(const entry of [...esther.study.research,...daniel.study.research]){
  assert.match(entry.url,/^https:\/\//);
  assert.ok(entry.title.length>15&&entry.author.length>5&&entry.scope.length>55);
 }
 const all=PERSON_TRAILS.filter(t=>t.study.research.length);
 assert.deepEqual(all.map(t=>t.personId),['esther','daniel']);
 const entity=read('public/assets/entity-index.js');
 assert.match(entity,/entity-trail-research/);
 assert.match(entity,/noopener noreferrer/);
 const corrupted=structuredClone(daniel);
 corrupted.study.research[0].url='javascript:alert(1)';
 assert.throws(()=>validatePersonTrails(counts,ids,[corrupted]));
});

test('person trail source range stays precise for six audited descriptions',()=>{
 const expected=[
  ['abraham','Covenant sign','Genesis 17:9-14'],
  ['abraham',"End of Abraham's life",'Genesis 25:8-10'],
  ['moses','The burning bush','Exodus 3:2-10'],
  ['moses','At Sinai','Exodus 20:1-17'],
  ['david-king','Dynastic promise','2 Samuel 7:12-16'],
  ['hezekiah','Accession and reforms','2 Kings 18:3-6']
 ];
 for(const [person,label,reference] of expected){
  const stage=personTrail(person).stages.find(s=>s.label===label);
  assert.ok(stage,person+' missing stage: '+label);
  assert.equal(stage.ref,reference,person+' '+label);
  assert.ok(validateCanonicalReference(stage.ref,counts),person+' '+label+' must remain in verse bounds');
 }
});
