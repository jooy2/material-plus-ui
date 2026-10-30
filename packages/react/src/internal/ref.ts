import * as React from 'react';

/**
 * One callback ref that hands the node to several refs, for a component that
 * needs its own handle on an element a caller also holds a ref to.
 *
 * Memoised on the refs, so the callback is stable for as long as they are and
 * React does not detach and reattach it on every render.
 */
export function useJoinedRef<Node>(
  ...refs: (React.Ref<Node> | undefined)[]
): React.RefCallback<Node> {
  // The refs themselves are the dependencies.
  return React.useCallback((node: Node | null) => {
    for (const ref of refs) {
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        (ref as React.RefObject<Node | null>).current = node;
      }
    }
  }, refs);
}
