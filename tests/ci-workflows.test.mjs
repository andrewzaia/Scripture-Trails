import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=name=>readFileSync(new URL('../.github/workflows/'+name,import.meta.url),'utf8');

test('CI runs supported Node 24 actions on a stable runner with all three browser engines',()=>{
 const ci=read('ci.yml');
 assert.ok(!ci.split('\n').some(line=>line.trim()==='runs-on: ubuntu-latest'),'CI image must not change without review');
 assert.equal((ci.match(/runs-on: ubuntu-26\.04/g)||[]).length,3,'all required jobs must pin the reviewed Ubuntu 26.04 runner');
 assert.match(ci,/Verify deterministic Atlas import on Ubuntu 26\.04/);
 assert.match(ci,/git status --porcelain -- public\/data\/refs/);
 assert.ok(!ci.includes('actions/checkout@v4'));
 assert.ok(!ci.includes('actions/setup-node@v4'));
 assert.match(ci,/actions\/checkout@v7/);
 assert.match(ci,/actions\/setup-node@v7/);
 assert.match(ci,/actions\/upload-artifact@v7/);
 for(const engine of ['chromium','firefox','webkit'])assert.match(ci,new RegExp('engine: '+engine));
 assert.equal((ci.match(/- engine: webkit/g)||[]).length,2,'both WebKit viewport projects must remain required');
 assert.ok(ci.includes("label: webkit-desktop\n            projects: '--project=desktop-webkit'"),'desktop WebKit must have its own required job');
 assert.ok(ci.includes("label: webkit-mobile\n            projects: '--project=mobile-webkit'"),'mobile WebKit must have its own required job');
 assert.ok(ci.includes('name: browser-report-${{ matrix.label }}'),'each browser job needs a distinct report name');
 assert.match(ci,/timeout-minutes: 45/,'each full browser project must have sufficient time to finish');
 assert.match(ci,/needs: \[test, browser\]/);
 assert.ok(ci.includes("  browser:\n    if: ${{ github.event_name == 'pull_request' }}\n    name: Browser - ${{ matrix.label }}\n    needs: test"),'PR browser matrix must wait for source checks');
 assert.match(ci,/npx playwright test --list/,'browser test definitions must be parsed before browser runners start');
 assert.match(ci,/\$SOURCE_RESULT/);
 assert.match(ci,/\$BROWSER_RESULT/);
 assert.match(ci,/if \[ "\$SOURCE_RESULT" != "success" \]; then/);
 assert.match(ci,/if \[ "\$BROWSER_RESULT" != "success" \]; then/);
 assert.match(ci,/if \[ "\$BROWSER_RESULT" != "skipped" \] \|\| \[ "\$REF_NAME" != "refs\/heads\/main" \]; then/);
 assert.match(ci,/EVENT_NAME/);
 assert.match(ci,/if: \$\{\{ github.event_name == 'pull_request' \}\}/);
 assert.match(ci,/exit 1/,'a failing required source or browser job must block release');
});

test('superseded PR validations cancel without canceling main or weakening release gates',()=>{
 const ci=read('ci.yml');
 assert.match(ci,/^concurrency:/m);
 assert.ok(ci.includes("group: ${{ github.workflow }}-${{ github.event.pull_request.number || github.ref }}"));
 assert.ok(ci.includes("cancel-in-progress: ${{ github.event_name == 'pull_request' }}"));
 assert.match(ci,/needs: \[test, browser\]/);
 assert.match(ci,/SOURCE_RESULT/);
 assert.match(ci,/BROWSER_RESULT/);
 assert.match(ci,/exit 1/);
});

test('Atlas reference rebuild cannot bypass semantic release reviews by directly pushing to main',()=>{
 const flow=read('import-crossrefs.yml');
 assert.match(flow,/contents: read/);
 assert.match(flow,/runs-on: ubuntu-26\.04/);
 assert.match(flow,/actions\/checkout@v7/);
 assert.match(flow,/actions\/setup-node@v7/);
 assert.match(flow,/npm run import:refs/);
 assert.match(flow,/npm run build/);
 assert.match(flow,/git status --porcelain -- public\/data\/refs/);
 assert.match(flow,/workflow_dispatch:/,'Atlas import is an explicitly requested maintenance task');
 assert.match(flow,/exit 1/,'Atlas import must fail closed when refreshed data differs');
 assert.doesNotMatch(flow,/git push/);
 assert.doesNotMatch(flow,/contents: write/);
});
