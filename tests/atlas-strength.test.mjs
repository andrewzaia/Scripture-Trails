import test from 'node:test';
import assert from 'node:assert/strict';
import {maxDatasetVotes,relativeVoteBars} from '../public/assets/atlas-strength.js';

test('highest community vote total is scoped to dataset links',()=>{
 const links=[{type:'dataset',votes:42},{type:'editorial',votes:500},{type:'dataset',votes:18},{type:'dataset'}];
 assert.equal(maxDatasetVotes(links),42);
 assert.equal(maxDatasetVotes([{type:'editorial',votes:8}]),0);
});
test('seven bars scale proportionally to the strongest direct dataset link',()=>{
 assert.equal(relativeVoteBars(42,42),7);
 assert.equal(relativeVoteBars(21,42),4);
 assert.equal(relativeVoteBars(12,42),2);
 assert.equal(relativeVoteBars(2,42),1);
});
test('no votes or unavailable votes do not create false strength',()=>{
 assert.equal(relativeVoteBars(0,42),0);
 assert.equal(relativeVoteBars(undefined,42),0);
 assert.equal(relativeVoteBars(20,0),0);
 assert.equal(relativeVoteBars(-1,42),0);
 assert.equal(relativeVoteBars(100,42),7);
});
