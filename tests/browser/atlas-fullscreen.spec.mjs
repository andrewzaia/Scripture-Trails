import {test,expect,open,navigate} from './fixtures.mjs';

async function enterImmersive(page){
 await page.locator('#graph-fullscreen').click();
 await expect(page.locator('#graph-fullscreen')).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('#atlas-workspace')).toBeVisible();
 await expect(page.locator('#graph-details #atlas-preview-panel')).toHaveCount(1);
 await expect(page.locator('#graph-details #atlas-compare')).toHaveCount(1);
}

async function showDetails(page){
 if(await page.locator('#graph-details-toggle').getAttribute('aria-expanded')==='false')await page.locator('#graph-details-toggle').click();
 await expect(page.locator('#graph-details-toggle')).toHaveAttribute('aria-expanded','true');
 await expect(page.locator('#graph-details')).toBeVisible();
}

test('Atlas fullscreen preserves the passage preview, evidence sidebar, controls and comparison',async({page})=>{
 test.setTimeout(90000);
 await open(page,'connections','John 1:1');
 await expect(page.locator('#atlas-preview-content')).toContainText('John 1:1 in ESV');
 await enterImmersive(page);await showDetails(page);
 await expect(page.locator('#graph-info-ref')).toHaveText('John 1:1');
 const row=page.locator('#graph-details-list .atlas-reference-row').filter({has:page.getByRole('button',{name:/Genesis 1:1/})}).first();
 await expect(row).toBeVisible();
 await row.locator('> button').click();
 await expect(page.locator('#atlas-preview-ref')).toHaveText('Genesis 1:1');
 await expect(page.locator('#atlas-preview-content')).toContainText('Genesis 1:1 in ESV');
 await expect(page.locator('#graph-current')).toHaveText('John 1:1');
 await row.locator('.atlas-evidence-detail > summary').click();
 await row.getByRole('button',{name:'Compare passages side by side'}).click();
 await expect(page.locator('#graph-details #atlas-compare')).toBeVisible();
 await expect(page.locator('#atlas-compare [data-compare="left-passage"]')).toContainText('Synthetic browser fixture');
 await page.locator('#atlas-compare [data-compare="close"]').click();
 const compact=await page.evaluate(()=>matchMedia('(max-width:850px)').matches);
 if(compact)await page.locator('#graph-details-close').click();
 else await page.locator('#graph-details-toggle').click();
 await expect(page.locator('#graph-details-toggle')).toHaveAttribute('aria-expanded','false');
 await expect(page.locator('#graph-details')).toBeHidden();
 const dimensions=await page.locator('#graph-canvas').boundingBox();
 expect(dimensions.width).toBeGreaterThan(200);
 expect(dimensions.height).toBeGreaterThan(120);
 await page.locator('#graph-details-toggle').click();await showDetails(page);
 await page.locator('#graph-fullscreen').click();
 await expect(page.locator('#graph-fullscreen')).toHaveAttribute('aria-pressed','false');
 await expect(page.locator('#graph-panel #atlas-preview-panel')).toHaveCount(1);
 await expect(page.locator('#view-connections > #atlas-compare')).toHaveCount(1);
 await expect(page.locator('#atlas-preview-ref')).toHaveText('Genesis 1:1');
});

test('immersive Atlas exits on Escape or when navigating to the reader',async({page})=>{
 await open(page,'connections','John 1:1');
 await enterImmersive(page);
 await page.keyboard.press('Escape');
 await expect(page.locator('#graph-fullscreen')).toHaveAttribute('aria-pressed','false');
 await expect(page.locator('#graph-panel #atlas-preview-panel')).toHaveCount(1);
 await enterImmersive(page);await showDetails(page);
 await page.locator('#graph-read').click();
 await expect(page.locator('#view-reader')).toBeVisible();
 await expect(page.locator('#reader-title')).toHaveText('John 1:1');
 await expect(page.locator('#graph-fullscreen')).toHaveAttribute('aria-pressed','false');
 await navigate(page,'connections');
 await expect(page.locator('#graph-panel #atlas-preview-panel')).toHaveCount(1);
});
