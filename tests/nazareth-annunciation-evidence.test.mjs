import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateCityStudies} from '../public/assets/city-studies.js';
const data=JSON.parse(readFileSync(new URL('../public/data/city-studies.json',import.meta.url),'utf8'));
const nazareth=data.cities.find(c=>c.id==='nazareth');
const oxford=data.sources['nazareth-annunciation-oxford'];
const custodian=data.sources['nazareth-annunciation-custody'];

test('Nazareth Annunciation finding cites exact research chapter and custodial history with distinct evidence roles',()=>{
 assert.equal(validateCityStudies(data),true);
 assert.ok(nazareth&&oxford&&custodian);
 assert.equal(oxford.url,'https://academic.oup.com/book/45361/chapter-abstract/389285524');
 assert.equal(oxford.doi,'10.1093/oso/9780192865397.003.0002');
 assert.match(oxford.access,/full paywalled chapter not accessed/);
 assert.match(oxford.scope,/not an excavated verification/);
 assert.match(custodian.url,/^https:\/\/www\.custodia\.org\/en\/sanctuaries\/nazareth-basilica-of-the-annunciation\//);
 assert.match(custodian.kind,/devotional tradition/);
 const finding=nazareth.findings.find(f=>f.title==='Annunciation traditions');
 assert.deepEqual(finding.sourceIds,['nazareth-annunciation-oxford','nazareth-annunciation-custody']);
 assert.match(finding.claim,/later Christian commemoration/);
 assert.match(finding.limitation,/cannot establish the precise place/);
 assert.deepEqual(finding.passages,['Luke 1:26-38']);
 for(const id of finding.sourceIds){
  assert.ok(nazareth.sourceIds.includes(id),'City research bibliography misses '+id);
  assert.ok(nazareth.timeline.find(t=>t.period==='Pilgrimage commemorations').sourceIds.includes(id),'Timeline citation misses '+id);
  assert.ok(nazareth.studyLayers.find(l=>l.kind==='interpretive-question').sourceIds.includes(id),'Detailed study citation misses '+id);
 }
});

test('city evidence provenance rejects unknown Annunciation source and retains five historical studies',()=>{
 assert.equal(data.cities.length,5);
 assert.equal(data.cities.reduce((n,c)=>n+c.findings.length,0),22);
 const bad=structuredClone(data);
 bad.cities.find(c=>c.id==='nazareth').findings.find(f=>f.title==='Annunciation traditions').sourceIds.push('untraceable-source');
 assert.throws(()=>validateCityStudies(bad),/Missing finding source/);
});
