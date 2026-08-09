import * as React from 'react';
import { Toggle } from '@base-ui/react/toggle';
import { ToggleGroup } from '@base-ui/react/toggle-group';
import { MPIcon } from '../icon/MPIcon';
import { CheckIcon } from '../../constants/icons';
import { MPStateLayer } from '../../internal/StateLayer';
import {
  CONTROL_GAP,
  CONTROL_HEIGHT,
  CONTROL_ICON,
  CONTROL_PAD_X,
  CONTROL_TEXT
} from '../../internal/scale';
import type { MPStyleProps } from '../../types';

export interface MPSegment {
  /** Identifies the segment. What `onValueChange` reports. */
  value: string;
  /** The words in the segment. */
  label?: React.ReactNode;
  /**
   * A glyph before the label. Replaced by the tick while the segment is chosen,
   * which is what MD3 does — the tick and the icon share one slot rather than
   * both being shown, so the segment does not change width on selection.
   */
  icon?: React.ReactNode;
  /** Unavailable, but still part of the set. */
  disabled?: boolean;
}

export interface MPSegmentedButtonProps extends MPStyleProps {
  /** The segments, in the order they are drawn. */
  items: readonly MPSegment[];
  /**
   * Which segments are chosen. Use with `onValueChange` for a controlled set.
   *
   * An array in both modes, including single-select where it holds at most one
   * entry. A segmented button is genuinely the same control either way — MD3
   * documents one component with a multi-select option, not two — and a `value`
   * whose *type* changed with a boolean prop would be a union every caller has
   * to narrow before they can read it.
   */
  value?: readonly string[];
  /** Which segments start chosen, for an uncontrolled set. */
  defaultValue?: readonly string[];
  /** Called with every chosen value, in the order the segments are drawn. */
  onValueChange?: (value: string[]) => void;
  /**
   * Whether more than one segment may be chosen at a time.
   * @default false
   */
  multiple?: boolean;
  /**
   * Whether a chosen segment shows a tick.
   *
   * On by default, and the slot is reserved whether or not anything is chosen —
   * a tick that appears from nothing would push the label sideways at the exact
   * moment the reader is looking at it. Turn it off for a set of icon-only
   * segments, where the fill already says which one is on.
   * @default true
   */
  showCheck?: boolean;
  /** Greys every segment out and stops the set taking input. */
  disabled?: boolean;
  /** The accessible name of the set. */
  'aria-label'?: string;
}

/**
 * A Material Design segmented button: two to five choices in one pill.
 *
 * The container is a hairline `outline` with the segments divided by more of the
 * same, and the chosen one fills with `secondary-container` — deliberately not
 * `primary`, which is what MD3 reserves for the action a screen is about. A
 * segmented button changes what you are *looking at*; it does not do anything.
 *
 * Underneath it is Base UI's toggle group, which gives the set one tab stop with
 * the arrow keys moving inside it, and `aria-pressed` on each segment. Built out
 * of plain buttons instead, a four-way switch would announce itself as four
 * unrelated actions.
 *
 * ## When this is the wrong component
 *
 * At more than five segments, use `MPSelect` — the labels stop fitting and the
 * set starts wrapping, and a segmented button that has wrapped to two lines has
 * lost the one thing it was for. For choosing something *in a form*, use
 * `MPRadioGroup`: that is the control a form's value comes from, and it scales
 * down the page rather than across it.
 */
export const MPSegmentedButton = React.forwardRef<HTMLDivElement, MPSegmentedButtonProps>(
  function MPSegmentedButton(
    {
      items,
      value,
      defaultValue,
      onValueChange,
      multiple = false,
      showCheck = true,
      size = 'md',
      fullWidth = false,
      disabled = false,
      'aria-label': ariaLabel
    },
    ref
  ) {
    return (
      <ToggleGroup
        ref={ref}
        aria-label={ariaLabel}
        value={value}
        defaultValue={defaultValue}
        onValueChange={(next) => onValueChange?.(next)}
        multiple={multiple}
        disabled={disabled}
        data-mp-size={size}
        className={[
          'mp-segmented-button rounded-mp-full box-border items-center align-middle',
          // Clipped to the pill, so the fill of the first and last segments takes
          // the container's corners instead of squaring them off.
          'overflow-hidden border',
          disabled ? 'border-mp-on-surface/12' : 'border-mp-outline',
          fullWidth ? 'flex w-full' : 'inline-flex w-fit',
          CONTROL_HEIGHT[size]
        ].join(' ')}
      >
        {items.map((item, index) => {
          const itemDisabled = disabled || item.disabled;

          return (
            <Toggle
              key={item.value}
              value={item.value}
              disabled={item.disabled}
              className={[
                'mp-segmented-button__segment group relative flex h-full items-center',
                'box-border justify-center bg-transparent font-[inherit] whitespace-nowrap',
                'select-none',
                // `overflow-hidden` is load-bearing beyond clipping the state
                // layer: it is what takes a flex item's automatic minimum size
                // down to zero, and without it `fullWidth` cannot divide the row
                // evenly — the segment with the longest label refuses to shrink
                // below its text and the others give up the difference.
                'appearance-none overflow-hidden outline-none',
                'transition-[background-color,color] duration-(--mp-sys-motion-duration-short4)',
                CONTROL_TEXT[size],
                CONTROL_GAP[size],
                CONTROL_PAD_X[size],
                // The divider is the segment's own leading edge, so it lands
                // between every pair and never at either end of the run.
                index === 0 ? '' : 'border-s',
                itemDisabled
                  ? 'border-mp-on-surface/12 text-mp-on-surface/38 cursor-default'
                  : [
                      'border-mp-outline cursor-pointer',
                      'text-mp-on-surface',
                      'data-pressed:bg-mp-secondary-container',
                      'data-pressed:text-mp-on-secondary-container'
                    ].join(' '),
                // Equal parts of the width, so the set is one shape divided
                // rather than a row of differently sized tiles.
                fullWidth ? 'flex-1' : ''
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {itemDisabled ? null : <MPStateLayer />}

              {showCheck || item.icon ? (
                <span
                  className="relative flex shrink-0 items-center justify-center"
                  style={{ width: CONTROL_ICON[size], height: CONTROL_ICON[size] }}
                >
                  {/*
                   * Both glyphs are in the DOM and one of them is hidden, rather
                   * than the pair being chosen in JavaScript: an uncontrolled set
                   * keeps its state in the DOM, so a prop-driven choice would
                   * show the wrong glyph from the first click onwards.
                   */}
                  {/*
                   * The `display` toggle goes on a wrapper rather than on the
                   * glyph. `MPIcon` is `inline-flex`, and both that and `hidden`
                   * are display utilities — so they resolve by their order in the
                   * generated stylesheet, where `inline-flex` sorts after
                   * `hidden` and quietly wins. A wrapper has no display class of
                   * its own to lose to.
                   */}
                  {showCheck ? (
                    <span className="hidden items-center group-data-pressed:flex">
                      <MPIcon icon={CheckIcon} size={CONTROL_ICON[size]} />
                    </span>
                  ) : null}
                  {item.icon ? (
                    <span
                      className={['flex items-center', showCheck ? 'group-data-pressed:hidden' : '']
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {item.icon}
                    </span>
                  ) : null}
                </span>
              ) : null}

              <span className="truncate">{item.label}</span>
            </Toggle>
          );
        })}
      </ToggleGroup>
    );
  }
);
