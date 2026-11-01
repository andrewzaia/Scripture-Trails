import {nvdaTest as test} from '@guidepup/playwright';
import {expect} from '@playwright/test';

// Real NVDA. Test-only announcements and probes are injected into the loaded
// browser context, never the deployed website or licensed passage contents.
async function inspectHeadings(nvda,term,count=3){
 const attempts=[];
 for(let i=0;i<count;i++){
  await nvda.nextHeading();
  const spoken=String(await nvda.lastSpokenPhrase());
  attempts.push({empty:!spoken.trim(),matched:spoken.toLowerCase().includes(term)});
  if(attempts.at(-1).matched)break;
 }
 return attempts;
}
const summary=results=>({matched:results.some(r=>r.matched),silent:results.filter(r=>r.empty).length,count:results.length});

test('NVDA SPA transition and route announcement diagnosis',async({page,nvda})=>{
 test.setTimeout(230000);
 await page.goto('/?view=reader&ref=John%203%3A16',{waitUntil:'load'});
 await expect(page.locator('#passage-content')).toHaveAttribute('aria-busy','false',{timeout:18000});
 await nvda.navigateToWebContent();
 const initial=summary(await inspectHeadings(nvda,'context',5));
 expect(initial.matched).toBe(true);

 // Test-only DOM insertion follows established SPA accessibility guidance.
 // The region is never written to Scripture Trails' production files.
 await page.evaluate(()=>{
  const region=document.createElement('div');
  region.id='test-route-announcement';
  region.setAttribute('role','status');
  region.setAttribute('aria-live','polite');
  region.setAttribute('aria-atomic','true');
  Object.assign(region.style,{position:'absolute',left:'-9999px',width:'1px',height:'1px',overflow:'hidden'});
  document.body.append(region);
  document.addEventListener('scripturetrails:view-change',ev=>{
   region.textContent=ev.detail.view==='connections'?'Connection atlas opened':'Study section opened';
  });
 });

 await page.locator('.nav-link[data-view="connections"]').click();
 await expect(page.locator('#view-connections')).toBeVisible();
 await expect(page.locator('#atlas-preview-content')).toHaveAttribute('aria-busy','false',{timeout:18000});
 const focusAfterClick=await page.evaluate(()=>({id:document.activeElement?.id||'',tag:document.activeElement?.tagName||''}));
 const firstSpoken=String(await nvda.lastSpokenPhrase()).toLowerCase().includes('connection');
 const withoutHelper=summary(await inspectHeadings(nvda,'thread',4));
 await nvda.press('Escape');
 const afterEscape=summary(await inspectHeadings(nvda,'thread',4));
 await nvda.perform(nvda.keyboardCommands.toggleBetweenBrowseAndFocusMode);
 const afterModeToggle=summary(await inspectHeadings(nvda,'thread',4));
 await nvda.navigateToWebContent();
 const afterHelper=summary(await inspectHeadings(nvda,'thread',4));
 await nvda.perform(nvda.keyboardCommands.reportCurrentFocus);
 const currentFocus=String(await nvda.lastSpokenPhrase());
 const log=await nvda.spokenPhraseLog();
 console.log('NVDA_SPA_INTERACTION_METADATA',JSON.stringify({
  initial,focusAfterClick,liveRegionSpoken:firstSpoken,
  withoutHelper,afterEscape,afterModeToggle,afterHelper,
  currentFocusMentionsAtlas:/connection atlas|thread/.test(currentFocus.toLowerCase()),
  logContainsRouteNotice:log.some(x=>String(x).toLowerCase().includes('connection atlas opened')),
  routeNoticeDom:await page.locator('#test-route-announcement').textContent(),
 }));
 // A diagnostic run need not fail when a suspected technique is ineffective.
 expect(await page.locator('#view-connections').isVisible()).toBe(true);
});
