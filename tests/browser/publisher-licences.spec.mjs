import {test,expect,open} from './fixtures.mjs';

test('Atlas side-by-side NIV readings retain a direct Biblica link beside both quotations',async({page})=>{
 await open(page,'connections','Isaiah 9:6');
 const row=page.locator('.atlas-reference-row').filter({has:page.getByText('Luke 2:11',{exact:true})});
 await row.getByText('Why these passages connect',{exact:true}).click();
 await row.getByRole('button',{name:'Compare passages side by side'}).click();
 const panel=page.locator('#atlas-compare');
 await expect(panel).toBeVisible();
 await panel.locator('[data-compare="edition"]').selectOption('NIV');
 await expect(panel.locator('[data-compare="left-status"]')).toContainText('NIV via API.Bible');
 await expect(panel.locator('[data-compare="right-status"]')).toContainText('NIV via API.Bible');
 for(const side of ['left','right']){
  const credit=panel.locator('[data-compare="'+side+'-copyright"]');
  await expect(credit).toContainText('Biblica');
  await expect(credit.getByRole('link',{name:'Biblica, Inc. - publisher information'})).toHaveAttribute('href','https://www.biblica.com/');
  await expect(credit.getByRole('link',{name:'Biblica, Inc. - publisher information'})).toHaveAttribute('rel','noopener noreferrer');
 }
 await panel.locator('[data-compare="edition"]').selectOption('NASB20');
 for(const side of ['left','right']){
  const credit=panel.locator('[data-compare="'+side+'-copyright"]');
  await expect(credit.getByRole('link',{name:'The Lockman Foundation - publisher information'})).toHaveAttribute('href','https://www.lockman.org/');
 }
});

test('About describes non-commercial academic use and links public publisher terms',async({page})=>{
 await open(page,'about');
 await expect(page.getByRole('heading',{name:'Publisher permissions and review status'})).toBeVisible();
 const about=page.locator('#view-about');
 await expect(about).toContainText('Scripture Trails is a non-commercial academic Bible-study website');
 await expect(about).toContainText('does not provide a downloadable translation corpus');
 await expect(about.getByRole('link',{name:'Biblica permissions'})).toHaveAttribute('href','https://www.biblica.com/permissions/');
});
