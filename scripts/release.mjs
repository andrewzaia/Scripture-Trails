import {readFileSync,writeFileSync} from 'node:fs';
import {nextVersion,validateReleases} from './versioning.mjs';

const [level,title,...changes]=process.argv.slice(2);
if(!title?.trim()||!changes.length||changes.some(x=>!x.trim()))throw new Error('Usage: npm run release -- patch|minor|major "Heading" "Public summary" ["Another change"]');
const read=path=>readFileSync(path,'utf8');
const packagePath='package.json',historyPath='public/data/releases.json',htmlPath='public/index.html';
const appPath='public/assets/app.js',graphPath='public/assets/graph.js',indexPath='public/assets/entity-index.js',evidencePath='public/assets/connection-evidence.js';
const versionedImport=(content,oldPart,newPart,label)=>{if(!content.includes(oldPart))throw Error('Index cache key missing: '+label);return content.replace(oldPart,newPart);};
const pkg=JSON.parse(read(packagePath)),history=JSON.parse(read(historyPath));
validateReleases(history.releases,pkg.version);
const oldVersion=pkg.version,newVersion=nextVersion(oldVersion,level);
const parts=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Australia/Sydney',day:'2-digit',month:'2-digit',year:'numeric'}).formatToParts(new Date()).map(x=>[x.type,x.value]));
const date=`${parts.year}-${parts.month}-${parts.day}`;
const html=read(htmlPath),oldLabel='<span id="site-version" class="site-version" aria-label="Website version">v'+oldVersion+'</span>';
if(!html.includes(oldLabel))throw new Error('Footer version is out of sync; run npm run check:release');
if(!html.includes('/assets/app.js?v='+oldVersion)||!html.includes('/assets/style.css?v='+oldVersion)||!html.includes('/assets/entity-index.css?v='+oldVersion))throw new Error('Asset cache keys are out of sync');
let nextApp=versionedImport(read(appPath),'entity-index.js?v='+oldVersion,'entity-index.js?v='+newVersion,'index module');
nextApp=versionedImport(nextApp,'graph.js?v='+oldVersion,'graph.js?v='+newVersion,'Atlas renderer');
const nextGraph=versionedImport(read(graphPath),'atlas-shortest-path.js?v='+oldVersion,'atlas-shortest-path.js?v='+newVersion,'Atlas shortest path module');
nextApp=versionedImport(nextApp,'connection-evidence.js?v='+oldVersion,'connection-evidence.js?v='+newVersion,'Atlas evidence module');
nextApp=versionedImport(nextApp,'atlas-comparison.js?v='+oldVersion,'atlas-comparison.js?v='+newVersion,'licensed side-by-side comparison');
const prevIndex=read(indexPath);
let nextIndex=versionedImport(prevIndex,'entity-index-data.js?v='+oldVersion,'entity-index-data.js?v='+newVersion,'index data module');
nextIndex=versionedImport(nextIndex,"ENTITY_INDEX_DATA_VERSION='"+oldVersion+"'","ENTITY_INDEX_DATA_VERSION='"+newVersion+"'",'index JSON files');
nextIndex=versionedImport(nextIndex,'connection-evidence.js?v='+oldVersion,'connection-evidence.js?v='+newVersion,'index evidence import');
nextIndex=versionedImport(nextIndex,'person-trails.js?v='+oldVersion,'person-trails.js?v='+newVersion,'person study trails');
const nextEvidence=versionedImport(read(evidencePath),'connection-evidence-expanded.js?v='+oldVersion,'connection-evidence-expanded.js?v='+newVersion,'expanded evidence');
const newHtml=html.replace(oldLabel,oldLabel.replace(oldVersion,newVersion))
 .replace('/assets/app.js?v='+oldVersion,'/assets/app.js?v='+newVersion)
 .replace('/assets/style.css?v='+oldVersion,'/assets/style.css?v='+newVersion)
 .replace('/assets/entity-index.css?v='+oldVersion,'/assets/entity-index.css?v='+newVersion);
pkg.version=newVersion;
history.releases.unshift({version:newVersion,date,title:title.trim(),changes:changes.map(x=>x.trim())});
validateReleases(history.releases,newVersion);
const changelog=read('CHANGELOG.md');
if(!changelog.startsWith('# Changelog\n'))throw new Error('Expected changelog title is missing');
const dated=`${parts.day}/${parts.month}/${parts.year}`;
const lines=changes.map(x=>'- '+x.trim()).join('\n');
const newChangelog=changelog.replace('# Changelog\n',`# Changelog\n\n## ${newVersion} - ${dated}: ${title.trim()}\n\n${lines}\n`);
writeFileSync(packagePath,JSON.stringify(pkg,null,2)+'\n');
writeFileSync(historyPath,JSON.stringify(history,null,2)+'\n');
writeFileSync(htmlPath,newHtml);
writeFileSync(appPath,nextApp);
writeFileSync(graphPath,nextGraph);
writeFileSync(indexPath,nextIndex);
writeFileSync(evidencePath,nextEvidence);
writeFileSync('CHANGELOG.md',newChangelog);
console.log(`Prepared release v${newVersion}: ${title}`);
