/**
 * Where an element stops being drawn: the padding box of the nearest ancestor
 * that clips it.
 *
 * A scroll container clips what it holds at its padding box, and so does any
 * other box whose overflow is not `visible`. That edge is the line a focus ring
 * or a floated label has to stay inside to be drawn whole. It is read off the
 * computed style rather than off a class name, because the claim is about what
 * the browser does and not about how it was asked.
 */
export function clipEdges(element: Element): { top: number; bottom: number } {
  let node = element.parentElement;

  while (node && getComputedStyle(node).overflowY === 'visible') {
    node = node.parentElement;
  }

  if (!node) {
    return { top: -Infinity, bottom: Infinity };
  }

  const top = node.getBoundingClientRect().top + node.clientTop;

  return { top, bottom: top + node.clientHeight };
}
