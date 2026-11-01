import assert from 'node:assert/strict';
import {chromium,expect} from '@playwright/test';

// Privacy-safe live FUMS diagnostic. Never log passage text, FUMS tokens or URLs with query strings.
const browser=await chromium.launch({headless:true});
try{
 const context=await browser.newContext({viewport:{width:1280,height:900}});
 await context.addInitScript(()=>{
  const nativeFetch=window.fetch;
  window.__fumsAttempted=0;
  window.fetch=function(input,init){
   try{const address=new URL(typeof input==='string'?input:input?.url,location.href);
    if(address.hostname==='fums.api.bible')window.__fumsAttempted++;
   }catch{}
   return nativeFetch.call(this,input,init);
  };
 });
 const page=await context.newPage(),events={requests:0,failed:0,networkCspErrors:0,uncaught:0};
 page.on('request',r=>{try{if(new URL(r.url()).hostname==='fums.api.bible')events.requests++;}catch{}});
 page.on('requestfailed',r=>{try{if(new URL(r.url()).hostname==='fums.api.bible')events.failed++;}catch{}});
 page.on('console',msg=>{if(msg.type()==='error'&&/fums\.api\.bible|content security policy/i.test(msg.text()))events.networkCspErrors++;});
 page.on('pageerror',()=>events.uncaught++);
 await page.goto('https://www.scripturetrails.com/?view=reader&ref=John%203%3A16&translation=NIV',{waitUntil:'domcontentloaded'});
 await expect(page.locator('#passage-status')).toHaveText('Official NIV text',{timeout:30000});
 await page.waitForTimeout(800);
 const natural=await page.evaluate(()=>window.__fumsAttempted||0);
 const diagnostic=await page.evaluate(async()=>{
  const response=await fetch('/api/passage?q=John%203%3A16&translation=NIV',{cache:'no-store'});
  const payload=await response.json();
  const t=payload.fums?.token;
  const {fumsViewUrl,reportScriptureView}=await import('/assets/fums.js');
  const valid=typeof t==='string'&&t.length>=12&&/^[a-zA-Z0-9_-]+$/.test(t);
  const destination=fumsViewUrl(t,crypto.randomUUID(),crypto.randomUUID());
  const constructed=destination?.hostname==='fums.api.bible';
  const before=window.__fumsAttempted||0;
  await reportScriptureView(payload.fums);
  return {apiStatus:response.status,hasValidToken:valid,urlConstructed:constructed,manualFetchAttempted:(window.__fumsAttempted||0)>before};
 });
 await page.waitForTimeout(1000);
 const summary={productionVersion:'0.44.18',naturalFumsAttempts:natural,manualFumsDiagnostic:diagnostic,observedNetworkRequests:events.requests,observedNetworkFailures:events.failed,cspErrorCount:events.networkCspErrors,uncaughtErrors:events.uncaught,tokenValuesRecorded:false,passageTextRecorded:false};
 console.log(JSON.stringify(summary));
 assert.equal(diagnostic.apiStatus,200);
 assert.equal(diagnostic.hasValidToken,true);
 assert.equal(diagnostic.urlConstructed,true);
 // Keep the diagnostic fail-closed if no request is attempted naturally.
 assert.ok(natural>0,'A displayed API.Bible NIV passage did not attempt the required FUMS view report');
 await context.close();
}finally{await browser.close()}
