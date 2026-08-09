---
title: MPCheckbox
order: 4
---

# MPCheckbox

<p class="mp-lede">A single yes or no. The box is `on-surface-variant` at rest and fills with the accent family when it is ticked, with Material's 40dp state layer around an 18dp box — the box is what you see and the halo is what you hit.</p>

<Demo src="checkbox/hero" :minHeight="64" />

```tsx
import { MPCheckbox } from 'material-plus-ui';

const [agreed, setAgreed] = useState(false);

<MPCheckbox label="I accept the terms" checked={agreed} onCheckedChange={setAgreed} />;
```

## Props

<PropsTable name="MPCheckbox" />

## Examples

### indeterminate

Neither ticked nor empty — what a parent box shows when some of its children are ticked.

<Demo src="checkbox/parent" :minHeight="180">

<<< @/.vitepress/demos/checkbox/parent.tsx

</Demo>

It is a **display** state rather than a value: clicking a half-ticked box ticks it. A parent that toggled back to half-ticked would be handing the reader a click that lands where it started.

### errorMessage

There is no separate `error` boolean, the same bargain [MPTextField](./text-field) makes: a message is what turns the checkbox over, so there is no way to render one that is visibly wrong with no explanation.

<Demo src="checkbox/states" :minHeight="200">

<<< @/.vitepress/demos/checkbox/states.tsx

</Demo>

Invalid re-points the whole accent family at `error`, so the box, its halo and the message turn over together rather than the message being the only clue.

`description` is the same slot as `errorMessage` and is replaced by it. Material gives supporting text one line.

### readOnly

Shows the state without allowing a change, and unlike `disabled` the box stays in the tab order — which is what a value the reader still has to be able to find needs. See [Prop conventions](../../design/prop-conventions#state-props).

### size and color

Five rungs, and the halo grows with the box rather than staying at 40dp: what the ladder keeps is the _relationship_ between the two, which is what makes an `xs` checkbox still hittable.

`color` picks the accent family the ticked box is filled with. It is overridden while the checkbox is invalid, because an error that kept the brand colour would not read as an error.

## There is no `children`

`label`, `description` and `errorMessage` are props, and anything a checkbox has to say belongs in one of the three. The arrangement is fixed — tick, label, supporting line — and what a caller actually wants to decide is what goes in each slot.

## Accessibility

- What you see and press is a span with `role="checkbox"`, named by the label through `aria-labelledby`; the label's own `for` points at the hidden input that carries the value into a form. That is what makes clicking the words tick the box.
- `indeterminate` is announced as `aria-checked="mixed"`.
- The halo is bigger than the box on purpose. 18dp is far below any usable pointer target.

## See also

- [MPRadioGroup](./radio-group) — when exactly one of a set may be chosen.
- [MPSwitch](./switch) — when the change takes effect immediately rather than on save.
- [Base UI Checkbox](https://base-ui.com/react/components/checkbox) — the behaviour underneath.
