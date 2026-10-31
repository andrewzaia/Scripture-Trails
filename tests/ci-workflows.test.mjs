import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=name=>readFileSync(new URL('../.github/workflows/'+name,import.meta.url),'utf8');

test('CI runs supported Node 24 actions on a stable runner with all three browser engines',()=>{
 const ci=read('ci.yml');
 assert.ok(!ci.includes('ubuntu-latest'),'CI image must not change during migration without review');
 assert.ok((ci.match(/runs-on: ubuntu-24\.04/g)||[]).length>=3);
 assert.ok(!ci.includes('actions/checkout@v4'));
 assert.ok(!ci.includes('actions/setup-node@v4'));
 assert.match(ci,/actions\/checkout@v5/);
 assert.match(ci,/actions\/setup-node@v5/);
 assert.match(ci,/actions\/upload-artifact@v6/);
 for(const engine of ['chromium','firefox','webkit'])assert.match(ci,new RegExp('engine: '+engine));
 assert.match(ci,/needs: \[test, browser\]/);
 assert.match(ci,/test "\$SOURCE_RESULT" = success && test "\$BROWSER_RESULT" = success/);
});

test('Atlas reference rebuild cannot bypass semantic release reviews by directly pushing to main',()=>{
 const flow=read('import-crossrefs.yml');
 assert.match(flow,/contents: read/);
 assert.match(flow,/runs-on: ubuntu-24\.04/);
 assert.match(flow,/actions\/checkout@v5/);
 assert.match(flow,/actions\/setup-node@v5/);
 assert.match(flow,/npm run import:refs/);
 assert.match(flow,/npm run build/);
 assert.match(flow,/git status --porcelain -- public\/data\/refs/);
 assert.doesNotMatch(flow,/git push/);
 assert.doesNotMatch(flow,/contents: write/);
});
