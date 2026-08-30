import * as React from 'react';
import {
  GROUP_JOIN,
  MPButtonGroupContext,
  type MPButtonGroupContextValue
} from '../../internal/button-group';
import type { MPColor, MPOrientation, MPStyleProps, MPVariant } from '../../types';

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
            GROUP_JOIN[orientation],
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
