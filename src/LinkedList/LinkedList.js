class _Node {
    constructor(value, next) {
      this.value = value;
      this.next = next;
    }
  }
  class LinkedList {
    constructor() {
      this.head = null;
    }
    display() {
      let current = this.head;
      while (current) {
        console.log(current.value);
        current = current.next;
      }
    }
    size() {
      let current = this.head;
      let count = 0;
      while (current) {
        current = current.next;
        count++;
      }
      console.log(count);
    }
    isEmpty() {
      if (this.head === null) {
        console.log("true");
      } else {
        console.log("false");
      }
    }
    findPrevious(item) {
      let current = this.head;
      let previous;
      if(!item) {
        throw 'must contain item'
      }
      if (!this.head) {
        return null;
      }
      while (current.value !== item) {
        if (current.next === null) {
          return null;
        } else {
          previous = current;
          current = current.next;
        }
      }
      console.log(previous.value);
    }
    findLast() {
      let current = this.head;
      while(current.next !== null) {
        current = current.next;
      }
      console.log(current.value)
    }
    insertFirst(item) {
      this.head = new _Node(item, this.head);
      this.next = null;
    }
    findIndex(item) {
      // Start at the head
      let currNode = this.head;
      let index = 0;
      // If the list is empty
      if (!this.head) {
        return null;
      }
      // Check for the item
      while (currNode.value !== item) {
        /* Return null if it's the end of the list 
                 and the item is not on the list */
        if (currNode.next === null) {
          return null;
        } else {
          // Otherwise, keep looking
          currNode = currNode.next;
          index++;
        }
      }
      return index;
    }
    insertBefore(item, key) {
      if (!key) {
        return;
      }
      if (this.head === null) {
        this.insertFirst(item);
        return;
      }
      const node = new _Node(item);
      let previous;
      let current = this.head;
      while (current && current.value !== key) {
        previous = current;
        current = current.next;
      }
      if (!previous) {
        this.insertFirst(item);
      } else {
        node.next = current;
        previous.next = node;
      }
    }
    insertAfter(item, key) {
      if (!key) {
        throw "what key?";
      }
      if (this.head === null) {
        throw "Key doesn't exist";
      }
      const node = new _Node(item);
      let current = this.head;
      while (current && current.value !== key) {
        current = current.next;
      }
      if (!current) {
        throw "key does not exist";
      }
      node.next = current.next;
      current.next = node;
    }
    insertAt(item, index) {
      if (index > 0 && index > this.size) {
        return;
      }
      if (index === 0) {
        this.insertFirst(item);
        return;
      }
      const node = new _Node(item);
      let current, previous;
      current = this.head;
      let count = 0;
      while (count < index) {
        previous = current;
        count++;
        current = current.next;
      }
      node.next = current;
      previous.next = node;
    }
    insertLast(item) {
      if (this.head === null) {
        this.insertFirst(item);
      } else {
        let tempNode = this.head;
        while (tempNode.next !== null) {
          tempNode = tempNode.next;
        }
        tempNode.next = new _Node(item, null);
      }
    }
    find(item) {
      // Start at the head
      let currNode = this.head;
      // If the list is empty
      if (!this.head) {
        return null;
      }
      // Check for the item
      while (currNode.value !== item) {
        /* Return null if it's the end of the list 
                 and the item is not on the list */
        if (currNode.next === null) {
          return null;
        } else {
          // Otherwise, keep looking
          currNode = currNode.next;
        }
      }
      // Found it
      return currNode;
    }
    remove(item) {
      // If the list is empty
      if (!this.head) {
        return null;
      }
      // If the node to be removed is head, make the next node head
      if (this.head.value === item) {
        this.head = this.head.next;
        return;
      }
      // Start at the head
      let currNode = this.head;
      // Keep track of previous
      let previousNode = this.head;
  
      while (currNode !== null && currNode.value !== item) {
        // Save the previous node
        previousNode = currNode;
        currNode = currNode.next;
      }
      if (currNode === null) {
        console.log("Item not found");
        return;
      }
      previousNode.next = currNode.next;
    }
  }
  module.exports = LinkedList;
  