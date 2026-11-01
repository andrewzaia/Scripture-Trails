import {nvdaTest as test} from '@guidepup/playwright';
import {expect} from '@playwright/test';

// Real NVDA on headed Windows Chromium, public site, no logged licensed text.
// navigateToWebContent() is for the initial page entry, NOT every SPA route swap.
const routeChecks=[
 {view:'reader',heading:'context'},
 {view:'connections',heading:'thread'},
 {view:'notebook',heading:'matters'},
 {view:'about',heading:'discernment'},
 {view:'reader',heading:'context'},
];
test('NVDA continues heading navigation across live SPA sections without reinitialising its cursor',async({page,nvda})=>{
 test.setTimeout(180000);
 await page.goto('/?view=reader&ref=John%203%3A16',{waitUntil:'load'});
 await expect(page.locator('#passage-content')).toHaveAttribute('aria-busy','false',{timeout:18000});
 await nvda.navigateToWebContent();
 const observed=[];
 for(let index=0;index<routeChecks.length;index++){
  const target=routeChecks[index];
  if(index!==0)await page.locator(`.nav-link[data-view="${target.view}"]`).click();
  await expect(page.locator(`#view-${target.view}`)).toBeVisible();
  if(target.view==='reader')await expect(page.locator('#passage-content')).toHaveAttribute('aria-busy','false',{timeout:18000});
  if(target.view==='connections')await expect(page.locator('#atlas-preview-content')).toHaveAttribute('aria-busy','false',{timeout:18000});
  if(index!==0)await expect(page.locator('#main')).toBeFocused();
  const results=[];let matched=false;
  for(let i=0;i<8;i++){
   await nvda.nextHeading();
   const phrase=String(await nvda.lastSpokenPhrase());
   results.push({empty:!phrase.trim(),matched:phrase.toLowerCase().includes(target.heading)});
   if(results.at(-1).matched){matched=true;break;}
  }
  observed.push({view:target.view,announced:matched,moves:results.length,silent:results.filter(x=>x.empty).length});
  if(!matched){
   console.log('NVDA_FIVE_ROUTE_RESULT',JSON.stringify(observed));
   throw Error('NVDA could not announce the '+target.view+' main heading after navigation');
  }
 }
 console.log('NVDA_FIVE_ROUTE_RESULT',JSON.stringify(observed));
 expect(observed).toHaveLength(5);
});
