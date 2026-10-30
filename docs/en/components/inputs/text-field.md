---
title: MPTextField
order: 1
---

# MPTextField

<p class="mp-lede">A Material Design outlined text field that survives an IME, with the label, supporting text, adornments and password toggle already assembled. Every colour, size and duration comes from Material Design 3's own component tokens.</p>

<Demo src="text-field/hero" :minHeight="72" />

::: fw react

```tsx
import { MPTextField } from 'material-plus-ui';

const [email, setEmail] = useState('');

<MPTextField label="Email" type="email" value={email} onChange={setEmail} />;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPTextField(
  label: const Text('Email'),
  type: MPTextFieldType.email,
  value: email,
  onChanged: (String next) => setState(() => email = next),
);
```

:::

## Props

<PropsTable name="MPTextField" />

::: fw flutter

The field is built on `EditableText` from `package:flutter/widgets.dart`, not on Material's `TextField`, so it works in an app with no `MaterialApp` above it. What does not carry across from the React package is in [differences from the React build](#differences-from-the-react-build).

:::

## Why this exists

::: fw react

A controlled `<input>` is rendered from its `value` prop. While an input method is composing — Korean, Japanese, Chinese, and dead-key sequences in several European layouts — the browser is holding a **provisional** string in the element that has not been committed yet. Writing a `value` back over it in that moment destroys the composition: the syllable in progress is thrown away, and the caret jumps to the end.

:::

::: fw flutter

A controlled field writes its `value` into the editor. While an input method is composing — Korean, Japanese, Chinese, and dead-key sequences in several European layouts — the editor is holding a **provisional** string with a composing range the platform owns. Writing a value over it in that moment ends the composition: the syllable in progress is thrown away, and the caret jumps. A `TextEditingController` the parent writes into in `onChanged` has exactly this problem.

:::

Anything the parent does to the value in its change handler is enough to trigger it — trimming, upper-casing, validating, or simply rebuilding slowly.

`MPTextField` stops showing `value` for as long as a composition is running and shows what is actually being composed. The change callback still fires for every keystroke, so the parent sees the text as it is typed. When the composition ends the committed text is reported, and the field is controlled again.

<Demo src="text-field/composition" :minHeight="104">

::: fw react

<<< @/.vitepress/demos/text-field/composition.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/text_field/composition.dart

:::

</Demo>

The demo's parent upper-cases everything it is handed. Type a Korean word: the syllable being built stays intact, and the rule only applies once the syllable is committed. A plainly controlled field loses a character on every keystroke.

::: fw react

This is also why `value` and `onChange` are a plain string rather than an event. An event's `target` is the element mid-composition, which is precisely the value that must not be trusted.

:::

::: fw flutter

This is also why the field takes `value` and `onChanged` as a plain string rather than a `TextEditingController`. A controller is shared state the parent can write into at any moment, composing or not; a string is a value the field decides when to show.

A change the parent turns down is turned down on screen too: after the frame that would carry the parent's answer, the field shows `value` again, so a parent that keeps the text it already had keeps the field showing it.

:::

## Examples

### type

`text`, `email`, `search` and `password`. Only `password` changes behaviour rather than appearance: it grows a reveal toggle in the trailing adornment.

::: fw react

`search` is here for the keyboard it summons and the autofill it declines — iOS labels the return key "search" for it, and a browser keeps its own history of what was typed into one. It draws exactly as `text` does, and the browser's own × inside it is suppressed: that mark sits outside the adornment row, is not in the tab order, and empties a controlled value without telling React.

:::

::: fw flutter

The types are `MPTextFieldType.text`, `.email`, `.search` and `.password`. `email` brings up the keyboard with `@` on it and turns autocorrection off; `search` makes the keyboard's action key read "search". Both draw exactly as `text` does.

:::

<Demo src="text-field/password" :minHeight="72">

::: fw react

<<< @/.vitepress/demos/text-field/password.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/text_field/password.dart

:::

</Demo>

::: fw react

Pressing the toggle does not move the caret. Both `mousedown` and `mouseup` are cancelled — cancelling only one leaves the field losing focus and the caret coming back at the end of the text. The toggle is disabled along with the field.

:::

::: fw flutter

Pressing the toggle does not move the caret. The toggle takes no focus on a press and sits inside the field's tap region, so the editor keeps the focus and the caret stays where it was. Tab still reaches the toggle, and it is disabled along with the field.

:::

### errorMessage

There is no separate `error` boolean. A message is what puts the field into its error state, so there is no way to render a field that is visibly wrong with no explanation of why.

<Demo src="text-field/states" :minHeight="280">

::: fw react

<<< @/.vitepress/demos/text-field/states.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/text_field/states.dart

:::

</Demo>

::: warning A note if you are porting from `PageTextField`

In the original the error colour reached the helper text only, leaving the outline in its resting state. Here `errorMessage` turns the whole control over — outline, label and message together — which is what the specification asks for.

:::

`readOnly` shows a value without allowing edits, and unlike `disabled` the text stays selectable and the field stays in the focus order. That is what you want for a value the reader may need to copy.

### floatingLabel

While the field is empty and unfocused the label rests on the field's own line, at the field's own type scale, reading as the placeholder — and rises into the notch the moment there is something to make room for. That is Material's outlined text field, and it is what every other notched control in this library does too.

<Demo src="text-field/floating-label" :minHeight="260">

::: fw react

<<< @/.vitepress/demos/text-field/floating-label.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/text_field/floating_label.dart

:::

</Demo>

Three things hold the label up: focus, content, and a `startIcon`. The icon is already standing where the resting label would be and the two cannot share the spot, so a field with a leading glyph keeps its label in the notch — the third field above.

The `placeholder` is withheld for as long as the label is resting in its place, and comes back with focus, which is also when it is of any use. Two greyed strings in one box is not a hint.

::: fw react

`floatingLabel={false}` pins the label in the notch — the second field above.

:::

::: fw flutter

`floatingLabel: false` pins the label in the notch — the second field above.

:::

That is worth having for one reason: a field with a label and a field without one sit at the same height only while the label is up, so a row that mixes the two, or a dense form where the labels moving would be noise, may want them still.

On a multiline field the resting label sits on the first line rather than in the middle of the box, since the middle of a six-row box is nowhere near the caret.

### rows

::: fw react

Any `rows` renders a `<textarea>` instead of an `<input>`. Everything else stays identical.

:::

::: fw flutter

Any `rows` makes the field multiline, that many rows tall. Everything else stays identical.

:::

<Demo src="text-field/multiline" :minHeight="200">

::: fw react

<<< @/.vitepress/demos/text-field/multiline.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/text_field/multiline.dart

:::

</Demo>

::: fw react

`resizable` lets the reader drag the field taller — vertically only, since a field that can be widened breaks the column of the form it is in.

:::

### size

Five rungs, and `md` is the specification's: Material defines one size for a text field, the 56px one, so that is what you get by saying nothing. The other four exist because a component library is used in places a design system does not plan for — a filter bar, a table's inline editor, a dense settings page. See [Prop conventions](../../design/prop-conventions#size) for the rule this follows.

The heights are a Material type scale plus padding rather than a number anybody sets, which is what lets a multiline field grow past its own size.

<Demo src="text-field/sizes" :minHeight="220">

::: fw react

<<< @/.vitepress/demos/text-field/sizes.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/text_field/sizes.dart

:::

</Demo>

### startIcon

Content placed before the text, usually an [MPIcon](../display/icon). It takes the `on-surface-variant` role and the field's own spacing, so a glyph put here sits where the specification puts a leading icon.

::: fw react

```tsx
<MPTextField
  label="Search"
  value={query}
  onChange={setQuery}
  startIcon={<MPIcon icon={ICONS.search} size={18} />}
/>
```

:::

::: fw flutter

```dart
MPTextField(
  label: const Text('Search'),
  value: query,
  onChanged: (String next) => setState(() => query = next),
  startIcon: MPIcon(icon: searchGlyph, size: 18),
)
```

An `Icon` or any widget that reads `IconTheme` takes the rung's glyph size and the `on-surface-variant` colour from the field.

:::

The trailing adornment is reserved for the password toggle and is not configurable.

### onSubmit

Called when Enter is pressed.

::: fw react

```tsx
<MPTextField value={query} onChange={setQuery} onSubmit={() => search(query)} />
```

**Passing it is what makes the field take the key.** With an `onSubmit` on a single-line field Enter is then swallowed, so a surrounding `<form>` is submitted once rather than also natively; with no `onSubmit` the keystroke is left to the browser, which inside a `<form>` is the native submit an `<input>` has always done. A page that already writes `<form onSubmit>` needs nothing here.

:::

::: fw flutter

```dart
MPTextField(
  value: query,
  onChanged: (String next) => setState(() => query = next),
  onSubmit: () => search(query),
)
```

**Passing it is what makes the field take the key.** With an `onSubmit` on a single-line field Enter is then taken, so an [MPForm](./form) around the field is not also submitted, and the field keeps the focus. With no `onSubmit`, Enter on a single-line field inside an `MPForm` submits the form, as Enter in an `<input>` submits its `<form>`; outside one it is left to the platform, which puts the on-screen keyboard away. The keyboard's own action key on a phone counts as Enter.

:::

On a multiline field Enter is left alone either way — there it inserts a newline, which is what a multiline field is for. `disableEnterKey` takes the key away from whatever would otherwise have it: the newline with `rows`, the form's submit without.

The Enter that **commits a composition** never reaches it. Typing 한글 or 日本語 ends every syllable with an Enter the input method is consuming, and a field that read those as submissions would send the form on the first word of every sentence — the same failure this component exists to prevent, arriving through the key handler instead of through `value`. That keystroke is left alone rather than taken, because the input method is using it to commit; the next Enter, once there is nothing being composed, submits as usual.

::: fw react

### onKeyDown, and the rest of the raw events

`onSubmit` is the plain Enter. Anything else the keyboard can say — a combination, Escape, the arrow keys — arrives through `onKeyDown`, and the pointer through `onClick`, `onDoubleClick` and `onContextMenu`.

They are on the **control**, not on the box around it: a keystroke that landed on the reveal toggle is not one that landed in the field, and neither is the focus the toggle takes. Yours runs **first**, and the field checks `defaultPrevented` before doing anything of its own with the key:

```tsx
<MPTextField
  value={draft}
  onChange={setDraft}
  rows={4}
  onSubmit={() => {}} // Enter still inserts a newline here
  onKeyDown={(event) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault(); // ⌘Enter is yours, and the newline does not happen
      send(draft);
    }
  }}
/>
```

`onFocus` and `onBlur` come from the same set, which is what a form library's "touched" bookkeeping wants.

The composition rule still holds: a caller hears the Enter that commits a syllable — it is theirs to interpret — but the field does not turn it into a submission.

The whole of the convention, and which other components take these, is in [Prop conventions](../../design/prop-conventions#raw-events).

:::

::: fw flutter

### onKeyEvent and onFocusChange

`onSubmit` is the plain Enter. Anything else the keyboard can say — a combination, Escape, the arrow keys — arrives through `onKeyEvent`, Flutter's own key callback.

It is on the **control**, not on the box around it: a key pressed on the reveal toggle is not one pressed in the field. Yours runs **first**, and returning `KeyEventResult.handled` takes the key, so the field does nothing further with it:

```dart
MPTextField(
  value: draft,
  onChanged: (String next) => setState(() => draft = next),
  rows: 4,
  onKeyEvent: (FocusNode node, KeyEvent event) {
    final bool command = HardwareKeyboard.instance.isMetaPressed ||
        HardwareKeyboard.instance.isControlPressed;

    if (event is KeyDownEvent && event.logicalKey == LogicalKeyboardKey.enter && command) {
      send(draft);

      return KeyEventResult.handled; // ⌘Enter is yours, and the newline does not happen
    }

    return KeyEventResult.ignored;
  },
)
```

`onFocusChange` reports the control taking and losing the focus, which is what a form library's "touched" bookkeeping wants. The reveal toggle taking the focus is not reported.

The composition rule still holds: a caller hears the Enter that commits a syllable — it is theirs to interpret — but the field does not turn it into a submission.

:::

### onFormReset

::: fw react

Called before every change, ahead of `onChange`. It exists for the common case of clearing a form-level error that a further edit has made stale:

```tsx
<MPTextField
  value={email}
  onChange={setEmail}
  onFormReset={() => setServerError('')}
  errorMessage={serverError}
/>
```

:::

::: fw flutter

Called before every change, ahead of `onChanged`. It exists for the common case of clearing a form-level error that a further edit has made stale:

```dart
MPTextField(
  value: email,
  onChanged: (String next) => setState(() => email = next),
  onFormReset: () => setState(() => serverError = null),
  errorMessage: serverError,
)
```

:::

::: fw react

### autoFocus

Focuses the field on mount — except on a small screen, where it would summon the on-screen keyboard over a page the reader has only just arrived at. The breakpoint is your theme's `sm`.

:::

::: fw flutter

### autofocus

Focuses the field as it is inserted — except in a compact window, where it would summon the on-screen keyboard over a screen the reader has only just arrived at. The breakpoint is the `medium` window class, which an `MPConfigProvider` can move.

:::

## Accessibility

::: fw react

- The label is a real `<label>` wired to the control by `id`. Pass `id` to choose it; leave it out and one is generated, so two fields on a page never collide.
- `required` reaches both the label and the control.
- The password toggle is a real button with a name that changes with its state — "Show the password" / "Hide the password" in English, and in the reader's language once its messages are registered.

:::

::: fw flutter

- The field is one stop for a screen reader: a text field named by its label, holding its text, with the error message read after the name. The asterisk on a required label is not read; the field says it is required instead.
- An error message marks the field invalid, and `semanticLabel` names a field that has no visible label.
- A screen reader's tap and focus both reach the editor. A read-only field takes the focus and no tap; a disabled one takes neither, and Tab passes it.
- The password toggle is a button of its own with a name that changes with its state — "Show the password" / "Hide the password" in English, and in the reader's language once its messages are registered.

:::

::: fw flutter

## Differences from the React build

Most of this page is the same in both packages. These are the places where it is not, and why.

| React | Flutter | Why |
| --- | --- | --- |
| `onChange` | `onChanged` | Flutter's name. |
| `label` (a `string`) | `label` (a `Widget?`) | Usually a `Text`. Every other field in the Flutter package takes its label as a widget, so a form is written the same way for each of them. |
| `type="email"` | `type: MPTextFieldType.email` | An enum rather than a string. |
| `autoComplete` | `autofillHints` | Flutter's autofill takes [`AutofillHints`](https://api.flutter.dev/flutter/services/AutofillHints-class.html) rather than HTML's tokens. |
| `aria-label` | `semanticLabel` | Flutter's name. |
| `autoFocus` | `autofocus` | Flutter's name. The compact window is the `medium` window class rather than the theme's `sm` breakpoint. |
| `onKeyDown`, `onKeyUp` | `onKeyEvent` | One callback for both, returning a `KeyEventResult` in place of `preventDefault()`. |
| `onFocus`, `onBlur` | `onFocusChange` | One callback with a `bool`. |
| `onClick`, `onDoubleClick`, `onContextMenu` | — | Wrap the field in a `GestureDetector` or a `Listener` for the pointer. |
| The browser's selection handles and context menu | Drawn by the package | On Android a long press selects a word, with handles to drag in the theme's primary colour and a menu of cut, copy, paste, select all and share in the field's language. iOS shows its own system menu. On a desktop a right click opens the same menu, and on the web the browser's menu stays. There is no magnifier. |
| `resizable` | — | It is CSS's `resize`, which has no Flutter counterpart. |
| `id` | — | There is no document to point a label at; the label is part of the field's semantics node. |
| `className`, `style` | — | There is nothing to pass them through to. `focusNode` is offered instead. |
| `<form>` submit on Enter | `MPForm` submit on Enter | Flutter has no native form, so a single-line field without `onSubmit` submits the [MPForm](./form) around it. |

A field that is not `fullWidth` is laid out about twenty characters wide, which is what a browser gives an `<input>`, and does not grow as it is typed into.

The rest is matched deliberately: the composition handling, the floating label and its three reasons to stay up, the notch, the Enter rules, the password toggle that keeps the caret, and the size ladder.

:::

## See also

- [MPIcon](../display/icon) — for `startIcon`.
- [MPForm](./form) — for submitting a group of fields and showing a server's errors on them.
- [Theming](../../guide/getting-started#theming) — the colour roles this field reads, and how to change them.

::: fw react

- [Base UI Field](https://base-ui.com/react/components/field) — the behaviour underneath: the label association, the validity state, the `data-*` attributes the styling keys on.

:::
