import {readFileSync,existsSync} from 'node:fs';
import {validateV1Readiness,v1ReadinessCounts} from '../public/assets/roadmap.js';
import {CONNECTION_EVIDENCE} from '../public/assets/connection-evidence.js';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const pkg=JSON.parse(read('package.json'));
const roadmap=JSON.parse(read('public/data/roadmap.json'));
const review=JSON.parse(read('public/data/citation-review.json'));
const data=roadmap.v1Readiness;

validateV1Readiness(data);
const actualReviewed=new Set(review.records.filter(r=>r.kind==='connection').map(r=>r.target));
const unreviewed=CONNECTION_EVIDENCE.filter(e=>!actualReviewed.has(e.id));
if([...actualReviewed].some(id=>!CONNECTION_EVIDENCE.some(e=>e.id===id)))throw Error('Citation review references a non-existent Atlas pair');
const gates=new Map(data.gates.flatMap(g=>g.criteria.map(c=>[c.id,c])));
if(gates.size!==17)throw Error('Expected 17 explicit v1.0 acceptance criteria');
const required=new Set(['atlas-context','atlas-reviews','critical-claims','source-licences','crossrefs-integrity','content-audit','reader-provider-smoke','automated-accessibility','screen-readers','cross-browser-zoom','security-review','data-recovery','provider-failures','semantic-versioning','rollback','live-smoke','launch-signoff']);
if(required.size!==gates.size||[...required].some(id=>!gates.has(id)))throw Error('Required release gates are missing or unexpectedly renamed');
if(roadmap.milestones.find(m=>m.id==='v1-readiness-framework')?.status!=='delivered')throw Error('Readiness framework milestone is missing');
if(gates.get('atlas-reviews').status==='met'&&unreviewed.length)throw Error('Atlas evidence review declared complete with '+unreviewed.length+' pairs still pending');
if(gates.get('atlas-context').status!=='met')throw Error('Atlas annotations must retain their passing field validation');
const notes=JSON.parse(read('public/data/releases.json'));
if(notes.releases[0].version!==pkg.version)throw Error('Version mismatch in v1 readiness check');
const expectedAutomated=new Set(['atlas-context','crossrefs-integrity','automated-accessibility','semantic-versioning']);
for(const criterion of gates.values()){
 if(criterion.status==='met'&&criterion.mode==='automated'&&!expectedAutomated.has(criterion.id))throw Error('Unsupported automatic signoff for '+criterion.id);
 if(criterion.status==='met'&&criterion.mode!=='automated'){
  if(!criterion.reviewer||!criterion.reviewedOn)throw Error('Human signoff requires a date and reviewer: '+criterion.id);
  if(!/^\\d{4}-\\d{2}-\\d{2}$/.test(criterion.reviewedOn))throw Error('Invalid signoff date '+criterion.id);
 }
 if(!criterion.evidence.startsWith('https://')&&!existsSync(new URL('../'+criterion.evidence,import.meta.url)))throw Error('Missing declared evidence source '+criterion.evidence);
}
const counts=v1ReadinessCounts(data);
if(pkg.version.split('.').map(Number)[0]>=1&&!counts.ready)throw Error('Version 1.0 release blocked: '+counts.open+' required criteria remain open');
console.log('v1.0 readiness: '+counts.met+'/'+counts.total+' criteria met; '+counts.open+' launch blockers; '+unreviewed.length+' Atlas explanation source reviews pending.');
