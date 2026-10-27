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

test('every historical release is numbered, sorted and patch-contiguous',()=>{
 const versions=manifest.releases.map(entry=>entry.version);
 assert.equal(new Set(versions).size,versions.length);
 assert.ok(versions.includes('0.1.1'));
 assert.ok(versions.includes('0.2.14'));
 assert.ok(versions.every((v,i)=>!i||compareVersions(versions[i-1],v)>0));
 const details=readFileSync(new URL('../CHANGELOG.md',import.meta.url),'utf8');
 assert.deepEqual([...details.matchAll(/^## (\d+\.\d+\.\d+)\b/gm)].map(m=>m[1]),versions);
});
test('missing, reversed and skipped historical patch versions are rejected',()=>{
 const missing=manifest.releases.map(r=>({...r}));delete missing[2].version;
 assert.throws(()=>validateReleases(missing,pkg.version),/needs a semantic version/);
 const reversed=manifest.releases.map(r=>({...r}));[reversed[2],reversed[3]]=[reversed[3],reversed[2]];
 assert.throws(()=>validateReleases(reversed,pkg.version),/newest first/);
 const skipped=manifest.releases.map(r=>({...r})).filter(r=>r.version!=='0.2.10');
 assert.equal(manifest.releases.some(r=>r.version==='0.2.10'),true);
 assert.throws(()=>validateReleases(skipped,pkg.version),/Skipped patch version/);
});
