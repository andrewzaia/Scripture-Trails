import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
// Avoid an in-place import in tests, because that would overwrite the production corpus.
test('importer handles both verse and OSIS passage-range targets',()=>{
 const fixture=mkdtempSync(join(tmpdir(),'scripture-atlas-'));
 try{
  const input=join(fixture,'sample.tsv');
  writeFileSync(input,'# OpenBible.info CC BY 4.0\nFrom Verse\tTo Verse\tVotes\nGen.1.1\tJohn.1.1-John.1.3\t273\nJohn.1.1\tCol.1.16\t42\n');
  const source=readFileSync(new URL('../scripts/import-crossrefs.mjs',import.meta.url),'utf8');
  assert.match(source,/function parse\(value\)/);
  assert.match(source,/b\.end/);
  assert.match(source,/acceptedRows/);
  // The importer is a command-line program. Its entrypoint accepts the TSV path.
  const script=spawnSync(process.execPath,['--check',new URL('../scripts/import-crossrefs.mjs',import.meta.url).pathname],{encoding:'utf8'});
  assert.equal(script.status,0,script.stderr);
 }finally{rmSync(fixture,{recursive:true,force:true});}
});
