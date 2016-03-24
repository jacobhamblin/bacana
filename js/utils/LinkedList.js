class LinkedList {
  constructor(props) {
    this.head = null;
  }

  add(value) {
    let node = {
      value,
      next: null
    }
    let current;

    if (this.head === null) {
      this.head = node;
    } else {
      current = this.head;
      while (current.next) {
        current = current.next;
      }
      current.next = node;
    }
    return node;
  }

  remove(node) {
    let current, value = node.value;

    if (this.head !== null) {
      if (this.head === node) {
        this.head = this.head.next;
        node.next = null;
        return value;
      }
      current = this.head;
    }
  }

  map(cb) {
    let current = this.head;
    while (current.next) {
      cb(current);
      current = current.next;
    }
  }
}

export default LinkedList;
