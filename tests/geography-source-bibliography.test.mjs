import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateJourneyData,validatePlaceStudies} from '../public/assets/jesus-map.js';

const read=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),'utf8'));
const geography=read('../public/data/jesus-geography.json');
const journeys=read('../public/data/jesus-journeys.json');

test('Nein source uses the official 2022 journal citation rather than the 2025 download date',()=>{
 const source=geography.sources['citation-review-nein'];
 assert.ok(source);
 assert.match(source.title,/Nein.*\(2022\)$/);
 assert.doesNotMatch(source.title,/2025/);
 assert.match(source.publisher,/107 \(2022\)/);
 assert.equal(source.doi,'10.70967/2948-040X.1843');
 assert.equal(source.url,'https://publications.iaa.org.il/atiqot/vol107/iss1/6/');
 assert.match(source.scope,/publisher's downloads date from January 2025/);
 assert.match(source.scope,/not the location of Luke 7/);
 assert.deepEqual(geography.places.nain.literature,['citation-review-nein']);
 assert.equal(geography.places.nain.evidenceLevel,'tradition');
 assert.match(geography.places.nain.caution,/gate remain uncertain/);
});

test('Sidon uses the excavation director institutional source without implying a precise Gospel route',()=>{
 const source=geography.sources['citation-review-sidon'];
 assert.ok(source);
 assert.equal(source.url,'https://www.oeaw.ac.at/en/oeai/media/news-archive/news-detail/nineteen-years-of-excavation-on-sidons-college-site');
 assert.match(source.title,/Sidon's College site \(2018\)$/);
 assert.match(source.author,/Claude Doumet-Serhal/);
 assert.match(source.publisher,/Austrian Academy of Sciences/);
 assert.match(source.scope,/not a reconstruction of Jesus' precise route/);
 assert.ok(!Object.values(geography.sources).some(s=>s.url==='https://www.sidonexcavation.com/'));
 assert.deepEqual(geography.places.sidon.literature,['citation-review-sidon']);
 assert.equal(geography.places.sidon.evidenceLevel,'reported');
 assert.match(geography.places.sidon.caution,/unrecorded city meetings/);
});

test('source maintenance leaves every Gospel journey and all 35 place dossiers valid',()=>{
 assert.equal(validateJourneyData(journeys),true);
 assert.equal(validatePlaceStudies(geography,journeys),true);
 assert.equal(journeys.events.length,79);
 assert.equal(Object.keys(geography.places).length,35);
 assert.equal(geography.places.nain.historicalContext,'Luke locates the restoration of a widow\'s son at the gate of Nain.');
 assert.equal(geography.places.sidon.historicalContext,'Mark describes a route through Sidon and surrounding territory on the way towards the Decapolis.');
});
