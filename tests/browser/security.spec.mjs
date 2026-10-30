import {test,expect} from './fixtures.mjs';

test('publisher HTML never executes untrusted script or event attributes in Bible reader',async({page})=>{
 await page.addInitScript(()=>{window.__publisherCodeExecuted=false;});
 await page.route('**/api/passage?**',async route=>{
  const html='<script>window.__publisherCodeExecuted=true</script><img src=x onerror="window.__publisherCodeExecuted=true"><svg onload="window.__publisherCodeExecuted=true"></svg><a href="javascript:alert(1)">unsafe source</a><a href="https://www.esv.org/John+3:16/">Verified publisher link</a><p><span class="v">16</span> Synthetic safe passage text.</p>';
  await route.fulfill({json:{passages:[html],copyright:'Synthetic publisher copyright',fums:null}});
 });
 await page.goto('/?view=reader&ref=John%203%3A16&translation=ESV');
 await expect(page.locator('#passage-status')).toHaveText('Official ESV text');
 await expect(page.locator('#passage-content')).toContainText('Synthetic safe passage text.');
 await expect(page.locator('#passage-content script,#passage-content img,#passage-content svg')).toHaveCount(0);
 await expect(page.locator('#passage-content a[href^="javascript:"]')).toHaveCount(0);
 await expect(page.locator('#passage-content a[href="https://www.esv.org/John+3:16/"]')).toHaveCount(1);
 expect(await page.evaluate(()=>window.__publisherCodeExecuted)).toBe(false);
});

test('without opt-in, analytics and FUMS tracking scripts do not execute in the site origin',async({page})=>{
 await page.goto('/?view=reader&ref=John%203%3A16&translation=ESV');
 await expect(page.locator('#passage-status')).toHaveText('Official ESV text');
 const scripts=await page.locator('script[src]').evaluateAll(xs=>xs.map(x=>x.getAttribute('src')));
 expect(scripts.every(s=>!s.includes('fumsV3')&&!s.includes('fumsv2')&&!s.includes('googletagmanager'))).toBe(true);
});
