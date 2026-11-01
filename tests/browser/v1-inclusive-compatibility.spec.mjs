import {test,expect,open,navigate} from './fixtures.mjs';

// Check the platform accessibility representations and actual keyboard interactions.
// These deterministic contracts are useful regression checks, not synthetic speech
// and not a claim that VoiceOver/TalkBack ran on physical mobile devices.
const journeys=[
 {view:'reader',name:/Read in context/,control:'Bible translation'},
 {view:'connections',name:/Follow every thread/,control:'Atlas book'},
 {view:'notebook',name:/Keep what matters/,control:'Download backup'},
 {view:'roadmap',name:/Built with purpose/,control:'Review acceptance criteria'}
];

test('screen-reader-facing headings, named controls and focus survive cross-view keyboard navigation',async({page})=>{
 test.setTimeout(120000);
 await page.setViewportSize({width:1280,height:900});
 await open(page,'about');
 for(const {view,name,control} of journeys){
  const link=page.locator('.nav-link[data-view="'+view+'"]');
  await link.focus();
  await link.press('Enter');
  const visible=page.locator('#view-'+view);
  await expect(visible).toBeVisible();
  await expect(link).toHaveAttribute('aria-current','page');
  await expect(visible.getByRole('heading',{level:1,name})).toBeFocused();
  const accessible=await visible.ariaSnapshot();
  expect(accessible,view+' must expose an H1 to accessibility APIs').toMatch(/- heading .+\[level=1\]/);
  expect(accessible,view+' must expose named interactive controls').toContain(control);
  expect(accessible,view+' must not expose nameless primary buttons').not.toMatch(/^- button:\s*$/m);
 }
 const reader=page.locator('#view-reader');
 await page.locator('.nav-link[data-view="reader"]').press('Enter');
 await expect(reader).toBeVisible();
 await expect(page.locator('#passage-content')).toContainText('Synthetic browser fixture');
 const edition=reader.getByRole('combobox',{name:'Bible translation'});
 await edition.focus();
 await edition.selectOption('NIV');
 await expect(page.locator('#passage-content')).toContainText('in NIV');
 await expect(page.locator('#passage-status')).toHaveAttribute('role','status');
 await expect(page.locator('#passage-status')).toContainText('NIV');
});

test('400 percent-equivalent reflow and landscape keep essential controls operable',async({page,isMobile},testInfo)=>{
 test.setTimeout(120000);
 const failures=[];
 // For a 1280 CSS px desktop baseline, 320 px is the 400% reflow threshold;
 // 640 px models the 200% reflow threshold. These are layout equivalents,
 // NOT native zoom events or a physical-device test.
 for(const size of [{width:640,height:900},{width:320,height:800},{width:844,height:390}]){
  await page.setViewportSize(size);
  for(const view of ['reader','connections','notebook','roadmap']){
   await open(page,view);
   const root=page.locator('#view-'+view);
   await expect(root.getByRole('heading',{level:1})).toBeVisible();
   const sizeCheck=await page.evaluate(()=>({
    width:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth,
    bodyWidth:document.body.scrollWidth
   }));
   if(sizeCheck.width>sizeCheck.viewport+1)failures.push({view,size,...sizeCheck});
   const nav=page.locator('#menu-toggle');
   if(await nav.isVisible()){
    await expect(nav).toHaveAttribute('aria-expanded','false');
    await nav.focus();
    await nav.press('Enter');
    await expect(nav).toHaveAttribute('aria-expanded','true');
    await page.keyboard.press('Escape');
    await expect(nav).toHaveAttribute('aria-expanded','false');
   }
   if(view==='reader')await expect(root.getByRole('combobox',{name:'Bible translation'})).toBeVisible();
  }
 }
 await testInfo.attach('scaled-reflow-and-landscape',{body:JSON.stringify({project:testInfo.project.name,isMobile,failures},null,2),contentType:'application/json'});
 expect(failures).toEqual([]);
});

test('reduced motion and mobile-profile interaction preserve the study controls',async({page,isMobile})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.setViewportSize({width:390,height:844});
 await open(page,'discover');
 const menu=page.locator('#menu-toggle');
 await expect(menu).toBeVisible();
 if(isMobile)await menu.tap();else await menu.click();
 await expect(menu).toHaveAttribute('aria-expanded','true');
 const reader=page.locator('#sidebar .nav-link[data-view="reader"]');
 if(isMobile)await reader.tap();else await reader.click();
 await expect(page.locator('#view-reader')).toBeVisible();
 await expect(page.locator('#view-reader h1')).toBeFocused();
 await expect(page.locator('#passage-content')).toContainText('Synthetic browser fixture');
 await expect(page.getByRole('combobox',{name:'Bible translation'})).toBeVisible();
});
