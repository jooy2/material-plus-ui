/**
 * `TextField` — a line, a paragraph, a password or a number.
 *
 * Three of the four variants are `MPTextField`. `number` is `MPNumberField`,
 * because MD3's numeric field is a different control: it has steppers, it formats
 * what it holds, and it does not let a stray letter into the value. What the
 * protocol calls a variant is two components here, and that is the mapping being
 * right rather than the catalog being uneven.
 *
 * ## The value stays a string
 *
 * `value` is a `DynamicString` in the schema even for the numeric variant, so the
 * data model holds `"42"` and not `42`. `MPNumberField` works in numbers, so the
 * two are converted at this boundary and nowhere else — and a value the agent
 * left empty, or wrote something unparseable into, arrives as an empty field
 * rather than as `NaN`.
 *
 * ## The errors are the binder's
 *
 * `validationErrors` is what the agent's own `checks` produced, re-evaluated as
 * the reader types. Only the first is drawn: MD3's field has one supporting line,
 * and a field that grows a paragraph of complaints moves everything below it.
 * `validationRegexp` is deliberately not read here — the binder applies it to the
 * value and reports the result through the same `validationErrors`.
 */
import { createComponentImplementation } from '@a2ui/react/v0_9';
import { TextFieldApi } from '@a2ui/web_core/v0_9';
import { MPNumberField } from '../../components/number-field/MPNumberField';
import { MPTextField } from '../../components/text-field/MPTextField';
import { weightStyle } from '../internal/common';

/** The rows a `longText` field opens at, before the reader drags it taller. */
const LONG_TEXT_ROWS = 4;

export const MPA2uiTextField = createComponentImplementation(TextFieldApi, ({ props }) => {
  const variant = props.variant ?? 'shortText';
  const error = props.validationErrors?.[0];
  const value = typeof props.value === 'string' ? props.value : '';

  if (variant === 'number') {
    const parsed = Number(value);

    return (
      <MPNumberField
        value={value === '' || !Number.isFinite(parsed) ? null : parsed}
        onValueChange={(next) => props.setValue(next === null ? '' : String(next))}
        label={props.label}
        errorMessage={error}
        style={weightStyle(props.weight)}
      />
    );
  }

  return (
    <MPTextField
      value={value}
      onChange={props.setValue}
      type={variant === 'obscured' ? 'password' : 'text'}
      rows={variant === 'longText' ? LONG_TEXT_ROWS : undefined}
      resizable={variant === 'longText'}
      label={props.label}
      errorMessage={error}
      style={weightStyle(props.weight)}
    />
  );
});
