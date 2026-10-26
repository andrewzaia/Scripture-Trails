import {parseRef,shortRef} from './books.js';
export class ScriptureGraph{
 constructor(canvas,onSelect){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.onSelect=onSelect;this.nodes=[];this.edges=[];this.scale=1;this.pan={x:0,y:0};this.drag=null;this.hover=null;
  this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(canvas.parentElement);
  canvas.addEventListener('pointerdown',e=>this.down(e));canvas.addEventListener('pointermove',e=>this.move(e));canvas.addEventListener('pointerup',e=>this.up(e));canvas.addEventListener('pointercancel',()=>this.drag=null);canvas.addEventListener('pointerleave',()=>{this.hover=null;this.draw();});
  canvas.addEventListener('wheel',e=>{e.preventDefault();this.zoom(e.deltaY<0?1.12:.89);},{passive:false});this.resize();
 }
 resize(){const box=this.canvas.getBoundingClientRect();if(!box.width||!box.height)return;const dpr=Math.min(devicePixelRatio||1,2);this.w=box.width;this.h=box.height;this.canvas.width=Math.round(box.width*dpr);this.canvas.height=Math.round(box.height*dpr);this.ctx.setTransform(dpr,0,0,dpr,0,0);this.draw();}
 setData(center,links,depth=2){this.center=center;this.nodes=[];this.edges=[];const lookup=new Map([[center,0]]);this.nodes.push({ref:center,depth:0,x:0,y:0});let queue=[center];for(let layer=1;layer<=depth;layer++){
  const next=[];for(const ref of queue){for(const link of (links[ref]||[])){const target=link.to;if(!lookup.has(target)&&this.nodes.length<55){lookup.set(target,this.nodes.length);this.nodes.push({ref:target,depth:layer,x:0,y:0});next.push(target);}if(lookup.has(target)){const a=lookup.get(ref),b=lookup.get(target);if(a!==b&&!this.edges.some(e=>(e.a===a&&e.b===b)||(e.a===b&&e.b===a)))this.edges.push({a,b,type:link.type});}}
  }queue=next;}
  const byDepth=new Map();for(const node of this.nodes){if(!byDepth.has(node.depth))byDepth.set(node.depth,[]);byDepth.get(node.depth).push(node);}for(const [layer,list] of byDepth){const radius=[0,140,260,350][Math.min(layer,3)];list.forEach((n,i)=>{const angle=(-Math.PI/2)+(i/list.length)*Math.PI*2+(layer===2?.22:0);n.x=radius*Math.cos(angle);n.y=radius*Math.sin(angle);});}this.reset();
 }
 reset(){this.scale=.96;this.pan={x:0,y:0};this.draw();}
 zoom(mult){this.scale=Math.max(.35,Math.min(2.9,this.scale*mult));this.draw();}
 canvasPos(e){const r=this.canvas.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};}
 world(p){return{x:(p.x-this.w/2-this.pan.x)/this.scale,y:(p.y-this.h/2-this.pan.y)/this.scale};}
 hit(point){const p=this.world(point);for(let i=this.nodes.length-1;i>=0;i--){const n=this.nodes[i];const radius=(n.depth===0?22:12)+6/this.scale;if(Math.hypot(n.x-p.x,n.y-p.y)<radius)return n;}return null;}
 down(e){this.canvas.setPointerCapture(e.pointerId);const p=this.canvasPos(e);this.drag={start:p,prev:p,moved:false,target:this.hit(p)};}
 move(e){const p=this.canvasPos(e);this.hover=this.hit(p);if(this.drag){const dx=p.x-this.drag.prev.x,dy=p.y-this.drag.prev.y;if(Math.hypot(p.x-this.drag.start.x,p.y-this.drag.start.y)>6)this.drag.moved=true;if(this.drag.moved){this.pan.x+=dx;this.pan.y+=dy;}this.drag.prev=p;}this.canvas.style.cursor=this.hover?'pointer':this.drag?'grabbing':'grab';this.draw();}
 up(e){if(!this.drag)return;const drag=this.drag;this.drag=null;if(!drag.moved&&drag.target)this.onSelect(drag.target.ref);this.draw();}
 draw(){if(!this.ctx||!this.w||!this.h)return;const ctx=this.ctx;ctx.clearRect(0,0,this.w,this.h);ctx.save();ctx.translate(this.w/2+this.pan.x,this.h/2+this.pan.y);ctx.scale(this.scale,this.scale);
  for(const edge of this.edges){const a=this.nodes[edge.a],b=this.nodes[edge.b];ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle=edge.type==='quotation'?'rgba(217,178,113,.59)':'rgba(118,162,158,.35)';ctx.lineWidth=1.3;ctx.stroke();}
  for(const n of this.nodes){const selected=n.depth===0,over=n===this.hover,old=parseRef(n.ref)?.book?.index<39,fill=selected?'#e0ba82':old?'#c6a77c':'#86b5ad';if(selected||over){ctx.beginPath();ctx.arc(n.x,n.y,selected?31:20,0,Math.PI*2);ctx.fillStyle=selected?'rgba(210,165,101,.11)':'rgba(184,187,160,.12)';ctx.fill();}
   ctx.beginPath();ctx.arc(n.x,n.y,selected?15:over?11:9,0,Math.PI*2);ctx.fillStyle=selected?'#d5ae76':'#172b33';ctx.fill();ctx.lineWidth=selected?3:2.3;ctx.strokeStyle=fill;ctx.stroke();if(selected){ctx.beginPath();ctx.arc(n.x,n.y,4,0,Math.PI*2);ctx.fillStyle='#24323a';ctx.fill();}
   const label=shortRef(n.ref);const show=n.depth<2||over||this.nodes.length<24;if(show){ctx.font=`${selected?'600 13':'11'}px Arial, sans-serif`;ctx.textAlign='center';ctx.fillStyle=selected?'#edd5ad':'#c0d0cb';ctx.fillText(label,n.x,n.y+(selected?35:27));}
  }ctx.restore();}
}
