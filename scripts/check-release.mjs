import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {validateReleases,assertReleaseIncrement} from './versioning.mjs';
const pkg=JSON.parse(readFileSync('package.json','utf8'));
const notes=JSON.parse(readFileSync('public/data/releases.json','utf8'));
const html=readFileSync('public/index.html','utf8');
const detailed=readFileSync('CHANGELOG.md','utf8');
validateReleases(notes.releases,pkg.version);
const headings=[...detailed.matchAll(/^## (\d+\.\d+\.\d+)\b/gm)].map(match=>match[1]);
const publicVersions=notes.releases.map(entry=>entry.version);
if(JSON.stringify(headings)!==JSON.stringify(publicVersions))throw new Error('Development and public changelogs must list the same versions in the same order');
const version='v'+pkg.version;
if(!html.includes(`id="site-version" class="site-version" aria-label="Website version">${version}</span>`))throw new Error('Footer version must match package.json');
for(const name of ['app.js','style.css','entity-index.css'])if(!html.includes(name+'?v='+pkg.version))throw new Error('Asset cache keys must match website version: '+name);
const app=readFileSync('public/assets/app.js','utf8'),index=readFileSync('public/assets/entity-index.js','utf8');
if(!app.includes('entity-index.js?v='+pkg.version))throw new Error('Index module cache key must match version');
if(!app.includes('graph.js?v='+pkg.version))throw new Error('Atlas renderer cache key must match version');
if(!readFileSync('public/assets/graph.js','utf8').includes('atlas-shortest-path.js?v='+pkg.version))throw new Error('Atlas shortest path module cache key must match version');
if(!index.includes('entity-index-data.js?v='+pkg.version)||!index.includes("ENTITY_INDEX_DATA_VERSION='"+pkg.version+"'"))throw new Error('Index module and JSON cache keys must match version');
if(!app.includes('connection-evidence.js?v='+pkg.version)||!index.includes('connection-evidence.js?v='+pkg.version))throw new Error('Atlas evidence modules must match website release version');
if(!app.includes('atlas-comparison.js?v='+pkg.version)||!index.includes('person-trails.js?v='+pkg.version))throw new Error('Comparison and person trails must match release version');
const evidence=readFileSync('public/assets/connection-evidence.js','utf8');
if(!evidence.includes('connection-evidence-expanded.js?v='+pkg.version))throw new Error('Expanded evidence cache key must match release version');
// PR validation covers ALL branch commits. Cloudflare's production checkout can be shallow,
// so only GitHub Actions must have full history; every build still checks release metadata.
// GitHub Actions checks out full history (fetch-depth: 0) so the merge base is available.
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
let base='HEAD^';
try{
 if(process.env.GITHUB_BASE_REF){
  base=git('merge-base','HEAD',`refs/remotes/origin/${process.env.GITHUB_BASE_REF}`);
  if(!base)throw new Error('Empty PR merge base');
 }
 execFileSync('git',['cat-file','-e',base],{stdio:'ignore'});
}catch(error){
 if(process.env.GITHUB_ACTIONS||process.env.GITHUB_BASE_REF)throw new Error('GitHub release validation requires the destination branch history: '+error.message);
 console.log('Release metadata is consistent; Git history unavailable, skipping historical comparison.');
 process.exit(0);
}
const changes=git('diff','--name-only',base,'HEAD').split(/\r?\n/).filter(Boolean);
const previous=JSON.parse(git('show',`${base}:package.json`)).version;
assertReleaseIncrement(changes,previous,pkg.version);
console.log('Release metadata and version rules verified: '+version+' (compared with '+previous+')');
