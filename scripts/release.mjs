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
nextApp=versionedImport(nextApp,'paul-map.js?v='+oldVersion,'paul-map.js?v='+newVersion,'Pauline journeys');
nextApp=versionedImport(nextApp,'hebrew-geography.js?v='+oldVersion,'hebrew-geography.js?v='+newVersion,'Hebrew Bible geography');
nextApp=versionedImport(nextApp,'roadmap.js?v='+oldVersion,'roadmap.js?v='+newVersion,'roadmap');
nextApp=versionedImport(nextApp,'notebook-backup.js?v='+oldVersion,'notebook-backup.js?v='+newVersion,'notebook backups');
nextApp=versionedImport(nextApp,'reading-plans.js?v='+oldVersion,'reading-plans.js?v='+newVersion,'reading progress');
nextApp=versionedImport(nextApp,'release-notes.js?v='+oldVersion,'release-notes.js?v='+newVersion,'release history');
const backupPath='public/assets/notebook-backup.js';
const nextBackup=versionedImport(read(backupPath),'reading-plans.js?v='+oldVersion,'reading-plans.js?v='+newVersion,'backup progress validation');
nextApp=versionedImport(nextApp,'person-trails.js?v='+oldVersion,'person-trails.js?v='+newVersion,'person trail directory');
nextApp=versionedImport(nextApp,'annotations.js?v='+oldVersion,'annotations.js?v='+newVersion,'annotations');
let finalBackup=versionedImport(nextBackup,'annotations.js?v='+oldVersion,'annotations.js?v='+newVersion,'backup annotations');
nextApp=versionedImport(nextApp,'study-collections.js?v='+oldVersion,'study-collections.js?v='+newVersion,'study collections');
nextApp=versionedImport(nextApp,'studies.js?v='+oldVersion,'studies.js?v='+newVersion,'guided journals');
const plansPath='public/assets/reading-plans.js',collectionsPath='public/assets/study-collections.js';
const nextPlans=versionedImport(read(plansPath),'studies.js?v='+oldVersion,'studies.js?v='+newVersion,'reading progress journal data');
const nextCollections=versionedImport(read(collectionsPath),'studies.js?v='+oldVersion,'studies.js?v='+newVersion,'study collection journal data');
finalBackup=versionedImport(finalBackup,'study-collections.js?v='+oldVersion,'study-collections.js?v='+newVersion,'backup study collections');
const annotationsPath='public/assets/annotations.js';
const nextAnnotations=versionedImport(read(annotationsPath),'note-places.js?v='+oldVersion,'note-places.js?v='+newVersion,'notebook place registry');
const prevIndex=read(indexPath);
let nextIndex=versionedImport(prevIndex,'entity-index-data.js?v='+oldVersion,'entity-index-data.js?v='+newVersion,'index data module');
nextIndex=versionedImport(nextIndex,"ENTITY_INDEX_DATA_VERSION='"+oldVersion+"'","ENTITY_INDEX_DATA_VERSION='"+newVersion+"'",'index JSON files');
nextIndex=versionedImport(nextIndex,'connection-evidence.js?v='+oldVersion,'connection-evidence.js?v='+newVersion,'index evidence import');
nextIndex=versionedImport(nextIndex,'person-trails.js?v='+oldVersion,'person-trails.js?v='+newVersion,'person study trails');
const nextEvidence=versionedImport(read(evidencePath),'connection-evidence-expanded.js?v='+oldVersion,'connection-evidence-expanded.js?v='+newVersion,'expanded evidence');
const newHtml=html.replace(oldLabel,oldLabel.replace(oldVersion,newVersion))
 .replace('/assets/app.js?v='+oldVersion,'/assets/app.js?v='+newVersion)
 .replace('/assets/analytics.js?v='+oldVersion,'/assets/analytics.js?v='+newVersion)
 .replace('/assets/city-studies.css?v='+oldVersion,'/assets/city-studies.css?v='+newVersion)
 .replace('/assets/style.css?v='+oldVersion,'/assets/style.css?v='+newVersion)
 .replace('/assets/entity-index.css?v='+oldVersion,'/assets/entity-index.css?v='+newVersion)
 .replace('/assets/paul-map.css?v='+oldVersion,'/assets/paul-map.css?v='+newVersion)
 .replace('/assets/hebrew-geography.css?v='+oldVersion,'/assets/hebrew-geography.css?v='+newVersion);
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
writeFileSync(plansPath,nextPlans);
writeFileSync(collectionsPath,nextCollections);
writeFileSync(backupPath,finalBackup);
writeFileSync(annotationsPath,nextAnnotations);
writeFileSync(graphPath,nextGraph);
writeFileSync(indexPath,nextIndex);
writeFileSync(evidencePath,nextEvidence);
for(const path of ['public/assets/app.js','public/assets/jesus-map.js','public/assets/entity-index.js','public/assets/atlas-comparison.js','public/assets/citation-review.js']){
 const text=read(path).replaceAll('citation-review.js?v='+oldVersion,'citation-review.js?v='+newVersion).replaceAll('citation-review-data.js?v='+oldVersion,'citation-review-data.js?v='+newVersion).replaceAll('jesus-map.js?v='+oldVersion,'jesus-map.js?v='+newVersion).replaceAll('citation-review.json?v='+oldVersion,'citation-review.json?v='+newVersion).replaceAll('city-studies.js?v='+oldVersion,'city-studies.js?v='+newVersion);
 writeFileSync(path,text);
}
writeFileSync('CHANGELOG.md',newChangelog);
console.log(`Prepared release v${newVersion}: ${title}`);
