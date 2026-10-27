import test from 'node:test';
import assert from 'node:assert/strict';
import {buildShortestRouteTree,getOneHopConnections} from '../public/assets/atlas-shortest-path.js';

test('highlights the direct shortcut instead of a longer discovery route', () => {
  const routeTo = buildShortestRouteTree(5, [
    {a:0,b:1},{a:1,b:2},{a:2,b:3},{a:3,b:4},{a:0,b:3}
  ]);
  assert.deepEqual(routeTo(4), {nodes:[0,3,4], edges:[4,3]});
});

test('handles cycles and consistently picks one minimum-hop path', () => {
  const routeTo = buildShortestRouteTree(4, [
    {a:0,b:1},{a:0,b:2},{a:1,b:3},{a:2,b:3},{a:1,b:2}
  ]);
  assert.deepEqual(routeTo(3), {nodes:[0,1,3], edges:[0,2]});
  assert.deepEqual(routeTo(0), {nodes:[0], edges:[]});
});

test('does not invent routes through disconnected or invalid edges', () => {
  const routeTo = buildShortestRouteTree(5, [{a:0,b:1},{a:2,b:3},{a:9,b:1},{a:4,b:4}]);
  assert.equal(routeTo(3), null);
  assert.equal(routeTo(4), null);
  assert.equal(routeTo(5), null);
  assert.equal(routeTo(-1), null);
});

test('works when the centre is not node zero', () => {
  const routeTo = buildShortestRouteTree(3, [{a:0,b:1},{a:1,b:2}], 2);
  assert.deepEqual(routeTo(0), {nodes:[2,1,0], edges:[1,0]});
});

test('highlights only one-hop neighbours, not their neighbours', () => {
  const edges=[{a:0,b:1},{a:1,b:2},{a:2,b:3},{a:2,b:4},{a:4,b:5}];
  assert.deepEqual(getOneHopConnections(6,edges,2),{nodes:[1,3,4],edges:[1,2,3]});
  assert.ok(!getOneHopConnections(6,edges,2).nodes.includes(5));
});

test('one-hop neighbours work in both edge directions and exclude repeated nodes', () => {
  const edges=[{a:2,b:0},{a:0,b:2},{a:0,b:3},{a:3,b:4}];
  assert.deepEqual(getOneHopConnections(5,edges,0),{nodes:[2,3],edges:[0,1,2]});
});

test('one-hop discovery ignores disconnected, invalid and self-link edges', () => {
  const edges=[{a:0,b:1},{a:3,b:4},{a:1,b:1},{a:1,b:99},{a:-2,b:1}];
  assert.deepEqual(getOneHopConnections(5,edges,1),{nodes:[0],edges:[0]});
  assert.deepEqual(getOneHopConnections(5,edges,5),{nodes:[],edges:[]});
});
