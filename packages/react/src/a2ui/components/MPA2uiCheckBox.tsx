/**
 * `CheckBox` — one boolean with a label beside it, as `MPCheckbox`.
 *
 * The label is the protocol's and stays visible: `MPCheckbox` puts it in a
 * `<label>` tied to the box, so the whole row is the hit target and the word is
 * what a screen reader announces. `validationErrors` draws under it, as the
 * component's own error line, which is also what turns the box red.
 */
import { createComponentImplementation } from '@a2ui/react/v0_9';
import { CheckBoxApi } from '@a2ui/web_core/v0_9';
import { MPCheckbox } from '../../components/checkbox/MPCheckbox';
import { weightStyle } from '../internal/common';

export const MPA2uiCheckBox = createComponentImplementation(CheckBoxApi, ({ props }) => (
  <MPCheckbox
    checked={props.value === true}
    onCheckedChange={props.setValue}
    label={props.label}
    errorMessage={props.validationErrors?.[0]}
    style={weightStyle(props.weight)}
  />
));
