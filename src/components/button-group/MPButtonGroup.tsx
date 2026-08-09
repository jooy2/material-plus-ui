import * as React from 'react';
import { MPButtonGroupContext, type MPButtonGroupContextValue } from '../../internal/button-group';
import type { MPColor, MPOrientation, MPStyleProps, MPVariant } from '../../types';

/**
 * The corners that face a neighbour.
 *
 * MD3's connected button group keeps the run's *outer* corners fully round and
 * cuts the inner ones back to `corner-small`, so the row reads as one shape that
 * has been divided rather than as three pills that happen to be adjacent. The
 * seam is a 2px gap rather than a border, which is what lets a filled group work
 * at all: two filled buttons sharing an edge merge into one blob, and a hairline
 * between them would be the only line on the page drawn between two fills.
 *
 * Logical properties (`s`/`e`) rather than left/right: under RTL the first button
 * is on the right, and `rounded-l-none` would flatten the wrong side.
 */
const JOIN: Record<MPOrientation, string> = {
  horizontal: '[&>*:not(:first-child)]:rounded-s-mp-sm [&>*:not(:last-child)]:rounded-e-mp-sm',
  vertical: '[&>*:not(:first-child)]:rounded-t-mp-sm [&>*:not(:last-child)]:rounded-b-mp-sm'
};

export interface MPButtonGroupProps
  extends MPStyleProps, Omit<React.ComponentPropsWithoutRef<'div'>, 'color'> {
  /**
   * Which way the buttons run.
   * @default 'horizontal'
   */
  orientation?: MPOrientation;
  /** Passed to every button in the group. */
  variant?: MPVariant;
  /** Passed to every button in the group. */
  color?: MPColor;
  /** Disables every button in the group at once. */
  disabled?: boolean;
  children?: React.ReactNode;
}

/**
 * A run of buttons that belong together.
 *
 * Two things happen here and only one of them is visual. The corners that face a
 * neighbour are cut back — that is the look. The other half is that `variant`,
 * `size`, `color` and `disabled` are set once for the set rather than repeated on
 * every button, which is the failure this exists to prevent: a group where one
 * button is a size out is not a group.
 *
 * The buttons stay real `MPButton`s, and the group does not manage selection.
 * For one-of-a-set, reach for `MPSegmentedButton` — a row of buttons that
 * remembers which one was pressed is a radio group wearing a costume, and it
 * announces itself to a screen reader as four unrelated actions.
 */
export const MPButtonGroup = React.forwardRef<HTMLDivElement, MPButtonGroupProps>(
  function MPButtonGroup(
    {
      variant,
      size,
      color,
      disabled,
      orientation = 'horizontal',
      fullWidth = false,
      className,
      children,
      ...props
    },
    ref
  ) {
    // Every value is passed through as-is, `undefined` included — see the note in
    // `internal/button-group.ts` for why that matters.
    const context = React.useMemo<MPButtonGroupContextValue>(
      () => ({ variant, size, color, disabled }),
      [variant, size, color, disabled]
    );

    return (
      <MPButtonGroupContext.Provider value={context}>
        <div
          ref={ref}
          role="group"
          data-mp-orientation={orientation}
          className={[
            'mp-button-group inline-flex gap-0.5 align-middle',
            orientation === 'vertical' ? 'flex-col' : 'flex-row',
            JOIN[orientation],
            // The focus ring is drawn outside the button, so a focused button in
            // the middle of a run would be painted under whichever neighbour
            // comes after it in the DOM.
            '[&>*]:relative [&>*:focus-visible]:z-10',
            fullWidth ? 'flex w-full [&>*]:flex-1' : '',
            className ?? ''
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        >
          {children}
        </div>
      </MPButtonGroupContext.Provider>
    );
  }
);
