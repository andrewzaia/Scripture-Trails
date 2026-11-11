import {readFileSync} from 'node:fs';
import {aggregateIncidentLocations} from '../../public/assets/christian-heatmap.js';
const json=path=>JSON.parse(readFileSync(new URL('../../public/data/'+path,import.meta.url),'utf8'));
const reportData=json('christian-persecution.json').reports;
const geoData=json('christian-heatmap-places.json');
const totals=aggregateIncidentLocations(reportData,geoData);
const overall=totals.reportCount+' matching reports across '+totals.countries.size+' countries';
const ausTotal=(totals.countries.get('Australia')||0)+' matching reports across 1 countries';
const oldAus=reportData.filter(x=>x.country==='Australia'&&x.date.startsWith('1999')).length+' matching reports across 1 countries';
import {test,expect,open} from './fixtures.mjs';
import AxeBuilder from '@axe-core/playwright';

test('world heat map loads from local data and updates alongside incident filters',async({page})=>{
 await open(page,'christian-persecution');
 const map=page.locator('[data-pc-map]');
 await expect(map).toHaveAttribute('data-ready','true');
 await expect(page.locator('[data-pc-map-summary]')).toContainText(overall);
 await expect(page.locator('[data-pc-map-summary]')).toContainText(totals.withoutLocality+' are counted at country level only');
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
 await expect(page.locator('[data-pc-map-summary]')).toContainText(overall);
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
 await expect(page.locator('[data-pc-map-summary]')).toContainText(overall);
 const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
 expect(audit.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
});

test('map reset clears locality and active catalogue filters without scrolling to the filter form',async({page})=>{
 await open(page,'christian-persecution');
 await expect(page.locator('[data-pc-map]')).toHaveAttribute('data-ready','true');
 await page.locator('[data-pc-year]').selectOption('2026');
 await page.locator('[data-pc-map-layer]').selectOption('localities');
 const marker=page.locator('.pc-map-marker').first();
 await marker.focus();
 await page.keyboard.press('Enter');
 await expect(page.locator('[data-pc-country]')).not.toHaveValue('');
 await page.locator('[data-pc-map-reset]').click();
 await expect(page.locator('[data-pc-year]')).toHaveValue('');
 await expect(page.locator('[data-pc-country]')).toHaveValue('');
 await expect(page.locator('[data-pc-search]')).toHaveValue('');
 await expect(page.locator('[data-pc-map-layer]')).toHaveValue('combined');
 await expect(page.locator('[data-pc-map-summary]')).toContainText(overall);
});

test('Australia and historical years appear in the interactive report map',async({page})=>{
 await open(page,'christian-persecution');
 await expect(page.locator('[data-pc-map]')).toHaveAttribute('data-ready','true');
 await page.locator('[data-pc-country]').selectOption('Australia');
 await expect(page.locator('[data-pc-map-summary]')).toContainText(ausTotal);
 await page.locator('[data-pc-year]').selectOption('1999');
 await expect(page.locator('[data-pc-map-summary]')).toContainText(oldAus);
 await expect(page.locator('.persecution-case').first()).toContainText('1999');
 await page.locator('[data-pc-map-reset]').click();
 await expect(page.locator('[data-pc-map-summary]')).toContainText(overall);
 await page.locator('[data-pc-year]').selectOption('1997');
 await expect(page.locator('.persecution-case').first()).toContainText('Shantinagar');
});

test('incident cards display consistent locally hosted media and the renamed section',async({page})=>{
 await open(page,'christian-persecution');
 await expect(page.locator('#view-christian-persecution .page-heading h1')).toContainText('Christian persecution');
 const first=page.locator('.persecution-case').first();
 const image=first.locator('.persecution-card-media img');
 await expect(image).toBeVisible();
 await expect(image).toHaveAttribute('src',/^\/assets\/persecution-media\/[a-z0-9-]+\.svg\?v=\d+\.\d+\.\d+$/);
 await expect(first.locator('.persecution-card-media figcaption')).toContainText('Not incident photography');
 const loaded=await image.evaluate(img=>img.complete&&img.naturalWidth>0);
 expect(loaded).toBe(true);
});
