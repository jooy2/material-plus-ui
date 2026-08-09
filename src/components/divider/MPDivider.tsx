import * as React from 'react';
import { Separator } from '@base-ui/react/separator';
import { hasContent } from '../../internal/scale';
import type { MPAlign, MPColor, MPOrientation, MPSize } from '../../types';

/** Where the label sits along a labelled divider. Ignored without a label. */
export type MPDividerTextAlign = MPAlign;

export interface MPDividerProps extends Omit<
  React.ComponentPropsWithoutRef<'div'>,
  'color' | 'children'
> {
  /**
   * Which way the line runs. A vertical divider has no height of its own — it
   * stretches to its flex parent, the way a rule between two toolbar groups
   * should.
   * @default 'horizontal'
   */
  orientation?: MPOrientation;
  /**
   * Which accent family the rule is drawn in.
   *
   * **This is the one component in the library whose `color` has no default**,
   * and the reason is the specification: MD3 gives a divider exactly one colour,
   * `outline-variant`, and it is not an accent at all. It is the quietest line
   * in the token sheet — quieter than `outline`, which is the edge of a control
   * — because a divider's job is to separate two things without becoming a
   * third.
   *
   * So left unset the rule is `outline-variant`, which is the Material divider.
   * Setting it tints the rule with an accent, for the case a divider is carrying
   * meaning rather than structure — the line under a failed section.
   */
  color?: MPColor;
  /** Type scale of the label. Nothing else on a divider has a size. */
  size?: MPSize;
  /**
   * How far the rule runs — the width of a horizontal divider, the height of a
   * vertical one. A number is pixels; a string is any CSS length, so `'50%'`
   * and `'12rem'` both work.
   *
   * `length` rather than `width`, because a divider is the one component whose
   * long axis turns with `orientation`: a `width` that meant height half the
   * time would be a worse name than a longer one.
   *
   * Left out, a horizontal divider is the full width of its container and a
   * vertical one stretches to the height of the flex row it is in — which is
   * what a rule between two things should do by default.
   */
  length?: number | string;
  /**
   * How thick the rule is. A number is pixels; a string is any CSS length.
   *
   * MD3's divider is 1dp and there is no second thickness in the specification.
   * This exists for the hairline that has to survive a display where 1px is
   * half a device pixel, not as a weight to design with.
   * @default 1
   */
  thickness?: number | string;
  /** A label set into the line — "OR" between two sign-in options. */
  children?: React.ReactNode;
  /**
   * Where the label sits. `center` splits the line in half; `start` and `end`
   * leave a short stub on the near side so the label still reads as set *into*
   * the rule rather than floating above it.
   * @default 'center'
   */
  textAlign?: MPDividerTextAlign;
}

/**
 * The hairline itself. A border rather than a filled 1px box, so it lands on the
 * device pixel grid the same way every other edge in the library does.
 *
 * Its thickness is read from a slot rather than from a `border-2`-style utility
 * because a labelled divider draws the rule three times — the root and the two
 * stubs either side of the label — and one custom property set on the root is
 * what keeps all three the same without threading a value through each.
 */
const LINE = '[border-color:var(--_mp-line)]';

/** Turns `2` into `2px` and leaves `'0.5rem'` alone. */
function toLength(value: number | string | undefined): string | undefined {
  return typeof value === 'number' ? `${value}px` : value;
}

/**
 * How the line is split around an off-centre label: `[before, after]`. The short
 * side is a fixed stub rather than a small flex ratio, so the label sits the
 * same distance from the edge whatever the divider's width turns out to be.
 */
const STUB: Record<MPOrientation, Record<MPDividerTextAlign, [string, string]>> = {
  horizontal: {
    start: ['w-4 shrink-0', 'flex-1'],
    center: ['flex-1', 'flex-1'],
    end: ['flex-1', 'w-4 shrink-0']
  },
  vertical: {
    start: ['h-4 shrink-0', 'flex-1'],
    center: ['flex-1', 'flex-1'],
    end: ['flex-1', 'h-4 shrink-0']
  }
};

/**
 * The label's type scale.
 *
 * The *label* roles rather than the body ones, which is the same call
 * `CONTROL_TEXT` makes and for the same reason: a word set into a rule is a
 * caption on a piece of structure, not a sentence. MD3 has nothing to say about
 * labelled dividers — the specification's divider has no label at all — so this
 * is the library's, built out of the specification's own roles.
 */
const LABEL_TEXT: Record<MPSize, string> = {
  xs: 'text-mp-label-small',
  sm: 'text-mp-label-small',
  md: 'text-mp-label-medium',
  lg: 'text-mp-label-large',
  xl: 'text-mp-label-large'
};

/** Space between the label and the line on either side of it. */
const LABEL_GAP: Record<MPSize, string> = {
  xs: 'gap-1.5',
  sm: 'gap-2',
  md: 'gap-3',
  lg: 'gap-3.5',
  xl: 'gap-4'
};

/**
 * A rule between two things.
 *
 * With no children it is Base UI's `Separator` and nothing else — a real
 * `role="separator"` with the right `aria-orientation`. With children the line
 * breaks around the label.
 *
 * `separator` is not a name-from-content role, so the visible label does *not*
 * become the accessible name on its own: a screen reader would announce a bare
 * "separator" and the word "OR" would be read as loose text somewhere nearby. A
 * string label is therefore copied into `aria-label`. Anything richer is left
 * alone — only the caller knows which part of it is the name.
 *
 * There is no `variant` and no elevation. A divider is not a surface: it has no
 * container to paint, so four of the five variants would have nothing to say and
 * the fifth would be the line it already is.
 */
export const MPDivider = React.forwardRef<HTMLDivElement, MPDividerProps>(function MPDivider(
  {
    orientation = 'horizontal',
    color,
    size = 'md',
    length,
    thickness,
    textAlign = 'center',
    className,
    style,
    children,
    ...props
  },
  ref
) {
  const vertical = orientation === 'vertical';
  const hasLabel = hasContent(children);

  const slots = {
    // `outline-variant` unless an accent was asked for — see `color`.
    '--_mp-line': color ? `var(--_mp-color-${color})` : 'var(--_mp-color-outline-variant)',
    '--_mp-rule': toLength(thickness) ?? '1px'
  } as React.CSSProperties;

  // The long axis, and only when it was asked for: left alone, a horizontal
  // divider is `w-full` and a vertical one stretches to its flex row, which are
  // the two things a rule between two things should already do.
  const span = toLength(length);
  const sizing = span === undefined ? null : vertical ? { height: span } : { width: span };

  const rootStyle = { ...slots, ...sizing, ...style };

  if (!hasLabel) {
    return (
      <Separator
        ref={ref}
        orientation={orientation}
        data-mp-size={size}
        className={[
          'mp-divider',
          // The line is a single border edge; the box itself has no thickness,
          // so a divider never adds a pixel of layout beyond the rule.
          vertical
            ? `w-0 border-l [border-left-width:var(--_mp-rule)] ${span === undefined ? 'self-stretch' : ''}`
            : 'h-0 w-full border-t [border-top-width:var(--_mp-rule)]',
          LINE,
          className ?? ''
        ]
          .filter(Boolean)
          .join(' ')}
        style={rootStyle}
        {...props}
      />
    );
  }

  const [before, after] = STUB[orientation][textAlign];
  const edge = vertical
    ? 'w-0 border-l [border-left-width:var(--_mp-rule)]'
    : 'h-0 border-t [border-top-width:var(--_mp-rule)]';

  return (
    <Separator
      ref={ref}
      orientation={orientation}
      aria-label={typeof children === 'string' ? children : undefined}
      data-mp-size={size}
      className={[
        'mp-divider flex items-center',
        vertical ? `w-auto flex-col ${span === undefined ? 'self-stretch' : ''}` : 'w-full',
        LABEL_GAP[size],
        className ?? ''
      ]
        .filter(Boolean)
        .join(' ')}
      style={rootStyle}
      {...props}
    >
      <span aria-hidden="true" className={`${edge} ${before} ${LINE}`} />
      <span
        className={[
          'text-mp-on-surface-variant shrink-0 whitespace-nowrap',
          LABEL_TEXT[size],
          // A vertical rule's label has to turn with it, or the line grows to
          // the width of the word and stops being a hairline.
          vertical ? '[writing-mode:vertical-rl]' : ''
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {children}
      </span>
      <span aria-hidden="true" className={`${edge} ${after} ${LINE}`} />
    </Separator>
  );
});
