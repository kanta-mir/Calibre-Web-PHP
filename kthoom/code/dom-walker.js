/**
 * dom-walker.js
 *
 * Licensed under the MIT License
 *
 * Copyright(c) 2019 Google Inc.
 */

export const NodeType = {
  ELEMENT: 1,
  TEXT: 3,
};

/**
 * Do depth-first traversal of a DOM tree.
 * @param {Node} topNode The top node of a DOM tree.  This node must not have a parentElement.
 * @param {Function(Element)} callbackFn
 */
export function walkDom(topNode, callbackFn) {
  if (topNode.parentElement) {
    throw 'Top node in walkDom() must not have a parentElement';
  }

  let curNode = topNode;
  while (curNode) {
    callbackFn(curNode);

    // First, try to go to first child.
    let nextNode = curNode.firstChild;
    // If that fails, try to go to next sibling.
    if (!nextNode) nextNode = curNode.nextSibling;
    // If that fails, keep trying to go to parent's next sibling, going up the tree, if needed.
    while (!nextNode && curNode.parentElement) {
      nextNode = curNode.parentElement.nextSibling;
      if (!nextNode) curNode = curNode.parentElement;
    }
    curNode = nextNode;
  }
}
