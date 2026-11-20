import {test,expect,open} from './fixtures.mjs';

test('Hebrew OT and Peshitta Syriac NT appear alongside untouched English text',async({page})=>{
 await open(page,'reader','Genesis 1:1');
 const old=page.locator('#passage-content');
 await expect(old.locator('.parallel-english')).toContainText('Synthetic browser fixture for Genesis 1:1 in ESV');
 await expect(old.locator('.original-verse-text[lang="he"]')).toContainText(/[\u0590-\u05ff]/);
 await expect(old.locator('.original-scripture-heading')).toContainText('Westminster Leningrad Codex');
 await page.goto('/?view=reader&ref=John%201%3A1&translation=NIV');
 await expect(page.locator('#reader-translation')).toHaveValue('NIV');
 const nt=page.locator('#passage-content');
 await expect(nt.locator('.parallel-english')).toContainText('Synthetic browser fixture for John 1:1 in NIV');
 await expect(nt.locator('.original-verse-text[lang="syc"]')).toContainText(/[\u0700-\u074f]/);
 await expect(nt.locator('.original-scripture-heading')).toContainText('Peshitta');
});

test('the Syriac later-canon note distinguishes five NT books',async({page})=>{
 await open(page,'reader','Revelation 1:1');
 await expect(page.locator('#passage-content .original-verse-text[lang="syc"]')).toContainText(/[\u0700-\u074f]/);
 await expect(page.locator('#passage-content .original-edition-note')).toContainText('outside the traditional 22-book Peshitta canon');
});

test('original-language text appears in the Atlas preview without changing its English source',async({page})=>{
 await open(page,'connections','John 1:1');
 await expect(page.locator('#atlas-preview-content .original-verse-text[lang="syc"]')).toContainText(/[\u0700-\u074f]/);
 await expect(page.locator('#atlas-preview-content .parallel-english')).toContainText('Synthetic browser fixture for John 1:1 in ESV');
});

test('hover Scripture preview also contains the local original-language passage',async({page,isMobile})=>{
 test.skip(isMobile,'Mobile citation shortcut opens the reader directly');
 await open(page,'discover','John 1:1');
 const ref=page.locator('.hero-examples [data-open="Genesis 1:1"] .scripture-preview-trigger');
 await expect(ref).toBeVisible();
 await ref.hover();
 await expect(page.locator('[data-preview-text]')).toContainText('Synthetic browser fixture for Genesis 1:1 in ESV');
 await expect(page.locator('.scripture-preview [data-preview-original] .original-verse-text[lang="he"]')).toContainText(/[\u0590-\u05ff]/);
});
