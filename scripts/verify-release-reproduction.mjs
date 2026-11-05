import {execFileSync} from 'node:child_process';
import {mkdtempSync,readFileSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {nextVersion} from './versioning.mjs';

// Verify the published release metadata can be reproduced using the standard
// npm release command, without mutating the checked-out PR or adding CI jobs.
if(!process.env.GITHUB_BASE_REF){
 console.log('Release reproduction applies to pull requests only.');
 process.exit(0);
}
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const base=git('merge-base','HEAD','refs/remotes/origin/'+process.env.GITHUB_BASE_REF);
const original=JSON.parse(git('show',base+':package.json'));
const pkg=JSON.parse(readFileSync('package.json','utf8'));
const current=JSON.parse(readFileSync('public/data/releases.json','utf8'));
const level=['patch','minor','major'].find(kind=>nextVersion(original.version,kind)===pkg.version);
if(!level){
 console.log('No single semantic-version increment to reproduce.');
 process.exit(0);
}
const release=current.releases[0];
if(release.version!==pkg.version)throw Error('Top release does not match package.json.');
const dir=mkdtempSync(join(tmpdir(),'scripture-trails-release-'));
try{
 execFileSync('git',['worktree','add','--detach',dir,base],{encoding:'utf8'});
 // Recreate the proposed HTML at the previous version. Releases can also
 // edit visible page copy, not just the version footer and asset cache keys.
 // Running the official release command must still regenerate an exact match.
 let preReleaseHtml=readFileSync('public/index.html','utf8');
 const oldFoot='id="site-version" class="site-version" aria-label="Website version">v'+pkg.version+'</span>';
 const baseFoot='id="site-version" class="site-version" aria-label="Website version">v'+original.version+'</span>';
 if(!preReleaseHtml.includes(oldFoot))throw Error('Proposed footer version missing.');
 preReleaseHtml=preReleaseHtml.replace(oldFoot,baseFoot);
 for(const name of ['app.js','analytics.js','city-studies.css','style.css','entity-index.css','paul-map.css','hebrew-geography.css','roadmap.css']){
  const current='/assets/'+name+'?v='+pkg.version;
  if(!preReleaseHtml.includes(current))throw Error('Missing proposed versioned HTML asset '+name);
  preReleaseHtml=preReleaseHtml.replace(current,'/assets/'+name+'?v='+original.version);
 }
 writeFileSync(join(dir,'public/index.html'),preReleaseHtml);
 const result=execFileSync('npm',['run','release','--',level,release.title,...release.changes],{cwd:dir,encoding:'utf8'});
 process.stdout.write(result);
 const files=['package.json','package-lock.json','public/index.html','public/data/releases.json','CHANGELOG.md'];
 for(const file of files){
  let generated=readFileSync(join(dir,file),'utf8');
  const published=readFileSync(file,'utf8');
  // The source command derives its date at execution time. Historical
  // PRs remain reproducible after midnight or when CI is rerun later.
  if(file==='public/data/releases.json'){
   const data=JSON.parse(generated);
   data.releases[0].date=release.date;
   generated=JSON.stringify(data,null,2)+'\n';
  }
  if(file==='CHANGELOG.md'){
   const dated=release.date.slice(8,10)+'/'+release.date.slice(5,7)+'/'+release.date.slice(0,4);
   generated=generated.replace(/^(## \d+\.\d+\.\d+ - )\d{2}\/\d{2}\/\d{4}(: )/m,(_,a,b)=>a+dated+b);
  }
  if(generated!==published)throw Error('Release generator output differs from committed '+file);
 }
 console.log('Standard npm run release output matches all five committed release artefacts.');
}finally{
 try{execFileSync('git',['worktree','remove','--force',dir],{encoding:'utf8'});}
 catch{execFileSync('git',['worktree','prune'],{encoding:'utf8'});}
}
