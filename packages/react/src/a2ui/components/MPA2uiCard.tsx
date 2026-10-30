/**
 * `Card` — one child on a sheet, as `MPCard`.
 *
 * The protocol's card has a single `child` and no header, so this passes it
 * straight through and lets `MPCard` be what MD3 says a card is: a filled
 * surface with a corner and padding. A card of several things is a card holding
 * a `Column`, which is what the schema tells the agent to send.
 */
import { createComponentImplementation } from '@a2ui/react/v0_9';
import { CardApi } from '@a2ui/web_core/v0_9';
import { MPCard } from '../../components/card/MPCard';
import { accessibilityAttributes, weightStyle } from '../internal/common';

export const MPA2uiCard = createComponentImplementation(CardApi, ({ props, buildChild }) => (
  <MPCard style={weightStyle(props.weight)} {...accessibilityAttributes(props.accessibility)}>
    {props.child ? buildChild(props.child) : null}
  </MPCard>
));
