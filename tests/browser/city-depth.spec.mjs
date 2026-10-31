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

test('Cana comparison changes archaeological sources with highlighted candidate',async({page})=>{
 await open(page,'city-studies');
 const root=page.locator('[data-city-studies]');
 await expect(root).toHaveAttribute('data-ready','true');
 const tabs=root.locator('[data-city="debate-tabs"]');
 await tabs.getByRole('button',{name:'Cana of Galilee'}).click();
 const list=root.locator('[data-city="debate-list"]');
 await expect(list.locator('.city-debate-candidate')).toHaveCount(2);
 await list.locator('.city-debate-candidate').nth(0).getByRole('button',{name:'Highlight on comparison map'}).click();
 const sources=root.locator('[data-city="debate-sources"]');
 await expect(sources).toContainText('Karm er-Ras');
 await expect(sources).toContainText('Cana location proposals and ancient names');
 await expect(sources).not.toContainText('Qana (Khirbet Qana): synagogue excavation');
 await list.locator('.city-debate-candidate').nth(1).getByRole('button',{name:'Highlight on comparison map'}).click();
 await expect(sources).toContainText('Qana (Khirbet Qana): synagogue excavation');
 await expect(sources).not.toContainText('Karm er-Ras');
 await expect(root.locator('[data-city="debate-desc"]')).toContainText('Neither candidate is established');
 const site=sources.getByRole('link',{name:'Qana (Khirbet Qana): synagogue excavation and bibliography'});
 await expect(site).toHaveAttribute('href','https://synagogues.kinneret.ac.il/synagogues/qana/');
 await expect(site).toHaveAttribute('rel','noopener noreferrer');
 await expect(sources).toContainText('Cana location proposals and ancient names');
});

test('Bethsaida comparison displays evidence from both excavation teams without claiming consensus',async({page})=>{
 await open(page,'city-studies');
 const root=page.locator('[data-city-studies]');
 await expect(root).toHaveAttribute('data-ready','true');
 await root.locator('[data-city="debate-tabs"]').getByRole('button',{name:'Bethsaida / Julias'}).click();
 const list=root.locator('[data-city="debate-list"]');
 const sources=root.locator('[data-city="debate-sources"]');
 await expect(list.locator('.city-debate-candidate')).toHaveCount(2);
 await list.locator('.city-debate-candidate').nth(0).getByRole('button',{name:'Highlight on comparison map'}).click();
 await expect(sources).toContainText('Bethsaida (et-Tell): excavation interpretation');
 await expect(sources).not.toContainText('2025 Season 9');
 await list.locator('.city-debate-candidate').nth(1).getByRole('button',{name:'Highlight on comparison map'}).click();
 await expect(sources).toContainText('Bethsaida-Julias el-Araj: 2025 Season 9');
 await expect(sources).toContainText('Bethsaida-Julias el-Araj excavation, season eight');
 await expect(sources).not.toContainText('Bethsaida (et-Tell): excavation interpretation');
 await expect(root.locator('[data-city="debate-desc"]')).toContainText('identification remains contested');
 const elArajLink=sources.getByRole('link',{name:'Bethsaida-Julias el-Araj: 2025 Season 9 excavation updates'});
 await expect(elArajLink).toHaveAttribute('href','https://www.bethsaida-julias.com/updates');
 await expect(elArajLink).toHaveAttribute('rel','noopener noreferrer');
});

test('Emmaus source links follow the selected proposed location without presenting proof',async({page})=>{
 await open(page,'city-studies');
 const root=page.locator('[data-city-studies]');
 await expect(root).toHaveAttribute('data-ready','true');
 await root.locator('[data-city="debate-tabs"]').getByRole('button',{name:'Emmaus',exact:true}).click();
 const list=root.locator('[data-city="debate-list"]'),sources=root.locator('[data-city="debate-sources"]');
 await expect(list.locator('.city-debate-candidate')).toHaveCount(3);
 await expect(root.locator('[data-city="debate-desc"]')).toContainText('160 stadia');
 await list.locator('.city-debate-candidate').nth(0).getByRole('button',{name:'Highlight on comparison map'}).click();
 await expect(root.locator('[data-city="debate-active"]')).toContainText('30 and 60 stadia');
 await expect(sources).toContainText('Emmaus entry');
 await list.locator('.city-debate-candidate').nth(2).getByRole('button',{name:'Highlight on comparison map'}).click();
 await expect(root.locator('[data-city="debate-active"]')).toContainText('minority 160-stadia reading');
 await expect(sources.getByRole('link',{name:'Luke 24:13 - 60 and 160 stadia textual variants'}))
  .toHaveAttribute('href','https://bible.org/seriespage/luke-24');
 await expect(sources).toContainText('Emmaus proposed modern identifications');
});
