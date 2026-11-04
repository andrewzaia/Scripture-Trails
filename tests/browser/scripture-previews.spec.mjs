import {test,expect,open} from './fixtures.mjs';

test('ESV reference preview appears only after interacting with its citation and opens the reader',async({page,isMobile})=>{
 const requests=[];
 await page.route('**/api/passage?**',async route=>{
  const url=new URL(route.request().url()),q=url.searchParams.get('q');
  requests.push(q);
  await route.fulfill({json:{canonical:q,passages:['<p>Synthetic ESV preview for '+q+'.</p>']}});
 });
 await open(page,'discover','John 3:16');
 const reference=page.locator('.hero-examples [data-open="Genesis 1:1"] .scripture-preview-trigger');
 await expect(reference).toBeVisible();
 await expect(reference).toHaveAttribute('data-scripture-preview','Genesis 1:1');
 await expect(page.locator('.scripture-preview')).toBeHidden();
 if(isMobile)await reference.tap();
 else await reference.hover();
 await expect(page.locator('.scripture-preview')).toBeVisible();
 await expect(page.locator('[data-preview-text]')).toContainText('Synthetic ESV preview for Genesis 1:1');
 expect(requests).toEqual(['Genesis 1:1']);
 await page.locator('[data-preview-read]').click();
 await expect(page.locator('#view-reader')).toBeVisible();
 await expect(page.locator('#reader-title')).toHaveText('Genesis 1:1');
});

test('reopening the same citation reuses the in-memory ESV result',async({page,isMobile})=>{
 let requests=0;
 await page.route('**/api/passage?**',async route=>{
  requests++;
  await route.fulfill({json:{passages:['<p>Temporary synthetic test passage.</p>']}});
 });
 await open(page,'discover');
 const reference=page.locator('.hero-examples [data-open="Psalm 23:1"] .scripture-preview-trigger');
 await expect(reference).toBeVisible();
 if(isMobile)await reference.tap();else await reference.hover();
 await expect(page.locator('[data-preview-text]')).toContainText('Temporary synthetic test passage.');
 await page.locator('[data-preview-close]').click();
 if(isMobile)await reference.tap();else {await page.mouse.move(0,0);await reference.hover();}
 await expect(page.locator('[data-preview-text]')).toContainText('Temporary synthetic test passage.');
 expect(requests).toBe(1);
});

test('long citations preview only a short passage and keep full reading target',async({page,isMobile})=>{
 const references=[];
 await page.route('**/api/passage?**',async route=>{
  const ref=new URL(route.request().url()).searchParams.get('q');references.push(ref);
  await route.fulfill({json:{passages:['<p>Short synthetic excerpt.</p>']}});
 });
 await open(page,'discover');
 await page.evaluate(()=>{
  const node=document.createElement('p');node.id='preview-range-test';node.textContent='Study Romans 8:28-39 closely.';
  document.querySelector('#view-discover .content-wrap').prepend(node);
 });
 const citation=page.locator('#preview-range-test .scripture-preview-trigger');
 await expect(citation).toHaveAttribute('data-scripture-preview','Romans 8:28-39');
 if(isMobile)await citation.tap();else await citation.hover();
 await expect(page.locator('[data-preview-text]')).toContainText('Short synthetic excerpt.');
 await expect(page.locator('[data-preview-scope]')).toContainText('First verses only');
 expect(references).toEqual(['Romans 8:28-33']);
 await page.locator('[data-preview-read]').click();
 await expect(page.locator('#reader-title')).toHaveText('Romans 8:28-39');
});
