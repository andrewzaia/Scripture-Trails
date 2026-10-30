import {readFile} from 'node:fs/promises';
import {test,expect,open,navigate,notebook,backup,chooseBackup,passagePayload} from './fixtures.mjs';

test('reader navigation, four editions, chapter context and history',async({page})=>{
 await open(page);
 await expect(page.locator('#passage-content')).toContainText('John 3:16 in ESV');
 for(const edition of ['NASB20','NIV','NKJV','ESV']){
  await page.getByLabel('Bible translation',{exact:true}).selectOption(edition);
  await expect(page.locator('#passage-content')).toContainText(`John 3:16 in ${edition}`);
  await expect(page.locator('#reader-source-name')).toContainText(edition);
 }
 await page.locator('#read-full-chapter').click();
 await expect(page.locator('#reader-title')).toHaveText('John 3');
 await expect(page.locator('#passage-content')).toContainText('John 3 in ESV');
 await page.getByRole('button',{name:'Next chapter',exact:true}).click();
 await expect(page.locator('#reader-title')).toHaveText('John 4');
 await page.getByRole('button',{name:'Previous chapter',exact:true}).click();
 await expect(page.locator('#reader-title')).toHaveText('John 3');
 await page.goBack();
 await expect(page.locator('#reader-title')).toHaveText('John 4');
});

test('reader recovers from an unavailable edition and ignores an older response',async({page})=>{
 await open(page);
 await expect(page.locator('#passage-content')).toContainText('in ESV');
 await page.route('**/api/passage?**',async route=>{
  const url=new URL(route.request().url()),edition=url.searchParams.get('translation');
  if(edition==='NASB20'){await route.fulfill({status:503,json:{message:'Synthetic service outage'}});return;}
  if(edition==='NIV')await new Promise(resolve=>setTimeout(resolve,350));
  await route.fulfill({json:passagePayload(url.searchParams.get('q'),edition)});
 });
 await page.locator('#reader-translation').selectOption('NASB20');
 await expect(page.locator('#passage-content')).toContainText('Synthetic service outage');
 const olderResponse=page.waitForResponse(response=>response.url().includes('/api/passage?')&&new URL(response.url()).searchParams.get('translation')==='NIV');
 await page.locator('#reader-translation').selectOption('NIV');
 await page.locator('#reader-translation').selectOption('NKJV');
 await expect(page.locator('#passage-content')).toContainText('in NKJV');
 await olderResponse;
 await expect(page.locator('#passage-content')).not.toContainText('in NIV');
 await expect(page.locator('#passage-status')).toHaveText('Official NKJV text');
});

test('Atlas keyboard list previews without moving centre, then focuses and opens reader',async({page})=>{
 await open(page,'connections','John 1:1');
 const node=page.locator('#graph-details-list .atlas-reference-row > button').filter({has:page.locator('span',{hasText:/^Genesis 1:1$/})}).first();
 await expect(node).toBeVisible();
 await node.focus();await page.keyboard.press('Enter');
 await expect(page.locator('#atlas-preview-ref')).toHaveText('Genesis 1:1');
 await expect(page.locator('#atlas-preview-content')).toContainText('Genesis 1:1 in ESV');
 await expect(page.locator('#graph-current')).toHaveText('John 1:1');
 await page.locator('#atlas-preview-translation').selectOption('NIV');
 await expect(page.locator('#atlas-preview-content')).toContainText('Genesis 1:1 in NIV');
 await page.locator('#atlas-preview-focus').click();
 await expect(page.locator('#graph-current')).toHaveText('Genesis 1:1');
 await page.locator('#graph-read').click();
 await expect(page.locator('#reader-title')).toHaveText('Genesis 1:1');
 await expect(page.locator('#passage-content')).toContainText('Genesis 1:1 in NIV');
});

test('map alternatives navigate Gospel stops and an unpinned Pauline stage',async({page})=>{
 await open(page,'jesus-map');
 await expect(page.locator('[data-jesus="event-heading"]')).not.toHaveText('Journey event');
 await page.locator('[data-jesus="place"]').selectOption('capernaum');
 await expect(page.locator('[data-jesus="place-name"]')).toContainText('Capernaum');
 const visit=page.locator('[data-jesus="visits"] button').last();
 await visit.focus();await page.keyboard.press('Enter');
 await expect(page.locator('[data-jesus="visits"] [aria-current]')).toHaveCount(1);
 await navigate(page,'paul-map');
 await page.locator('[data-paul="journey"]').selectOption('all');
 const stage=page.locator('[data-paul="list"] button').filter({hasText:/no pin/i}).first();
 await stage.focus();await page.keyboard.press('Enter');
 await expect(page.locator('[data-paul="status"]')).toContainText('has no pin');
 await expect(page.locator('[data-paul="list"] [aria-current]')).toHaveCount(1);
 await page.locator('[data-paul="passages"] button').first().click();
 await expect(page.locator('#reader-title')).toHaveText(/^Acts /);
 await expect(page.locator('#passage-content')).toContainText('Synthetic browser fixture');
});

test('v1.0 roadmap shows honest scoped progress and accessible launch acceptance criteria',async({page})=>{
 await open(page,'roadmap');
 await expect(page.locator('[data-roadmap=""]')).toHaveAttribute('data-ready','true');
 await expect(page.locator('[data-roadmap="v1-summary"]')).toContainText('5 of 17 criteria met');
 await expect(page.locator('[data-roadmap="v1-summary"]')).toContainText('12 criteria remain open');
 await expect(page.locator('.v1-gate')).toHaveCount(5);
 await page.locator('.v1-stages > summary').click();
 await expect(page.locator('[data-roadmap="v1-stages"] > li')).toHaveCount(5);
 const evidence=page.locator('.v1-gate').filter({has:page.getByRole('heading',{name:'Biblical evidence and editorial quality'})});
 await evidence.locator('.v1-gate-detail > summary').click();
 await expect(evidence.locator('[data-readiness="open"]')).toHaveCount(2);
 await expect(evidence).toContainText('Dated editorial source assessments for all 161 explained Atlas pairs');
 await expect(evidence).toContainText('dated canonical Scripture-context and scoped named secondary-source assessments');
});

test('roadmap filters retain an accessible selected state',async({page})=>{
 await open(page,'roadmap');
 await expect(page.locator('[data-roadmap=""]')).toHaveAttribute('data-ready','true');
 for(const filter of ['delivered','planned','research','all']){
  const button=page.locator(`[data-roadmap-filter="${filter}"]`);
  await button.focus();await page.keyboard.press('Enter');
  await expect(button).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('[data-roadmap-filter][aria-pressed="true"]')).toHaveCount(1);
  const statuses=await page.locator('.roadmap-card').evaluateAll(cards=>cards.map(card=>card.dataset.status));
  expect(statuses.length).toBeGreaterThan(0);
  if(filter!=='all')expect(statuses.every(status=>status===filter)).toBe(true);
 }
});

test('saved passages, reader notes and verse highlights survive reload and editions',async({page})=>{
 await open(page);
 await expect(page.locator('#passage-content')).toContainText('Synthetic browser fixture');
 await page.locator('#bookmark-current').click();
 await page.locator('#notes-text').fill('Synthetic private reader note');
 await page.locator('#save-notes').click();
 await page.locator('#highlight-ref').fill('John 3:16');
 await page.locator('#highlight-colour').selectOption('blue');
 await page.locator('#save-highlight').click();
 await expect(page.locator('#passage-content .personal-highlight[data-colour="blue"]')).toBeVisible();
 await page.locator('#reader-translation').selectOption('NIV');
 await expect(page.locator('#passage-content .personal-highlight[data-colour="blue"]')).toBeVisible();
 await page.reload();
 await expect(page.locator('#notes-text')).toHaveValue('Synthetic private reader note');
 await expect(page.locator('#bookmark-current')).toContainText('Saved');
 await navigate(page,'notebook');
 await expect(page.locator('#bookmarks-list')).toContainText('John 3:16');
 await expect(page.locator('#notes-list')).toContainText('Synthetic private reader note');
 expect((await notebook(page)).annotations.highlights['John 3:16']).toBe('blue');
});

test('linked place notes, reading schedules and backups round trip without passage text',async({page})=>{
 await open(page,'notebook');
 await page.locator('[data-annotation="text"]').fill('Synthetic linked observation');
 await page.locator('[data-annotation="refs"]').fill('John 3:16; Romans 5:8');
 await page.locator('[data-annotation="tags"]').fill('hope, context');
 await page.locator('[data-annotation="place-choice"]').selectOption('jerusalem');
 await page.locator('[data-annotation="add-place"]').click();
 await page.locator('[data-annotation="save"]').click();
 await expect(page.locator('[data-annotation="list"]')).toContainText('Synthetic linked observation');
 await page.getByRole('button',{name:'Edit note',exact:true}).click();
 await page.locator('[data-annotation="text"]').fill('Synthetic linked observation, edited');
 await page.locator('[data-annotation="save"]').click();
 await expect(page.locator('[data-annotation="status"]')).toHaveText('Linked note saved on this device.');
 expect((await notebook(page)).annotations.notes[0].text).toBe('Synthetic linked observation, edited');
 await page.locator('[data-collection="title"]').fill('Synthetic two-day study');
 await page.locator('[data-collection="refs"]').fill('John 3:16; Romans 5:8');
 await page.locator('[data-collection="start"]').fill('2026-11-02');
 await page.locator('[data-collection="save"]').click();
 const card=page.locator('.study-collection');
 await card.getByText('Passages and schedule',{exact:true}).click();
 await expect(card).toContainText('John 3:16 - 2026-11-02');
 await card.getByRole('checkbox',{name:/John 3:16/}).check();
 await expect(card).toContainText('1 of 2 passages marked read');
 await card.getByRole('button',{name:'Edit collection',exact:true}).click();
 await page.locator('[data-collection="title"]').fill('Synthetic two-day study, edited');
 await page.locator('[data-collection="save"]').click();
 await expect(card).toContainText('Synthetic two-day study, edited');
 await expect(card).toContainText('1 of 2 passages marked read');
 const downloadPromise=page.waitForEvent('download');
 await page.getByRole('button',{name:'Download backup',exact:true}).click();
 const data=JSON.parse(await readFile(await (await downloadPromise).path(),'utf8'));
 expect(data.annotations.notes[0].places).toContain('jerusalem');
 expect(data.collections[0].completed).toEqual(['John 3:16']);
 expect(JSON.stringify(data)).not.toContain('Synthetic browser fixture');
 await page.evaluate(()=>localStorage.clear());await page.reload();
 await chooseBackup(page,data);
 await expect(page.locator('[data-backup="preview"]')).toBeVisible();
 await page.locator('[data-backup="apply"]').click();
 await expect(page.locator('[data-backup="status"]')).toContainText('Notebook imported');
 await expect(page.locator('[data-annotation="list"]')).toContainText('Synthetic linked observation');
 await expect(page.locator('.study-collection')).toContainText('1 of 2 passages marked read');
 await page.getByRole('button',{name:'Resume next unread passage',exact:true}).click();
 await expect(page.locator('#reader-title')).toHaveText('Romans 5:8');
});

test('backup conflicts require a reviewed replacement and stale previews cannot write',async({page})=>{
 await open(page);
 await page.locator('#notes-text').fill('Existing synthetic note');await page.locator('#save-notes').click();
 await navigate(page,'notebook');
 const data=backup({notes:{'John 3:16':'Incoming synthetic note'}});
 await chooseBackup(page,data);
 await expect(page.locator('[data-backup="conflicts"]')).toContainText('Existing synthetic note');
 await expect(page.locator('[data-backup="conflicts"] input')).not.toBeChecked();
 await page.locator('[data-backup="apply"]').click();
 expect((await notebook(page)).notes['John 3:16']).toBe('Existing synthetic note');
 await chooseBackup(page,data);
 await page.locator('[data-backup="conflicts"] input').check();
 await page.locator('[data-backup="apply"]').click();
 expect((await notebook(page)).notes['John 3:16']).toBe('Incoming synthetic note');
 await chooseBackup(page,backup({bookmarks:['Psalm 23:1']}));
 await page.locator('[data-annotation="text"]').fill('A draft saved after import preview');
 await page.locator('[data-annotation="refs"]').fill('Romans 5:8');
 await page.locator('[data-annotation="save"]').click();
 await page.locator('[data-backup="apply"]').click();
 await expect(page.locator('[data-backup="status"]')).toContainText('changed after the preview');
 expect((await notebook(page)).bookmarks).toEqual([]);
 await chooseBackup(page,{broken:true});
 await expect(page.locator('[data-backup="status"]')).toContainText('Unsupported or malformed');
 await expect(page.locator('[data-backup="preview"]')).toBeHidden();
 expect((await notebook(page)).notes['John 3:16']).toBe('Incoming synthetic note');
});

test('another tab changing storage prevents stale collection writes',async({page,context})=>{
 await open(page,'notebook');
 const other=await context.newPage();
 // Same-origin storage change models a second tab without using any publisher API.
 await other.goto('/assets/favicon.svg');
 await other.evaluate(()=>localStorage.setItem('scripture-trails:notebook',JSON.stringify({bookmarks:[],notes:{'John 3:16':'Saved in another tab'},readingPlans:{},annotations:{notes:[],highlights:{}},collections:[]})));
 await other.close();
 await page.locator('[data-collection="title"]').fill('Stale draft');
 await page.locator('[data-collection="refs"]').fill('John 3:16');
 await page.locator('[data-collection="save"]').click();
 await expect(page.locator('[data-collection="status"]')).toContainText('changed in another tab');
 expect((await notebook(page)).notes['John 3:16']).toBe('Saved in another tab');
 expect((await notebook(page)).collections).toEqual([]);
});

test('importing replacements cannot silently overwrite open note and collection drafts',async({page})=>{
 await open(page,'notebook');
 const note={id:'a-browser-note',text:'Original observation',refs:['John 3:16'],tags:[]};
 const collection={id:'c-browser-study',title:'Original collection',refs:['John 3:16'],completed:[],start:null,days:[1]};
 await chooseBackup(page,backup({annotations:{notes:[note],highlights:{}},collections:[collection]}));
 await page.locator('[data-backup="apply"]').click();
 await page.getByRole('button',{name:'Edit note',exact:true}).click();
 await page.locator('[data-annotation="text"]').fill('Open observation draft');
 await page.getByRole('button',{name:'Edit collection',exact:true}).click();
 await page.locator('[data-collection="title"]').fill('Open collection draft');
 await chooseBackup(page,backup({annotations:{notes:[{...note,text:'Reviewed replacement observation'}],highlights:{}},collections:[{...collection,title:'Reviewed replacement collection'}]}));
 for(const checkbox of await page.locator('[data-backup="conflicts"] input').all())await checkbox.check();
 await page.locator('[data-backup="apply"]').click();
 await page.locator('[data-annotation="save"]').click();
 await expect(page.locator('[data-annotation="status"]')).toContainText('changed');
 await expect(page.locator('[data-annotation="text"]')).toHaveValue('Open observation draft');
 await page.locator('[data-collection="save"]').click();
 await expect(page.locator('[data-collection="status"]')).toContainText('changed');
 const saved=await notebook(page);
 expect(saved.annotations.notes[0].text).toBe('Reviewed replacement observation');
 expect(saved.collections[0].title).toBe('Reviewed replacement collection');
});

test('stale reader notes and bookmark actions preserve another tab changes',async({page,context})=>{
 await open(page);
 await page.locator('#notes-text').fill('Open reader draft');
 const other=await context.newPage();await other.goto('/assets/favicon.svg');
 await other.evaluate(()=>localStorage.setItem('scripture-trails:notebook',JSON.stringify({bookmarks:['Romans 5:8'],notes:{'John 3:16':'Newer note in another tab'},readingPlans:{},annotations:{notes:[],highlights:{}},collections:[]})));
 await other.close();
 await page.locator('#save-notes').click();
 await expect(page.locator('#toast')).toContainText('changed in another tab');
 await expect(page.locator('#notes-text')).toHaveValue('Open reader draft');
 await page.locator('#bookmark-current').click();
 const saved=await notebook(page);
 expect(saved.notes['John 3:16']).toBe('Newer note in another tab');
 expect(saved.bookmarks).toEqual(['Romans 5:8']);
});

test("All four Pauline journey groups show substantive Scripture study notes",async({page})=>{
 await open(page,'paul-map');
 await expect(page.locator('[data-paul="study-section"]')).toBeVisible();
 await expect(page.locator('[data-paul="study-context"]')).toContainText('community of prophets and teachers');
 await expect(page.locator('[data-paul="study-links"] .jesus-passage-row')).toHaveCount(2);
 await page.locator('[data-paul="study-links"] .jesus-passage-row').first().getByRole('button',{name:'Read'}).click();
 await expect(page.locator('#reader-title')).toHaveText(/^Acts 11:19/);
 await navigate(page,'paul-map');
 await page.locator('[data-paul="journey"]').selectOption('second');
 await expect(page.locator('[data-paul="study-section"]')).toBeVisible();
 await expect(page.locator('[data-paul="study-context"]')).toContainText('disagreement over John Mark');
 await page.locator('[data-paul="journey"]').selectOption('third');
 await expect(page.locator('[data-paul="study-section"]')).toBeVisible();
 await expect(page.locator('[data-paul="study-context"]')).toContainText('The new departure begins');
 await expect(page.locator('[data-paul="study-links"] .jesus-passage-row')).toHaveCount(2);
 await page.locator('[data-paul="journey"]').selectOption('rome');
 await expect(page.locator('[data-paul="study-section"]')).toBeVisible();
 await expect(page.locator('[data-paul="study-context"]')).toContainText("The custody voyage follows Paul's extended imprisonment");
 await expect(page.locator('[data-paul="study-links"] .jesus-passage-row')).toHaveCount(3);
});

test('Rome wreck study retains an unpinned stage and navigable biblical context',async({page})=>{
 await open(page,'paul-map');
 await page.locator('[data-paul="journey"]').selectOption('rome');
 const wreck=page.locator('[data-paul="list"] button').filter({hasText:'The ship is lost'});
 await wreck.click();
 await expect(page.locator('[data-paul="status"]')).toContainText('has no pin');
 await expect(page.locator('[data-paul="study-section"]')).toBeVisible();
 await expect(page.locator('[data-paul="study-context"]')).toContainText('no particular beach is proven');
 await expect(page.locator('[data-paul="study-links"] .jesus-passage-row')).toHaveCount(2);
 await page.locator('[data-paul="study-links"] .jesus-passage-row').last().getByRole('button',{name:'Read'}).click();
 await expect(page.locator('#reader-title')).toHaveText(/^Acts 28:1/);
});

test('Gospel journey stages show individual Scripture contexts and open comparison passages',async({page})=>{
 await open(page,'jesus-map');
 await expect(page.locator('[data-jesus="episode-study-context"]')).toContainText("Luke places the birth within a narrative");
 await expect(page.locator('[data-jesus="episode-study-links"] .jesus-passage-row')).toHaveCount(2);
 await page.locator('[data-jesus="episode-study-links"] .jesus-passage-row').first().getByRole('button',{name:'Read in Bible reader'}).click();
 await expect(page.locator('#reader-title')).toHaveText(/^Luke 2:8/);
 await navigate(page,'jesus-map');
 await page.goto('/?view=jesus-map&stop=j059&translation=ESV');
 await expect(page.locator('[data-jesus="event-heading"]')).toHaveText('Zacchaeus welcomed');
 await expect(page.locator('[data-jesus="episode-study-context"]')).toContainText('restitution and generosity');
});
test('Gospel disputed ending and ascension show qualified sources and maintain stable deep links',async({page})=>{
 await page.goto('/?view=jesus-map&stop=j074&translation=ESV');
 await expect(page.locator('#view-jesus-map')).toBeVisible();
 await expect(page.locator('[data-jesus="event-heading"]')).toHaveText('The empty tomb and appearances');
 await expect(page.locator('[data-jesus="episode-study-context"]')).toContainText('longer ending at 16:9-20');
 await expect(page.locator('[data-jesus="audit-event-issues"]')).toContainText('Several early witnesses');
 await page.goto('/?view=jesus-map&stop=j079&translation=ESV');
 await expect(page.locator('[data-jesus="event-heading"]')).toHaveText('Ascension near Bethany');
 await expect(page.locator('[data-jesus="episode-study-context"]')).toContainText('textual variants in Luke 24:51-52');
 await expect(page.locator('[data-jesus="chronology-comparisons"]')).toContainText('Ascension: narrative continuity');
});
