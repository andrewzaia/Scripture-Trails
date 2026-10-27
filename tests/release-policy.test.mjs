import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {assertReleaseIncrement} from '../scripts/versioning.mjs';

test('public-facing changes need a strictly newer semantic version',()=>{
 assert.throws(()=>assertReleaseIncrement(['public/assets/style.css'],'0.9.1','0.9.1'),/without a semantic version increment/);
 assert.throws(()=>assertReleaseIncrement(['public/index.html'],'0.9.2','0.9.1'),/without a semantic version increment/);
 assert.equal(assertReleaseIncrement(['public/assets/style.css'],'0.9.1','0.9.2'),true);
});

test('new pages and release scripts also require an increment',()=>{
 for(const path of ['public/new-page.html','functions/api/passage.js','scripts/check-release.mjs','sources/openbible/info.json','wrangler.toml']){
  assert.throws(()=>assertReleaseIncrement([path],'0.9.1','0.9.1'),/without a semantic version increment/);
 }
});

test('documentation-only changes do not force an artificial website release',()=>{
 assert.equal(assertReleaseIncrement(['AGENTS.md','README.md','.github/copilot-instructions.md'],'0.9.1','0.9.1'),false);
});

test('PR checks compare all commits with destination merge base',()=>{
 const check=readFileSync(new URL('../scripts/check-release.mjs',import.meta.url),'utf8');
 const workflow=readFileSync(new URL('../.github/workflows/ci.yml',import.meta.url),'utf8');
 assert.match(check,/GITHUB_BASE_REF/);
 assert.match(check,/process\.env\.GITHUB_ACTIONS/);
 assert.doesNotMatch(check,/if\(process\.env\.CI\)throw/);
 assert.match(check,/merge-base/);
 assert.match(check,/assertReleaseIncrement\(changes,previous,pkg.version\)/);
 assert.match(workflow,/fetch-depth:\s*0/);
});
