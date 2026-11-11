import {test,expect,open} from './fixtures.mjs';
import AxeBuilder from '@axe-core/playwright';

test('world heat map loads from local data and updates alongside incident filters',async({page})=>{
 await open(page,'christian-persecution');
 const map=page.locator('[data-pc-map]');
 await expect(map).toHaveAttribute('data-ready','true');
 await expect(page.locator('[data-pc-map-summary]')).toContainText('166 matching reports across 26 countries');
 await expect(page.locator('[data-pc-map-summary]')).toContainText('39 are counted at country level only');
 await expect(page.locator('.pc-country[data-level="5"]').first()).toBeAttached();
 await expect(page.locator('.pc-map-marker').first()).toBeAttached();
 await page.locator('[data-pc-country]').selectOption('France');
 await expect(page.locator('[data-pc-map-summary]')).toContainText('across 1 countries');
 await page.locator('[data-pc-map-layer]').selectOption('countries');
 await expect(page.locator('.pc-map-marker')).toHaveCount(0);
 await page.locator('[data-pc-map-layer]').selectOption('combined');
 await expect(page.locator('.pc-map-marker').first()).toBeAttached();
 await page.locator('[data-pc-map-reset]').click();
 await expect(page.locator('[data-pc-country]')).toHaveValue('');
 await expect(page.locator('[data-pc-map-layer]')).toHaveValue('combined');
 await expect(page.locator('[data-pc-map-summary]')).toContainText('166 matching reports across 26 countries');
});

test('country keyboard selection filters reports and map controls are accessible',async({page},testInfo)=>{
 if(testInfo.project.name==='desktop-firefox')test.setTimeout(120000);
 await open(page,'christian-persecution');
 await expect(page.locator('[data-pc-map]')).toHaveAttribute('data-ready','true');
 const france=page.locator('.pc-country[aria-label^="France:"]');
 await expect(france).toHaveCount(1);
 await france.focus();
 await page.keyboard.press('Enter');
 await expect(page.locator('[data-pc-country]')).toHaveValue('France');
 await expect(page.locator('[data-pc-map-summary]')).toContainText('across 1 countries');
 await page.locator('[data-pc-map-layer]').selectOption('localities');
 await page.locator('[data-pc-map-reset]').click();
 await expect(page.locator('[data-pc-country]')).toHaveValue('');
 await expect(page.locator('[data-pc-map-layer]')).toHaveValue('combined');
 await expect(page.locator('[data-pc-map-summary]')).toContainText('166 matching reports across 26 countries');
 const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
 expect(audit.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
});

test('map reset clears locality and active catalogue filters without scrolling to the filter form',async({page})=>{
 await open(page,'christian-persecution');
 await expect(page.locator('[data-pc-map]')).toHaveAttribute('data-ready','true');
 await page.locator('[data-pc-year]').selectOption('2026');
 await page.locator('[data-pc-map-layer]').selectOption('localities');
 await page.locator('.pc-map-marker').first().click();
 await expect(page.locator('[data-pc-country]')).not.toHaveValue('');
 await page.locator('[data-pc-map-reset]').click();
 await expect(page.locator('[data-pc-year]')).toHaveValue('');
 await expect(page.locator('[data-pc-country]')).toHaveValue('');
 await expect(page.locator('[data-pc-search]')).toHaveValue('');
 await expect(page.locator('[data-pc-map-layer]')).toHaveValue('combined');
 await expect(page.locator('[data-pc-map-summary]')).toContainText('166 matching reports across 26 countries');
});
