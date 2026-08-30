import * as React from 'react';
import { ToggleGroup } from '@base-ui/react/toggle-group';
import {
  GROUP_JOIN,
  MPButtonGroupContext,
  type MPButtonGroupContextValue
} from '../../internal/button-group';
import type { MPColor, MPOrientation, MPStyleProps, MPVariant } from '../../types';

export interface MPToggleGroupProps
  extends
    MPStyleProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'color' | 'defaultValue' | 'onChange'> {
  /**
   * Passed to every toggle in the set.
   * @default 'outlined'
   */
  variant?: MPVariant;
  /** Passed to every toggle in the set. */
  color?: MPColor;
  /**
   * Which toggles are on, by their `value`.
   *
   * An array in both the single and the multiple case — Base UI's own shape, and
   * the same decision [MPSegmentedButton](./segmented-button) makes: a `value`
   * whose *type* changed with a boolean prop would be a union every caller has
   * to narrow before they can read it.
   */
  value?: readonly string[];
  /** Which start on, for an uncontrolled set. */
  defaultValue?: readonly string[];
  onValueChange?: (value: string[]) => void;
  /**
   * Whether more than one may be on at a time. Off, turning one on turns the
   * last one off — which is a one-of-a-set, and worth a second thought: if what
   * is being chosen is a **value** rather than a state, that is an
   * [MPSegmentedButton](./segmented-button) or an
   * [MPRadioGroup](./radio-group).
   * @default false
   */
  multiple?: boolean;
  /**
   * Which way the toggles run.
   * @default 'horizontal'
   */
  orientation?: MPOrientation;
  /** Disables every toggle in the set at once. */
  disabled?: boolean;
  /**
   * Whether the arrow keys wrap around at the ends.
   * @default true
   */
  loopFocus?: boolean;
  children?: React.ReactNode;
}

/**
 * A run of toggles that share one state.
 *
 * Two things happen here and only one of them is visual. The corners that face a
 * neighbour are cut back to `corner-small` — MD3's connected button group, the
 * same shape an [MPButtonGroup](./button-group) draws, out of the same table.
 *
 * The other half is that the **set owns the value**: the toggles report into one
 * array, `multiple` decides whether more than one of them can be on, and
 * `variant`, `size`, `color` and `disabled` are set once here rather than on
 * every toggle. A run where the fourth toggle is a rung out is not a run.
 *
 * Base UI owns the roving tab index — one tab stop for the whole set, with the
 * arrow keys moving inside it — which is what makes a toolbar of eight toggles
 * two key presses deep instead of eight.
 *
 * ## When this is the wrong component
 *
 * When what is being chosen is a **value** rather than a state. A run of toggles
 * with `multiple` off is a one-of-a-set, and the two components that say so
 * properly are [MPSegmentedButton](./segmented-button) — which is MD3's own
 * control for picking between two and five views — and
 * [MPRadioGroup](./radio-group), which is what a form's value comes from.
 *
 * A toggle group is for a **toolbar**: bold, italic, underline; grid, snap,
 * rulers. Each one is a state of the thing beside it, and they happen to sit
 * together.
 */
export const MPToggleGroup = React.forwardRef<HTMLDivElement, MPToggleGroupProps>(
  function MPToggleGroup(
    {
      variant,
      size,
      color,
      value,
      defaultValue,
      onValueChange,
      multiple = false,
      orientation = 'horizontal',
      disabled,
      loopFocus = true,
      fullWidth = false,
      className,
      children,
      ...props
    },
    ref
  ) {
    // Every value passes through as-is, `undefined` included: a toggle reads the
    // group only as a fallback, so "not set here" keeps meaning "use the
    // toggle's own default" rather than turning into one.
    const context = React.useMemo<MPButtonGroupContextValue>(
      () => ({ variant, size, color, disabled }),
      [variant, size, color, disabled]
    );

    return (
      <MPButtonGroupContext.Provider value={context}>
        <ToggleGroup
          ref={ref}
          value={value}
          defaultValue={defaultValue}
          onValueChange={(next) => onValueChange?.(next)}
          multiple={multiple}
          orientation={orientation}
          disabled={disabled}
          loopFocus={loopFocus}
          data-mp-orientation={orientation}
          className={[
            'mp-toggle-group inline-flex gap-0.5 align-middle',
            orientation === 'vertical' ? 'flex-col' : 'flex-row',
            GROUP_JOIN[orientation],
            // The focus ring is drawn outside the control, so a focused toggle in
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
        </ToggleGroup>
      </MPButtonGroupContext.Provider>
    );
  }
);
