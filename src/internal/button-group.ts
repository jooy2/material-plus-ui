/**
 * What a button inherits from the group around it.
 *
 * Its own module rather than a file `MPButtonGroup` exports, because both sides
 * import it: the group provides the context and the button reads it. Putting it
 * in either component would make one of them import the other, and a `<Button>`
 * that pulls in a `<ButtonGroup>` nobody used is dead weight in every bundle.
 *
 * Every field is optional and every one of them may legitimately be `undefined`.
 * A button reads the group as a *fallback*, so "not set on the group" has to keep
 * meaning "use the button's own default" rather than turning into one.
 */
import * as React from 'react';
import type { MPColor, MPOrientation, MPSize, MPVariant } from '../types';

export interface MPButtonGroupContextValue {
  variant?: MPVariant;
  size?: MPSize;
  color?: MPColor;
  disabled?: boolean;
}

export const MPButtonGroupContext = React.createContext<MPButtonGroupContextValue | null>(null);

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
 * Logical properties (`s`/`e`) rather than left/right: under RTL the first
 * button is on the right, and `rounded-l-none` would flatten the wrong side.
 *
 * It is here rather than in `MPButtonGroup`, which was its first reader, because
 * `MPToggleGroup` is a connected run of exactly the same shape — and two copies
 * of one table is how a run of toggles ends up cut differently from a run of
 * buttons beside it.
 */
export const GROUP_JOIN: Record<MPOrientation, string> = {
  horizontal: '[&>*:not(:first-child)]:rounded-s-mp-sm [&>*:not(:last-child)]:rounded-e-mp-sm',
  vertical: '[&>*:not(:first-child)]:rounded-t-mp-sm [&>*:not(:last-child)]:rounded-b-mp-sm'
};
