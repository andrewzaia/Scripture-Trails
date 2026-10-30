import {test,expect,open} from './fixtures.mjs';

test('new citation reviews are reachable from About and the Atlas with accurate coverage',async({page})=>{
 await open(page,'about');
 await expect(page.locator('#about-review-meter')).toHaveAttribute('value','161');
 await expect(page.locator('#citation-review-summary')).toContainText('161 selected passage comparisons');
 await expect(page.locator('#citation-review-summary')).toContainText('161 comparisons include named scholarly commentary');
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

test('Acts retelling and single-vision reviews retain their limits from About into the Atlas',async({page})=>{
 await open(page,'about');
 const group=page.locator('.citation-review-group').filter({has:page.getByText('Selected passage comparisons',{exact:true})});
 await group.locator('> summary').click();
 const vision=group.locator('article').filter({has:page.getByRole('heading',{name:'Revelation 21:1 and Revelation 21:4 within one vision',exact:true})});
 await vision.locator('.citation-review > summary').click();
 await expect(vision).toContainText('These anchors belong to one passage, not two independent accounts');
 await expect(vision.getByRole('link',{name:'Revelation 21 - USCCB',exact:true})).toBeVisible();
 await expect(vision.getByRole('link',{name:'Revelation 21 - ESV',exact:true})).toBeVisible();
 const article=group.locator('article').filter({has:page.getByRole('heading',{name:'Acts 9:1-19 and Acts 22:6-16',exact:true})});
 await article.locator('.citation-review > summary').click();
 await expect(article).toContainText("The companions' hearing is described differently");
 await article.getByRole('link',{name:'Open in Atlas',exact:true}).click();
 await expect(page.locator('#graph-current')).toHaveText('Acts 9:3');
 const row=page.locator('.atlas-reference-row').filter({has:page.getByText('Acts 22:6',{exact:true})});
 await row.getByText('Why these passages connect',{exact:true}).click();
 await row.locator('.citation-review > summary').click();
 await expect(row).toContainText('Raj Nadella');
 await expect(row).toContainText('not silently harmonised');
 await expect(row.getByRole('link',{name:'Commentary on Acts 9:1-6 [7-20]',exact:true})).toBeVisible();
});

test('completed register retains siege dates and returnee differences from About into the Atlas',async({page})=>{
 await open(page,'about');
 await expect(page.locator('#about-review-meter')).toHaveAttribute('value','161');
 await expect(page.locator('#citation-review-summary')).toContainText('The original 115 explained pairs retain their earlier dated assessments');
 await expect(page.locator('#citation-review-summary')).toContainText('32 previously passage-based assessments have dated commentary follow-ups');
 const group=page.locator('.citation-review-group').filter({has:page.getByText('Selected passage comparisons',{exact:true})});
 await group.locator('> summary').click();
 const siege=group.locator('article').filter({has:page.getByRole('heading',{name:'2 Kings 25:1-12 and Jeremiah 52:4-16',exact:true})});
 await siege.locator('.citation-review > summary').click();
 await expect(siege).toContainText('seventh day in 2 Kings 25:8 and the tenth in Jeremiah 52:12');
 await expect(siege).toContainText('a proposed multi-day sequence is not established here');
 const list=group.locator('article').filter({has:page.getByRole('heading',{name:'Ezra 2:1-70 and Nehemiah 7:5-73',exact:true})});
 await list.locator('.citation-review > summary').click();
 await expect(list).toContainText('Arah has 775 in Ezra 2:5 and 652 in Nehemiah 7:10');
 await list.getByRole('link',{name:'Open in Atlas',exact:true}).click();
 await expect(page.locator('#graph-current')).toHaveText('Ezra 2:1');
 const row=page.locator('.atlas-reference-row').filter({has:page.getByText('Nehemiah 7:6',{exact:true})});
 await row.getByText('Why these passages connect',{exact:true}).click();
 await row.locator('.citation-review > summary').click();
 await expect(row).toContainText('Russell Meek');
 await expect(row).toContainText('Arah has 775 in Ezra 2:5 and 652 in Nehemiah 7:10');
 await expect(row).toContainText('No full literature review or independent specialist signoff');
 await expect(row.getByRole('link',{name:'Nehemiah - selected commentary',exact:true})).toBeVisible();
});

test('commentary follow-up retains a competing intertext from About into the Atlas',async({page})=>{
 await open(page,'about');
 await expect(page.locator('#citation-review-summary')).toContainText('All assessed pairs have at least one scoped secondary citation');
 const group=page.locator('.citation-review-group').filter({has:page.getByText('Selected passage comparisons',{exact:true})});
 await group.locator('> summary').click();
 const article=group.locator('article').filter({has:page.getByRole('heading',{name:'Genesis 3:14-15 and Romans 16:17-20',exact:true})});
 await article.locator('.citation-review > summary').click();
 await expect(article).toContainText('A proposed echo remains an editorial interpretation');
 await expect(article.getByRole('heading',{name:'Commentary follow-up',exact:true})).toBeVisible();
 await expect(article).toContainText('instead relates the defeat language to Psalm 110:1');
 await article.getByRole('link',{name:'Open in Atlas',exact:true}).click();
 await expect(page.locator('#graph-current')).toHaveText('Genesis 3:15');
 const row=page.locator('.atlas-reference-row').filter({has:page.getByText('Romans 16:20',{exact:true})});
 await row.getByText('Why these passages connect',{exact:true}).click();
 await row.locator('.citation-review > summary').click();
 await expect(row).toContainText('does not affirm a Genesis 3:15 echo');
 await expect(row).toContainText('Follow-up reviewed 2026-10-29');
 await expect(row.getByRole('link',{name:'Romans - selected commentary',exact:true})).toHaveAttribute('href','https://www.thegospelcoalition.org/commentary/Romans/');
});

test('indexed-only commentary discloses its access limit alongside the original lament warning',async({page})=>{
 await open(page,'about');
 const group=page.locator('.citation-review-group').filter({has:page.getByText('Selected passage comparisons',{exact:true})});
 await group.locator('> summary').click();
 const article=group.locator('article').filter({has:page.getByRole('heading',{name:'Psalm 22:1-5 and Matthew 27:45-50',exact:true})});
 await article.locator('.citation-review > summary').click();
 await expect(article).toContainText('Keep the lament audible');
 await expect(article).toContainText('Douglas Sean O\'Donnell');
 await expect(article).toContainText('search-indexed excerpts');
 await expect(article).toContainText('HTTP 403');
 await expect(article.getByRole('link',{name:'Matthew - selected indexed commentary',exact:true})).toHaveAttribute('href','https://www.thegospelcoalition.org/commentary/matthew/');
});

test('twelve new biblical quotation assessments are available from About with named accessible source links',async({page})=>{
 await open(page,'about');
 await expect(page.locator('#about-review-meter')).toHaveAttribute('value','161');
 await expect(page.locator('#citation-review-summary')).toContainText('0 remain pending');
 const group=page.locator('.citation-review-group').filter({has:page.getByText('Selected passage comparisons',{exact:true})});
 await group.locator('> summary').click();
 for(const [title,author] of [
  ['Genesis 2:2 and Hebrews 4:4','Dennis Johnson'],
  ['Habakkuk 2:4 and Romans 1:17','Donny Ray Mathis'],
  ['Deuteronomy 6:4 and Mark 12:29','Mark L. Strauss']
 ]){
  const article=group.locator('article').filter({has:page.getByRole('heading',{name:title,exact:true})});
  await article.locator('.citation-review > summary').click();
  await expect(article).toContainText(author);
  await expect(article).toContainText('independent specialist');
  await expect(article.locator('.citation-review a[href^="https://"]')).toHaveCount(3);
 }
});


test('final sensitive quotation reviews are available with textual cautions and original sources',async({page})=>{
 await open(page,'about');
 await expect(page.locator('#about-review-meter')).toHaveAttribute('value','161');
 await expect(page.locator('#citation-review-summary')).toContainText('46 have dated assessments and 0 remain pending');
 const group=page.locator('.citation-review-group').filter({has:page.getByText('Selected passage comparisons',{exact:true})});
 await group.locator('> summary').click();
 for(const [title,required] of [
  ['Hosea 11:1 and Matthew 2:15','does not literally predict'],
  ['Amos 9:11 and Acts 15:16','Edom'],
  ['Exodus 12:46 and John 19:36','Psalm 34:20']
 ]){
  const article=group.locator('article').filter({has:page.getByRole('heading',{name:title,exact:true})});
  await article.locator('.citation-review > summary').click();
  await expect(article).toContainText(required);
  await expect(article.locator('.citation-review a[href^="https://"]')).toHaveCount(3);
 }
});
