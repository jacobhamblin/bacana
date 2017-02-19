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

  bfs(target, queue = [], callback, seen = {}) {
    seen[this.id] = seen[this.id] || [];
    if (this === target) return this;
    if (callback) {
      callback(this, target, seen[this.id]);
      //if (callback(this, target, seen[this.id])) return this;
    } else if (this === target) {
      return this;
    }
    this.adjacent.forEach((n) => {
      if (!seen[n.id]) {
        queue.push(n);
        seen[n.id] = seen[this.id].concat(this.id);
      }
    });
    if (!queue.length) return null;
    return queue.pop().bfs(target, queue, callback, seen);
  }
}

export default GraphNode;
