import * as React from 'react';
import { Field } from '@base-ui/react/field';
import { MPIcon } from '../icon/MPIcon';
import { MPFieldLabel, MPFieldOutline } from '../../internal/FieldOutline';
import { VisibilityIcon, VisibilityOffIcon } from '../../constants/icons';
import type { MPSize, MPStyleProps } from '../../types';

/** The input modes this field is built for. */
export type MPTextFieldType = 'email' | 'password' | 'text';

/**
 * What each rung of the ladder is, in one table.
 *
 * Written out rather than computed. Five rows is small enough to read, and the
 * classes have to be literal strings for Tailwind to find them at all — an
 * interpolated `py-${n}` generates nothing.
 *
 * The heights come out of the type scale plus the padding, so they are the
 * numbers in the comments rather than a `height` anybody sets: a `<textarea>`
 * has to be able to grow past them, which a fixed height would prevent.
 */
const SIZES: Record<
  MPSize,
  {
    /** Inline padding on the container. */
    padding: string;
    /** Block padding on the control, which is what makes the height. */
    control: string;
    /** Which Material body role the input text is set in. */
    text: string;
    /** The reveal toggle's glyph, in CSS pixels. */
    icon: number;
  }
> = {
  // 32px: 20 line-height + 12 padding. The floor — below this the control stops
  // being a comfortable pointer target.
  xs: { padding: 'px-2', control: 'py-1.5', text: 'text-mp-body-medium', icon: 16 },
  // 40px: 20 + 20.
  sm: { padding: 'px-3', control: 'py-2.5', text: 'text-mp-body-medium', icon: 18 },
  // 56px: 24 + 32. Material's own size, and the default.
  md: { padding: 'px-4', control: 'py-4', text: 'text-mp-body-large', icon: 20 },
  // 64px: 24 + 40.
  lg: { padding: 'px-4', control: 'py-5', text: 'text-mp-body-large', icon: 22 },
  // 72px: 24 + 48.
  xl: { padding: 'px-5', control: 'py-6', text: 'text-mp-body-large', icon: 24 }
};

export interface MPTextFieldProps extends MPStyleProps {
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
   * Label above the field. Always drawn in the outline's notch rather than
   * floating over the placeholder, so a field with a label and a field without
   * one sit at the same height in a form.
   */
  label?: string;
  /** Marks the field required, both to assistive technology and to the label. */
  required?: boolean;
  /** Greys the field out and stops it taking input. */
  disabled?: boolean;
  /**
   * Focuses the field on mount — except on a small screen, where it would
   * summon the on-screen keyboard over the page the reader has just arrived at.
   * @default false
   */
  autoFocus?: boolean;
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
 * Material's compact breakpoint, below which an automatic focus is suppressed.
 *
 * Read at the moment it is needed rather than tracked in state. `autoFocus`
 * describes how the field arrives, so the only reading that matters is the one
 * taken on mount — and a `useState` seeded to `false` would focus on a phone
 * anyway, in the render before its effect could correct it.
 */
const COMPACT_SCREEN = '(max-width: 599.95px)';

/**
 * A Material Design text field that survives an IME.
 *
 * The control is an outlined text field, drawn from Material Design 3's own
 * component tokens: `outline` at rest, `primary` and a 2px stroke on focus,
 * `error` when there is a message, and the spec's disabled opacities. Behaviour
 * that a field needs but has nothing to do with looks — the label association,
 * the validity plumbing, the `aria-describedby` onto the supporting text —
 * comes from Base UI's `Field`.
 *
 * What this component adds is the handling around a controlled input that a
 * language with an input method exposes, plus the parts of a field that are
 * always assembled by hand anyway: the notch, the adornments and the password
 * toggle.
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
    size = 'md',
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
  const [showPassword, setShowPassword] = React.useState(false);
  const [isComposing, setIsComposing] = React.useState(false);
  const [innerValue, setInnerValue] = React.useState(value);
  const generatedId = React.useId();
  const fieldId = id ?? `mp-text-field-${name ?? generatedId}`;
  const multiline = !!rows;
  const invalid = errorMessage.length > 0;
  const scale = SIZES[size];

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

  // `target` is what was actually composed into, which is why the value is read
  // from there rather than from `currentTarget`.
  const handleCompositionUpdate = (event: React.CompositionEvent<HTMLElement>) => {
    setInnerValue((event.target as HTMLInputElement | HTMLTextAreaElement).value);
  };

  const handleCompositionEnd = (event: React.CompositionEvent<HTMLElement>) => {
    setIsComposing(false);

    const finalValue = (event.target as HTMLInputElement | HTMLTextAreaElement).value;

    // The committed syllable is a change like any other, and this is a path that
    // reaches `onChange` on its own: browsers disagree on whether `input` fires
    // before or after `compositionend`, so on the ones that end the composition
    // first this is the *only* announcement the parent gets. A stale form-level
    // error has to be cleared here too, or an IME user keeps an error the ASCII
    // typist next to them does not.
    onFormReset?.();
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
    if (autoFocus && !window.matchMedia(COMPACT_SCREEN).matches) {
      inputRef.current?.focus();
    }
  }, []);

  return (
    <Field.Root
      className={[
        'mp-text-field group relative',
        fullWidth ? 'w-full' : 'inline-block',
        // `font-size: 0` on the wrapper keeps the label's own `1rem` from
        // inheriting into the absolutely positioned copies unpredictably; each
        // text part sets its own scale from a typescale token.
        'align-top'
      ].join(' ')}
      disabled={disabled}
      invalid={invalid}
      data-mp-size={size}
    >
      <div
        className={[
          'relative flex w-full items-center gap-2',
          scale.padding,
          // The control carries the height rather than the container, so a
          // `<textarea>` can grow past it while an `<input>` stays put.
          multiline ? 'py-2' : ''
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <MPFieldOutline label={label} required={required} />

        {startIcon ? (
          <span className="text-mp-on-surface-variant group-data-disabled:text-mp-on-surface/38 flex shrink-0 items-center">
            {startIcon}
          </span>
        ) : null}

        <Field.Control
          /* `rows` goes on the element rather than on `Field.Control`, whose
             props are typed against an `<input>` and have no such thing. */
          render={multiline ? <textarea rows={rows} /> : <input />}
          id={fieldId}
          name={name}
          type={multiline ? undefined : showPassword ? 'text' : type}
          required={required}
          readOnly={readOnly}
          disabled={disabled}
          autoComplete={autoComplete}
          placeholder={placeholder}
          maxLength={maxLength}
          value={isComposing ? innerValue : value}
          ref={setInputRef as React.Ref<HTMLElement>}
          className={[
            `${scale.text} text-mp-on-surface w-full min-w-0 flex-1`,
            // A native control does not inherit the page's font, and with no
            // reset on the page nothing else will hand it one. The typescale
            // token is what says which — it is `inherit` by default, so the
            // field speaks in the application's own typeface.
            'font-[family-name:var(--mp-sys-typescale-body-large-font)]',
            // The row's own class is what sets the size; this only fixes the
            // family, which is the same `inherit` at every step.
            'appearance-none border-0 bg-transparent px-0 outline-none',
            'caret-mp-primary',
            scale.control,
            multiline ? 'py-0' : '',
            multiline && resizable ? 'resize-y' : 'resize-none',
            // The spec's disabled content opacity, on the text and on the
            // placeholder alike.
            'group-data-disabled:text-mp-on-surface/38',
            'placeholder:text-mp-on-surface-variant group-data-disabled:placeholder:text-mp-on-surface/38'
          ]
            .filter(Boolean)
            .join(' ')}
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

        {type === 'password' && !multiline ? (
          <button
            type="button"
            aria-label={showPassword ? 'hide the password' : 'display the password'}
            onClick={handleClickShowPassword}
            onMouseDown={handleMouseEventPassword}
            onMouseUp={handleMouseEventPassword}
            disabled={disabled}
            className={[
              'text-mp-on-surface-variant -mr-1 flex shrink-0 items-center justify-center',
              // Reset explicitly. This library ships no page reset — no
              // Preflight, no `CssBaseline` — so a native `<button>` arrives
              // with the browser's own grey background, border and font, and
              // nothing else is going to take them off.
              'cursor-pointer appearance-none border-0 bg-transparent p-1 font-[inherit]',
              'rounded-full outline-none',
              'hover:text-mp-on-surface focus-visible:text-mp-primary',
              'disabled:text-mp-on-surface/38 disabled:cursor-default'
            ].join(' ')}
          >
            <MPIcon icon={showPassword ? VisibilityIcon : VisibilityOffIcon} size={scale.icon} />
          </button>
        ) : null}
      </div>

      {label ? (
        <MPFieldLabel size={size} label={label} required={required} htmlFor={fieldId} />
      ) : null}

      {invalid ? (
        <Field.Error
          match={true}
          className={[
            'mp-text-field__support text-mp-body-small text-mp-error mt-1 block',
            scale.padding,
            'group-data-disabled:text-mp-on-surface/38'
          ].join(' ')}
        >
          {errorMessage}
        </Field.Error>
      ) : null}
    </Field.Root>
  );
});
