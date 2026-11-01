import {voiceOverTest as test} from '@guidepup/playwright';
import {expect} from '@playwright/test';
import {destinations,localSyntheticRoutes,loadReader,changeView} from './shared.mjs';

// Real macOS VoiceOver on a local headed WebKit browser, not iPhone VoiceOver.
// A focused heading may already be at the VO cursor: inspect before advancing.
test('VoiceOver finds core heading via current focus or forward/reverse heading navigation',async({page,voiceOver})=>{
 test.setTimeout(240000);
 await localSyntheticRoutes(page);
 await loadReader(page);
 const results=[];
 for(const {view,term} of [{view:'reader',term:'context'},...destinations]){
  if(results.length)await changeView(page,view);
  await voiceOver.navigateToWebContent();
  let method='unreached',matched=false,moves=0;
  const current=[];
  try{current.push(String(await voiceOver.itemText()).toLowerCase());}catch{}
  try{current.push(String(await voiceOver.lastSpokenPhrase()).toLowerCase());}catch{}
  if(current.some(x=>x.includes(term))){matched=true;method='current item';}
  if(!matched)for(let i=0;i<20;i++){
   await voiceOver.nextHeading();moves++;
   if(String(await voiceOver.lastSpokenPhrase()).toLowerCase().includes(term)){matched=true;method='next heading';break;}
  }
  if(!matched)for(let i=0;i<20;i++){
   await voiceOver.previousHeading();moves++;
   if(String(await voiceOver.lastSpokenPhrase()).toLowerCase().includes(term)){matched=true;method='previous heading';break;}
  }
  results.push({view,headingSpoken:matched,method,moves});
  console.log('VOICEOVER_LOCAL_CANDIDATE_STEP',JSON.stringify(results.at(-1)));
  expect(matched,view+' H1 could not be spoken by current, next or previous VoiceOver heading navigation').toBe(true);
 }
 console.log('VOICEOVER_LOCAL_CANDIDATE_ACCESSIBILITY_METADATA',JSON.stringify(results));
});
