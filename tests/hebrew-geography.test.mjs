import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateHebrewGeography,filterHebrewStages,restoreHebrewSelection,passageAnchor} from '../public/assets/hebrew-geography.js';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const data=JSON.parse(read('public/data/hebrew-geography.json')),counts=JSON.parse(read('public/data/verse-counts.json'));
const history=JSON.parse(read('public/data/biblical-history.json'));
const identities=new Set([...history.people.map(p=>'person:'+p.id),...history.places.map(p=>'place:'+p.id)]);
const clone=()=>structuredClone(data);

test('the declared first collection has valid bounded readings, source links and existing index identities',()=>{
 assert.equal(validateHebrewGeography(data,counts,identities),true);
 assert.equal(data.stages.length,25);assert.equal(data.places.length,15);assert.equal(data.phases.length,5);assert.equal(data.comparisons.length,5);assert.equal(Object.keys(data.sources).length,7);
 assert.equal(data.stages.at(-1).passages[0],'Deuteronomy 34:1-8');
});
test('invalid references and publisher-sized reading overflows are rejected',()=>{
 for(const ref of ['Exodus 1:99','Numbers 20:13-1','John 1:1','Exodus 12:1-42','Exodus 12']){const d=clone();d.stages[0].passages=[ref];assert.throws(()=>validateHebrewGeography(d,counts));}
});
test('geometry, stage dates and unearned review labels cannot enter the unlocated collection',()=>{
 for(const mutate of [d=>d.places[0].coordinates=[31,30],d=>delete d.places[0].coordinates,d=>d.stages[0].date='1446 BC',d=>d.stages[0].review='peer-reviewed']){const d=clone();mutate(d);assert.throws(()=>validateHebrewGeography(d,counts));}
 assert.ok(data.places.every(p=>p.coordinates===null));assert.ok(data.stages.every(s=>s.date===null));
});
test('duplicate identities, backwards sections and broken profile/source links fail validation',()=>{
 for(const mutate of [d=>d.stages[1].id=d.stages[0].id,d=>d.stages[1].order=7,d=>d.stages[0].phase='moab',d=>d.stages[0].place='unknown',d=>d.stages[0].comparisonIds=['missing'],d=>d.stages[0].people=['invented'],d=>d.places[0].sourceIds=['missing'],d=>d.places[3].related[0].id='unknown',d=>d.comparisons[0].candidates[0].sourceIds=[]]){const d=clone();mutate(d);assert.throws(()=>validateHebrewGeography(d,counts,identities));}
});
test('source/check records require safe links, real dates, authorship and stated access limitations',()=>{
 for(const mutate of [d=>d.sources['beitzel-sea'].url='javascript:alert(1)',d=>d.sources['iaa-kadesh'].access='',d=>d.sources['iaa-kadesh'].accessed='2026-02-31',d=>d.sources['iaa-kadesh'].author='',d=>d.stages[0].primaryCheck.url='https://unverified.example/reading',d=>delete d.stages[0].primaryCheck]){const d=clone();mutate(d);assert.throws(()=>validateHebrewGeography(d,counts));}
 assert.match(data.sources['iaa-kadesh'].access,/full.*not been reviewed/);assert.match(data.collection.review,/Independent.*review remains pending/);
});
test('Sin/Zin, Rephidim/Kadesh, refused passage and the unknown grave remain separate',()=>{
 const stage=id=>data.stages.find(s=>s.id===id);
 assert.equal(stage('exodus-12').place,'sin-wilderness');assert.equal(stage('exodus-13').place,'rephidim');assert.equal(stage('exodus-20').place,'kadesh');
 assert.deepEqual(stage('exodus-20').passages,['Numbers 20:1-13']);
 assert.match(stage('exodus-21').caution,/not an Israelite arrival inside Edom/);
 assert.match(stage('exodus-25').summary,/burial place was not known/);
});
test('case-insensitive searches combine setting, passage and phase filters with meaningful empty states',()=>{
 assert.deepEqual(filterHebrewStages(data,'departure','EXODUS 14').map(s=>s.id),['exodus-09','exodus-10']);
 assert.equal(filterHebrewStages(data,'moab','kadesh').length,0);
 assert.ok(filterHebrewStages(data,'all','Rephidim').length>=2);
 assert.equal(filterHebrewStages(data,'all','nothing matches this phrase').length,0);
 assert.equal(filterHebrewStages(data,'all','  ').length,25);
});
test('shared selections honour filters and recover safely from stale or unknown parameters',()=>{
 assert.deepEqual(restoreHebrewSelection(data,new URLSearchParams('hb-phase=departure&hb-stage=exodus-10')),{phase:'departure',query:'',stageId:'exodus-10'});
 assert.equal(restoreHebrewSelection(data,new URLSearchParams('hb-phase=moab&hb-stage=exodus-10')).stageId,'exodus-24');
 assert.equal(restoreHebrewSelection(data,new URLSearchParams('hb-phase=invalid&hb-stage=unknown')).stageId,'exodus-01');
 assert.equal(restoreHebrewSelection(data,new URLSearchParams('hb-phase=moab&hb-q=notfound')).stageId,null);
 assert.equal(restoreHebrewSelection(data,new URLSearchParams('hb-q='+'x'.repeat(200))).query.length,150);
});
test('Atlas targets the selected range starting verse while reader references retain their range',()=>{
 assert.equal(passageAnchor('Exodus 14:15-31'),'Exodus 14:15');assert.equal(passageAnchor('Numbers 20:1-13'),'Numbers 20:1');assert.equal(passageAnchor('invalid'),null);
 assert.deepEqual(data.stages[9].passages,['Exodus 14:15-31']);
});
test('page navigation, labelled controls, source actions and suspended background loading are wired',()=>{
 const html=read('public/index.html'),app=read('public/assets/app.js'),module=read('public/assets/hebrew-geography.js');
 assert.match(html,/id="view-hebrew-geography"/);assert.match(html,/data-view="hebrew-geography"/);assert.match(app,/createHebrewGeography/);assert.match(app,/hebrewGeographyPage\?\.suspend\(\)/);
 const region=html.slice(html.indexOf('id="view-hebrew-geography"'),html.indexOf('id="view-jesus-map"'));
 const controls=new Set([...module.matchAll(/\$\('([a-z-]+)'\)/g)].map(m=>m[1]));
 for(const name of [...controls,'scope','method','review','geography','chronology'])assert.equal((region.match(new RegExp('data-hb="'+name+'"','g'))||[]).length,1,name);
 assert.match(region,/for="hb-search"/);assert.match(region,/for="hb-phase"/);assert.match(region,/data-hb="heading" tabindex="-1"/);
 assert.match(module,/if\(!active\)return/);assert.match(module,/textContent/);assert.doesNotMatch(module,/innerHTML/);
});
test('both geography assets and fetched data use the release cache key and stay in the release checks',()=>{
 const version=JSON.parse(read('package.json')).version;
 assert.ok(read('public/assets/app.js').includes('hebrew-geography.js?v='+version));assert.ok(read('public/index.html').includes('hebrew-geography.css?v='+version));
 assert.ok(read('scripts/release.mjs').includes("'Hebrew Bible geography'"));assert.ok(read('scripts/check-release.mjs').includes("'hebrew-geography.js'"));assert.ok(read('scripts/check-release.mjs').includes("'hebrew-geography.css'"));
});
