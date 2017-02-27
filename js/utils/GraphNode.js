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

  bfs({target, queue = [], callback, seen = {}}) {
    seen[this.id] = seen[this.id] || [];
    if (this.id === target) return this;
    if (callback) {
      callback(this, target, seen[this.id])
    }
    this.adjacent.forEach((n) => {
      if (!seen[n.id]) {
        queue.push(n);
        seen[n.id] = seen[this.id].concat(this.id);
      }
    });
    if (!queue.length) return -1;
    return queue.pop().bfs({target, queue, callback, seen});
  }

  dfs({target, callback, seen = {}}) {
    seen[this.id] = seen[this.id] || [];
    if (this.id === target) return this;
    if (callback) {
      if (callback(this, target, seen[this.id])) return this;
    }
    this.adjacent.forEach((n) => {
      if (!seen[n.id]) {
        seen[n.id] = seen[this.id].concat(this.id);
        return n.dfs({target, callback, seen});
      }
    });
    return -1;
  }
}

export default GraphNode;
