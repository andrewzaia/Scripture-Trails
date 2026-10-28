import {defineConfig,devices} from '@playwright/test';

export default defineConfig({
 testDir:'./tests/browser',
 fullyParallel:true,
 forbidOnly:!!process.env.CI,
 retries:0,
 workers:2,
 timeout:45000,
 expect:{timeout:10000},
 reporter:[['list'],['json',{outputFile:'test-results/results.json'}],['html',{open:'never'}]],
 use:{baseURL:'http://127.0.0.1:4387',trace:'retain-on-failure',screenshot:'only-on-failure',serviceWorkers:'block',
  launchOptions:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{}
 },
 projects:[
  {name:'desktop-chromium',use:{...devices['Desktop Chrome'],viewport:{width:1440,height:1000}}},
  {name:'mobile-chromium',use:{...devices['Pixel 7'],viewport:{width:390,height:844}}}
 ],
 webServer:{command:'node tests/browser/server.mjs',url:'http://127.0.0.1:4387',reuseExistingServer:!process.env.CI}
});
