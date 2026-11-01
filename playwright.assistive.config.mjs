import {devices} from '@playwright/test';
import {withGuidepup} from '@guidepup/playwright';

const mode=process.env.SCREEN_READER_PLATFORM;
if(!['nvda','voiceover'].includes(mode))throw Error('Select SCREEN_READER_PLATFORM=nvda or voiceover');
export default withGuidepup({
 testDir:'./tests/assistive',
 testMatch:mode==='nvda'?'nvda.spec.mjs':'voiceover.spec.mjs',
 fullyParallel:false,
 retries:0,
 workers:1,
 timeout:180000,
 expect:{timeout:15000},
 reporter:'list',
 use:{baseURL:'https://www.scripturetrails.com',headless:false,trace:'retain-on-failure'},
 projects:[{name:mode,use:{...devices[mode==='nvda'?'Desktop Chrome':'Desktop Safari'],headless:false}}],
});
