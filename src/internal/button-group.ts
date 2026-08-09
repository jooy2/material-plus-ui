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
import type { MPColor, MPSize, MPVariant } from '../types';

export interface MPButtonGroupContextValue {
  variant?: MPVariant;
  size?: MPSize;
  color?: MPColor;
  disabled?: boolean;
}

export const MPButtonGroupContext = React.createContext<MPButtonGroupContextValue | null>(null);
