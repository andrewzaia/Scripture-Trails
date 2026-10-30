import {test,expect,open,navigate,notebook} from './fixtures.mjs';
import {PATHS} from '../../public/assets/studies.js';
import {PERSON_TRAILS} from '../../public/assets/person-trails.js';

test('all six guided journal permalinks load their own six-stage reading pathway',async({page})=>{
 for(const journal of PATHS){
  await page.goto('/?view=journeys&journey='+encodeURIComponent(journal.id)+'&translation=ESV');
  await expect(page.locator('#view-journeys')).toBeVisible();
  await expect(page.locator('#journey-detail h2')).toHaveText(journal.name);
  await expect(page.locator('#journey-detail .journal-chapter')).toHaveCount(6);
  await expect(page.locator('#journey-detail .journal-intro-count')).toContainText('Approx. '+journal.time);
  await expect(page.locator('#journey-detail .reading-plan')).toContainText('Your reading progress');
 }
 await page.goto('/?view=journeys&journey=not-a-journal&translation=ESV');
 await expect(page.locator('#view-journeys')).toBeVisible();
 await expect(page.locator('#journey-detail')).toBeHidden();
 await expect(page.locator('#all-journeys .journey-card')).toHaveCount(6);
});

test('journal selection survives reload and reader Back/Forward, while saved progress is retained',async({page})=>{
 await open(page,'journeys');
 await expect(page.locator('#journey-detail')).toBeHidden();
 await page.locator('#all-journeys .journey-card').first().click();
 await expect(page).toHaveURL(/view=journeys.*journey=creation/);
 await expect(page.locator('#journey-detail h2')).toHaveText(PATHS[0].name);
 await page.reload();
 await expect(page.locator('#journey-detail h2')).toHaveText(PATHS[0].name);
 await page.locator('#journey-detail .reading-plan-checklist summary').click();
 await page.locator('#journey-detail .reading-plan-checklist input[type=checkbox]').first().check();
 await expect(page.locator('#journey-detail .reading-plan')).toContainText('1 of '+PATHS[0].refs.length+' passages marked read');
 expect((await notebook(page)).readingPlans.creation).toEqual([PATHS[0].refs[0]]);
 await page.reload();
 await expect(page.locator('#journey-detail .reading-plan')).toContainText('1 of '+PATHS[0].refs.length+' passages marked read');
 await page.locator('#journey-detail .reading-plan button').filter({hasText:'Resume next unread passage'}).click();
 await expect(page.locator('#view-reader')).toBeVisible();
 await expect(page.locator('#reader-title')).toHaveText(PATHS[0].refs[1]);
 await expect(page).not.toHaveURL(/journey=creation/);
 await page.goBack();
 await expect(page.locator('#journey-detail h2')).toHaveText(PATHS[0].name);
 await expect(page.locator('#journey-detail .reading-plan')).toContainText('1 of '+PATHS[0].refs.length+' passages marked read');
 await page.goForward();
 await expect(page.locator('#reader-title')).toHaveText(PATHS[0].refs[1]);
});

test('person trails open from guided discovery and Back restores selected journal',async({page})=>{
 await page.goto('/?view=journeys&journey=messiah&translation=ESV');
 await expect(page.locator('#journey-detail h2')).toHaveText(PATHS[1].name);
 await page.locator('#person-trail-search').fill('Ruth');
 await expect(page.locator('#person-trail-list .person-trail-card')).toHaveCount(1);
 await page.locator('#person-trail-list .person-trail-card button').click();
 await expect(page.locator('#view-entities')).toBeVisible();
 await expect(page).toHaveURL(/view=entities.*type=person.*id=ruth-moabite/);
 await expect(page.locator('[data-entity="detail"] h2')).toContainText('Ruth');
 await page.goBack();
 await expect(page.locator('#view-journeys')).toBeVisible();
 await expect(page.locator('#journey-detail h2')).toHaveText(PATHS[1].name);
 await expect(page).toHaveURL(/journey=messiah/);
});

test('all twenty person trails have distinct indexed identities and usable passages',async({page})=>{
 await page.goto('/?view=entities&type=person&id=jesus&translation=ESV');
 await expect(page.locator('#view-entities')).toBeVisible();
 await expect(page.locator('[data-entity="detail"] h2')).toBeVisible();
 for(const trail of PERSON_TRAILS){
  await page.goto('/?view=entities&type=person&id='+encodeURIComponent(trail.personId)+'&translation=ESV');
  await expect(page.locator('#view-entities')).toBeVisible();
  await expect(page.locator('[data-entity="detail"] h2')).not.toHaveText('Choose an entry');
  await expect(page.locator('[data-entity="detail"]')).toContainText('Follow this person');
  await expect(page.locator('[data-entity="detail"] .entity-trail-further-row')).toHaveCount(trail.study.furtherRefs.length);
 }
 await page.locator('[data-entity="detail"] .entity-trail-further-row').first().getByRole('button',{name:'Read'}).click();
 await expect(page.locator('#view-reader')).toBeVisible();
 await expect(page.locator('#reader-title')).toHaveText(PERSON_TRAILS.at(-1).study.furtherRefs[0]);
});
