import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {readReferenceSource,readVendoredReferenceSource} from '../scripts/crossref-source.mjs';

test('local OpenBible source preserves its reviewed archive and complete reference rows',()=>{
 const source=readVendoredReferenceSource();
 assert.equal(source.sourceDate,'2026-10-26');
 assert.equal(source.archiveSha256,'045f1c5db8a331e3d2a185b44646b6ff220b72dd54669fd1976270a7351afcf4');
 assert.equal(source.text.trim().split('\n').length-1,344799);
 assert.ok(source.text.includes('Gen.1.1\t'));
 assert.ok(source.text.includes('Rev.22.21\t'));
});

test('importer handles ranges, reverse navigation, invalid rows and reproducible output without overwriting production',()=>{
 const fixture=mkdtempSync(join(tmpdir(),'scripture-atlas-'));
 try{
  const input=join(fixture,'sample.tsv'),output=join(fixture,'refs');
  writeFileSync(input,'# OpenBible.info CC BY 4.0\nFrom Verse\tTo Verse\tVotes\nGen.1.1\tJohn.1.1-John.1.3\t273\nJohn.1.1\tCol.1.16\t42\nGen.1.99\tJohn.1.1\t2\nGen.1.1\tGen.1.1\t2\n');
  const run=()=>spawnSync(process.execPath,[new URL('../scripts/import-crossrefs.mjs',import.meta.url).pathname,input,output],{encoding:'utf8'});
  let result=run();assert.equal(result.status,0,result.stderr);
  const gen=JSON.parse(readFileSync(join(output,'gen.json'),'utf8')),john=JSON.parse(readFileSync(join(output,'john.json'),'utf8'));
  assert.deepEqual(gen['1:1'],[[42,1,1,273,1,3,42]]);
  assert.ok(john['1:1'].some(link=>link[0]===0&&link[1]===1&&link[2]===1));
  const manifest=readFileSync(join(output,'manifest.json'),'utf8');
  assert.equal(JSON.parse(manifest).skippedRows,2);
  assert.equal(JSON.parse(manifest).directedLinks,4);
  assert.equal(Object.keys(JSON.parse(manifest).shardSha256).length,66);
  result=run();assert.equal(result.status,0,result.stderr);assert.equal(readFileSync(join(output,'manifest.json'),'utf8'),manifest);
 }finally{rmSync(fixture,{recursive:true,force:true});}
});

test('malformed or unsupported archives are rejected without extraction',()=>{
 const fixture=mkdtempSync(join(tmpdir(),'scripture-atlas-zip-'));
 try{
  const file=join(fixture,'bad.zip');writeFileSync(file,'Not an archive');assert.throws(()=>readReferenceSource(file),/Invalid/);
  const bytes=Buffer.alloc(40);bytes.writeUInt32LE(0x04034b50,0);bytes.writeUInt16LE(8,6);writeFileSync(file,bytes);assert.throws(()=>readReferenceSource(file),/Unsupported/);
 }finally{rmSync(fixture,{recursive:true,force:true});}
});
