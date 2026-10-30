import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {BOOKS,parseRef} from '../public/assets/books.js';
import {TRANSLATIONS} from '../public/assets/translations.js';
import {PATHS} from '../public/assets/studies.js';
import {PERSON_TRAILS} from '../public/assets/person-trails.js';
import {CONNECTION_EVIDENCE} from '../public/assets/connection-evidence.js';

const root=new URL('../',import.meta.url);
const read=path=>readFileSync(new URL(path,root),'utf8');
const json=name=>JSON.parse(read('public/data/'+name+'.json'));
export function siteStats(){
 const manifest=json('refs/manifest');
 if(manifest.enabled!==true||manifest.bidirectional!==true)throw Error('About statistics require the enabled bidirectional reference dataset');
 const people=['biblical-people','biblical-history','biblical-people-expanded'].flatMap(name=>json(name).people);
 if(new Set(people.map(p=>p.id)).size!==people.length)throw Error('Duplicate people cannot be counted in About statistics');
 const shardFiles=Object.keys(manifest.shardSha256);
 const shardsByBook=Object.fromEntries(shardFiles.map(name=>[name.replace(/\.json$/,''),JSON.parse(read('public/data/refs/'+name))]));
 const shards=Object.values(shardsByBook);
 const links=shards.reduce((n,shard)=>n+Object.values(shard).reduce((sum,rows)=>sum+rows.length,0),0);
 if(links!==manifest.directedLinks||shards.length!==BOOKS.length)throw Error('About statistics disagree with the reference dataset');
 const review=json('citation-review');
 const reviewed=new Set(review.records.filter(r=>r.kind==='connection').map(r=>r.target));
 if([...reviewed].some(id=>!CONNECTION_EVIDENCE.some(e=>e.id===id)))throw Error('About review statistics reference an unknown comparison');
 if(links%2)throw Error('Bidirectional Atlas links must have an even total');
 const indexed=(entry)=>{
  const from=parseRef(entry.from),to=parseRef(entry.to);
  if(!from||!to)return false;
  return (shardsByBook[from.book.abbr.toLowerCase()]?.[`${from.chapter}:${from.verse}`]||[])
   .some(link=>link[0]===to.book.index&&link[1]===to.chapter&&link[2]===to.verse);
 };
 const editorialOnly=CONNECTION_EVIDENCE.filter(entry=>!indexed(entry)).length;
 const pairs=links/2+editorialOnly;
 const unexplained=pairs-CONNECTION_EVIDENCE.length;
 if(unexplained<0||reviewed.size>CONNECTION_EVIDENCE.length)throw Error('Atlas explanation coverage is inconsistent');
 return {links,books:BOOKS.length,verses:shards.reduce((n,shard)=>n+Object.keys(shard).length,0),people:people.length,trails:PERSON_TRAILS.length,comparisons:CONNECTION_EVIDENCE.length,pairs,unexplained,editions:TRANSLATIONS.length,studies:PATHS.length,gospel:json('jesus-journeys').events.length,paul:json('pauline-journeys').events.length,reviewed:reviewed.size};
}
export function renderSiteStats(s){
 const number=n=>new Intl.NumberFormat('en-AU').format(n);
 const stat=(key,label,detail,icon)=>`<div class="about-stat"><span class="about-stat-icon" aria-hidden="true">${icon}</span><dl><dt>${label}</dt><dd data-stat="${key}">${number(s[key])}</dd></dl><p>${detail}</p></div>`;
 return `<section class="about-dashboard" aria-labelledby="about-stats-title">
<div class="about-dashboard-heading"><div><p class="eyebrow">A WORLD OF DISCOVERY</p><h2 id="about-stats-title">Scripture Trails in numbers.</h2></div><span class="about-dashboard-badge"><span aria-hidden="true"></span>Built for deeper study</span></div>
<div class="about-stats-grid">
<div class="about-stat about-stat-featured"><span class="about-stat-orbit" aria-hidden="true"></span><dl><dt>Atlas navigation links</dt><dd data-stat="links">${number(s.links)}</dd></dl><p>Follow the threads across Scripture.</p><div class="about-stat-reach"><span><strong data-stat="books">${number(s.books)}</strong> Bible books</span><span><strong data-stat="verses">${number(s.verses)}</strong> verses with links</span></div><a href="/?view=connections">Explore the Atlas <span aria-hidden="true">&#8599;</span></a></div>
${stat('people','People profiles','Names, relationships and passage links.','&#9672;')}
${stat('trails','Person-centred trails','Follow a life through selected readings.','&#8599;')}
${stat('comparisons','Explained connections','Quotations, parallels, echoes and themes.','&#9671;')}
${stat('editions','Bible editions','ESV, NASB20, NIV and NKJV.','&#9641;')}
</div>
<ul class="about-stat-extras"><li><strong data-stat="studies">${number(s.studies)}</strong> guided studies</li><li><strong data-stat="gospel">${number(s.gospel)}</strong> Gospel map episodes</li><li><strong data-stat="paul">${number(s.paul)}</strong> Pauline journey stages</li><li><strong data-stat="pairs">${number(s.pairs)}</strong> distinct Atlas pairs</li><li><strong data-stat="unexplained">${number(s.unexplained)}</strong> without written explanations</li></ul>
<div class="about-review-progress"><div><label for="about-review-meter">Connection citation reviews</label><span><strong data-stat="reviewed">${number(s.reviewed)}</strong> of ${number(s.comparisons)} explained connections</span></div><progress id="about-review-meter" value="${s.reviewed}" max="${s.comparisons}">${s.reviewed} of ${s.comparisons}</progress><p>${number(s.comparisons)} of ${number(s.pairs)} distinct Atlas pairs have written explanations (${(100*s.comparisons/s.pairs).toFixed(3)}%). ${s.comparisons===s.reviewed?'Every explained Atlas connection has a dated scoped editorial source assessment.':' '+number(s.comparisons-s.reviewed)+' newer explanations await separate dated source review;'} Atlas navigation totals include reverse navigation links; independent specialist review remains open.</p><a href="#citation-review-heading">See sources and review coverage <span aria-hidden="true">&#8595;</span></a></div>
</section>`;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const path=new URL('public/index.html',root),html=readFileSync(path,'utf8');
 const start='<!-- ABOUT STATS START -->',end='<!-- ABOUT STATS END -->';
 if(!html.includes(start)||!html.includes(end))throw Error('About statistics markers are missing');
 const a=html.indexOf(start)+start.length,b=html.indexOf(end);
 const expected='\n'+renderSiteStats(siteStats())+'\n';
 if(process.argv.includes('--check')){
  if(html.slice(a,b)!==expected)throw Error('About statistics are stale. Run node scripts/site-stats.mjs before releasing.');
  console.log('About dashboard statistics match the published source datasets.');
 }else{
  writeFileSync(path,html.slice(0,a)+expected+html.slice(b));
  console.log('Updated About dashboard from source datasets.');
 }
}
