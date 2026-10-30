import {test,expect,open} from './fixtures.mjs';

test('all five city dossiers show substantive Scripture-first interpretation with sources',async({page})=>{
 await open(page,'city-studies');
 const root=page.locator('[data-city-studies]');
 await expect(root).toHaveAttribute('data-ready','true');
 const cities=[
  ['Jerusalem','What the excavated city can date'],
  ['Nazareth','A first-century village, not a named family house'],
  ['Capernaum','Why the visible white synagogue is later'],
  ['Bethlehem','What the Church of the Nativity actually preserves'],
  ['Jericho','Three periods, not one excavated Jericho']
 ];
 for(const [name,topic] of cities){
  await root.locator('[data-city-select]').filter({hasText:name}).click();
  await expect(root.locator('[data-city="city-title"]')).toHaveText(name);
  const articles=root.locator('.city-study-layer');
  await expect(articles).toHaveCount(3);
  await expect(articles.nth(1).getByRole('heading',{name:topic})).toBeVisible();
  await expect(articles.nth(0)).toContainText('Evidence boundary');
  await expect(articles.nth(1).locator('.city-mini-sources a[href^="https://"]').first()).toBeVisible();
  await expect(articles.nth(2).locator('.city-study-layer-refs button').first()).toBeVisible();
 }
 await expect(root.locator('[data-city="city-title"]')).toHaveText('Jericho');
 await expect(root.locator('[data-city="study-layers"]')).toContainText('tentative listing');
});

test('corrected Nazareth excavation date and independent evidence limitations are visible',async({page})=>{
 await open(page,'city-studies');
 const root=page.locator('[data-city-studies]');
 await expect(root).toHaveAttribute('data-ready','true');
 await root.locator('[data-city-select]').filter({hasText:'Nazareth'}).click();
 const material=root.locator('.city-study-layer').nth(1);
 await expect(material).toContainText('2020');
 await expect(material).toContainText('do not identify Mary, Joseph or Jesus');
 const link=material.getByRole('link',{name:/The Settlement History of Nazareth/});
 await expect(link).toHaveAttribute('href','https://publications.iaa.org.il/atiqot/vol98/iss1/3/');
 await expect(link).toHaveAttribute('rel','noopener noreferrer');
 await expect(root.locator('[data-city="references"]')).toContainText('2020');
});
