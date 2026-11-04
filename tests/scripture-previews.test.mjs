import test from 'node:test';
import assert from 'node:assert/strict';
import {findScriptureReferences,previewQuery} from '../public/assets/scripture-previews.js';

test('recognises ordinary references, numbered books and ranges',()=>{
 const matches=findScriptureReferences('Compare John 3:16-18 and 1 Corinthians 13:4-7 with Psalm 23:1.');
 assert.deepEqual(matches.map(x=>x.ref),['John 3:16-18','1 Corinthians 13:4-7','Psalms 23:1']);
});
test('rejects unrelated numbers and impossible chapters',()=>{
 assert.deepEqual(findScriptureReferences('Version 1.2.0 and John 999:1 are not passages.'),[]);
});
test('caps chapter and long range previews without altering the full reference',()=>{
 assert.deepEqual(previewQuery('John 3:16-25'),{query:'John 3:16-21',partial:true});
 assert.deepEqual(previewQuery('John 3'),{query:'John 3:1-6',partial:true});
 assert.deepEqual(previewQuery('John 3:16'),{query:'John 3:16',partial:false});
});
test('normalises typographic range separators',()=>{
 assert.equal(findScriptureReferences('Read Rom 8:28\u201330.')[0].ref,'Romans 8:28-30');
});
