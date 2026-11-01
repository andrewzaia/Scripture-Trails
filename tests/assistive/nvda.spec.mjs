import {nvdaTest as test} from '@guidepup/playwright';
import {expect} from '@playwright/test';

// Scoped actual screen-reader audit against the live site. Never log licensed Bible
// passages, FUMS tokens or user-owned notebook content. Hosted desktop, not a phone.
const routes=[
 {view:'about',term:'discernment'},
 {view:'reader',term:'context'},
 {view:'connections',term:'thread'},
 {view:'notebook',term:'matters'},
];

test('NVDA announces the main heading across four live study journeys',async({page,nvda})=>{
 test.setTimeout(240000);
 await page.goto('/?view=about',{waitUntil:'load'});
 const results=[];
 for(const target of routes){
  if(target.view!=='about')await page.locator(`.nav-link[data-view="${target.view}"]`).click();
  await expect(page.locator(`#view-${target.view}`)).toBeVisible();
  await expect(page.locator(`#view-${target.view} h1`)).toBeVisible();
  if(target.view==='reader')await expect(page.locator('#passage-content')).toHaveAttribute('aria-busy','false',{timeout:18000});
  if(target.view==='connections')await expect(page.locator('#atlas-preview-content')).toHaveAttribute('aria-busy','false',{timeout:18000});
  await nvda.navigateToWebContent();
  let matched=false,moves=0;const speechHeadings=[];
  for(;moves<18;moves++){
   await nvda.nextHeading();
   const speech=String(await nvda.lastSpokenPhrase());
   if(target.view==='connections')speechHeadings.push(speech.slice(0,150));
   if(speech.toLowerCase().includes(target.term)){matched=true;moves++;break;}
  }
  if(target.view==='connections'){
   // Heading navigation only: no copyrighted Bible body text is captured.
   console.log('NVDA_ATLAS_SPEECH_HEADING_DIAGNOSTIC',JSON.stringify(speechHeadings));
   if(!matched){
    await page.goto('/?view=connections',{waitUntil:'load'});
    await expect(page.locator('#atlas-preview-content')).toHaveAttribute('aria-busy','false',{timeout:18000});
    await nvda.navigateToWebContent();
    const direct=[];
    for(let j=0;j<12;j++){
     await nvda.nextHeading();
     const spoken=String(await nvda.lastSpokenPhrase());
     direct.push(spoken.slice(0,150));
     if(spoken.toLowerCase().includes(target.term))break;
    }
    console.log('NVDA_ATLAS_DIRECT_ROUTE_DIAGNOSTIC',JSON.stringify(direct));
   }
  }
  results.push({view:target.view,headingAnnounced:matched,navigationMoves:moves});
  expect(matched,`${target.view} main heading was not spoken by NVDA`).toBe(true);
 }
 console.log('NVDA_JOURNEY_METADATA',JSON.stringify({hostedDesktop:true,results}));
});
