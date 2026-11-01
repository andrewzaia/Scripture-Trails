import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';

const ci=readFileSync(new URL('../.github/workflows/ci.yml',import.meta.url),'utf8');
const block=ci.split('  release-gate:\n')[1];
assert.ok(block,'Missing final release gate');
const parts=block.split('        run: |\n');
assert.equal(parts.length,2,'Expected one final release gate shell script');
const script=parts[1].split('\n').map(line=>line.startsWith('          ')?line.slice(10):line).join('\n');

function status(event,ref,source,browser){
 const result=spawnSync('bash',['-e','-u','-o','pipefail'],{
  input:script,encoding:'utf8',timeout:5000,
  env:{...process.env,EVENT_NAME:event,REF_NAME:ref,SOURCE_RESULT:source,BROWSER_RESULT:browser}
 });
 assert.ifError(result.error);
 return result.status;
}
test('all PR browsers are mandatory and the release gate fails closed',()=>{
 assert.match(ci,/if: \$\{\{ github.event_name == 'pull_request' \}\}/);
 assert.match(ci,/needs: \[test, browser\]/);
 assert.equal(status('pull_request','refs/pull/86/merge','success','success'),0);
 for(const result of ['skipped','failure','cancelled','neutral','timed_out',''])assert.notEqual(status('pull_request','refs/pull/86/merge','success',result),0,'PR browser '+result);
 for(const source of ['skipped','failure','cancelled',''])assert.notEqual(status('pull_request','refs/pull/86/merge',source,'success'),0,'PR source '+source);
});
test('main validates source with skipped duplicate browser matrix only',()=>{
 assert.equal(status('push','refs/heads/main','success','skipped'),0);
 for(const result of ['success','failure','cancelled',''])assert.notEqual(status('push','refs/heads/main','success',result),0,'Main browser '+result);
 for(const source of ['skipped','failure','cancelled',''])assert.notEqual(status('push','refs/heads/main',source,'skipped'),0,'Main source '+source);
 for(const ref of ['refs/heads/dev','refs/tags/1.0.0','refs/pull/86/merge'])assert.notEqual(status('push',ref,'success','skipped'),0,'Other ref '+ref);
});
test('unexpected release validation events are refused',()=>{
 assert.match(ci,/release-gate:\n    if: \$\{\{ always\(\) \}\}/);
 for(const event of ['workflow_dispatch','schedule','repository_dispatch',''])assert.notEqual(status(event,'refs/heads/main','success','skipped'),0,event);
});
