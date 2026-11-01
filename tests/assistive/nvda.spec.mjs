import {nvdaTest as test} from '@guidepup/playwright';
import {expect} from '@playwright/test';

// Read-only real NVDA probe. Never log licensed Bible passage text or private notes.
test('NVDA reads the About main heading on the actual live website',async({page,nvda})=>{
 await page.goto('/?view=about',{waitUntil:'load'});
 await expect(page.locator('#view-about h1')).toContainText('Discover with');
 await nvda.navigateToWebContent();
 const headings=[];
 for(let i=0;i<16;i++){
  await nvda.nextHeading();
  const spoken=String(await nvda.lastSpokenPhrase());
  headings.push({iteration:i+1,mainHeadingMatched:/discover|discernment/i.test(spoken)});
  if(/discover|discernment/i.test(spoken))break;
 }
 console.log('NVDA_META',JSON.stringify({device:'hosted Windows',browser:'Chromium headed',headings}));
 expect(headings.some(h=>h.mainHeadingMatched)).toBe(true);
});
