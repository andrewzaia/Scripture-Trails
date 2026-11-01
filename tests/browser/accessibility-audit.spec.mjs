import AxeBuilder from '@axe-core/playwright';
import {test,expect,open} from './fixtures.mjs';

const ready={reader:'#passage-content[aria-busy="false"]',connections:'#atlas-preview-content[aria-busy="false"]','jesus-map':'[data-jesus="visits"] button','paul-map':'[data-paul="list"] button',roadmap:'[data-roadmap][data-ready="true"]','city-studies':'[data-city-studies][data-ready="true"]',entities:'[data-entity-index][data-ready="true"]','hebrew-geography':'[data-hebrew-geography][data-ready="true"]'};
const views=['discover','reader','connections','jesus-map','paul-map','hebrew-geography','city-studies','entities','roadmap','journeys','notebook','about'];
async function loaded(page,view){await open(page,view);if(ready[view])await expect(page.locator(ready[view]).first()).toBeAttached();}
async function overflow(page){
 return page.evaluate(()=>({viewport:innerWidth,width:document.documentElement.scrollWidth,offenders:[...document.querySelectorAll('main *')].filter(e=>{
  const r=e.getBoundingClientRect();return r.width>0&&r.right>innerWidth+1&&getComputedStyle(e).position!=='absolute'&&!e.closest('svg');
 }).slice(0,8).map(e=>({tag:e.tagName,id:e.id,class:e.className,right:Math.round(e.getBoundingClientRect().right)}))}));
}

test('reference links and browser history retain focus in the visible destination',async({page})=>{
 await open(page,'discover');
 const example=page.getByRole('button',{name:'Genesis 1:1',exact:true});await example.focus();await page.keyboard.press('Enter');
 await expect(page.locator('#view-reader')).toBeVisible();await expect(page.locator('#view-reader h1')).toBeFocused();
 await expect(page.locator('.nav-link[data-view="reader"]')).toHaveAttribute('aria-current','page');
 await expect(page).toHaveTitle('Scripture Trails | Bible reader');
 await page.goBack();await expect(page.locator('#view-discover')).toBeVisible();await expect(page.locator('#view-discover h1')).toBeFocused();
 await expect(page.locator('.nav-link[data-view="discover"]')).toHaveAttribute('aria-current','page');
 await page.goForward();await expect(page.locator('#view-reader')).toBeVisible();await expect(page.locator('#view-reader h1')).toBeFocused();
});

test('keyword search moves focus out of the hidden form and announces results',async({page})=>{
 await page.route('**/api/search?**',route=>route.fulfill({json:{total_results:1,results:[{reference:'John 3:16',content:'Synthetic keyword-search fixture.'}]}}));
 await open(page,'discover');await page.locator('#passage-input').fill('hope');await page.locator('#passage-input').press('Enter');
 await expect(page.locator('#view-reader')).toBeVisible();await expect(page.locator('#view-reader h1')).toBeFocused();
 await expect(page.locator('#passage-status')).toHaveAttribute('role','status');
 await expect(page.locator('#passage-content')).toHaveAttribute('aria-busy','false');
 await expect(page.locator('#passage-content')).toContainText('1 matching verses');
 await page.getByRole('button',{name:'John 3:16 ↗',exact:true}).press('Enter');
 await expect(page.locator('#passage-content')).toContainText('Synthetic browser fixture for John 3:16');
 await expect(page.locator('#main')).toBeFocused();
});

test('mobile navigation contains keyboard focus, closes accessibly and resets on resize',async({page},testInfo)=>{
 if(testInfo.project.name==='desktop-firefox')test.setTimeout(120000);
 await page.setViewportSize({width:390,height:844});await open(page,'about');
 const menu=page.locator('#menu-toggle'),sidebar=page.locator('#sidebar');await menu.focus();await page.keyboard.press('Enter');
 await expect(sidebar).toHaveAttribute('role','dialog');await expect(sidebar).toHaveAttribute('aria-modal','true');
 await expect(page.getByRole('button',{name:'Close navigation',exact:true})).toBeFocused();
 await expect(page.locator('.main-column')).toHaveAttribute('inert','');
 await page.keyboard.press('Shift+Tab');await expect(sidebar.locator('[data-view="about"]')).toBeFocused();
 await page.keyboard.press('Tab');await expect(page.getByRole('button',{name:'Close navigation',exact:true})).toBeFocused();
 const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();expect(result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
 await page.keyboard.press('Escape');await expect(menu).toBeFocused();await expect(menu).toHaveAttribute('aria-expanded','false');
 await expect(page.locator('.main-column')).not.toHaveAttribute('inert');
 await menu.press('Enter');await page.getByRole('button',{name:'Close navigation',exact:true}).press('Enter');await expect(menu).toBeFocused();
 await menu.press('Enter');await sidebar.locator('[data-view="reader"]').press('Enter');await expect(page.locator('#view-reader')).toBeVisible();await expect(page.locator('#view-reader h1')).toBeFocused();
 await menu.press('Enter');await page.setViewportSize({width:1280,height:900});await expect(sidebar).not.toHaveAttribute('aria-modal');await expect(page.locator('.main-column')).not.toHaveAttribute('inert');
 await expect(sidebar.locator('[data-view="reader"]')).toBeFocused();
 await page.setViewportSize({width:390,height:844});await expect(menu).toBeFocused();
});

test('client-side navigation focuses each visible section heading and retains the skip link',async({page})=>{
 await page.setViewportSize({width:1280,height:900});
 await open(page,'about');
 for(const view of ['reader','connections','notebook','about']){
  await page.locator('.nav-link[data-view="'+view+'"]').click();
  await expect(page.locator('#view-'+view)).toBeVisible();
  await expect(page.locator('#view-'+view+' h1')).toBeFocused();
  await expect(page.locator('#view-'+view+' h1')).toHaveAttribute('tabindex','-1');
  await expect(page.locator('.nav-link[data-view="'+view+'"]')).toHaveAttribute('aria-current','page');
 }
 await page.goto('/?view=about');
 await page.keyboard.press('Tab');
 await expect(page.getByRole('link',{name:'Skip to content'})).toBeFocused();
 await page.keyboard.press('Enter');
 await expect(page.locator('#main')).toBeFocused();
});

test('all main views reflow at 320 CSS pixels',async({page},testInfo)=>{
 test.setTimeout(90000);await page.setViewportSize({width:320,height:800});const findings=[];
 for(const view of views){await loaded(page,view);const size=await overflow(page);if(size.width>size.viewport+1)findings.push({view,...size});}
 await testInfo.attach('320px-reflow-findings',{body:JSON.stringify(findings,null,2),contentType:'application/json'});expect(findings).toEqual([]);
});

test('all main views retain layout with text enlarged to 200 percent',async({page},testInfo)=>{
 test.setTimeout(90000);await page.setViewportSize({width:1280,height:900});const findings=[];
 for(const view of views){
  await loaded(page,view);
  // A deterministic text-resize stress check, not actual browser zoom or a device test.
  await page.evaluate(()=>{const sizes=[...document.querySelectorAll('body *')].filter(e=>!e.closest('svg')).map(e=>[e,parseFloat(getComputedStyle(e).fontSize)]);for(const [e,size] of sizes)e.style.fontSize=(size*2)+'px';});
  const size=await overflow(page);if(size.width>size.viewport+1)findings.push({view,...size});
 }
 await testInfo.attach('200-percent-text-findings',{body:JSON.stringify(findings,null,2),contentType:'application/json'});expect(findings).toEqual([]);
});
