---
title: MPRating
order: 10
---

# MPRating

<p class="mp-lede">A score out of five, as a row of stars. Underneath is a radio group of real inputs, one per choosable score — which is what makes the row one tab stop, the arrow keys work inside it, and the value arrive in a form submission with nothing wired up.</p>

<Demo src="rating/hero" :minHeight="140" />

::: fw react

```tsx
import { MPRating } from 'material-plus-ui';

const [score, setScore] = useState(0);

<MPRating value={score} onValueChange={setScore} />;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

double score = 0;

MPRating(value: score, onChanged: (double next) => setState(() => score = next));
```

:::

## Props

<PropsTable name="MPRating" />

## Why it is radios and not buttons

Because a rating **is** "exactly one of these", and that is what a radio group means.

The browser then hands over everything a rating needs and a row of `<button>`s would have to reimplement: one tab stop for the set, the arrow keys within it, `aria-checked` on the one that is taken, a value in a form submission, and `required` validation. Every input is visually hidden under the half of a star it stands for, so a pointer presses a star and a keyboard presses a radio.

Each one is named — "3 out of 5" — because what is drawn is a shape, and five unlabelled radios is a control nobody can hear.

::: fw flutter

There are no inputs in Flutter, but the shape is the same: the row is one focus stop, the arrow keys move the score, and every score that can be chosen is a radio of its own to a screen reader, in a node with the radio group role, named "3 out of 5". Controlled with `value` and `onChanged`, or left to hold its own score from `initialValue`.

:::

## precision

<Demo src="rating/precision" :minHeight="320">

::: fw react

<<< @/.vitepress/demos/rating/precision.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/rating/precision.dart

:::

</Demo>

`precision` bounds what can be **chosen**, and nothing else. `0.5` gives half stars, `1` whole ones, and anything outside `0 < precision <= 1` falls back to `1`.

A `value` of `4.3` is drawn as four stars and a third at every precision, because an average is not a choice — rounding it to the nearest half would be reporting a different number from the one the component was handed.

The fraction is drawn by laying the filled star over the empty one and clipping it to a percentage of the width. Nothing is transformed and no glyph is scaled, so a half star is the left half of exactly the star beside it. The clip runs from the inline start, so it fills from the right under RTL with nothing being told to.

## readOnly

A product's average, a rating somebody else left. It becomes a different component in the same clothes: no inputs, no radio group, and one `role="img"` carrying the score as a sentence — because twenty focusable radios on a page that was only reporting a number is twenty tab stops nobody asked for.

**This is the one `readOnly` in the library that does not drain the saturation.** It is not a control being held still: there are no inputs at all, and what is left is a picture of a number. A row of grey stars would say the score itself was unavailable.

`disabled` is the other thing, and it does drain it: the accent goes and the specification's disabled ink comes in, exactly as it does on every other control.

## clearable

On by default: pressing the score that is already chosen clears it back to `0`.

::: fw react

It has to be a click handler rather than a change handler, and that is worth knowing if you are reading the source — clicking a radio that is already checked fires a click and no change at all, and that click is exactly the gesture being listened for.

:::

## Why the stars are not amber

Because there is no amber in this library's colour system.

MD3 defines four accent families — `primary`, `secondary`, `tertiary` and `error` — and a fifth colour hardcoded here would be one the token sheet has no name for and a theme has no way to change. It would also be the only colour in the library that a page could not restyle.

A product whose stars must be gold sets the token and asks for the family:

::: fw react

```css
:root {
  --mp-sys-color-tertiary: #b58900;
}
```

:::

::: fw flutter

```dart
MPTheme(
  colors: MPColorScheme.fromSource().copyWith(tertiary: const Color(0xFFB58900)),
  child: const App(),
);
```

:::

::: fw react

```tsx
<MPRating color="tertiary" />
```

:::

::: fw flutter

```dart
const MPRating(color: MPColor.tertiary);
```

:::

Which is the same answer this library gives everywhere else.

:::: fw react

## In a form

::: fw react

```tsx
<form action={submit}>
  <MPRating name="score" required />
  <MPButton type="submit">Send</MPButton>
</form>
```

:::

`name` identifies the value, `required` stops the form submitting until a star has been chosen, and the browser does both. Without a `name` one is generated, so two ratings on a page never share a radio group by accident.

::::

::: fw flutter

## In a form

There is no form submission in Flutter, so there is no `name`. `required` is kept for what it says to a screen reader, that a score has to be chosen; holding a form back until one is chosen is the form's job.

:::

:::: fw react

## structuredData

A score is the other thing a search engine will draw beside a result, and it wants schema.org `Rating` markup to do it.

::: fw react

```tsx
<div itemScope itemType="https://schema.org/Product">
  <h2 itemProp="name">A kettle</h2>
  <MPRating readOnly value={4.3} structuredData itemProp="aggregateRating" />
  <meta itemProp="ratingCount" content="128" />
</div>
```

:::

Three things about that example are the whole of this prop.

It is **`readOnly` only**. A score somebody is still choosing is not a fact about anything, and marking an empty control up as a rating of nought tells a crawler something untrue about the page.

The **`itemProp` is yours**. Microdata is nesting, and this component cannot know what it is nested in — `aggregateRating` on a product, `reviewRating` inside a review, something else entirely. It emits the `Rating` and its values; naming the relationship is the page's job.

The **count is yours too**. `aggregateRating` needs a `ratingCount` or a `reviewCount` beside it before a search engine will draw anything, and that number is not something a row of stars knows.

`worstRating` is written out as `0` rather than left to default to 1, because this control's floor is nought — "1 out of 5" means something different on a scale that starts at 1.

::::

## Accessibility

::: fw react

- A `radiogroup` named from the locale's word for "Rating", holding one radio per choosable score.
- Every radio has a spoken name, because what is drawn is a shape rather than a number.
- Read-only is one `role="img"` with the score as its name, and nothing focusable inside it.
- The hover preview is pointer-only. What a keyboard reader hears is the score, never what the pointer is currently promising.

:::

::: fw flutter

- A node with the radio group role, named from the locale's word for "Rating", holding one radio per choosable score, each with a spoken name.
- One focus stop. The arrow keys move the score by one step, left and right following the writing direction; <kbd>Home</kbd> and <kbd>End</kbd> go to the ends without clearing. The focus ring is drawn round the star that holds the score.
- Read-only is one image node with the score as its name, and nothing focusable inside it.
- The hover preview is pointer-only. What a keyboard reader hears is the score, never what the pointer is currently promising.

:::

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| A radio group of `<input>`s | One focus stop with radio nodes | The same thing to a screen reader, without inputs to hide. |
| `defaultValue` | `initialValue` | `initialX` is the name Flutter gives a starting value. |
| `onValueChange` | `onChanged` | Flutter’s name for a control’s value changing. |
| `labels: Partial<MPRatingLabels>` | `labels: Map<String, String>` | The same keys, as a map. |
| `name` | — | There is no form submission to be part of. |
| `structuredData` | — | Microdata is HTML; there is no crawler reading a Flutter screen. |
| `className`, `style` | — | There is no class list and no style attribute to pass through. |

:::

## See also

- [MPRadioGroup](./radio-group) — the same "exactly one of these", written out.
- [MPSlider](./slider) — a value on a continuous range rather than a score out of five.
- [Localisation](../../design/localization) — where the spoken names come from.
