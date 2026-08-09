---
title: MPSwitch
order: 6
---

# MPSwitch

<p class="mp-lede">An on and off that takes effect the moment it moves. Material's 52×32 track holding a 16dp thumb that grows to 24dp once it is on — the growth is what makes the state survive being read at a glance, in greyscale, from the far side of a settings page.</p>

<Demo src="switch/hero" :minHeight="64" />

```tsx
import { MPSwitch } from 'material-plus-ui';

const [on, setOn] = useState(false);

<MPSwitch label="Wi-Fi" checked={on} onCheckedChange={setOn} />;
```

## Props

<PropsTable name="MPSwitch" />

## Switch or checkbox?

The difference is not visual, it is temporal.

A **checkbox** is a value that gets submitted with a form. A **switch** takes effect the moment it moves. If there is a Save button underneath, it should have been a checkbox — and a screen reader is told which one it is, because a switch carries `role="switch"` rather than `role="checkbox"`.

## Examples

### labelPlacement

`end` reads as a caption for the control. `start` is for a settings list, where the labels form a column and every track lines up on the right.

<Demo src="switch/settings" :minHeight="240">

<<< @/.vitepress/demos/switch/settings.tsx

</Demo>

`fullWidth` is what makes that work: it stretches the row so a `start` label takes the slack and the track sits against the far edge. Without it each track would sit against its own text and the column would not line up.

### icons

Draws a tick in the thumb when it is on and a cross when it is off.

Off by default, and worth turning on wherever the two states are not obviously different in context: the thumb's position and the track's colour are otherwise the only signals, and one of those is a hue.

### errorMessage

A message under the label, which also turns the switch over — the track's edge, the thumb and the message together. `description` is the same slot and is replaced by it.

## The edge is a ring, not a border

Worth knowing if you are styling around it.

An unselected track carries a 2dp outline and a selected one does not. A `border` that comes and goes would change the box the thumb is positioned inside, so the thumb would jump two pixels at the exact moment it is already moving. An inset ring is drawn as a shadow: it appears and disappears without ever being part of the layout.

This is also the only component in the library that reads the spec's `standard` easing token — quick to leave, slow to arrive — because it is the only thing here that actually travels.

## Accessibility

- `role="switch"` with `aria-checked`, which is what tells an assistive technology that this takes effect now.
- The label is wired to the control by `id`; clicking the words flips it.
- `readOnly` shows the state without allowing a change and stays focusable; `disabled` does neither.

## See also

- [MPCheckbox](./checkbox) — when the value is submitted rather than applied.
- [Base UI Switch](https://base-ui.com/react/components/switch) — the behaviour underneath.
