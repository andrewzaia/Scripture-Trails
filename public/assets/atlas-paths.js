/** Bounded, breadth-first verse discovery. A level is one reference hop, not a theological claim. */
export async function buildAtlas(start, depth, getConnections, options={}) {
  const maxDepth=Math.max(1,Math.min(10,Number(depth)||1));
  const layerWidth=Math.max(1,Math.min(16,options.layerWidth||10));
  const perSource=Math.max(1,Math.min(12,options.perSource||4));
  const seen=new Set([start]), layers=[[start]], linksByRef={};
  let frontier=[start], truncated=false;
  const cancelled=options.cancelled||(()=>false);
  for(let level=1;level<=maxDepth&&frontier.length;level++){
    if(cancelled())return null;
    const entries=await Promise.all(frontier.map(async ref=>({ref,links:await getConnections(ref)})));
    if(cancelled())return null;
    const queue=entries.map(({ref,links})=>({ref, links:links.filter(l=>l&&l.to&&l.to!==ref).slice(0,level===1?25:perSource*5), i:0,added:0,cap:level===1?layerWidth:perSource}));
    const next=[];
    // Round-robin selection prevents the first hub in a layer from consuming every slot.
    while(next.length<layerWidth && queue.some(q=>q.i<q.links.length && q.added<q.cap)){
      let progressed=false;
      for(const entry of queue){
        while(entry.i<entry.links.length && entry.added<entry.cap){
          const link=entry.links[entry.i++];
          if(seen.has(link.to))continue;
          seen.add(link.to);next.push(link.to);entry.added++;progressed=true;
          if(next.length>=layerWidth)break;
          break;
        }
        if(next.length>=layerWidth)break;
      }
      if(!progressed)break;
    }
    for(const entry of entries)linksByRef[entry.ref]=entry.links;
    if(queue.some(q=>q.i<q.links.length))truncated=true;
    if(!next.length)break;
    layers.push(next);frontier=next;
  }
  return {center:start,layers,linksByRef,depthRequested:maxDepth,depthReached:layers.length-1,nodes:layers.flat().length,truncated};
}
