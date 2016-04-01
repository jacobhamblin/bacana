class GraphNode {
  constructor(props) {
    this.adjacent = props.adjacent || [];
  }

  add(node) {
    this.adjacent.push(node);
    node.adjacent.push(this);

    return node;
  }
}

export default GraphNode;
