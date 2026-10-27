import test from 'node:test';
import assert from 'node:assert/strict';
import {buildShortestRouteTree} from '../public/assets/atlas-shortest-path.js';

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
