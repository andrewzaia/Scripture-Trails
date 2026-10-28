import {test as base,expect} from '@playwright/test';

// Invented test prose only. Never fetch or vendor publisher Scripture text.
export function passagePayload(reference,translation){
 const first=Number(reference.match(/:(\d+)/)?.[1]||1);
 return {passages:[`<p><sup class="verse-num">${first}</sup> Synthetic browser fixture for ${reference} in ${translation}.</p>`],copyright:'Synthetic test attribution. No publisher Bible text.',fums:null};
}
export const test=base.extend({
 page:async({page},use)=>{
  const errors=[],unexpected=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/*',async route=>{
   const url=new URL(route.request().url());
   if(url.origin!=='http://127.0.0.1:4387'){unexpected.push(url.origin);await route.abort();return;}
   if(url.pathname==='/api/passage'){await route.fulfill({json:passagePayload(url.searchParams.get('q'),url.searchParams.get('translation'))});return;}
   if(url.pathname.startsWith('/api/')){unexpected.push(url.pathname);await route.abort();return;}
   await route.continue();
  });
  await use(page);
  expect(errors,'Uncaught application errors').toEqual([]);
  expect(unexpected,'Tests must stay local and use declared synthetic API fixtures').toEqual([]);
 }
});
export {expect};
export async function open(page,view='reader',ref='John 3:16'){
 await page.goto(`/?view=${view}&ref=${encodeURIComponent(ref)}&translation=ESV`);
 await expect(page.locator(`#view-${view}`)).toBeVisible();
}
export async function navigate(page,view){
 const menu=page.locator('#menu-toggle');
 if(await menu.isVisible())await menu.click();
 await page.locator(`.nav-link[data-view="${view}"]`).click();
 await expect(page.locator(`#view-${view}`)).toBeVisible();
}
export async function notebook(page){
 return page.evaluate(()=>JSON.parse(localStorage.getItem('scripture-trails:notebook')));
}
export function backup(overrides={}){
 return {format:'scripture-trails-notebook',schemaVersion:5,exportedAt:'2026-10-28T00:00:00.000Z',bookmarks:[],notes:{},readingPlans:{},annotations:{notes:[],highlights:{}},collections:[],...overrides};
}
export async function chooseBackup(page,data){
 await page.locator('[data-backup="file"]').setInputFiles({name:'synthetic-notebook.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(data))});
}
