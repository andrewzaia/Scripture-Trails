import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
const app=readFileSync(new URL('../public/assets/app.js',import.meta.url),'utf8');
const journey=readFileSync(new URL('../public/assets/jesus-map.js',import.meta.url),'utf8');
test('roadmap is a dedicated navigable view with its own data-backed filters',()=>{
 assert.match(html,/id="view-roadmap"/);
 assert.match(html,/data-view="roadmap"/);
 assert.match(html,/data-roadmap-filter="next"/);
 assert.match(app,/roadmap:'Project roadmap'/);
 assert.match(app,/createRoadmap/);
});
test('historical place study panel has every datum required by its renderer',()=>{
 const all=[...journey.matchAll(/\$\('study-([a-z-]+)'\)/g)].map(m=>'study-'+m[1]);
 assert.ok(all.length>=11);
 for(const value of new Set(all))assert.ok(html.includes(`data-jesus="${value}"`),`Missing ${value}`);
 assert.match(html,/Biblical place dossier/i);
 assert.match(html,/Historical and archaeological sources/);
});

test('the complete sidebar brand is an accessible link to the home page',()=>{
 assert.match(html,/<a class="brand" href="\/">/);
 assert.match(html,/<small>THE BIBLE, EXPLORED<\/small><\/div><\/a>/);
});
