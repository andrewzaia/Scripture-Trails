import {expect} from '@playwright/test';
import {readFileSync} from 'node:fs';

export const expectedVersion='v'+JSON.parse(readFileSync('package.json','utf8')).version;
export async function localSyntheticRoutes(page){
 await page.route('**/*',async route=>{
  const u=new URL(route.request().url());
  if(u.origin!=='http://127.0.0.1:4387'){await route.abort();return;}
  if(u.pathname==='/api/passage'){
   const reference=u.searchParams.get('q')||'John 3:16';
   await route.fulfill({json:{passages:['<p>Synthetic local assistive-technology fixture for '+reference+'.</p>'],copyright:'Synthetic fixture. No publisher Bible text.',fums:null}});return;
  }
  if(u.pathname.startsWith('/api/')){await route.abort();return;}
  await route.continue();
 });
}
export const destinations=[
 {view:'connections',term:'thread'},
 {view:'notebook',term:'matters'},
 {view:'about',term:'discernment'},
 {view:'reader',term:'context'}
];
export async function loadReader(page){
 await page.goto('/?view=reader&ref=John%203%3A16',{waitUntil:'load'});
 await expect(page.locator('#site-version')).toHaveText(expectedVersion);
 await expect(page.locator('#passage-content')).toHaveAttribute('aria-busy','false',{timeout:20000});
}
export async function changeView(page,view){
 await page.locator('.nav-link[data-view="'+view+'"]').click();
 await expect(page.locator('#view-'+view)).toBeVisible();
 await expect(page.locator('#view-'+view+' h1')).toBeFocused();
 if(view==='connections')await expect(page.locator('#atlas-preview-content')).toHaveAttribute('aria-busy','false',{timeout:20000});
 if(view==='reader')await expect(page.locator('#passage-content')).toHaveAttribute('aria-busy','false',{timeout:20000});
}
