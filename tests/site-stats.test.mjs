import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {siteStats,renderSiteStats} from '../scripts/site-stats.mjs';

test('About dashboard matches the real datasets and separates network size from review coverage',()=>{
 const stats=siteStats();
 assert.deepEqual(stats,{links:603076,books:66,verses:30303,people:173,trails:20,comparisons:161,pairs:301553,unexplained:301392,editions:4,studies:6,gospel:79,paul:83,reviewed:115});
 const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
 const panel=html.split('<!-- ABOUT STATS START -->\n')[1].split('\n<!-- ABOUT STATS END -->')[0];
 assert.equal(panel,renderSiteStats(stats));
 assert.ok(html.indexOf('about-stats-title')<html.indexOf('Rooted in fifteen years'));
 assert.match(panel,/reverse navigation links/);
 assert.match(panel,/independent specialist review remains open/);
 assert.match(panel,/301,553.*distinct Atlas pairs/);
 assert.match(panel,/301,392.*without written explanations/);
 assert.match(panel,/46 newer explanations await separate dated source review/);
 assert.match(panel,/<label for="about-review-meter">/);
 assert.match(panel,/<progress id="about-review-meter" value="115" max="161">/);
 assert.match(html,/id="citation-review-heading" tabindex="-1"/);
});
