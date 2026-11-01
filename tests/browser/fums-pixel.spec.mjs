import {test,expect,open,passagePayload} from './fixtures.mjs';

const token='TEST_FUMS_BROWSER_TOKEN_1234';
const pixel=Buffer.from('R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==','base64');
test('API.Bible views issue a scoped privacy-safe reporting pixel each time content is displayed',async({page})=>{
 const reports=[];
 await page.route('https://fums.api.bible/f3?**',async route=>{
  const req=route.request(),url=new URL(req.url());
  reports.push({method:req.method(),referrer:req.headers().referer||null,keys:[...url.searchParams.keys()].sort(),token:url.searchParams.get('t'),device:url.searchParams.get('dId'),session:url.searchParams.get('sId'),cacheNonce:url.searchParams.get('cb')});
  await route.fulfill({status:200,contentType:'image/gif',body:pixel});
 });
 await page.route('**/api/passage?**',async route=>{
  const u=new URL(route.request().url()),code=u.searchParams.get('translation');
  await route.fulfill({json:{...passagePayload(u.searchParams.get('q'),code),fums:code==='ESV'?null:{token}}});
 });
 await open(page,'reader','John 3:16');
 await expect(page.locator('#passage-status')).toHaveText('Official ESV text');
 await page.locator('#reader-translation').selectOption('NIV');
 await expect(page.locator('#passage-status')).toHaveText('Official NIV text');
 await expect.poll(()=>reports.length).toBe(1);
 await page.locator('#reader-translation').selectOption('NASB20');
 await expect(page.locator('#passage-status')).toHaveText('Official NASB20 text');
 await expect.poll(()=>reports.length).toBe(2);
 for(const report of reports){
  expect(report.method).toBe('GET');
  expect(report.referrer).toBe(null);
  expect(report.keys).toEqual(['cb','dId','sId','t']);
  expect(report.cacheNonce).toMatch(/^[0-9a-f-]{36}$/i);
  expect(report.token).toBe(token);
  expect(report.device).toMatch(/^[0-9a-f-]{36}$/i);
  expect(report.session).toMatch(/^[0-9a-f-]{36}$/i);
 }
 expect(reports[0].device).toBe(reports[1].device);
 expect(reports[0].session).toBe(reports[1].session);
 expect(reports[0].cacheNonce).not.toBe(reports[1].cacheNonce);
});
