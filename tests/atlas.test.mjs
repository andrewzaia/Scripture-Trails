import test from 'node:test';import assert from 'node:assert/strict';
import {buildAtlas} from '../public/assets/atlas-paths.js';
test('bounded atlas can reach 10 actual reference hops',async()=>{
 const get=async(ref)=>[{to:`Step ${Number(ref.split(' ')[1])+1}`,type:'dataset',votes:4}];
 const path=await buildAtlas('Step 0',10,get);
 assert.equal(path.depthReached,10);assert.equal(path.nodes,11);assert.deepEqual(path.layers[10],['Step 10']);
});
test('atlas constrains breadth, prevents cycles, and labels remaining depth',async()=>{
 const get=async(ref)=>[{to:'A',type:'dataset'},{to:'B',type:'dataset'},{to:ref,type:'dataset'}];
 const path=await buildAtlas('Root',10,get,{layerWidth:1,perSource:4});
 assert.equal(path.layers[1].length,1);assert.equal(path.nodes,3);assert.ok(path.depthReached<10);
});
test('atlas cancels stale requests',async()=>{
 const path=await buildAtlas('Root',3,async()=>[{to:'Next',type:'dataset'}],{cancelled:()=>true});assert.equal(path,null);
});

test('centre can show ten strongest direct links without exponential expansion',async()=>{
 const path=await buildAtlas('Root',1,async()=>Array.from({length:25},(_,i)=>({to:`V ${i+1}`,type:'dataset'})));
 assert.equal(path.depthReached,1);assert.equal(path.layers[1].length,10);assert.equal(path.nodes,11);
});
