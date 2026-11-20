import {test,expect,open} from './fixtures.mjs';

test('keyword Scripture search includes Syriac original beside the matching English snippet',async({page})=>{
 await page.route('**/api/search?**',route=>route.fulfill({json:{
  total_results:1,results:[{reference:'John 1:1',content:'Synthetic ESV keyword search result.'}]
 }}));
 await open(page,'discover');
 await page.locator('#passage-input').fill('word');
 await page.locator('#passage-input').press('Enter');
 await expect(page.locator('#passage-content .search-result')).toContainText('Synthetic ESV keyword search result.');
 await expect(page.locator('#passage-content .search-result .original-verse-text[lang="syc"]')).toContainText(/[\u0700-\u074f]/);
});
