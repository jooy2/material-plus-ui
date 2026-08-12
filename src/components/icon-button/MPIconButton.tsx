import * as React from 'react';
import { MPButton, type MPButtonProps } from '../button/MPButton';

export interface MPIconButtonProps extends Omit<
  MPButtonProps,
  'children' | 'startIcon' | 'endIcon' | 'fullWidth'
> {
  /**
   * The glyph.
   *
   * Wrap it in an `MPIcon` when it needs a size of its own; passed bare it is
   * laid out exactly as a button's `startIcon` is, which is what keeps an icon
   * button and a labelled button with the same glyph drawing it at the same
   * size.
   */
  icon: React.ReactNode;
  /**
   * What the button does, in words.
   *
   * Required, and the one prop here that is. A button whose whole label is a
   * drawing has no accessible name at all, and "an icon button with no
   * `aria-label`" is the single most common accessibility defect a component
   * library ships. Making it required is the only fix that survives review — a
   * default would be a name that is right for nobody, and a warning is a thing
   * that gets filtered out of a console.
   */
  label: string;
}

/**
 * A round button with a glyph in it and nothing else.
 *
 * There is almost nothing here, and that is the point: an [MPButton](./button)
 * with an icon and no children already goes square and is already a pill, which
 * for a square is a circle — MD3's icon button shape falls out of the button's
 * own `corner-full` with no second table to keep in step. What this component
 * adds is the *name*, which is the part that cannot be defaulted and is the part
 * that is always missing.
 *
 * Everything else is the button's, unchanged and on purpose: the five variants,
 * the four families, the size ladder, the state layer, `loading`, and the values
 * a surrounding `MPButtonGroup` sets. Two components drawing the same surface
 * from two copies of one table are two components that will eventually disagree
 * about it.
 *
 * ## Why the default variant is `text` and the button's is `filled`
 *
 * Because MD3's default icon button is its *standard* one — a glyph with no
 * container at all — and the specification is right about why. A labelled button
 * is usually the one thing on a row worth pressing; an icon button is usually
 * one of several sitting in a toolbar or a card's corner, and five filled discs
 * in a row is a row with no emphasis left in it. Reach for `filled` when the
 * icon button *is* the action on the screen.
 *
 * ## No toggle state
 *
 * MD3 also describes a *toggle* icon button, which swaps its container and its
 * ink when selected. This is not that, and a `selected` prop would make it half
 * of one: a toggle needs a pressed state that survives the press, a group that
 * can enforce one choice, and a name that changes with the state. That is
 * [MPSegmentedButton](./segmented-button) for a set, and a `<MPIconButton>` whose
 * `icon` and `label` are both derived from your own state for a single one.
 */
export const MPIconButton = React.forwardRef<HTMLButtonElement, MPIconButtonProps>(
  function MPIconButton({ icon, label, variant = 'text', ...props }, ref) {
    return (
      <MPButton
        ref={ref}
        aria-label={label}
        variant={variant}
        // The glyph goes in `startIcon` rather than in `children`, which is what
        // puts the button on its icon-only path: a square footprint, no inline
        // padding, and the spinner taking the glyph's place while `loading`.
        startIcon={icon}
        {...props}
      />
    );
  }
);
