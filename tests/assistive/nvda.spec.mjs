import {nvdaTest as test} from '@guidepup/playwright';
import {expect} from '@playwright/test';

// Browser-only prototype for route-heading focus. Nothing is deployed. Only
// ordinary page headings and categorised speech outcomes are logged.
const routes=[
 {view:'connections',term:'thread'},
 {view:'notebook',term:'matters'},
 {view:'about',term:'discernment'},
 {view:'reader',term:'context'},
];
test('real NVDA announces newly focused SPA route headings without Ctrl+Home',async({page,nvda})=>{
 test.setTimeout(190000);
 await page.goto('/?view=reader&ref=John%203%3A16',{waitUntil:'load'});
 await expect(page.locator('#passage-content')).toHaveAttribute('aria-busy','false',{timeout:18000});
 await nvda.navigateToWebContent();
 await nvda.nextHeading();
 expect(String(await nvda.lastSpokenPhrase()).toLowerCase()).toContain('context');

 // Experimental enhancement applied inside this one browser session only.
 // The real application has not been edited.
 await page.evaluate(()=>{
  document.addEventListener('scripturetrails:view-change',e=>{
   const heading=document.querySelector(`#view-${e.detail.view} h1`);
   if(!heading)return;
   heading.tabIndex=-1;
   heading.focus({preventScroll:true});
  });
 });
 const observed=[];
 for(const target of routes){
  await page.locator(`.nav-link[data-view="${target.view}"]`).click();
  await expect(page.locator(`#view-${target.view}`)).toBeVisible();
  if(target.view==='reader')await expect(page.locator('#passage-content')).toHaveAttribute('aria-busy','false',{timeout:18000});
  if(target.view==='connections')await expect(page.locator('#atlas-preview-content')).toHaveAttribute('aria-busy','false',{timeout:18000});
  const heading=page.locator(`#view-${target.view} h1`);
  await expect(heading).toBeFocused();
  await page.waitForTimeout(350);
  const spontaneous=String(await nvda.lastSpokenPhrase()).toLowerCase();
  await nvda.perform(nvda.keyboardCommands.reportCurrentFocus);
  const reported=String(await nvda.lastSpokenPhrase()).toLowerCase();
  observed.push({
   view:target.view,
   headingFocused:true,
   spontaneouslyAnnounced:spontaneous.includes(target.term),
   focusReportMatched:reported.includes(target.term),
   reportContainsHeading:reported.includes('heading'),
  });
 }
 console.log('NVDA_HEADING_FOCUS_PROTOTYPE',JSON.stringify(observed));
 expect(observed.every(x=>x.focusReportMatched),'NVDA should report every newly focused view heading').toBe(true);
});
