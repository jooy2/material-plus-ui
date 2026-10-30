/**
 * `Button` — a press that sends an action back, as `MPButton`.
 *
 * The protocol's three hints are read as the three MD3 buttons that mean the same
 * things: `primary` is the call to action and is therefore `filled`, `default` is
 * an available action beside it and is `outlined`, and `borderless` — which the
 * schema describes as a button whose child looks like a link — is `text`.
 *
 * `tonal` and `elevated` are not reachable from the protocol, which is the
 * catalog being honest rather than this being incomplete: three hints cannot
 * choose between five treatments, and inventing a rule that mapped one of them
 * onto `tonal` would put a decision in the agent's hands that it never made.
 *
 * `action` is already a closure by the time it arrives — the binder resolved the
 * event name and its payload — so there is nothing to build here and nothing to
 * validate. A button with no action is a button that does nothing, and that is
 * the agent's to answer for.
 */
import { createComponentImplementation } from '@a2ui/react/v0_9';
import { ButtonApi } from '@a2ui/web_core/v0_9';
import { MPButton } from '../../components/button/MPButton';
import type { MPVariant } from '../../types';
import { accessibilityAttributes, weightStyle } from '../internal/common';

/** The protocol's three hints, as this library's treatments. */
const VARIANT: Record<string, MPVariant> = {
  default: 'outlined',
  primary: 'filled',
  borderless: 'text'
};

export const MPA2uiButton = createComponentImplementation(ButtonApi, ({ props, buildChild }) => (
  <MPButton
    variant={VARIANT[props.variant ?? 'default'] ?? 'outlined'}
    onClick={props.action}
    /*
     * `isValid` is only ever present on a component the agent attached `checks`
     * to, and the binder keeps it up to date as the data those checks read
     * changes. So a form's submit button disables itself while a field it depends
     * on is wrong, and a button with no checks is never disabled by this.
     */
    disabled={props.isValid === false}
    style={weightStyle(props.weight)}
    {...accessibilityAttributes(props.accessibility)}
  >
    {props.child ? buildChild(props.child) : null}
  </MPButton>
));
