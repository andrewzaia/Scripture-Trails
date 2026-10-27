import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {nextVersion,compareVersions,validateReleases} from '../scripts/versioning.mjs';
const pkg=JSON.parse(readFileSync(new URL('../package.json',import.meta.url)));
const manifest=JSON.parse(readFileSync(new URL('../public/data/releases.json',import.meta.url)));
const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
test('semantic versioning increments correctly',()=>{
 assert.equal(nextVersion('0.3.0','patch'),'0.3.1');
 assert.equal(nextVersion('0.3.8','minor'),'0.4.0');
 assert.equal(nextVersion('0.9.8','major'),'1.0.0');
 assert.equal(compareVersions('0.3.0','0.2.0'),1);
 assert.throws(()=>nextVersion('0.3.0','unknown'));
});
test('public changelog is accurate and collapsed by default',()=>{
 assert.equal(validateReleases(manifest.releases,pkg.version),true);
 assert.ok(manifest.releases.length>=16);
 assert.match(html,/<details id="public-release-history" class="public-release-history">/);
 assert.match(html,/id="public-release-list"/);
});
test('footer and assets agree with current version',()=>{
 assert.ok(html.includes('id="site-version" class="site-version" aria-label="Website version">v'+pkg.version+'</span>'));
 assert.ok(html.includes('app.js?v='+pkg.version));
 assert.ok(html.includes('style.css?v='+pkg.version));
});
test('repeating a release version is rejected',()=>{
 assert.throws(()=>validateReleases([{version:'0.3.0',date:'2026-10-27',title:'One',changes:['a']},{version:'0.3.0',date:'2026-10-26',title:'Two',changes:['b']}],'0.3.0'));
});
