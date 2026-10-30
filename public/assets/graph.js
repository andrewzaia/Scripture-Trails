import {parseRef,shortRef} from './books.js';
import {buildShortestRouteTree,getOneHopConnections} from './atlas-shortest-path.js?v=0.41.0';
/** Distinguish a passage preview from the subsequent request to focus the Atlas. */
export function atlasNodeAction(center,preview,clicked){return clicked===preview&&clicked!==center?'focus':'preview';}
export class ScriptureGraph{
 constructor(canvas,onSelect){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.onSelect=onSelect;this.nodes=[];this.edges=[];this.scale=1;this.pan={x:0,y:0};this.drag=null;this.hover=null;this.route=null;this.routeTo=null;this.oneHop=null;this.previewRef=null;
  this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(canvas.parentElement);
  canvas.addEventListener('pointerdown',e=>this.down(e));canvas.addEventListener('pointermove',e=>this.move(e));canvas.addEventListener('pointerup',e=>this.up(e));canvas.addEventListener('pointercancel',()=>this.drag=null);canvas.addEventListener('pointerleave',()=>{this.hover=null;this.route=null;this.oneHop=null;this.draw();});
  canvas.addEventListener('wheel',e=>{e.preventDefault();this.zoom(e.deltaY<0?1.12:.89);},{passive:false});this.resize();
 }
 resize(){const box=this.canvas.getBoundingClientRect();if(!box.width||!box.height)return;const dpr=Math.min(devicePixelRatio||1,2);this.w=box.width;this.h=box.height;this.canvas.width=Math.round(box.width*dpr);this.canvas.height=Math.round(box.height*dpr);this.ctx.setTransform(dpr,0,0,dpr,0,0);this.draw();}
 setPreviewRef(ref){this.previewRef=ref;this.draw();}
 setData(result){this.center=result.center;this.previewRef=result.center;this.nodes=[];this.edges=[];this.hover=null;this.route=null;this.oneHop=null;const lookup=new Map();
  for(const [depth,refs] of result.layers.entries())for(const ref of refs){lookup.set(ref,this.nodes.length);this.nodes.push({ref,depth,x:0,y:0});}
  const drawn=new Set();for(const [ref,links] of Object.entries(result.linksByRef)){
   const a=lookup.get(ref);if(a===undefined)continue;
   for(const link of links){const b=lookup.get(link.to);if(b===undefined||a===b)continue;
    const key=[a,b].sort((x,y)=>x-y).join(':');if(drawn.has(key))continue;drawn.add(key);this.edges.push({a,b,type:link.type});}
  }
  this.routeTo=buildShortestRouteTree(this.nodes.length,this.edges,lookup.get(result.center)??0);
  for(const [depth,refs] of result.layers.entries()){
   const radius=depth*116;refs.forEach((ref,i)=>{const n=this.nodes[lookup.get(ref)];const angle=-Math.PI/2+(i/Math.max(1,refs.length))*2*Math.PI+(depth%2?.14:0);n.x=Math.cos(angle)*radius;n.y=Math.sin(angle)*radius;});
  }
  this.maxRing=(result.layers.length-1)*116;this.reset();
 }
 reset(){this.scale=Math.min(1,Math.max(.065,(Math.min(this.w||650,this.h||550)*.43)/(this.maxRing+35)));this.pan={x:0,y:0};this.draw();}
 zoom(mult){this.scale=Math.max(.065,Math.min(4.5,this.scale*mult));this.draw();}
 canvasPos(e){const r=this.canvas.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};}
 world(p){return{x:(p.x-this.w/2-this.pan.x)/this.scale,y:(p.y-this.h/2-this.pan.y)/this.scale};}
 hit(point){const p=this.world(point);for(let i=this.nodes.length-1;i>=0;i--){const n=this.nodes[i];const radius=Math.max(n.depth===0?17:10,8/this.scale);if(Math.hypot(n.x-p.x,n.y-p.y)<radius)return n;}return null;}
 down(e){this.canvas.setPointerCapture(e.pointerId);const p=this.canvasPos(e);this.drag={start:p,prev:p,moved:false,target:this.hit(p)};}
 move(e){const p=this.canvasPos(e);const hovered=this.hit(p);if(hovered!==this.hover){this.hover=hovered;const index=hovered?this.nodes.indexOf(hovered):-1;this.route=index>=0&&this.routeTo?this.routeTo(index):null;this.oneHop=index>=0?getOneHopConnections(this.nodes.length,this.edges,index):null;}if(this.drag){const dx=p.x-this.drag.prev.x,dy=p.y-this.drag.prev.y;if(Math.hypot(p.x-this.drag.start.x,p.y-this.drag.start.y)>6)this.drag.moved=true;if(this.drag.moved){this.pan.x+=dx;this.pan.y+=dy;}this.drag.prev=p;}this.canvas.style.cursor=this.hover?'pointer':this.drag?'grabbing':'grab';this.draw();}
 up(){if(!this.drag)return;const drag=this.drag;this.drag=null;if(!drag.moved&&drag.target)this.onSelect(drag.target.ref,atlasNodeAction(this.center,this.previewRef,drag.target.ref));this.draw();}
 draw(){if(!this.ctx||!this.w||!this.h)return;const ctx=this.ctx;ctx.clearRect(0,0,this.w,this.h);ctx.save();ctx.translate(this.w/2+this.pan.x,this.h/2+this.pan.y);ctx.scale(this.scale,this.scale);
  for(const edge of this.edges){const a=this.nodes[edge.a],b=this.nodes[edge.b];ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle=edge.type==='quotation'?'rgba(217,178,113,.63)':edge.type==='context'?'rgba(151,161,169,.25)':'rgba(118,162,158,.36)';ctx.lineWidth=edge.type==='context'?1:1.4;ctx.stroke();}
  // Direct neighbours are a secondary, one-hop hint; strong shortest-route edges take priority.
  if(this.oneHop){const routeEdges=new Set(this.route?.edges||[]);ctx.save();ctx.lineCap='round';ctx.lineWidth=Math.max(2.2,1.6/this.scale);ctx.strokeStyle='rgba(179,245,213,.67)';ctx.shadowColor='rgba(168,247,204,.45)';ctx.shadowBlur=7;for(const index of this.oneHop.edges){if(routeEdges.has(index))continue;const edge=this.edges[index],a=this.nodes[edge.a],b=this.nodes[edge.b];ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}ctx.restore();}
  if(this.route){ctx.save();ctx.lineCap='round';ctx.lineWidth=Math.max(4,2.6/this.scale);ctx.strokeStyle='#51efaa';ctx.shadowColor='rgba(48,231,146,.85)';ctx.shadowBlur=14;for(const index of this.route.edges){const edge=this.edges[index],a=this.nodes[edge.a],b=this.nodes[edge.b];ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}ctx.restore();}
  const routeNodes=new Set(this.route?.nodes||[]),neighbours=new Set(this.oneHop?.nodes||[]);
  for(const [index,n] of this.nodes.entries()){const onRoute=routeNodes.has(index),oneHop=!onRoute&&neighbours.has(index),selected=n.depth===0,previewed=n.ref===this.previewRef&&!selected,over=n===this.hover,old=parseRef(n.ref)?.book?.index<39,fill=onRoute?'#51efaa':oneHop?'#b3f5d5':selected?'#e0ba82':old?'#c6a77c':'#86b5ad';if(selected||over||onRoute||oneHop){ctx.beginPath();ctx.arc(n.x,n.y,onRoute?Math.max(selected?29:19,12/this.scale):oneHop?Math.max(18,11/this.scale):selected?29:19,0,Math.PI*2);ctx.fillStyle=onRoute?'rgba(49,226,147,.24)':oneHop?'rgba(179,245,213,.13)':selected?'rgba(210,165,101,.13)':'rgba(184,187,160,.16)';ctx.fill();}
   ctx.beginPath();ctx.arc(n.x,n.y,onRoute?Math.max(selected?15:over?11:9,5/this.scale):selected?15:over?11:9,0,Math.PI*2);ctx.fillStyle=onRoute?'#103c2f':oneHop?'#203d36':selected?'#d5ae76':'#172b33';ctx.fill();ctx.lineWidth=selected?3:2.3;ctx.strokeStyle=fill;ctx.stroke();if(previewed){ctx.beginPath();ctx.arc(n.x,n.y,Math.max(22,14/this.scale),0,Math.PI*2);ctx.strokeStyle='#f1ce94';ctx.lineWidth=2;ctx.stroke();}if(selected){ctx.beginPath();ctx.arc(n.x,n.y,4,0,Math.PI*2);ctx.fillStyle=onRoute?'#51efaa':'#24323a';ctx.fill();}
   const label=shortRef(n.ref);if(selected||over||(onRoute&&this.scale>.16)||(oneHop&&this.scale>.25)||(n.depth<=2&&this.scale>.35)){ctx.font=`${selected?'600 13':'11'}px Arial, sans-serif`;ctx.textAlign='center';ctx.fillStyle=onRoute?'#83f9c7':oneHop?'#c6f8df':selected?'#edd5ad':'#c0d0cb';ctx.fillText(label,n.x,n.y+(selected?35:27));}
  }ctx.restore();}
}
