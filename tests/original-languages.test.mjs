import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {originalLanguageFor,verseScriptLanguage,originalVerseSelection} from '../public/assets/original-languages.js';

test('the Old Testament shows Hebrew, and the New Testament shows Syriac Aramaic',()=>{
 assert.equal(originalLanguageFor('Genesis 1:1').code,'he');
 assert.equal(originalLanguageFor('John 1:1').code,'syc');
 assert.equal(originalLanguageFor('Revelation 22:21').code,'syc');
 assert.equal(originalLanguageFor('Unknown 1:1'),null);
 assert.equal(verseScriptLanguage('Daniel 3:1',1),'arc');
 assert.equal(verseScriptLanguage('Ezra 6:18',18),'arc');
 assert.equal(verseScriptLanguage('Ezra 6:19',19),'he');
 assert.equal(verseScriptLanguage('Genesis 1:1',1),'he');
});
test('a one-verse or chapter request selects only the requested source lines',()=>{
 const data={chapters:{'1':{'1':'one','2':'two','3':'three'}}};
 assert.deepEqual(originalVerseSelection('John 1:2',data),[{number:2,text:'two'}]);
 assert.deepEqual(originalVerseSelection('John 1:2-3',data),[{number:2,text:'two'},{number:3,text:'three'}]);
 assert.equal(originalVerseSelection('John 1',data).length,3);
 assert.deepEqual(originalVerseSelection('John 1:3',null),[]);
});
test('all 66 pinned, locally hosted original-language source shards are available and integrity recorded',()=>{
 const dir=new URL('../public/data/originals/',import.meta.url);
 const manifest=JSON.parse(readFileSync(new URL('../sources/original-languages/manifest.json',import.meta.url),'utf8'));
 const files=readdirSync(dir).filter(file=>file.endsWith('.json')).sort();
 assert.equal(files.length,66);
 assert.deepEqual(Object.keys(manifest.files).sort(),files);
 assert.equal(manifest.sourceCommits.wlc,'db6c5c9b46b8f39346f10915ddb1a70dcd429901');
 assert.equal(manifest.sourceArchives.crosswirePeshitta.sha256,'badce0aa0a9b70a9c81891ed48d5a9e86de1e24d12ad4ad378e060e03cabc7b9');
 for(const file of files){
  const bytes=readFileSync(new URL('../public/data/originals/'+file,import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),manifest.files[file],file+' integrity');
  const data=JSON.parse(bytes.toString('utf8'));
  assert.ok(data.book&&data.language&&data.chapters?.['1']?.['1'],file+' first verse');
  assert.ok(['he','syc'].includes(data.language));
  if(data.language==='syc')assert.match(data.source,/CrossWire Peshitta.*1905/);
 }
 for(const [book,chapter,verse] of [['gen',1,1],['ps',3,1],['joel',3,1],['mal',4,1],['john',1,1],['rev',1,1]]){
  const data=JSON.parse(readFileSync(new URL('../public/data/originals/'+book+'.json',import.meta.url),'utf8'));
  assert.ok(data.chapters[String(chapter)]?.[String(verse)],book+' '+chapter+':'+verse);
 }
});
