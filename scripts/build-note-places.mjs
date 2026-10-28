import {readFileSync,writeFileSync} from 'node:fs';
const read=path=>JSON.parse(readFileSync(path,'utf8'));
const gospel=read('public/data/jesus-journeys.json'),history=read('public/data/biblical-history.json');
const places=[...gospel.places.map(p=>({id:p.id,name:p.name,context:p.region,aliases:[]})),...history.places.map(p=>({id:p.id,name:p.name,context:p.region+' - '+p.kind,aliases:p.aliases}))].sort((a,b)=>a.name.localeCompare(b.name,'en'));
if(new Set(places.map(p=>p.id)).size!==places.length)throw Error('Duplicate notebook place ID');
const content='/** Generated from the existing Gospel and Hebrew Bible place indexes. Run node scripts/build-note-places.mjs. No new geographic claims. */\nexport const NOTE_PLACES='+JSON.stringify(places,null,2)+';\nexport const notePlace=id=>NOTE_PLACES.find(p=>p.id===id);\n';
if(process.argv.includes('--check')){if(readFileSync('public/assets/note-places.js','utf8')!==content)throw Error('Notebook places are out of sync; rebuild and review the registry.');}else writeFileSync('public/assets/note-places.js',content);
