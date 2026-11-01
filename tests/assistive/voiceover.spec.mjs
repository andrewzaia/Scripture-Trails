import {voiceOverTest as test} from '@guidepup/playwright';
import {expect} from '@playwright/test';

// Read-only real VoiceOver probe. Never log licensed Bible passage text or private notes.
test('VoiceOver reads the About main heading on the actual live website',async({page,voiceOver})=>{
 await page.goto('/?view=about',{waitUntil:'load'});
 await expect(page.locator('#view-about h1')).toContainText('Discover with');
 await voiceOver.navigateToWebContent();
 const headings=[];
 for(let i=0;i<16;i++){
  await voiceOver.nextHeading();
  const spoken=String(await voiceOver.lastSpokenPhrase());
  headings.push({iteration:i+1,mainHeadingMatched:/discover|discernment/i.test(spoken)});
  if(/discover|discernment/i.test(spoken))break;
 }
 console.log('VOICEOVER_META',JSON.stringify({device:'hosted macOS',browser:'WebKit headed',headings}));
 expect(headings.some(h=>h.mainHeadingMatched)).toBe(true);
});
