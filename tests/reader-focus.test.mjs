import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readerScope} from '../public/assets/books.js';

const app=readFileSync(new URL('../public/assets/app.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
const css=readFileSync(new URL('../public/assets/style.css',import.meta.url),'utf8');

test('a single verse is the exact ESV reader request, with its chapter accessible',()=>{
 assert.deepEqual(readerScope('John 3:16'),{query:'John 3:16',chapter:'John 3',focused:true});
 assert.deepEqual(readerScope('Ps.23.1'),{query:'Psalms 23:1',chapter:'Psalms 23',focused:true});
});
test('a range remains a range and a chapter stays a chapter',()=>{
 assert.deepEqual(readerScope('John 3:16-18'),{query:'John 3:16-18',chapter:'John 3',focused:true});
 assert.deepEqual(readerScope('John 3'),{query:'John 3',chapter:'John 3',focused:false});
 assert.equal(readerScope('Unicorn 2:2'),null);
});
test('reader loads the complete requested reference rather than its entire chapter',()=>{
 assert.match(app,/const requested=readerScope\(state\.ref\)\?\.query/);
 assert.match(app,/loadPassage\(requested\)/);
 assert.match(app,/encodeURIComponent\(reference\)/);
 assert.doesNotMatch(app,/loadPassage\(chapter\)/);
 assert.match(app,/state\.loadedPassage=reference/);
 assert.match(app,/requestId===state\.requestId/);
});
test('only verse and range references show the full-chapter action',()=>{
 assert.match(html,/id=\"reader-chapter-access\"[^>]*hidden/);
 assert.match(html,/id=\"read-full-chapter\"/);
 assert.match(app,/reader-chapter-access'\)\.hidden=!scope\?\.focused/);
 assert.match(app,/selectRef\(scope\.chapter\)/);
 assert.match(css,/\.reader-chapter-access\[hidden\]\{display:none\}/);
});
