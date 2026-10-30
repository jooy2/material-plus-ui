/**
 * The helpers every Flutter props file in this folder is written with.
 *
 * A Flutter row is **derived from its React row rather than written again**,
 * and the reason is the shared vocabulary: `variant`, `size`, `color`,
 * `density` and `elevation` mean exactly the same thing in both packages, and
 * the sentence explaining what `density` does is the same sentence. Two
 * independent tables would be two sentences, and by the third edit they would
 * be two different sentences.
 *
 * So a Flutter row starts as its React row and states only what differs,
 * almost always just the Dart type and default. A parameter with no React
 * counterpart is written out in full; a React prop with no Flutter
 * counterpart is simply not listed, and the page says why in prose.
 *
 * One file per component page, `props-flutter/<page>.ts`, exporting a record
 * of the tables on that page. `props-flutter.ts` beside this folder gathers
 * them.
 */

import { propTables, type PropRow } from '../props';

export type { PropRow };

export const SIZE = 'MPSize';
export const COLOR = 'MPColor';
export const VARIANT = 'MPVariant';
export const DENSITY = 'MPDensity';
export const WIDGET = 'Widget';

/**
 * One React row, with the parts Dart spells differently replaced.
 *
 * Throws rather than falling back if the React row is gone: a prop that was
 * renamed or removed on the React side has to be a decision here too, and a row
 * that silently disappeared from a table is exactly the drift this exists to
 * prevent.
 */
export function from(component: string, name: string, patch: Partial<PropRow> = {}): PropRow {
  const row = propTables[component]?.find((candidate) => candidate.name === name);

  if (!row) {
    throw new Error(`[material-plus-ui docs] no React prop named '${name}' on ${component}`);
  }

  return { ...row, ...patch };
}

/** A React row under a different Dart name, such as `onClick` as `onPressed`. */
export function renamed(
  component: string,
  name: string,
  dartName: string,
  patch: Partial<PropRow> = {}
): PropRow {
  return { ...from(component, name, patch), name: dartName };
}

/** `size`, nullable, because `null` means "inherit from the provider". */
export function sizeRow(component: string, fallback = 'MPSize.md'): PropRow {
  return from(component, 'size', { type: `${SIZE}?`, default: fallback });
}

/** `color`, nullable for the same reason. */
export function colorRow(component: string, fallback = 'MPColor.primary'): PropRow {
  return from(component, 'color', { type: `${COLOR}?`, default: fallback });
}

/** `density`, an `int` from `0` to `-3`, as in React. */
export function densityRow(component: string, fallback = '0'): PropRow {
  return from(component, 'density', { type: `${DENSITY}?`, default: fallback });
}

/** `elevation`, an `int` from `0` to `5`. */
export function elevationRow(component: string): PropRow {
  return from(component, 'elevation', { type: 'int?' });
}

/** The `semanticLabel` a Flutter widget takes where React takes `aria-label`. */
export const semanticLabelRow: PropRow = {
  name: 'semanticLabel',
  type: 'String?',
  description: {
    ko: '화면 낭독기가 읽는 이름. 보이는 내용 대신 읽히며, React의 `aria-label` 자리입니다',
    en: "The name a screen reader announces, in place of what is shown. React's `aria-label`"
  }
};

/** `focusNode` and `autofocus`, which every focusable widget takes. */
export const focusRows: PropRow[] = [
  {
    name: 'focusNode',
    type: 'FocusNode?',
    description: {
      ko: '포커스를 밖에서 다룰 때 넘기는 노드',
      en: 'Drives the focus from outside'
    }
  },
  {
    name: 'autofocus',
    type: 'bool',
    default: 'false',
    description: {
      ko: '트리에 들어오면서 포커스를 가져갑니다',
      en: 'Takes the focus as it is inserted'
    }
  }
];
