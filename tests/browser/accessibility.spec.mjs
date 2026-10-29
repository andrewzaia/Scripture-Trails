import AxeBuilder from '@axe-core/playwright';
import {test,expect,open} from './fixtures.mjs';

const views=['discover','reader','connections','jesus-map','paul-map','hebrew-geography','city-studies','entities','roadmap','journeys','notebook','about'];
for(const view of views)test(`${view}: WCAG checks, both themes and no horizontal page overflow`,async({page},testInfo)=>{
 await open(page,view);
 // Wait for lazy data and fixture text, rather than auditing a loading placeholder.
 const ready={reader:'#passage-content[aria-busy="false"]',connections:'#atlas-preview-content[aria-busy="false"]','jesus-map':'[data-jesus="visits"] button','paul-map':'[data-paul="list"] button',roadmap:'[data-roadmap][data-ready="true"]','city-studies':'[data-city-studies][data-ready="true"]',entities:'[data-entity-index][data-ready="true"]','hebrew-geography':'[data-hebrew-geography][data-ready="true"]'};
 if(ready[view])await expect(page.locator(ready[view]).first()).toBeAttached();
 for(const theme of ['dark','light']){
  if(theme==='light')await page.locator('#theme-toggle').click();
  if(view==='about'){
   const path=testInfo.outputPath(`about-${theme}.png`);
   await page.screenshot({path});
   await testInfo.attach(`About dashboard: ${theme}`,{path,contentType:'image/png'});
  }
  const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
  expect(result.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),`${view}, ${theme}`).toEqual([]);
  const size=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:innerWidth}));
  expect(size.scroll,`${view}, ${theme}: page width`).toBeLessThanOrEqual(size.viewport+1);
 }
});

test('keyboard navigation reaches the active view and mobile menu dismisses with Escape',async({page,isMobile})=>{
 await open(page,'about');
 if(isMobile){
  await page.locator('#menu-toggle').focus();await page.keyboard.press('Enter');
  await expect(page.locator('#menu-toggle')).toHaveAttribute('aria-expanded','true');
  await page.keyboard.press('Escape');
  await expect(page.locator('#menu-toggle')).toHaveAttribute('aria-expanded','false');
  await expect(page.locator('#menu-toggle')).toBeFocused();
 }
 await page.goto('/?view=about');
 await page.keyboard.press('Tab');
 await expect(page.getByRole('link',{name:'Skip to content'})).toBeFocused();
 await page.keyboard.press('Enter');
 await expect(page.locator('#main')).toBeFocused();
});
