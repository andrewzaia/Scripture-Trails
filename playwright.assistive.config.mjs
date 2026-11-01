import {devices} from '@playwright/test';
import {withGuidepup} from '@guidepup/playwright';

const mode=process.env.SCREEN_READER_PLATFORM;
if(!['nvda','voiceover'].includes(mode))throw Error('Select SCREEN_READER_PLATFORM=nvda or voiceover');
export default withGuidepup({
 testDir:'./tests/assistive',
 testMatch:mode+'.spec.mjs',
 fullyParallel:false,retries:0,workers:1,timeout:240000,
 expect:{timeout:20000},reporter:'list',
 webServer:{command:'node tests/browser/server.mjs',url:'http://127.0.0.1:4387',reuseExistingServer:false,timeout:30000},
 use:{baseURL:'http://127.0.0.1:4387',headless:false,trace:'retain-on-failure'},
 projects:[{name:mode,use:{...devices[mode==='nvda'?'Desktop Chrome':'Desktop Safari'],headless:false}}]
});
