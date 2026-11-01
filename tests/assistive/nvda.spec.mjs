import {nvdaTest as test} from '@guidepup/playwright';
import {expect} from '@playwright/test';

// Real NVDA commands against the public site. Store only heading-match metadata.
// Never log copyrighted Bible verses, user notes or telemetry identifiers.
async function nextHeadings(nvda,term,max=8){
 const seen=[];
 for(let index=0;index<max;index++){
  await nvda.nextHeading();
  const phrase=String(await nvda.lastSpokenPhrase());
  seen.push({empty:!phrase.trim(),matched:phrase.toLowerCase().includes(term)});
  if(seen.at(-1).matched)break;
 }
 return seen;
}

test('NVDA refreshes browse document after SPA reader to Atlas navigation',async({page,nvda})=>{
 test.setTimeout(210000);
 await page.goto('/?view=reader&ref=John%203%3A16',{waitUntil:'load'});
 await expect(page.locator('#passage-content')).toHaveAttribute('aria-busy','false',{timeout:18000});
 await nvda.navigateToWebContent();
 const before=await nextHeadings(nvda,'context',6);
 expect(before.some(x=>x.matched),'Reader heading should announce before SPA navigation').toBe(true);

 await page.locator('.nav-link[data-view="connections"]').click();
 await expect(page.locator('#view-connections')).toBeVisible();
 await expect(page.locator('#atlas-preview-content')).toHaveAttribute('aria-busy','false',{timeout:18000});
 await expect(page.locator('#main')).toBeFocused();
 await nvda.navigateToWebContent();
 const afterNavigation=await nextHeadings(nvda,'thread',5);
 const refreshed=await nvda.perform(nvda.keyboardCommands.refreshBrowseDocument);
 await nvda.navigateToWebContent();
 const afterRefresh=await nextHeadings(nvda,'thread',10);
 console.log('NVDA_BUFFER_REFRESH_METADATA',JSON.stringify({
   readerAnnounced:before.some(x=>x.matched),
   afterSPAHeading:afterNavigation.some(x=>x.matched),
   afterSPASilent:afterNavigation.filter(x=>x.empty).length,
   refreshExecuted:true,
   refreshResultType:typeof refreshed,
   afterRefreshHeading:afterRefresh.some(x=>x.matched),
   afterRefreshSilent:afterRefresh.filter(x=>x.empty).length,
   documentTitle:await page.title(),
   focusedMain:await page.locator('#main').evaluate(e=>document.activeElement===e),
 }));
 expect(afterRefresh.some(x=>x.matched),'NVDA browse-document refresh should make Atlas heading available').toBe(true);
});
