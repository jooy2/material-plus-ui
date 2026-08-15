---
title: MPTextField
order: 1
---

# MPTextField

<p class="mp-lede">A Material Design outlined text field that survives an IME, with the label, supporting text, adornments and password toggle already assembled. Every colour, size and duration comes from Material Design 3's own component tokens.</p>

<Demo src="text-field/hero" :minHeight="72" />

```tsx
import { MPTextField } from 'material-plus-ui';

const [email, setEmail] = useState('');

<MPTextField label="Email" type="email" value={email} onChange={setEmail} />;
```

## Props

<PropsTable name="MPTextField" />

## Why this exists

A controlled `<input>` is rendered from its `value` prop. While an input method is composing — Korean, Japanese, Chinese, and dead-key sequences in several European layouts — the browser is holding a **provisional** string in the element that has not been committed yet. Writing a `value` back over it in that moment destroys the composition: the syllable in progress is thrown away, and the caret jumps to the end.

Anything the parent does to the value in its `onChange` is enough to trigger it — trimming, upper-casing, validating, or simply re-rendering slowly.

`MPTextField` stops rendering `value` for as long as a composition is running and shows its own copy of what the element actually contains. `onChange` still fires for every keystroke, so the parent sees the text as it is typed. When the composition ends the copy is dropped and the field is controlled again.

<Demo src="text-field/composition" :minHeight="104">

<<< @/.vitepress/demos/text-field/composition.tsx

</Demo>

The demo's parent upper-cases everything it is handed. Type a Korean word: the syllable being built stays intact, and the rule only applies once the syllable is committed. A plainly controlled `<input>` loses a character on every keystroke.

This is also why `value` and `onChange` are a plain string rather than an event. An event's `target` is the element mid-composition, which is precisely the value that must not be trusted.

## Examples

### type

`text`, `email` and `password`. Only `password` changes behaviour rather than appearance: it grows a reveal toggle in the trailing adornment.

<Demo src="text-field/password" :minHeight="72">

<<< @/.vitepress/demos/text-field/password.tsx

</Demo>

Pressing the toggle does not move the caret. Both `mousedown` and `mouseup` are cancelled — cancelling only one leaves the field losing focus and the caret coming back at the end of the text. The toggle is disabled along with the field.

### errorMessage

There is no separate `error` boolean. A message is what puts the field into its error state, so there is no way to render a field that is visibly wrong with no explanation of why.

<Demo src="text-field/states" :minHeight="280">

<<< @/.vitepress/demos/text-field/states.tsx

</Demo>

::: warning A note if you are porting from `PageTextField`

In the original the error colour reached the helper text only, leaving the outline in its resting state. Here `errorMessage` turns the whole control over — outline, label and message together — which is what the specification asks for.

:::

`readOnly` shows a value without allowing edits, and unlike `disabled` the text stays selectable and the field stays in the tab order. That is what you want for a value the reader may need to copy.

### rows

Any `rows` renders a `<textarea>` instead of an `<input>`. Everything else stays identical.

<Demo src="text-field/multiline" :minHeight="200">

<<< @/.vitepress/demos/text-field/multiline.tsx

</Demo>

`resizable` lets the reader drag the field taller — vertically only, since a field that can be widened breaks the column of the form it is in.

### size

Five rungs, and `md` is the specification's: Material defines one size for a text field, the 56px one, so that is what you get by saying nothing. The other four exist because a component library is used in places a design system does not plan for — a filter bar, a table's inline editor, a dense settings page. See [Prop conventions](../../design/prop-conventions#size) for the rule this follows.

The heights are a Material type scale plus padding rather than a number anybody sets, which is what lets a multiline field grow past its own size.

<Demo src="text-field/sizes" :minHeight="220">

<<< @/.vitepress/demos/text-field/sizes.tsx

</Demo>

### startIcon

Content placed before the text, usually an [MPIcon](../display/icon). It takes the `on-surface-variant` role and the field's own spacing, so a glyph put here sits where the specification puts a leading icon.

```tsx
<MPTextField
  label="Search"
  value={query}
  onChange={setQuery}
  startIcon={<MPIcon icon={ICONS.search} size={18} />}
/>
```

The trailing adornment is reserved for the password toggle and is not configurable.

### onSubmit

Called when Enter is pressed.

```tsx
<MPTextField value={query} onChange={setQuery} onSubmit={() => search(query)} />
```

On a single-line field Enter is then swallowed, so a surrounding `<form>` is submitted once rather than also natively. On a multiline field it is left alone — there Enter inserts a newline, which is what a textarea is for. `disableEnterKey` swallows it there too, for a multiline field that should submit rather than wrap.

The Enter that **commits a composition** never reaches it. Typing 한글 or 日本語 ends every syllable with an Enter the input method is consuming, and a field that read those as submissions would send the form on the first word of every sentence — the same failure this component exists to prevent, arriving through the key handler instead of through `value`. That keystroke is left alone rather than swallowed, because the browser is using it to commit; the next Enter, once there is nothing being composed, submits as usual.

### onFormReset

Called before every change, ahead of `onChange`. It exists for the common case of clearing a form-level error that a further edit has made stale:

```tsx
<MPTextField
  value={email}
  onChange={setEmail}
  onFormReset={() => setServerError('')}
  errorMessage={serverError}
/>
```

### autoFocus

Focuses the field on mount — except on a small screen, where it would summon the on-screen keyboard over a page the reader has only just arrived at. The breakpoint is your theme's `sm`.

## Accessibility

- The label is a real `<label>` wired to the control by `id`. Pass `name` and the id is derived from it; pass neither and one is generated, so two unnamed fields on a page never collide.
- `required` reaches both the label and the control.
- The password toggle is a real button with a name that changes with its state — "display the password" / "hide the password".

## See also

- [MPIcon](../display/icon) — for `startIcon`.
- [Theming](../../guide/getting-started#theming) — the colour roles this field reads, and how to change them.
- [Base UI Field](https://base-ui.com/react/components/field) — the behaviour underneath: the label association, the validity state, the `data-*` attributes the styling keys on.
