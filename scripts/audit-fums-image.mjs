import assert from 'node:assert/strict';
import {chromium,expect} from '@playwright/test';

// Isolated real-origin image-vs-fetch FUMS diagnostic.
// Never log publisher tokens, tokenised URLs, user IDs, or Scripture content.
const url='https://www.scripturetrails.com/';
const browser=await chromium.launch({headless:true});
const output={origin:'www.scripturetrails.com',test:'FUMS pixel with in-browser CSP override',policyAmendedInTestOnly:false,requestCount:0,responseStatuses:[],requestFailureCategories:[],publisherTextLogged:false};
try{
 const context=await browser.newContext({viewport:{width:1280,height:900}});
 const page=await context.newPage();
 await page.route(url,async route=>{
  const response=await route.fetch();
  const headers={...response.headers()};
  const original=headers['content-security-policy']||'';
  assert.ok(original.includes("img-src 'self'"),'Production document missing expected restrictive img policy');
  assert.ok(!original.split('img-src')[1]?.split(';')[0]?.includes('https://fums.api.bible'),'Expected live policy did not match baseline');
  headers['content-security-policy']=original.replace(/img-src ([^;]+);/,(_,rules)=>'img-src '+rules+' https://fums.api.bible;');
  output.policyAmendedInTestOnly=true;
  await route.fulfill({response,headers});
 });
 function host(request){try{return new URL(request.url()).hostname}catch{return null}}
 page.on('request',r=>{if(host(r)==='fums.api.bible')output.requestCount++});
 page.on('response',r=>{if(host(r)==='fums.api.bible')output.responseStatuses.push(r.status())});
 page.on('requestfailed',r=>{if(host(r)==='fums.api.bible')output.requestFailureCategories.push(r.failure()?.replace(/https?:\/\/[^\s]+/g,'[redacted-url]')||'unknown')});
 await page.goto(url+'?view=reader&ref=John%203%3A16&translation=NIV',{waitUntil:'domcontentloaded'});
 await expect(page.locator('#passage-status')).toHaveText('Official NIV text',{timeout:30000});
 const result=await page.evaluate(async()=>{
  const r=await fetch('/api/passage?q=John%203%3A16&translation=NIV',{cache:'no-store'});
  const p=await r.json();
  const {fumsViewUrl}=await import('/assets/fums.js');
  const u=fumsViewUrl(p.fums?.token,crypto.randomUUID(),crypto.randomUUID());
  if(!u)return {urlCreated:false,imageStatus:'not-run'};
  const image=new Image();
  image.referrerPolicy='no-referrer';
  image.decoding='async';
  image.width=1;image.height=1;
  image.style.display='none';
  const outcome=new Promise(resolve=>{
   const timeout=setTimeout(()=>resolve('timeout'),7500);
   image.onload=()=>{clearTimeout(timeout);resolve('loaded')};
   image.onerror=()=>{clearTimeout(timeout);resolve('error')};
  });
  document.body.append(image);
  image.src=u.href;
  return {urlCreated:true,imageStatus:await outcome};
 });
 await page.waitForTimeout(250);
 output.image=result;output.testPassed=output.policyAmendedInTestOnly&&result.urlCreated&&result.imageStatus==='loaded'&&output.responseStatuses.some(s=>s===200);
 console.log(JSON.stringify(output));
 assert.ok(output.testPassed,'Manual pixel FUMS reporting must load successfully before production change');
 await context.close();
}finally{await browser.close()}
