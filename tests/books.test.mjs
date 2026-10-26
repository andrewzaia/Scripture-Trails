import test from 'node:test';
import assert from 'node:assert/strict';
import {BOOKS,parseRef,adjacentChapter} from '../public/assets/books.js';
import {EDITORIAL_LINKS,PATHS} from '../public/assets/studies.js';
test('has 66 books in two testaments',()=>{assert.equal(BOOKS.length,66);assert.equal(BOOKS.filter(x=>x.testament==='Old Testament').length,39);assert.equal(BOOKS[65].name,'Revelation');});
test('normalises verse and chapter references',()=>{for(const [input,expected] of [['Ps.23.1','Psalms 23:1'],['1Cor.5.7','1 Corinthians 5:7'],['Rev 21:4','Revelation 21:4'],['John 3','John 3'],['John 3:16-18','John 3:16-18']])assert.equal(parseRef(input)?.formatted,expected);});
test('rejects impossible chapters, invalid ranges, nonsense',()=>{for(const q of ['Genesis 51:1','John 0:1','John 3:18-16','Unicorn 1:1','John 3:0'])assert.equal(parseRef(q),null,q);});
test('crosses canonical book boundaries',()=>{assert.equal(adjacentChapter('Malachi 4',1),'Matthew 1');assert.equal(adjacentChapter('John 1',-1),'Luke 24');assert.equal(adjacentChapter('Genesis 1',-1),null);assert.equal(adjacentChapter('Revelation 22',1),null);});
test('every curated study and link resolves to a Bible reference',()=>{for(const path of PATHS){assert.ok(path.refs.length>=3);for(const ref of path.refs)assert.ok(parseRef(ref),ref);}for(const edge of EDITORIAL_LINKS){assert.ok(parseRef(edge.from),edge.from);assert.ok(parseRef(edge.to),edge.to);assert.notEqual(edge.from,edge.to);}});
