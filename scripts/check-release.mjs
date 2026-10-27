import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {compareVersions,validateReleases} from './versioning.mjs';
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
if(!index.includes('entity-index-data.js?v='+pkg.version)||!index.includes("ENTITY_INDEX_DATA_VERSION='"+pkg.version+"'"))throw new Error('Index module and JSON cache keys must match version');
if(!app.includes('connection-evidence.js?v='+pkg.version)||!index.includes('connection-evidence.js?v='+pkg.version))throw new Error('Atlas evidence modules must match website release version');
if(!app.includes('atlas-comparison.js?v='+pkg.version)||!index.includes('person-trails.js?v='+pkg.version))throw new Error('Comparison and person trails must match release version');
const evidence=readFileSync('public/assets/connection-evidence.js','utf8');
if(!evidence.includes('connection-evidence-expanded.js?v='+pkg.version))throw new Error('Expanded evidence cache key must match release version');
try{execFileSync('git',['cat-file','-e','HEAD^'],{stdio:'ignore'});}
catch{console.log('Release metadata is consistent; parent commit history unavailable, skipping historical comparison.');process.exit(0);}
const changes=execFileSync('git',['diff','--name-only','HEAD^','HEAD'],{encoding:'utf8'}).split(/\r?\n/).filter(Boolean);
const siteChanges=changes.filter(x=>/^(public\/|functions\/|scripts\/|sources\/|package\.json$|wrangler\.toml$)/.test(x));
if(siteChanges.length){
 let previous;
 try{previous=JSON.parse(execFileSync('git',['show','HEAD^:package.json'],{encoding:'utf8'})).version;}
 catch{previous=null;}
 if(previous&&compareVersions(pkg.version,previous)<=0)throw new Error(`Website code changed without a version increment (${previous} -> ${pkg.version}). Run npm run release -- patch "Heading" "Summary".`);
}
console.log('Release metadata and version rules verified: '+version);
