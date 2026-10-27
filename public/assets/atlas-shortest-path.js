/** Precompute minimum-hop routes using only the edges shown in the Atlas. */
export function buildShortestRouteTree(nodeCount, edges, root = 0) {
  const neighbours = Array.from({length: nodeCount}, () => []);
  for (let index = 0; index < edges.length; index++) {
    const {a, b} = edges[index];
    if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0 || a >= nodeCount || b >= nodeCount || a === b) continue;
    neighbours[a].push({node: b, edge: index});
    neighbours[b].push({node: a, edge: index});
  }
  const parent = Array(nodeCount).fill(-1), incomingEdge = Array(nodeCount).fill(-1);
  if (!Number.isInteger(root) || root < 0 || root >= nodeCount) return () => null;
  parent[root] = root;
  const queue = [root];
  for (let front = 0; front < queue.length; front++) {
    const from = queue[front];
    for (const next of neighbours[from]) {
      if (parent[next.node] !== -1) continue;
      parent[next.node] = from;
      incomingEdge[next.node] = next.edge;
      queue.push(next.node);
    }
  }
  return target => {
    if (!Number.isInteger(target) || target < 0 || target >= nodeCount || parent[target] === -1) return null;
    const nodes = [], routeEdges = [];
    let cursor = target;
    while (cursor !== root) {
      nodes.push(cursor);
      routeEdges.push(incomingEdge[cursor]);
      cursor = parent[cursor];
    }
    nodes.push(root);
    return {nodes: nodes.reverse(), edges: routeEdges.reverse()};
  };
}

/** Return only the displayed edges touching the hovered node and their immediate neighbours. */
export function getOneHopConnections(nodeCount, edges, target) {
  const result={nodes:[],edges:[]};
  if(!Number.isInteger(target)||target<0||target>=nodeCount)return result;
  const seen=new Set();
  for(let index=0;index<edges.length;index++){
    const {a,b}=edges[index]||{};
    if(!Number.isInteger(a)||!Number.isInteger(b)||a<0||b<0||a>=nodeCount||b>=nodeCount||a===b)continue;
    if(a!==target&&b!==target)continue;
    const neighbour=a===target?b:a;
    result.edges.push(index);
    if(!seen.has(neighbour)){seen.add(neighbour);result.nodes.push(neighbour);}
  }
  return result;
}
