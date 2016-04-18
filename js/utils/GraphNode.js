class GraphNode {
  constructor(props) {
    this.adjacent = props.adjacent || [];
    this.mesh = props.mesh || null;
  }

  add(node) {
    this.adjacent.push(node);
    node.adjacent.push(this);

    return node;
  }
}

export default GraphNode;
