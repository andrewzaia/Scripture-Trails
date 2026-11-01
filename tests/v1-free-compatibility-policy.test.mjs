import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('true zoom is verified within existing Chromium and Firefox PR runners',()=>{
 const ci=read('.github/workflows/ci.yml'),zoom=read('tests/zoom/actual-browser-zoom-regression.mjs');
 for(const k of ['npm run test:browser','actual-browser-zoom-regression.mjs','release-gate','retention-days: 3'])assert.ok(ci.includes(k),k);
 for(const k of ['reached200','reached400','nativeZoomMeasured','baseline.version!==expectedVersion','Synthetic local zoom fixture'])assert.ok(zoom.includes(k),k);
 assert.match(ci,/matrix.engine != 'webkit'/);
});
test('free native desktop assistive technology is isolated from physical device claims',()=>{
 const workflow=read('.github/workflows/v1-native-at.yml');
 for(const k of ['windows-2025','macos-15','SCREEN_READER_PLATFORM','npm ci','tests/assistive/'])assert.ok(workflow.includes(k),k);
 assert.match(read('playwright.assistive.config.mjs'),/127\.0\.0\.1/);
 assert.match(read('tests/assistive/nvda.spec.mjs'),/reportCurrentFocus/);
 assert.match(read('tests/assistive/voiceover.spec.mjs'),/previousHeading/);
 assert.match(read('tests/assistive/shared.mjs'),/Synthetic local assistive-technology fixture/);
});
