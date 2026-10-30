/**
 * A `children` list, as nodes with keys.
 *
 * A2UI never nests components. A layout's `children` is a list of ids, and the
 * renderer resolves each id against the surface — which is what `buildChild`
 * does. The list arrives in one of two shapes, and both mean "these children, in
 * this order":
 *
 * - a plain id, for a fixed child the agent wrote down;
 * - an id with a `basePath`, for a child generated from a data list. The path is
 *   the row that child reads, so the same component definition draws once per
 *   row and each copy binds to its own.
 *
 * The key has to carry the path for the second shape. One template over five
 * rows is five children of the same id, and keying on the id alone would make
 * them one child that React re-mounts as the data moves.
 */
import type { ResolvedChildRef } from '@a2ui/web_core/v0_9';
import type * as React from 'react';

/** What a component implementation is handed to resolve an id with. */
export type MPA2uiBuildChild = (id: string, basePath?: string) => React.ReactNode;

/** One resolved child, ready to be placed. */
export interface MPA2uiChild {
  key: string;
  node: React.ReactNode;
}

/** The list a layout was given, resolved in order. */
export const childNodes = (
  children: readonly (string | ResolvedChildRef)[] | undefined,
  buildChild: MPA2uiBuildChild
): MPA2uiChild[] => {
  if (!Array.isArray(children)) {
    return [];
  }

  return children.map((child, index) => {
    if (typeof child === 'string') {
      return { key: `${child}-${index}`, node: buildChild(child) };
    }

    return {
      key: `${child.id}-${child.basePath}`,
      node: buildChild(child.id, child.basePath)
    };
  });
};
