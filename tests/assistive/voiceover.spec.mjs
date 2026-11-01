import {voiceOverTest as test} from '@guidepup/playwright';
import {expect} from '@playwright/test';

// Scoped actual screen-reader audit against the live site. Never log licensed Bible
// passages, FUMS tokens or user-owned notebook content. Hosted desktop, not a phone.
const routes=[
 {view:'about',term:'discernment'},
 {view:'reader',term:'context'},
 {view:'connections',term:'thread'},
 {view:'notebook',term:'matters'},
];

test('VoiceOver verifies v0.44.22 headings and focus across four live study journeys',async({page,voiceOver})=>{
 test.setTimeout(240000);
 await page.goto('/?view=about',{waitUntil:'load'});
 await expect(page.locator('#site-version')).toHaveText('v0.44.22');
 const results=[];
 for(const target of routes){
  if(target.view!=='about')await page.locator(`.nav-link[data-view="${target.view}"]`).click();
  await expect(page.locator(`#view-${target.view}`)).toBeVisible();
  await expect(page.locator(`#view-${target.view} h1`)).toBeVisible();
  if(target.view!=='about')await expect(page.locator(`#view-${target.view} h1`)).toBeFocused();
  if(target.view==='reader')await expect(page.locator('#passage-content')).toHaveAttribute('aria-busy','false',{timeout:18000});
  if(target.view==='connections')await expect(page.locator('#atlas-preview-content')).toHaveAttribute('aria-busy','false',{timeout:18000});
  await voiceOver.navigateToWebContent();
  let matched=false,moves=0;
  for(;moves<18;moves++){
   await voiceOver.nextHeading();
   const speech=String(await voiceOver.lastSpokenPhrase());
   if(speech.toLowerCase().includes(target.term)){matched=true;moves++;break;}
  }
  results.push({view:target.view,headingAnnounced:matched,navigationMoves:moves});
  expect(matched,`${target.view} main heading was not spoken by VoiceOver`).toBe(true);
 }
 console.log('VOICEOVER_JOURNEY_METADATA',JSON.stringify({hostedDesktop:true,results}));
});
