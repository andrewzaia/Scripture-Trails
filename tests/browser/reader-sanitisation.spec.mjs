import {test,expect,open} from './fixtures.mjs';

test('empty publisher anchors never become unnamed reader links',async({page})=>{
 await page.route('**/api/passage?**',route=>route.fulfill({json:{
  canonical:'John 3:16',
  passages:['<p><sup class="verse-num">16</sup> Synthetic reader text, not a Bible quotation. <a class="va" href="https://www.esv.org/"></a><a href="https://www.esv.org/">Official publisher information</a><a href="https://www.esv.org/" aria-label="Publisher passage details"></a></p>']
 }}));
 await open(page,'reader','John 3:16');
 await expect(page.locator('#passage-status')).toHaveText('Official ESV text');
 await expect(page.locator('#passage-content')).toContainText('Synthetic reader text');
 await expect(page.locator('#passage-content a.va')).toHaveCount(0);
 await expect(page.locator('#passage-content a[href]')).toHaveCount(2);
 await expect(page.locator('#passage-content').getByRole('link',{name:'Official publisher information'})).toHaveAttribute('href','https://www.esv.org/');
 await expect(page.locator('#passage-content').getByRole('link',{name:'Publisher passage details'})).toHaveAttribute('aria-label','Publisher passage details');
 const unnamed=page.locator('#passage-content a[href]:not([aria-label])').filter({hasText:/^\s*$/});
 await expect(unnamed).toHaveCount(0);
});
