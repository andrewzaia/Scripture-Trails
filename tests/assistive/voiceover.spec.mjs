import {voiceOverTest as test} from '@guidepup/playwright';
import {expect} from '@playwright/test';

// One-off real VoiceOver diagnostic on the published v0.44.22 site.
// Store only match metadata, never licensed Bible content or private notes.
const targets=[
 {view:'connections',term:'thread'},
 {view:'notebook',term:'matters'},
 {view:'about',term:'discernment'},
 {view:'reader',term:'context'},
];
test('VoiceOver navigation-capture and cursor follow published route heading focus',async({page,voiceOver})=>{
 test.setTimeout(200000);
 await page.goto('/?view=about',{waitUntil:'load'});
 await expect(page.locator('#site-version')).toHaveText('v0.44.22');
 await expect(page.locator('#view-about h1')).toBeVisible();
 await voiceOver.navigateToWebContent();
 const initial=[];
 for(let i=0;i<6;i++){
  await voiceOver.nextHeading();
  const t=String(await voiceOver.lastSpokenPhrase()).toLowerCase();
  initial.push({empty:!t.trim(),matchesAbout:t.includes('discernment')});
  if(t.includes('discernment'))break;
 }
 const result=[];
 for(const target of targets){
  const captured=await voiceOver.capture(async()=>page.locator(`.nav-link[data-view="${target.view}"]`).click());
  await expect(page.locator(`#view-${target.view}`)).toBeVisible();
  if(target.view==='reader')await expect(page.locator('#passage-content')).toHaveAttribute('aria-busy','false',{timeout:18000});
  if(target.view==='connections')await expect(page.locator('#atlas-preview-content')).toHaveAttribute('aria-busy','false',{timeout:18000});
  const heading=page.locator(`#view-${target.view} h1`);
  await expect(heading).toBeFocused();
  const cursor=String(await voiceOver.itemText()).toLowerCase();
  const speech=String(await voiceOver.lastSpokenPhrase()).toLowerCase();
  const captureSpeech=String(captured?.spokenPhrase||'').toLowerCase();
  const nextHeading=[];
  for(let i=0;i<5;i++){
   await voiceOver.nextHeading();
   const phrase=String(await voiceOver.lastSpokenPhrase()).toLowerCase();
   nextHeading.push({empty:!phrase.trim(),matched:phrase.includes(target.term)});
   if(phrase.includes(target.term))break;
  }
  result.push({
   view:target.view,domHeadingFocused:true,
   captureSpokeHeading:captureSpeech.includes(target.term),
   cursorOnHeading:cursor.includes(target.term),
   lastSpeechHeading:speech.includes(target.term),
   nextHeadingFound:nextHeading.some(x=>x.matched),
   nextHeadingSilent:nextHeading.filter(x=>x.empty).length
  });
 }
 console.log('VOICEOVER_RELEASE_04422_DIAGNOSTIC',JSON.stringify({initial,result}));
 expect(result).toHaveLength(4);
});
