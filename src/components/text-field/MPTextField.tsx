import * as React from 'react';
import { Field } from '@base-ui/react/field';
import { MPIcon } from '../icon/MPIcon';
import { MPFieldLabel, MPFieldOutline, useFloatingLabel } from '../../internal/FieldOutline';
import { MPSupportingText } from '../../internal/SupportingText';
import { VisibilityIcon, VisibilityOffIcon } from '../../constants/icons';
import { useMPLocale, useMPMessages } from '../../internal/locale';
import { TEXT_FIELD } from '../../internal/messages/text-field';
import type { MPMessages } from '../../internal/i18n';
import type { MPControlEventProps, MPSize, MPStyleProps } from '../../types';

/**
 * The input modes this field is built for.
 *
 * `search` is here for the keyboard it summons and the autofill it declines
 * rather than for anything visual: iOS labels the return key "search" for it,
 * and a browser keeps its own history of what was typed into one. The field
 * draws exactly as `text` does — the browser's own clear button is suppressed by
 * the same reset every other control in the library gets — because a search box
 * that came with a second × next to `MPTextField`'s adornments would be two
 * affordances doing one job.
 */
export type MPTextFieldType = 'email' | 'password' | 'search' | 'text';

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

export interface MPTextFieldProps
  extends MPStyleProps, MPControlEventProps<HTMLInputElement | HTMLTextAreaElement> {
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
  /**
   * Placeholder shown while the field is empty.
   *
   * With a floating label it is held back until the label has risen out of its
   * way, which is the moment the field is focused. Two greyed strings in one box
   * is not a hint, it is a collision.
   */
  placeholder?: string;
  /** Native `autocomplete` token — `'email'`, `'current-password'`, `'off'`. */
  autoComplete?: string;
  /**
   * Label for the field, drawn in the outline's notch and — while the field is
   * empty, unfocused and has no `startIcon` — resting on the field's own line
   * where a placeholder would be. See `floatingLabel`.
   */
  label?: string;
  /**
   * Whether the label rests on the field's line while there is nothing to make
   * room for, and rises into the notch on focus or on the first character.
   *
   * `false` pins it in the notch, which is the one thing a floating label costs:
   * a field with a label and a field without one no longer sit at the same
   * height in a form until both are filled.
   *
   * A `startIcon` holds the label up regardless. The icon is already standing
   * where the resting label would be, and the two cannot share the spot.
   * @default true
   */
  floatingLabel?: boolean;
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
   * Takes the Enter key away from whatever would otherwise have it.
   *
   * With `rows` that is the newline, which is the usual reason to reach for
   * this: a multiline field wired to `onSubmit` where Enter should send rather
   * than wrap.
   *
   * On a single-line field it is the *form* — Enter in an `<input>` inside a
   * `<form>` submits it — so this is how a field opts out of a submission it
   * has no part in. A field with an `onSubmit` already opts out, because
   * answering the key twice is the same accident spelled differently.
   * @default false
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
   * The id put on the control and pointed at by the label. Generated when it is
   * left out.
   */
  id?: string;
  /**
   * Which language the reveal toggle's name is written in. Falls back to the
   * nearest `MPLocaleProvider`, then to English.
   *
   * It is the only text a text field invents — everything else in it is yours —
   * and until it was in the table it was the one string in the library with no
   * way at all to change it.
   */
  locale?: string;
  /** Overrides the two words the reveal toggle is announced by. */
  passwordLabels?: Partial<MPMessages['textField']>;
  /**
   * Called with the field's text on every change, including each keystroke of
   * an in-progress composition. The field shows what was actually typed until
   * the composition ends, so a parent is free to normalise, truncate or reject
   * the value it is handed without the caret jumping mid-syllable.
   */
  onChange?: (value: string) => void;
  /**
   * Called when Enter is pressed.
   *
   * On a single-line field the key is then swallowed, so a surrounding form is
   * submitted once rather than also natively. **Passing this is what makes the
   * field take the key at all**: without it Enter is left to the browser, which
   * inside a `<form>` means the native submit an `<input>` has always done. A
   * page that already writes `<form onSubmit>` needs nothing here.
   *
   * On a **multiline** field it is not swallowed, and both things happen: this
   * fires *and* a newline is inserted. That is deliberate — the prop reports the
   * keystroke rather than deciding what the field does with it — but it is worth
   * knowing before wiring it to something that sends. `disableEnterKey` is what
   * makes Enter a submission there and nothing else.
   *
   * Never called for the Enter that commits an IME composition: that keystroke
   * belongs to the input method, not to the form.
   *
   * An `onKeyDown` of your own runs before this and can take the keystroke: an
   * `event.preventDefault()` there means no submission is reported and the
   * field does nothing further with the key.
   */
  onSubmit?: () => void;
  /**
   * Called before every change, ahead of `onChange`. For clearing a
   * form-level error that a further edit has made stale.
   */
  onFormReset?: () => void;
  /**
   * Added to the field's outermost element — the box around the control and its
   * supporting line, rather than to the `<input>` itself. The control carries a
   * type scale of its own, so a `text-*` written here does not reach it; that is
   * what `size` is for.
   */
  className?: string;
  style?: React.CSSProperties;
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
 * Whether this keystroke belongs to an input method rather than to the field.
 *
 * The Enter that commits a Korean or Japanese syllable is a keystroke the IME
 * is consuming, not one the reader aimed at the form — so a field that treated
 * it as a submission would send the form on the first word of every sentence.
 * That is the same class of bug this whole component exists to prevent, arriving
 * through the key handler instead of through `value`.
 *
 * Two tests, because neither covers every engine. `isComposing` is the standard
 * one and is what Chrome, Firefox and modern Safari set. `keyCode === 229` is
 * the convention every IME has used since long before that flag existed, and it
 * is what older WebKit reports on the same keystroke.
 */
function isComposingKey(event: React.KeyboardEvent): boolean {
  const native = event.nativeEvent;

  return native.isComposing || native.keyCode === 229;
}

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
    floatingLabel = true,
    onChange,
    onFormReset,
    onSubmit,
    onKeyDown,
    onKeyUp,
    onFocus,
    onBlur,
    onClick,
    onDoubleClick,
    onContextMenu,
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
    id,
    locale: localeProp,
    passwordLabels,
    className,
    style
  },
  ref
) {
  const locale = useMPLocale(localeProp);
  const messages = useMPMessages(TEXT_FIELD, locale, passwordLabels);
  const inputRef = React.useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const [isComposing, setIsComposing] = React.useState(false);
  const [innerValue, setInnerValue] = React.useState(value);
  const generatedId = React.useId();
  const fieldId = id ?? generatedId;
  const multiline = !!rows;
  const invalid = errorMessage.length > 0;
  const scale = SIZES[size];
  const shown = isComposing ? innerValue : value;
  const { shrunk, focusProps } = useFloatingLabel({
    floating: floatingLabel && !!label,
    filled: shown.length > 0,
    pinned: !!startIcon
  });

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
        'align-top',
        className ?? ''
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
      disabled={disabled}
      invalid={invalid}
      data-mp-size={size}
      {...focusProps}
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
        <MPFieldOutline label={label} required={required} notched={shrunk} />

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
          // Withheld while a floating label is resting in the same place. It
          // comes back with focus, which is also when it is of any use.
          placeholder={shrunk ? placeholder : undefined}
          maxLength={maxLength}
          value={shown}
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
            // WebKit draws its own × inside a `search` input, and it is not the
            // one this field would draw: it sits outside the adornment row, it
            // is not in the tab order, and it empties a controlled value without
            // telling React. `appearance-none` above does not reach it.
            type === 'search' ? '[&::-webkit-search-cancel-button]:hidden' : '',
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
          // The caller's, on the control rather than on the row around it: a
          // keystroke that landed on the reveal toggle is not one that landed in
          // the field, and neither is the focus the toggle takes.
          onKeyUp={onKeyUp}
          onFocus={onFocus}
          onBlur={onBlur}
          onClick={onClick}
          onDoubleClick={onDoubleClick}
          onContextMenu={onContextMenu}
          onKeyDown={(event) => {
            onKeyDown?.(event);

            // Theirs first, and theirs wins. A caller who has answered this
            // keystroke — Ctrl+Enter that sends, Escape that closes something
            // above the field — has said so by preventing it, and a field that
            // then also reported a submission would be sending twice.
            if (event.defaultPrevented) {
              return;
            }

            if (event.key === 'Enter') {
              // Left alone rather than swallowed. While an IME is composing the
              // browser is using Enter to commit the syllable, and a
              // `preventDefault` here would take the commit away from it —
              // which is worse than the submission this is avoiding.
              if (isComposingKey(event)) {
                return;
              }

              onSubmit?.();

              // Swallowed only when something here has already answered the
              // key.
              //
              // On a single-line field an `onSubmit` is that answer, and
              // letting the key through as well would submit a surrounding form
              // on top of whatever it just did. With no `onSubmit` the
              // keystroke is the browser's, and on a single-line field inside a
              // `<form>` the browser's answer is a native submit — a field that
              // ate it would have broken every form it was dropped into, which
              // is exactly what this used to do.
              //
              // On a multiline field the answer is a newline, and only
              // `disableEnterKey` takes it away. `onSubmit` there reports the
              // keystroke without deciding what the field does with it, which
              // is what its documentation has always said.
              if (disableEnterKey || (onSubmit && !multiline)) {
                event.preventDefault();
              }
            }
          }}
        />

        {type === 'password' && !multiline ? (
          <button
            type="button"
            aria-label={showPassword ? messages.hidePassword : messages.showPassword}
            onClick={handleClickShowPassword}
            onMouseDown={handleMouseEventPassword}
            onMouseUp={handleMouseEventPassword}
            disabled={disabled}
            className={[
              'text-mp-on-surface-variant -me-1 flex shrink-0 items-center justify-center',
              // Reset explicitly. This library ships no page reset — no
              // Preflight, no `CssBaseline` — so a native `<button>` arrives
              // with the browser's own grey background, border and font, and
              // nothing else is going to take them off.
              'cursor-pointer appearance-none border-0 bg-transparent p-1 font-[inherit]',
              'rounded-full',
              // The library's own ring, which this was the one control in it to
              // go without. A focus indicator that is only a change of colour is
              // one a reader who cannot tell those two colours apart does not
              // have — and the two here are `on-surface-variant` and `primary`,
              // which under a monochrome theme are the same ink.
              'outline-mp-secondary focus-visible:outline-2 focus-visible:outline-offset-1',
              'focus-visible:outline-solid outline-none',
              'hover:text-mp-on-surface focus-visible:text-mp-primary',
              'disabled:text-mp-on-surface/38 disabled:cursor-default'
            ].join(' ')}
          >
            <MPIcon icon={showPassword ? VisibilityIcon : VisibilityOffIcon} size={scale.icon} />
          </button>
        ) : null}

        {/* Inside the row rather than beside it: a resting label is centred on
            the control, and the `Field.Root` above also holds the supporting
            text, which would pull that centre down whenever there is a message. */}
        {label ? (
          <MPFieldLabel
            size={size}
            label={label}
            required={required}
            htmlFor={fieldId}
            shrunk={shrunk}
            multiline={multiline}
          />
        ) : null}
      </div>

      {/*
        The same line every other control in this library draws under itself.
        It used to be written out here — the classes, the two `Field.Error`
        slots and the argument for the second one — which is the fifth copy of a
        component that exists to be the only one.

        `mp-text-field__support` stays on it: it is a styling hook a page may
        have reached for, and a shared component is not a reason to take a name
        away.
      */}
      <MPSupportingText
        errorMessage={errorMessage}
        className={`mp-text-field__support mt-1 ${scale.padding}`}
      />
    </Field.Root>
  );
});
