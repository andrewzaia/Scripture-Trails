import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('security operations are read-only and grouped without bypassing release checks',()=>{
 const dep=read('.github/dependabot.yml'),audit=read('.github/workflows/repository-security-audit.yml');
 const operations=read('sources/security/public-repository-operations.md'),policy=read('.github/SECURITY.md');
 for(const system of ['npm','github-actions'])assert.match(dep,new RegExp('package-ecosystem: '+system));
 assert.equal((dep.match(/interval: monthly/g)||[]).length,2);
 assert.equal((dep.match(/open-pull-requests-limit: 1/g)||[]).length,2);
 assert.match(audit,/workflow_dispatch:/);
 assert.match(audit,/schedule:/);
 assert.match(audit,/permissions:\n  contents: read/);
 assert.match(audit,/fetch-depth: 0/);
 assert.match(audit,/audit-public-history\.mjs/);
 assert.doesNotMatch(audit,/contents: write|git push/);
 assert.match(operations,/No root `LICENSE` file/);
 assert.match(operations,/does not certify its completion/);
 assert.match(policy,/Do not publish secrets/);
 const ignored=read('.gitignore');
 assert.match(ignored,/^\.dev\.vars$/m);
 assert.match(ignored,/^\.env\*$/m);
});

test('locally hosted persecution photographs match licensed source imports',()=>{
 const images=JSON.parse(read('public/data/christian-persecution-images.json')).images;
 const imports=JSON.parse(read('scripts/persecution-media-import-sources.json'));
 assert.equal(images.length,imports.length);
 assert.ok(images.length>0);
 const ids=new Set();
 for(const item of images){
  assert.ok(!ids.has(item.report_id),'duplicate report ID '+item.report_id);
  ids.add(item.report_id);
  assert.match(item.path,/^\/assets\/persecution-media\/[a-z0-9-]+\.(?:jpg|png|webp)$/);
  assert.ok(existsSync(new URL('../public'+item.path,import.meta.url)));
  assert.match(item.source,/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
  assert.match(item.licence,/^https:\/\/creativecommons\.org\/licenses\//);
  for(const key of ['author','caption','alt','adaptation','licence_label'])assert.ok(item[key],key+' for '+item.report_id);
  const original=imports.find(x=>x.report_id===item.report_id);
  assert.ok(original,'missing import '+item.report_id);
  for(const key of ['author','source','licence','caption','alt'])assert.equal(item[key],original[key],item.report_id+' '+key);
  assert.equal(item.path.split('/').at(-1),original.file);
 }
});

test('publisher register does not falsely block the owner-accepted v1 gate or claim private verification',()=>{
 const ledger=JSON.parse(read('sources/legal/publisher-rights-register-2026-10-31.json'));
 assert.equal(ledger.allPublisherPermissionsVerified,false);
 assert.equal(Object.hasOwn(ledger,'blockedCriterion'),false);
 assert.equal(ledger.acceptance.status,'owner-accepted-with-limitations');
 assert.equal(ledger.acceptance.acceptedOn,'2026-11-02');
 assert.ok(ledger.acceptance.unverifiedAccountChecks.includes('Edition-specific authorisations'));
 const monitoring=read('sources/legal/ongoing-publisher-monitoring.md');
 assert.match(monitoring,/5,000 monthly end-user ceiling/);
 assert.match(monitoring,/private written provider confirmation/);
 assert.match(monitoring,/Keep issue #79 open/);
});
