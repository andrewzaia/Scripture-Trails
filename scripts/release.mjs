import {readFileSync,writeFileSync} from 'node:fs';
import {nextVersion,validateReleases} from './versioning.mjs';

const [level,title,...changes]=process.argv.slice(2);
if(!title?.trim()||!changes.length||changes.some(x=>!x.trim()))throw new Error('Usage: npm run release -- patch|minor|major "Heading" "Public summary" ["Another change"]');
const read=path=>readFileSync(path,'utf8');
const packagePath='package.json',historyPath='public/data/releases.json',htmlPath='public/index.html';
const pkg=JSON.parse(read(packagePath)),history=JSON.parse(read(historyPath));
validateReleases(history.releases,pkg.version);
const oldVersion=pkg.version,newVersion=nextVersion(oldVersion,level);
const parts=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Australia/Sydney',day:'2-digit',month:'2-digit',year:'numeric'}).formatToParts(new Date()).map(x=>[x.type,x.value]));
const date=`${parts.year}-${parts.month}-${parts.day}`;
const html=read(htmlPath),oldLabel='<span id="site-version" class="site-version" aria-label="Website version">v'+oldVersion+'</span>';
if(!html.includes(oldLabel))throw new Error('Footer version is out of sync; run npm run check:release');
if(!html.includes('/assets/app.js?v='+oldVersion)||!html.includes('/assets/style.css?v='+oldVersion))throw new Error('Asset cache keys are out of sync');
const newHtml=html.replace(oldLabel,oldLabel.replace(oldVersion,newVersion))
 .replace('/assets/app.js?v='+oldVersion,'/assets/app.js?v='+newVersion)
 .replace('/assets/style.css?v='+oldVersion,'/assets/style.css?v='+newVersion);
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
writeFileSync('CHANGELOG.md',newChangelog);
console.log(`Prepared release v${newVersion}: ${title}`);
