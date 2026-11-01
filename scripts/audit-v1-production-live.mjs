import assert from 'node:assert/strict';
import {chromium,expect} from '@playwright/test';

// Runs against a real public deployment, never test fixtures.
// Do not print, persist, or attach copyrighted Bible passages or notebook contents.
const origin='https://www.scripturetrails.com';
const expectedVersion=process.env.SCRIPTURE_TRAILS_EXPECTED_VERSION;
assert.match(expectedVersion||'',/^\d+\.\d+\.\d+$/);
const checks=[],errors=[],fums={requests:0};
const browser=await chromium.launch({headless:true});
const pass=async(name,action)=>{await action();checks.push(name);};
const watch=page=>page.on('pageerror',e=>errors.push(e.name||'Error'));
try{
 const context=await browser.newContext({baseURL:origin,viewport:{width:1280,height:900}});
 const page=await context.newPage();watch(page);
 page.on('request',request=>{try{if(new URL(request.url()).hostname==='fums.api.bible')fums.requests++;}catch{}});
 await pass('four live editions with reader attribution',async()=>{
  await page.goto('/?view=reader&ref=John%203%3A16&translation=ESV',{waitUntil:'domcontentloaded'});
  for(const code of ['ESV','NASB20','NIV','NKJV']){
   if(code!=='ESV')await page.locator('#reader-translation').selectOption(code);
   await expect(page.locator('#passage-status')).toHaveText('Official '+code+' text',{timeout:30000});
   assert.equal(await page.locator('#passage-content').evaluate(e=>!!e.textContent?.trim()),true,'Missing real passage: '+code);
   if(code==='ESV'){
    assert.equal(await page.locator('#passage-content a.va[href]').count(),0,'Upstream empty anchor remains');
    assert.equal(await page.locator('#passage-content a[href]').evaluateAll(as=>as.filter(a=>!a.textContent?.trim()&&!a.getAttribute('aria-label')?.trim()).length),0,'Unnamed reader links');
   }else{
    await expect(page.locator('#passage-attribution')).toBeVisible();
    assert.equal(await page.locator('#passage-attribution .translation-copyright').evaluate(e=>!!e.textContent?.trim()),true,'Missing publisher notice: '+code);
    assert.equal(await page.locator('#passage-attribution a[href="https://api.bible/"]').count(),1,'Missing API.Bible attribution: '+code);
   }
  }
 });
 await pass('live Atlas preview, centre refocus and linked reader',async()=>{
  await page.goto('/?view=connections&ref=John%201%3A1&translation=ESV',{waitUntil:'domcontentloaded'});
  const node=page.locator('#graph-details-list .atlas-reference-row > button').filter({has:page.locator('span',{hasText:/^Genesis 1:1$/})}).first();
  await expect(node).toBeVisible({timeout:30000});
  await node.click();
  await expect(page.locator('#atlas-preview-ref')).toHaveText('Genesis 1:1',{timeout:30000});
  await expect(page.locator('#graph-current')).toHaveText('John 1:1');
  await page.locator('#atlas-preview-focus').click();
  await expect(page.locator('#graph-current')).toHaveText('Genesis 1:1');
  await page.locator('#graph-read').click();
  await expect(page.locator('#view-reader')).toBeVisible();
  await expect(page.locator('#passage-status')).toHaveText('Official ESV text',{timeout:30000});
 });
 await pass('ephemeral local notebook save, reload, and notebook view',async()=>{
  await page.goto('/?view=reader&ref=John%203%3A16&translation=ESV',{waitUntil:'domcontentloaded'});
  await expect(page.locator('#passage-status')).toHaveText('Official ESV text',{timeout:30000});
  await page.locator('#notes-text').fill('Synthetic live production audit note');
  await page.locator('#save-notes').click();
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('scripture-trails:notebook'))?.notes?.['John 3:16']),'Synthetic live production audit note','New browser profile did not store its note');
  await page.reload();
  await expect(page.locator('#notes-text')).toHaveValue('Synthetic live production audit note',{timeout:20000});
  await page.goto('/?view=notebook',{waitUntil:'domcontentloaded'});
  await expect(page.locator('#notes-list')).toContainText('Synthetic live production audit note',{timeout:15000});
 });
 await context.close();
 await pass('mobile navigation and reduced-motion real browser',async()=>{
  const mobile=await browser.newContext({baseURL:origin,viewport:{width:375,height:812},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  try{
   const p=await mobile.newPage();watch(p);
   await p.goto('/?view=discover',{waitUntil:'domcontentloaded'});
   await expect(p.locator('#view-discover')).toBeVisible();
   await expect(p.locator('#menu-toggle')).toBeVisible();
   await p.locator('#menu-toggle').click();
   await expect(p.locator('#sidebar')).toHaveAttribute('aria-modal','true');
   await p.locator('#sidebar .nav-link[data-view="reader"]').click();
   await expect(p.locator('#view-reader')).toBeVisible();
   await expect(p.locator('#menu-toggle')).toHaveAttribute('aria-expanded','false');
   await expect(p.locator('#passage-status')).toHaveText('Official ESV text',{timeout:30000});
  }finally{await mobile.close()}
 });
 assert.deepEqual(errors,[],'Uncaught production page errors');
 console.log(JSON.stringify({origin,version:expectedVersion,checksPassed:checks,observedFumsRequests:fums.requests,pageErrors:errors.length,notesScope:'temporary isolated browser profile',copyrightTextLogged:false}));
}finally{await browser.close()}
