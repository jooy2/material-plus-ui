/**
 * What an avatar inherits from the stack around it.
 *
 * Its own module rather than a file `MPAvatarGroup` exports, for the reason
 * `button-group.ts` gives: both sides import it — the group provides the
 * context and the avatar reads it — so putting it in either component would
 * make one of them pull in the other, and an `MPAvatar` that dragged a group
 * nobody used into the bundle is dead weight on every page with a face on it.
 *
 * Every field is optional and every one of them may legitimately be `undefined`.
 * An avatar reads the group as a *fallback*, so "not set on the group" has to
 * keep meaning "use the avatar's own default" rather than turning into one.
 */
import * as React from 'react';
import type { MPColor, MPSize, MPVariant } from '../types';

export interface MPAvatarGroupContextValue {
  size?: MPSize;
  shape?: 'circle' | 'square';
  variant?: MPVariant;
  color?: MPColor;
}

export const MPAvatarGroupContext = React.createContext<MPAvatarGroupContextValue | null>(null);
