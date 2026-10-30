import {test,expect,open} from './fixtures.mjs';

test('twenty person trails provide reading context, reflection and sixty Bible links',async({page})=>{
 await open(page,'journeys');
 const links=page.locator('#person-trail-list .person-trail-card');
 await expect(links).toHaveCount(20);
 await links.first().getByRole('button').click();
 await expect(page.locator('#view-entities')).toBeVisible();
 const detail=page.locator('.entity-detail');
 await expect(detail.locator('.entity-trail-context')).toBeVisible();
 await expect(detail).toContainText('Read the person\'s story in context');
 await expect(detail).toContainText('Compare the texts');
 await expect(detail).toContainText('Question for reflection');
 await expect(detail.locator('.entity-trail-further-row')).toHaveCount(3);
 await detail.locator('.entity-trail-further-row').first().getByRole('button',{name:'Read'}).click();
 await expect(page.locator('#view-reader')).toBeVisible();
});

test('six guided journals expose distinct context guides without changing reading navigation',async({page})=>{
 await open(page,'journeys');
 const cards=page.locator('#all-journeys .journey-card');
 await expect(cards).toHaveCount(6);
 for(const index of [0,1,2,3,4,5]){
  await cards.nth(index).click();
  const guide=page.locator('.journal-editorial-guide');
  await expect(guide).toBeVisible();
  await expect(guide.locator('h3')).toHaveText('Reading this journal in context');
  await expect(guide).toContainText('Important distinction');
  await expect(guide).toContainText('Study method');
  await expect(page.locator('.journal-chapter')).toHaveCount(6);
  await expect(page.locator('.journal-intro-count')).toContainText('Approx.');
 }
});
