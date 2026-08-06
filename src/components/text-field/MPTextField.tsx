import * as React from 'react';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { MPIcon } from '../icon/MPIcon';
import { VisibilityIcon, VisibilityOffIcon } from '../../constants/icons';

/** The input modes this field is built for. */
export type MPTextFieldType = 'email' | 'password' | 'text';

export interface MPTextFieldProps {
  /**
   * The field's text. This is a controlled component: what is shown is what is
   * passed, except during composition — see `onChange`.
   */
  value: string;
  /** Name of the form control, as on a native `<input>`. */
  name?: string;
  /**
   * Which control to draw. `password` is the one that changes behaviour rather
   * than only appearance: it grows a reveal toggle in the trailing adornment.
   * @default 'text'
   */
  type?: MPTextFieldType;
  /** Placeholder shown while the field is empty. */
  placeholder?: string;
  /** Native `autocomplete` token — `'email'`, `'current-password'`, `'off'`. */
  autoComplete?: string;
  /**
   * Label above the field. Always drawn shrunk and notched rather than floating
   * over the placeholder, so a field with a label and a field without one sit
   * at the same height in a form.
   */
  label?: string;
  /** Marks the field required, both to assistive technology and to the label. */
  required?: boolean;
  /** Greys the field out and stops it taking input. */
  disabled?: boolean;
  /**
   * Draws the field at MUI's `medium` size instead of `small`.
   * @default false
   */
  large?: boolean;
  /**
   * Focuses the field on mount — except on a small screen, where it would
   * summon the on-screen keyboard over the page the reader has just arrived at.
   * @default false
   */
  autoFocus?: boolean;
  /** Stretches the field to the width of its container. */
  fullWidth?: boolean;
  /**
   * Shows the value without allowing edits. Unlike `disabled` the text stays
   * selectable and the field stays in the tab order, which is what you want for
   * a value the reader may need to copy.
   */
  readOnly?: boolean;
  /**
   * Swallows the Enter key instead of letting it insert a newline. Only
   * meaningful with `rows`, since a single-line field has no newline to insert
   * — there, Enter is already prevented so it cannot submit a surrounding form
   * twice.
   */
  disableEnterKey?: boolean;
  /**
   * The message under the field. Its presence is also what puts the field into
   * its error state, so there is no way to show an error with no explanation.
   * @default ''
   */
  errorMessage?: string;
  /** Renders a `<textarea>` of this many rows instead of an `<input>`. */
  rows?: number;
  /** Caps the number of characters the field will accept. */
  maxLength?: number;
  /** Content placed before the text — an `MPIcon`, usually. */
  startIcon?: React.ReactNode;
  /**
   * Lets the reader drag a multiline field taller. Ignored without `rows`.
   * @default false
   */
  resizable?: boolean;
  /**
   * The id put on the control and pointed at by the label. Derived from `name`
   * when omitted, which is enough as long as no two fields on a page share a
   * name.
   */
  id?: string;
  /**
   * Called with the field's text on every change, including each keystroke of
   * an in-progress composition. The field shows what was actually typed until
   * the composition ends, so a parent is free to normalise, truncate or reject
   * the value it is handed without the caret jumping mid-syllable.
   */
  onChange?: (value: string) => void;
  /**
   * Called when Enter is pressed. On a single-line field Enter is then
   * swallowed, so a form is submitted once rather than also natively.
   */
  onSubmit?: () => void;
  /**
   * Called before every change, ahead of `onChange`. For clearing a
   * form-level error that a further edit has made stale.
   */
  onFormReset?: () => void;
}

/**
 * A Material UI text field that survives an IME.
 *
 * The field is `@mui/material`'s `OutlinedInput`, and everything MUI decides
 * about how a field looks — the notched outline, the sizes, the palette, the
 * error colour — it still decides here. What this component adds is the
 * handling around a controlled input that a language with an input method
 * exposes, plus the parts of a field that are always assembled by hand
 * anyway: the label, the helper text, the adornments and the password toggle.
 *
 * ## The composition problem
 *
 * A controlled `<input>` is rendered from its `value` prop. While an IME is
 * composing — Korean, Japanese, Chinese, and dead-key sequences in several
 * European layouts — the browser is holding a *provisional* string in the
 * element that has not been committed yet. Writing a `value` back over it in
 * that moment destroys the composition: the syllable in progress is thrown
 * away, and the caret jumps. Anything the parent does to the value in its
 * `onChange` — trimming, upper-casing, validating, or simply re-rendering
 * slowly — is enough to trigger it.
 *
 * So while a composition is running the field shows its own copy of what the
 * element contains and stops rendering `value`. `onChange` still fires for
 * every keystroke, so a parent sees the text as it is typed. When the
 * composition ends the copy is dropped and the field is controlled again.
 *
 * This is the whole reason the component exists. It is also why `value` and
 * `onChange` are a plain string rather than an event: an event's `target` is
 * the element mid-composition, which is precisely the value that must not be
 * trusted.
 */
export const MPTextField = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  MPTextFieldProps
>(function MPTextField(
  {
    value,
    name,
    type = 'text',
    placeholder,
    autoComplete,
    label,
    onChange,
    onFormReset,
    onSubmit,
    errorMessage = '',
    required = false,
    fullWidth = false,
    readOnly = false,
    autoFocus = false,
    large = false,
    disabled = false,
    disableEnterKey = false,
    rows,
    maxLength,
    startIcon,
    resizable = false,
    id
  },
  ref
) {
  const inputRef = React.useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const theme = useTheme();
  const mobileDevice = useMediaQuery(theme.breakpoints.down('sm'));
  const [showPassword, setShowPassword] = React.useState(false);
  const [isComposing, setIsComposing] = React.useState(false);
  const [innerValue, setInnerValue] = React.useState(value);
  const generatedId = React.useId();
  const fieldId = id ?? `mp-text-field-${name ?? generatedId}`;
  const multiline = !!rows;

  const setInputRef = React.useCallback(
    (node: HTMLInputElement | HTMLTextAreaElement | null) => {
      inputRef.current = node;

      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref]
  );

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  // Both press and release are cancelled, not just one: a `mousedown` on the
  // toggle would otherwise take focus off the field, and the caret would come
  // back at the end of the text rather than where it was left.
  const handleMouseEventPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onFormReset?.();

    const next = event.target.value;

    if (isComposing) {
      setInnerValue(next);
    }

    onChange?.(next);
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
    setInnerValue(value);
  };

  // Typed against the element MUI attaches them to — `OutlinedInput` puts its
  // handlers on the root `<div>`, and the events reach here having bubbled up
  // from the control inside it. `target` is what was actually composed into,
  // which is why the value is read from there rather than from `currentTarget`.
  const handleCompositionUpdate = (event: React.CompositionEvent<HTMLElement>) => {
    setInnerValue((event.target as HTMLInputElement | HTMLTextAreaElement).value);
  };

  const handleCompositionEnd = (event: React.CompositionEvent<HTMLElement>) => {
    setIsComposing(false);

    const finalValue = (event.target as HTMLInputElement | HTMLTextAreaElement).value;

    onChange?.(finalValue);
    setInnerValue(finalValue);
  };

  // Outside a composition the field is controlled again, so a `value` the
  // parent changed on its own — a reset, a value arriving from the server —
  // has to reach the copy too, or it would be shown the moment the next
  // composition starts.
  React.useEffect(() => {
    if (!isComposing) {
      setInnerValue(value);
    }
  }, [value, isComposing]);

  // Mount only, and deliberately empty deps: `autoFocus` describes how the
  // field arrives, not something to reapply whenever the prop changes later.
  React.useEffect(() => {
    if (autoFocus && !mobileDevice) {
      inputRef.current?.focus();
    }
  }, []);

  return (
    <FormControl required={required} fullWidth={fullWidth} error={errorMessage.length > 0}>
      {label && (
        <InputLabel size="small" color="secondary" shrink={true} htmlFor={fieldId}>
          {label}
        </InputLabel>
      )}
      <OutlinedInput
        id={fieldId}
        autoComplete={autoComplete}
        inputRef={setInputRef}
        type={showPassword ? 'text' : type}
        label={label}
        notched={!!label}
        rows={rows}
        multiline={multiline}
        color={readOnly ? 'secondary' : undefined}
        readOnly={readOnly}
        placeholder={placeholder}
        startAdornment={
          startIcon ? <InputAdornment position="start">{startIcon}</InputAdornment> : null
        }
        inputProps={maxLength ? { maxLength } : undefined}
        endAdornment={
          type === 'password' ? (
            <InputAdornment position="end">
              <IconButton
                aria-label={showPassword ? 'hide the password' : 'display the password'}
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseEventPassword}
                onMouseUp={handleMouseEventPassword}
                edge="end"
                disabled={disabled}
              >
                <MPIcon
                  icon={showPassword ? VisibilityIcon : VisibilityOffIcon}
                  size={large ? 22 : 20}
                />
              </IconButton>
            </InputAdornment>
          ) : null
        }
        size={large ? 'medium' : 'small'}
        sx={resizable && multiline ? { '& textarea': { resize: 'vertical' } } : undefined}
        name={name}
        disabled={disabled}
        value={isComposing ? innerValue : value}
        onChange={handleInputChange}
        onCompositionStart={handleCompositionStart}
        onCompositionUpdate={handleCompositionUpdate}
        onCompositionEnd={handleCompositionEnd}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            onSubmit?.();

            // A single-line field has no newline to insert, so Enter is
            // always swallowed there — leaving it through would submit a
            // surrounding form on top of whatever `onSubmit` just did.
            if (!multiline || disableEnterKey) {
              event.preventDefault();
            }
          }
        }}
      />
      {errorMessage.length > 0 && <FormHelperText error>{errorMessage}</FormHelperText>}
    </FormControl>
  );
});
