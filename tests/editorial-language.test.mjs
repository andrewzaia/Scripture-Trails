import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {join,extname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../public/',import.meta.url));
function* files(dir){
 for(const item of readdirSync(dir,{withFileTypes:true})){
  const path=join(dir,item.name);
  if(item.isDirectory())yield* files(path);
  else if(['.html','.js','.mjs','.json','.css','.md','.txt'].includes(extname(path)))yield path;
 }
}

test('public study pages and data use source-based review language',()=>{
 const forbidden=/\bAI[\s-]*assisted\b|\bmachine[\s-]*assisted\b/i;
 let scanned=0;
 for(const path of files(root)){
  const content=readFileSync(path,'utf8');
  assert.doesNotMatch(content,forbidden,'Public wording remains in '+path);
  scanned++;
 }
 assert.ok(scanned>20,'Did not scan expected website files');
});

test('primary-source labels distinguish project-owner acceptance from external review',()=>{
 const read=p=>readFileSync(new URL('../public/'+p,import.meta.url),'utf8');
 const html=read('index.html'),geography=read('assets/hebrew-geography.js');
 const hebrew=JSON.parse(read('data/hebrew-geography.json'));
 const citation=JSON.parse(read('data/citation-review.json'));
 assert.match(html,/Scripture source reference/);
 assert.match(geography,/Study content reviewed and accepted by the project owner/);
 assert.match(hebrew.collection.review,/project owner has reviewed and accepted/);
 assert.ok(hebrew.stages.every(s=>s.primaryCheck.method==='Selected primary chapter reading'));
 assert.match(citation.method,/project owner has reviewed and accepted/);
 assert.match(citation.method,/No independent specialist signoff is claimed/);
});
