import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,mkdirSync,cpSync,rmSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
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
 const reversed=manifest.releases.map(r=>({...r}));
 // Reverse consecutive minor/major milestone entries so a newly added patch cannot mask the ordering assertion.
 const boundary=reversed.findIndex((r,i)=>i>1&&r.version.split('.').slice(0,2).join('.')!==reversed[i-1].version.split('.').slice(0,2).join('.'));
 assert.ok(boundary>0);
 [reversed[boundary-1],reversed[boundary]]=[reversed[boundary],reversed[boundary-1]];
 assert.throws(()=>validateReleases(reversed,pkg.version),/newest first/);
 const skipped=manifest.releases.map(r=>({...r})).filter(r=>r.version!=='0.2.10');
 assert.equal(manifest.releases.some(r=>r.version==='0.2.10'),true);
 assert.throws(()=>validateReleases(skipped,pkg.version),/Skipped patch version/);
});

test('npm run release keeps npm lockfile, package and the website release history in sync',()=>{
 const temp=mkdtempSync(join(tmpdir(),'scripture-release-'));
 const root=new URL('../',import.meta.url).pathname;
 const required=['package.json','package-lock.json','CHANGELOG.md','public/data/releases.json','public/index.html','public/assets/app.js','public/assets/graph.js','public/assets/entity-index.js','public/assets/connection-evidence.js','public/assets/notebook-backup.js','public/assets/reading-plans.js','public/assets/study-collections.js','public/assets/annotations.js','public/assets/jesus-map.js','public/assets/atlas-comparison.js','public/assets/citation-review.js','public/assets/persecution-catalogue.js','scripts/release.mjs','scripts/versioning.mjs'];
 try{
  for(const path of required){mkdirSync(join(temp,dirname(path)),{recursive:true});cpSync(new URL('../'+path,import.meta.url),join(temp,path));}
  const output=execFileSync('npm',['run','release','--','patch','Synthetic patch verification','Checks release metadata alignment'],{cwd:temp,encoding:'utf8'});
  const pkg=JSON.parse(readFileSync(join(temp,'package.json'),'utf8'));
  const lock=JSON.parse(readFileSync(join(temp,'package-lock.json'),'utf8'));
  const history=JSON.parse(readFileSync(join(temp,'public/data/releases.json'),'utf8'));
  assert.equal(pkg.version,nextVersion(manifest.releases[0].version,'patch'));
  assert.equal(lock.version,pkg.version);assert.equal(lock.packages[''].version,pkg.version);
  assert.equal(history.releases[0].version,pkg.version);
  assert.ok(readFileSync(join(temp,'CHANGELOG.md'),'utf8').includes('## '+pkg.version));
  assert.ok(readFileSync(join(temp,'public/index.html'),'utf8').includes('v'+pkg.version+'</span>'));
  assert.ok(readFileSync(join(temp,'public/assets/app.js'),'utf8').includes('reader-audio.js?v='+pkg.version));
  assert.match(output,/Prepared release/);
 }finally{rmSync(temp,{recursive:true,force:true});}
});
