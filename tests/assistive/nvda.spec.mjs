import {nvdaTest as test} from '@guidepup/playwright';
import {expect} from '@playwright/test';
import {destinations,localSyntheticRoutes,loadReader,changeView} from './shared.mjs';

// Real Windows NVDA speech on the local release candidate; not simulated speech.
test('NVDA reports focused headings across core study sections',async({page,nvda})=>{
 test.setTimeout(240000);
 await localSyntheticRoutes(page);
 await loadReader(page);
 await nvda.navigateToWebContent();
 let found=false;
 for(let i=0;i<8;i++){
  await nvda.nextHeading();
  if(String(await nvda.lastSpokenPhrase()).toLowerCase().includes('context')){found=true;break;}
 }
 expect(found,'Initial reader heading was not spoken by real NVDA').toBe(true);
 const results=[];
 for(const {view,term} of destinations){
  await changeView(page,view);
  await nvda.perform(nvda.keyboardCommands.reportCurrentFocus);
  const phrase=String(await nvda.lastSpokenPhrase()).toLowerCase();
  const matched=phrase.includes(term);
  results.push({view,headingSpokenOnExplicitFocusQuery:matched});
  expect(matched,view+' focused H1 was not reported by real NVDA').toBe(true);
 }
 console.log('NVDA_LOCAL_CANDIDATE_ACCESSIBILITY_METADATA',JSON.stringify(results));
});
