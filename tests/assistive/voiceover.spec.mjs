import {voiceOverTest as test} from '@guidepup/playwright';
import {expect} from '@playwright/test';
import {destinations,localSyntheticRoutes,loadReader,changeView} from './shared.mjs';

// Real macOS VoiceOver speech on a headed WebKit browser, not iOS VoiceOver.
test('VoiceOver speaks core study headings during navigable local journeys',async({page,voiceOver})=>{
 test.setTimeout(240000);
 await localSyntheticRoutes(page);
 await loadReader(page);
 const results=[];
 for(const {view,term} of [{view:'reader',term:'context'},...destinations]){
  if(results.length)await changeView(page,view);
  await voiceOver.navigateToWebContent();
  let matched=false,moves=0;
  for(;moves<20;moves++){
   await voiceOver.nextHeading();
   if(String(await voiceOver.lastSpokenPhrase()).toLowerCase().includes(term)){matched=true;moves++;break;}
  }
  results.push({view,headingAnnounced:matched,headingMoves:moves});
  expect(matched,view+' main H1 was not spoken by actual macOS VoiceOver').toBe(true);
 }
 console.log('VOICEOVER_LOCAL_CANDIDATE_ACCESSIBILITY_METADATA',JSON.stringify(results));
});
