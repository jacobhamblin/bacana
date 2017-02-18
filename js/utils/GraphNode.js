class GraphNode {
  constructor(props) {
    this.adjacent = props.adjacent || [];
    this.mesh = props.mesh || null;
    this.id = props.id;
  }

  add(node) {
    this.adjacent.push(node);
    node.adjacent.push(this);

    return node;
  }

  bfs(target, queue = [], callback, seen = {}, level = 0) {
    let newLevel = level;
    seen[this.id] = true;
    if (this === target) return this;
    if (callback) {
      callback(this, target, level);
      if (callback(this, target)) return this;
    } else if (this === target) {
      return this;
    }
    this.adjacent.forEach((n) => {
      let newNodes = false;
      if (!seen[n.id]) {
        queue.push(n);
        seen[n.id] = true;
        newNodes = true;
      }
      if (newNodes) newLevel++;
    });
    if (!queue.length) return null;
    return queue.pop().bfs(target, queue, callback, seen, newLevel);
  }
}

export default GraphNode;
