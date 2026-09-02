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
 * `depth` is the one exception, and says why below.
 */
import * as React from 'react';
import type { MPColor, MPSize, MPVariant } from '../types';

export interface MPAvatarGroupContextValue {
  size?: MPSize;
  shape?: 'circle' | 'square';
  variant?: MPVariant;
  color?: MPColor;
  /**
   * Where this avatar sits in the pile, as a `z-index`.
   *
   * The one field that is an instruction rather than a fallback, and it is here
   * rather than on the element because the group cannot reach the element. Its
   * children are whatever a caller passed — a face, a link around one, a
   * tooltip's trigger — and writing a style onto them would mean cloning them
   * with props they have no obligation to accept.
   *
   * So the number is *offered*, and an `MPAvatar` takes it. A child that is not
   * one keeps the painting order the document gives it, which is the order this
   * is correcting; the group is named for avatars and that is the case it
   * answers.
   */
  depth?: number;
}

export const MPAvatarGroupContext = React.createContext<MPAvatarGroupContextValue | null>(null);
