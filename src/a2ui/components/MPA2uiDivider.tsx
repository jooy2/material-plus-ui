/**
 * `Divider` — a rule, as `MPDivider`.
 *
 * The whole component, because both of the protocol's axes are `MPDivider`'s
 * own: a vertical rule stretches to the row it divides without being given a
 * height, which is exactly what a divider between two things in a `Row` needs.
 */
import { createComponentImplementation } from '@a2ui/react/v0_9';
import { DividerApi } from '@a2ui/web_core/v0_9';
import { MPDivider } from '../../components/divider/MPDivider';
import { accessibilityAttributes, weightStyle } from '../internal/common';

export const MPA2uiDivider = createComponentImplementation(DividerApi, ({ props }) => (
  <MPDivider
    orientation={props.axis === 'vertical' ? 'vertical' : 'horizontal'}
    style={weightStyle(props.weight)}
    {...accessibilityAttributes(props.accessibility)}
  />
));
