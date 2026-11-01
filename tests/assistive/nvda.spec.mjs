import {nvdaTest as test} from '@guidepup/playwright';
import {expect} from '@playwright/test';

// Post-release actual NVDA production verification. No browser DOM injection.
// Record heading/category matches only, not licensed Bible content or private notes.
const routes=[
 {view:'connections',term:'thread'},
 {view:'notebook',term:'matters'},
 {view:'about',term:'discernment'},
 {view:'reader',term:'context'},
];
test('v0.44.22 production route headings receive real NVDA focus',async({page,nvda})=>{
 test.setTimeout(200000);
 await page.goto('/?view=reader&ref=John%203%3A16',{waitUntil:'load'});
 await expect(page.locator('#site-version')).toHaveText('v0.44.22');
 await expect(page.locator('#passage-content')).toHaveAttribute('aria-busy','false',{timeout:18000});
 await nvda.navigateToWebContent();
 await nvda.nextHeading();
 expect(String(await nvda.lastSpokenPhrase()).toLowerCase()).toContain('context');
 const findings=[];
 for(const target of routes){
  await page.locator(`.nav-link[data-view="${target.view}"]`).click();
  await expect(page.locator(`#view-${target.view}`)).toBeVisible();
  if(target.view==='reader')await expect(page.locator('#passage-content')).toHaveAttribute('aria-busy','false',{timeout:18000});
  if(target.view==='connections')await expect(page.locator('#atlas-preview-content')).toHaveAttribute('aria-busy','false',{timeout:18000});
  await expect(page.locator(`#view-${target.view} h1`)).toBeFocused();
  await nvda.perform(nvda.keyboardCommands.reportCurrentFocus);
  const phrase=String(await nvda.lastSpokenPhrase()).toLowerCase();
  findings.push({view:target.view,focusReportedHeading:phrase.includes(target.term),headingSemantics:phrase.includes('heading')});
 }
 console.log('NVDA_RELEASE_04422',JSON.stringify(findings));
 expect(findings.every(f=>f.focusReportedHeading&&f.headingSemantics)).toBe(true);
});
