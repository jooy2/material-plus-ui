import * as React from 'react';
import { accentSlots } from '../../internal/accent';
import type { MPTypographyWeight } from '../typography/MPTypography';
import type { MPColor, MPVariant } from '../../types';

/**
 * The four weights a mark can be drawn at.
 *
 * `elevated` is deliberately absent, and it is the one member of `MPVariant` that
 * could not mean anything here: elevation is a surface lifting off the page, and
 * a mark is *inside* a line of text. A raised word would cast a shadow onto the
 * sentence it is part of.
 */
export type MPHighlightVariant = Exclude<MPVariant, 'elevated'>;

export interface MPHighlightProps extends Omit<React.ComponentPropsWithoutRef<'span'>, 'color'> {
  /**
   * What to find.
   *
   * A string is one term, an array is several — the longest is tried first, so
   * `['data', 'database']` marks the whole word rather than the first four
   * letters of it. A `RegExp` is used as written, with the global flag forced on;
   * `caseSensitive` and `wholeWord` are ignored for it, because a regular
   * expression already says both of those things itself.
   */
  query: string | string[] | RegExp;
  /**
   * How much surface the mark paints.
   *
   * `tonal` is the default, and it is the only one of the four that is a
   * highlighter pen: MD3's container roles are a pale wash under dark ink, which
   * is a marked word rather than a word replaced by a block of colour. `filled`
   * is the accent proper under its own ink — loud, and right for one match on a
   * page. `outlined` boxes the word, `text` recolours it and draws nothing.
   * @default 'tonal'
   */
  variant?: MPHighlightVariant;
  /**
   * Which accent family the mark reads.
   *
   * `tertiary` rather than `primary`, and this is the one place in the library
   * where that is the right default. `primary` is what a page uses for the thing
   * it wants pressed; a search match is not that, and a page whose marked words
   * are the same colour as its buttons has two things competing to be the loudest
   * thing on it.
   * @default 'tertiary'
   */
  color?: MPColor;
  /**
   * Whether `a` and `A` are different letters.
   * @default false
   */
  caseSensitive?: boolean;
  /**
   * Whether a term has to be a word on its own — `cat` marking "cat" but not
   * "concatenate".
   *
   * A word here is a run of letters, digits and underscores in any script, so it
   * means what it should for `café` and `naïve`. It means very little for Korean
   * or Japanese, where a phrase is not delimited by spaces at all; that is a
   * property of the writing system rather than of this prop, and is why it is off
   * by default.
   * @default false
   */
  wholeWord?: boolean;
  /** Underlines the mark as well. Combines with every variant. */
  underline?: boolean;
  /**
   * Sets the mark's weight. Omit it and the mark is the weight of the text around
   * it — the surface is already saying "this one", and a bolded word inside a
   * sentence changes the rhythm of the whole line.
   */
  weight?: MPTypographyWeight;
  /**
   * The text to search. Elements are walked into and left otherwise untouched, so
   * a match inside a `<strong>` is still marked and the `<strong>` survives.
   */
  children?: React.ReactNode;
}

/**
 * There is no `size` here, and it is the one prop a reader will look for.
 *
 * A mark sits inside running text and has to be the size of the text it is
 * inside; a `size` prop would only offer ways to be wrong. This is the same
 * reason `MPIcon` is off the ladder — see the prop conventions.
 */
const VARIANT: Record<MPHighlightVariant, string> = {
  filled: 'bg-(--_mp-accent) text-(--_mp-on-accent)',
  tonal: 'bg-(--_mp-accent-container) text-(--_mp-on-accent-container)',
  outlined: 'border border-(--_mp-accent) bg-transparent text-(--_mp-accent)',
  // Both properties are still set. A `<mark>` arrives from the browser's own
  // stylesheet with a yellow background and black ink, so "no surface" has to be
  // said out loud or it turns into the user agent's surface.
  text: 'bg-transparent text-(--_mp-accent)'
};

const WEIGHT: Record<MPTypographyWeight, string> = {
  regular: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold'
};

/** Letters, digits and underscores in any script — what `wholeWord` counts. */
const WORD_CHARACTER = /[\p{L}\p{N}_]/u;

/**
 * The characters a regular expression treats as syntax.
 *
 * `-` is in the set even though it only means anything inside a character class
 * and nothing here builds one. It is what the specification's own
 * `RegExp.escape` escapes, and a term that comes out of a search box is not
 * something to be clever about: the cost of one redundant backslash is nothing,
 * and the cost of a missing one is a query that means something other than what
 * was typed.
 */
function escapeRegExp(text: string): string {
  // The `-` comes first, where it is a literal rather than the start of a range
  // and so needs no escape of its own.
  return text.replace(/[-.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Turns the `query` prop into one expression, or `null` when there is nothing to
 * look for — an empty search box should leave the text exactly as it was, not
 * mark every character in it.
 *
 * Terms are sorted longest first because alternation in a regular expression is
 * first-match-wins: without it `['data', 'database']` would mark `data` and stop,
 * leaving `base` outside the mark.
 */
function buildPattern(query: string | string[] | RegExp, caseSensitive: boolean): RegExp | null {
  if (query instanceof RegExp) {
    /*
     * Copied even when it is already global, rather than used as it stands.
     *
     * `markString` drives the expression with `exec` in a loop, which means it
     * writes `lastIndex`. Doing that to the caller's own object would leave a
     * module-level `const RE = /…/g` somewhere else in their application
     * holding an offset this component put there — a bug that shows up as a
     * search that skips its first few matches, nowhere near the component that
     * caused it.
     */
    return new RegExp(query.source, query.global ? query.flags : `${query.flags}g`);
  }

  const terms = (Array.isArray(query) ? query : [query])
    .map((term) => term.trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  if (terms.length === 0) {
    return null;
  }

  return new RegExp(terms.map(escapeRegExp).join('|'), caseSensitive ? 'gu' : 'giu');
}

/**
 * Whether a match is a whole word.
 *
 * Two character tests rather than a lookbehind in the pattern. Lookbehind is the
 * one regular-expression feature this library would have to think about shipping
 * — Safari only grew it in 16.4 — and this costs nothing and works everywhere.
 */
function isWholeWord(text: string, start: number, end: number): boolean {
  const before = start > 0 ? text[start - 1] : '';
  const after = end < text.length ? text[end] : '';

  return !WORD_CHARACTER.test(before) && !WORD_CHARACTER.test(after);
}

/**
 * Splits one string into plain runs and marked ones.
 *
 * Returns the string itself when nothing matched, so an unmatched text node stays
 * a text node rather than becoming an array of one.
 */
function markString(
  text: string,
  pattern: RegExp,
  wholeWord: boolean,
  mark: (matched: string, key: string) => React.ReactNode
): React.ReactNode {
  pattern.lastIndex = 0;

  const parts: React.ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    // A pattern that can match nothing — `/x*/` — would otherwise never advance.
    if (match[0] === '') {
      pattern.lastIndex += 1;
      continue;
    }

    const start = match.index;
    const end = start + match[0].length;

    if (wholeWord && !isWholeWord(text, start, end)) {
      continue;
    }

    if (start > cursor) {
      parts.push(text.slice(cursor, start));
    }

    parts.push(mark(match[0], String(start)));
    cursor = end;
  }

  if (parts.length === 0) {
    return text;
  }

  if (cursor < text.length) {
    parts.push(text.slice(cursor));
  }

  return parts;
}

/**
 * Walks the tree, marking the text in it and leaving everything else alone.
 *
 * The alternative — requiring `children` to be a string — is what most libraries
 * do, and it fails on the first search result that has a `<strong>` in it. An
 * element is cloned with its children marked, which keeps its type, its props and
 * its key; anything that is not a string, a number, an array or an element with
 * children is returned untouched.
 */
function markNode(
  node: React.ReactNode,
  pattern: RegExp,
  wholeWord: boolean,
  mark: (matched: string, key: string) => React.ReactNode
): React.ReactNode {
  if (typeof node === 'string') {
    return markString(node, pattern, wholeWord, mark);
  }

  if (typeof node === 'number') {
    return markString(String(node), pattern, wholeWord, mark);
  }

  if (Array.isArray(node)) {
    return React.Children.map(node, (child) => markNode(child, pattern, wholeWord, mark));
  }

  if (React.isValidElement(node)) {
    const children = (node.props as { children?: React.ReactNode }).children;

    // A component whose children are a render prop, and every void element:
    // there is no text in either, and cloning one with a `children` it never
    // declared is how an `<input>` ends up with a child.
    if (children === undefined || typeof children === 'function') {
      return node;
    }

    return React.cloneElement(node, undefined, markNode(children, pattern, wholeWord, mark));
  }

  return node;
}

/**
 * Marks the words a reader is looking for, inside text they were already reading.
 *
 * The component is the search, not just the styling: `query` is what a search box
 * holds, and everything about *how* the matching is done — case, whole words, a
 * regular expression — is a prop rather than something a caller has to
 * pre-compute into a list of offsets.
 *
 * The mark is a real `<mark>`, which is the element for text of relevance to the
 * reader and is announced as such. That has one consequence worth knowing:
 * marking eleven words in a paragraph tells a screen reader that eleven things
 * are important, which is a way of saying nothing. A highlight is for a handful
 * of matches.
 *
 * Nothing here is stateful and nothing measures — the whole component is a pure
 * function of `children` and `query`, so it re-marks on its own the moment the
 * search box changes.
 */
export const MPHighlight = React.forwardRef<HTMLSpanElement, MPHighlightProps>(function MPHighlight(
  {
    query,
    variant = 'tonal',
    color = 'tertiary',
    caseSensitive = false,
    wholeWord = false,
    underline = false,
    weight,
    className,
    style,
    children,
    ...props
  },
  ref
) {
  /*
   * Keyed on what the query *says* rather than on the object that says it.
   *
   * `query={['data', 'database']}` and `query={/\bfoo\b/}` are both a fresh
   * object on every render when written inline, which is how they are usually
   * written — so an identity-keyed memo would rebuild the expression, and with
   * it re-walk the whole tree below, on every keystroke of the search box.
   */
  const queryKey =
    query instanceof RegExp
      ? `re ${query.source} ${query.flags}`
      : Array.isArray(query)
        ? `a ${query.join(' ')}`
        : `s ${query}`;

  // `queryKey` and `caseSensitive` are the whole dependency: they are what
  // `query` amounts to, and it is read from the render the key belongs to.
  const pattern = React.useMemo(
    () => buildPattern(query, caseSensitive),
    [queryKey, caseSensitive]
  );

  const markClasses = [
    // A hair of padding so the wash does not sit flush against the letters, and
    // the same hair back out as a negative margin so the marked line is exactly
    // as long as it was. A mark must not move the text around it.
    'rounded-mp-xs -mx-0.5 px-0.5',
    // A mark that wraps across two lines gets its corners on both fragments
    // rather than one long box with two square ends.
    'box-decoration-clone',
    VARIANT[variant],
    // `decoration-2` and an offset, so the rule sits under the descenders rather
    // than through them — which is the whole difference between an underline and
    // a strikethrough that missed.
    underline ? 'underline decoration-2 underline-offset-2' : '',
    weight ? WEIGHT[weight] : ''
  ]
    .filter(Boolean)
    .join(' ');

  /*
   * The walk, kept until something it depends on moves.
   *
   * `markNode` visits every node under `children` and clones each element it
   * finds. That is the right amount of work to do when the query changes and
   * far too much to do because a parent re-rendered — and the place this
   * component is used is a page of search results, where there are fifty of it
   * and the parent re-renders on every keystroke of the box being searched from.
   */
  const marked = React.useMemo(
    () =>
      pattern
        ? markNode(children, pattern, wholeWord, (matched, key) => (
            <mark key={key} className={markClasses}>
              {matched}
            </mark>
          ))
        : children,
    [children, pattern, wholeWord, markClasses]
  );

  return (
    <span
      ref={ref}
      className={['mp-highlight', className ?? ''].filter(Boolean).join(' ')}
      style={{ ...accentSlots(color), ...style }}
      {...props}
    >
      {marked}
    </span>
  );
});
