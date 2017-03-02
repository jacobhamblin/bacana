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

  bfs({
      target, queue = [], callback, seen = {}, targetFound, 
      callbackQueue = [], callbackFinish, continueCallback = true
    }) {
    seen[this.id] = seen[this.id] || [];
    if (this.id === target) {
      targetFound = true;  
      return this;
    }
    this.adjacent.forEach((n) => {
      if (!seen[n.id]) {
        queue.push(n);
        callbackQueue.push(n);
        seen[n.id] = seen[this.id].concat(this.id);
      }
    });
    if (callback && continueCallback) {
      if (callbackFinish) continueCallback = false;
      callback({
        node: this, target, path: seen[this.id],
        callbackFinish, callbackQueue
      });
    }
    if (!queue.length) return -1;
    return queue.shift().bfs({
      target, queue, callback, seen, continueCallback,
      callbackQueue, callbackFinish, targetFound
    });
  }

  dfs({
      target, callback, seen = {}, targetFound,
      callbackQueue = [this], callbackFinish, continueCallback = true
    }) {
    seen[this.id] = seen[this.id] || [];
    if (this.id === target) {
        targetFound = true;
        return this;
    }
    if (callback && continueCallback) {
      if (callbackFinish) continueCallback = false;
      callback({
        node: this, target, path: seen[this.id],
        callbackFinish, callbackQueue
      });
    }
    this.adjacent.forEach((n) => {
      if (!seen[n.id]) {
        seen[n.id] = seen[this.id].concat(this.id);
        callbackQueue.push(n)
        return n.dfs({
          target, callback, seen, continueCallback,
          callbackQueue, callbackFinish, targetFound
        });
      }
    });
    return -1;
  }
}

export default GraphNode;
