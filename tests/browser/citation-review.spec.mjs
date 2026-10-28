import {test,expect,open} from './fixtures.mjs';

test('new citation reviews are reachable from About and the Atlas with accurate coverage',async({page})=>{
 await open(page,'about');
 await expect(page.locator('#about-review-meter')).toHaveAttribute('value','88');
 await expect(page.locator('#citation-review-summary')).toContainText('88 selected passage comparisons');
 await expect(page.locator('#citation-review-summary')).toContainText('56 comparisons include named scholarly commentary');
 const group=page.locator('.citation-review-group').filter({has:page.getByText('Selected passage comparisons',{exact:true})});
 await group.locator('> summary').click();
 const article=group.locator('article').filter({has:page.getByRole('heading',{name:'Isaiah 9:2-7 and Luke 2:8-14',exact:true})});
 await article.locator('.citation-review > summary').click();
 await expect(article).toContainText('Luke 2 does not explicitly quote Isaiah 9:6');
 await expect(article.getByRole('link',{name:'Commentary on Isaiah 9:2-7 (2011)',exact:true})).toHaveAttribute('href',/workingpreacher\.org/);
 await article.getByRole('link',{name:'Open in Atlas',exact:true}).click();
 await expect(page.locator('#graph-current')).toHaveText('Isaiah 9:6');
 const row=page.locator('.atlas-reference-row').filter({has:page.getByText('Luke 2:11',{exact:true})});
 await row.getByText('Why these passages connect',{exact:true}).click();
 await row.locator('.citation-review > summary').click();
 await expect(row).toContainText('Patricia Tull');
 await expect(row).toContainText('independent specialist review remain open');
 await expect(row.getByRole('link',{name:'Commentary on Isaiah 9:2-7 (2011)',exact:true})).toBeVisible();
});

test('new narrative review retains differences and its citation when opened in the Atlas',async({page})=>{
 await open(page,'about');
 const group=page.locator('.citation-review-group').filter({has:page.getByText('Selected passage comparisons',{exact:true})});
 await group.locator('> summary').click();
 const article=group.locator('article').filter({has:page.getByRole('heading',{name:'2 Samuel 7:1-17 and 1 Chronicles 17:1-15',exact:true})});
 await article.locator('.citation-review > summary').click();
 await expect(article).toContainText('Chronicles omits that clause');
 await expect(article.getByRole('link',{name:'1 Chronicles - selected commentary',exact:true})).toHaveAttribute('href','https://www.thegospelcoalition.org/commentary/1-chronicles/');
 await article.getByRole('link',{name:'Open in Atlas',exact:true}).click();
 await expect(page.locator('#graph-current')).toHaveText('2 Samuel 7:1');
 const row=page.locator('.atlas-reference-row').filter({has:page.getByText('1 Chronicles 17:1',{exact:true})});
 await row.getByText('Why these passages connect',{exact:true}).click();
 await row.locator('.citation-review > summary').click();
 await expect(row).toContainText('Winfried Corduan');
 await expect(row).toContainText('Chronicles omits that clause');
 await expect(row).toContainText('independent specialist review remain open');
 await expect(row.getByRole('link',{name:'1 Chronicles - selected commentary',exact:true})).toBeVisible();
});
