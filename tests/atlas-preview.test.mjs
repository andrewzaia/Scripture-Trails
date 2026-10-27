import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ScriptureGraph,atlasNodeAction} from '../public/assets/graph.js';

test('a first click previews and only a second click on that same node requests focus',()=>{
 assert.equal(atlasNodeAction('John 1:1','John 1:1','John 1:2'),'preview');
 assert.equal(atlasNodeAction('John 1:1','John 1:2','John 1:2'),'focus');
 assert.equal(atlasNodeAction('John 1:1','John 1:2','John 1:3'),'preview');
 assert.equal(atlasNodeAction('John 1:1','John 1:1','John 1:1'),'preview');
 assert.equal(atlasNodeAction('John 1:1','John 1:2','John 1:1'),'preview');
});

test('graph click callback differentiates preview and focus without rebuilding node data',()=>{
 const previous=globalThis.ResizeObserver,oldDpr=globalThis.devicePixelRatio;
 globalThis.ResizeObserver=class{observe(){}};
 globalThis.devicePixelRatio=1;
 try{
  const ctx=new Proxy({}, {get:(object,key)=>object[key]||(()=>{})});
  const canvas={parentElement:{},style:{},getContext:()=>ctx,getBoundingClientRect:()=>({left:0,top:0,width:700,height:450}),addEventListener(){},setPointerCapture(){}};
  const clicks=[],graph=new ScriptureGraph(canvas,(ref,action)=>clicks.push({ref,action}));
  graph.setData({center:'John 1:1',layers:[['John 1:1'],['John 1:2','John 1:3']],linksByRef:{'John 1:1':[{to:'John 1:2',type:'dataset'},{to:'John 1:3',type:'dataset'}]}});
  const initialNodes=graph.nodes;
  const node=graph.nodes.find(n=>n.ref==='John 1:2');
  graph.drag={moved:false,target:node};graph.up();
  assert.deepEqual(clicks.at(-1),{ref:'John 1:2',action:'preview'});
  assert.equal(graph.nodes,initialNodes);
  assert.equal(graph.center,'John 1:1');
  graph.setPreviewRef('John 1:2');
  graph.drag={moved:false,target:node};graph.up();
  assert.deepEqual(clicks.at(-1),{ref:'John 1:2',action:'focus'});
  graph.setPreviewRef('John 1:3');
  graph.drag={moved:false,target:node};graph.up();
  assert.deepEqual(clicks.at(-1),{ref:'John 1:2',action:'preview'});
 }finally{
  if(previous===undefined)delete globalThis.ResizeObserver;
  else globalThis.ResizeObserver=previous;
  if(oldDpr===undefined)delete globalThis.devicePixelRatio;
  else globalThis.devicePixelRatio=oldDpr;
 }
});

test('Atlas passage panel is below graph, supports translation and manual focus',()=>{
 const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
 const canvas=html.indexOf('id="graph-canvas"');
 const preview=html.indexOf('id="atlas-preview-content"');
 const aside=html.indexOf('class="panel graph-details"');
 assert.ok(canvas>=0&&preview>canvas&&aside>preview);
 for(const id of ['atlas-preview-ref','atlas-preview-translation','atlas-preview-focus','atlas-preview-credit'])assert.ok(html.includes('id="'+id+'"'));
 assert.match(html,/Click a node once to preview its passage/);
});

test('Atlas preview uses licensed passage endpoint and reports API.Bible views',()=>{
 const app=readFileSync(new URL('../public/assets/app.js',import.meta.url),'utf8');
 assert.match(app,/async function renderAtlasPreview\(reference\)/);
 assert.match(app,/state\.atlasPreviewRequestId/);
 assert.match(app,/state\.graph\?\.setPreviewRef\(ref\)/);
 assert.match(app,/reportScriptureView\(payload\.fums\)/);
 assert.match(app,/activateAtlasNode\(ref,action='preview'\)/);
 assert.match(app,/if\(action==='focus'\)selectRef\(ref,'connections'\)/);
 assert.match(app,/selectRef\(state\.atlasPreviewRef\|\|state\.ref,'reader'\)/);
 assert.match(app,/function renderAtlasPreview|async function renderAtlasPreview/);
});
