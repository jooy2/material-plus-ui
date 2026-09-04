---
title: Prop conventions
order: 2
---

# Prop conventions

`size="md"` has to mean the same thing on a text field, a button and a dialog. The shared vocabulary lives in [`src/types.ts`](https://github.com/jooy2/material-plus/blob/main/src/types.ts), and each component takes only the axes it needs.

Two rules govern everything below.

1. **Where the specification has a word, use the specification's word.** A colour role is `primary` or `on-surface-variant`, a corner is `extra-small`, a type role is `body-large`. They are not `main`/`light`/`dark`/`contrastText` — that is Material UI's palette model, a different and earlier colour system, and borrowing its names would describe something this library does not implement.
2. **Do not invent a second spelling for an idea that already has one.** If a component needs an axis another component already has, it takes that one.

## The shared types

```ts
type MPSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type MPColor = 'primary' | 'secondary' | 'tertiary' | 'error';
type MPVariant = 'filled' | 'tonal' | 'elevated' | 'outlined' | 'text';
type MPDensity = 0 | -1 | -2 | -3;
type MPElevation = 0 | 1 | 2 | 3 | 4 | 5;
type MPTransition = MPAnimation | MPTransitionOptions;
type MPOrientation = 'horizontal' | 'vertical';

interface MPStyleProps {
  size?: MPSize; // default 'md'
  fullWidth?: boolean;
}

interface MPControlEventProps<Element> {
  onKeyDown?;
  onKeyUp?; // the keyboard, combinations included
  onFocus?;
  onBlur?; // the focus, on the control itself
  onClick?;
  onDoubleClick?;
  onContextMenu?; // the pointer
}
```

A component extends the bundle and adds only what is genuinely its own:

```ts
export interface MPTextFieldProps extends MPStyleProps {
  value: string;
  // …the props only a text field has
}
```

`MPStyleProps` is deliberately short. An axis joins it when a **second** component needs it, not in anticipation of one — the same rule the design tokens follow.

`variant`, `color` and `density` are shared _vocabulary_ rather than members of the bundle: a component that has meaningful variants takes `variant`, one that reads an accent family takes `color`, and one that holds other things takes `density` — but none of the three is on every component, and none of them would mean anything on `MPTextField`. `elevation` is the same kind of vocabulary and reaches the sheets that can be raised.

## `variant`

Material's five button styles, in the order they get quieter: `filled`, `tonal`, `elevated`, `outlined`, `text`.

The vocabulary is shared with components that are not buttons on purpose — a `filled` segmented button and a `filled` button are the same statement about emphasis, made by two different controls. `elevated` is the odd one out and stays separate from `filled` because MD3 keeps it separate: it is a _neutral_ surface that also casts a shadow, which is a different way of solving the same problem. A component with no meaningful raised state simply does not offer it.

## `size`

This is the one place the library knowingly goes beyond the specification.

Material defines a **single size** per component — a text field is 56dp, full stop — because it describes a design system for whole products, where one height per control is the point. A component library gets used in places a design system does not plan for: a filter bar, a table's inline editor, a dense settings page, a marketing hero. Those need a ladder, and a consumer who cannot get one from the library builds it out of `!important`.

So the rule is: **`md` is the specification's size, and the other four are ours.**

| `size`   | Height   | Input type role  |
| -------- | -------- | ---------------- |
| `xs`     | 32px     | `body-medium`    |
| `sm`     | 40px     | `body-medium`    |
| **`md`** | **56px** | **`body-large`** |
| `lg`     | 64px     | `body-large`     |
| `xl`     | 72px     | `body-large`     |

<Demo src="text-field/sizes">

<<< @/.vitepress/demos/text-field/sizes.tsx

</Demo>

Three things follow from that table, and they are the constraints on adding a component to the ladder.

- **The ladder is centred, not extended upward.** `md` is what you get by saying nothing, so nobody has to know the scale exists to be handed the Material size.
- **A smaller control moves down the Material type scale**, rather than to some interpolated size of the library's own. `body-medium` is the specification's 14px role; it is not `body-large` scaled by 0.875.
- **The height is the type scale plus padding, never a `height`.** A fixed height would stop a multiline field growing past its own size.

`xs` and `xl` are at the edges of usable rather than merely smaller and larger — below `xs` a control stops being a comfortable pointer target — and there is no sixth step, because a ladder long enough to need one is a sign the caller wants a custom control instead.

### The one exception: `MPIcon`

`MPIcon` takes `size` as a **length** — a number of pixels or any CSS length — not a rung of the ladder. It is the only component that does, and it does not extend `MPStyleProps`.

An icon is not a control. It has no height of its own to pick from a scale: it is sized to the text beside it or the box it is laid into, which is why `size="1em"` is the single most useful value it takes and why no ladder could express it. Every icon set in the world calls this axis `size` too, so renaming it here would cost more than the collision does.

The rule that survives is the one that matters: **within the size ladder, a rung means the same thing everywhere.** A component that is not on the ladder says so by not extending the bundle.

## `density`

Material's own scale and Material's own numbers: `0` is the component at the size it was asked for, and each step below it takes 4dp out.

It is not a second size ladder. `size` picks which control this is — the height, the type role, the padding that follows from both — and `density` takes room out of the one that was picked, out of the **spacing only**. The type scale does not move, so a table at `-2` is the same words in less room rather than smaller words. That is what a reader of a dense screen actually wants: more rows, at the size they could already read.

The two axes cannot be collapsed into one for the same reason. `size="sm"` on a list is a small list; `density={-2}` on a list is a normal list with more of it on the screen. One ladder would make those the same request.

```tsx
<MPList density={-1}>       // 52px rows instead of 56
<MPTable size="sm" density={-2} />
```

Every step lands on a height the ladder already has a name for, which is what keeps a dense list lined up with the controls beside it: `md` walks 56, 52, 48, 44, and 48 is exactly what `lg` at `-2` gives.

**A step that would take a control under 24px is not taken.** That floor is the one `size` already names — below it a control stops meeting a touch target — so `xs` runs out after two steps and stays there. Clamping is the better of the three answers available: refusing the value would make `density={-3}` an error on exactly the rung most likely to be given it, and honouring it would ship a control nobody can hit.

**Only containers take it.** A button is one control at one height and has `size` for that. A list, a table, a card, a toolbar — anything whose job is to hold a number of things — changes character with how many of them fit on a screen, and that is the question this answers. Set it once on [MPConfigProvider](../guide/config) and the containers under it tighten while the controls keep the height a finger needs.

## `elevation`

MD3's own levels, and all five of the raised ones: `1` is where an elevated card rests, `2` is a menu, `3` is a dialog, and `4` and `5` are there because the specification defines them and a ladder with holes in it is worse than no ladder.

**It moves the tone as well as the shadow**, and that is the only shape this prop can take here. Material does not treat height as a free axis: an elevated surface is `surface-container-low` _under_ a level-1 shadow, and the tone and the shadow are one decision rather than two. A prop that only cast a shadow would raise a `filled` box into a surface the specification has no name for — a lifted object that is somehow still the flattest tone in the system.

| `elevation` | Surface role                | Shadow  |
| ----------- | --------------------------- | ------- |
| `0`         | `surface`                   | none    |
| `1`         | `surface-container-low`     | level 1 |
| `2`         | `surface-container`         | level 2 |
| `3`         | `surface-container-high`    | level 3 |
| `4`         | `surface-container-high`    | level 4 |
| `5`         | `surface-container-highest` | level 5 |

Four and five share a tone on purpose. The specification runs out of container roles before it runs out of levels, and inventing a sixth tone to keep the columns tidy would be inventing a colour role.

`variant="elevated"` **is** `elevation={1}`, named. The variant stays because the vocabulary is about emphasis — a caller choosing between `filled` and `elevated` is choosing how loud a card is, not how many pixels it floats — and because it is the answer nearly every raised surface wants.

Given a level, the level decides the surface and `variant` is left holding only its hairline: an `outlined` sheet keeps its border and nothing else paints. Anything else would be two props writing one `background-color`, and the winner would depend on the order two class names happened to be generated in.

```tsx
<MPBox elevation={2}>          // surface-container, level 2
<MPBox variant="outlined" elevation={3} />  // the hairline, raised
```

A bar reads the same levels from one rung higher: `MPHeader`, `MPFooter` and `MPSidebar` rest at `2` on `variant="elevated"`, because a bar sits over the page's content rather than in it. An explicit level says exactly what it says.

## `color`

Four roles, which is Material's accent set: `primary`, `secondary`, `tertiary`, `error`.

Not Material UI's six. The specification's colour system has no `info`, `success` or `warning`, and offering them would promise roles [the token sheet](./color) has no way to derive.

Arbitrary colour values are not accepted as a prop. To change what a role _is_, set the token — that way one change reaches every component at once instead of every call site.

## Motion

Three ways to move something, and they are three because they answer three different questions.

**A token.** Every duration and every curve in this library is a custom property — `--mp-sys-motion-duration-short4`, `--mp-sys-motion-easing-emphasized`. A component's own transitions read those, so a page that wants everything a little slower sets one value and does not touch a component. `MPEasing` is the curve half said as a prop: it takes the specification's names and no arbitrary `cubic-bezier()`, for the reason `color` takes a family rather than a colour. A curve written into one component's props is a curve the theme cannot reach.

**A `transition` prop.** An entrance, run once as the component mounts, on the components that _display_ something:

```tsx
<MPCard transition="fade" />
<MPChip transition={{ effect: 'slide', from: 'left', duration: 300 }} />
```

It has no `trigger`, no `repeat` and no scroll timeline, and the absence is the design rather than an omission — those are the next paragraph, and a prop offering half of them would be a second, worse spelling of machinery that already exists.

**An `MPAnimate*` component.** The general answer: a wrapper round anything, with a trigger, a stagger, a scroll timeline, and control over when it plays. Reach for it the moment the answer to "when?" is anything but "as it appears".

The prop exists alongside the wrapper because wrapping is the wrong shape twice. A component that lays its children into boxes of its own — `MPStack` — puts them somewhere nothing outside can reach. And wrapping every card of a grid costs a second element per card, which a `display: contents` wrapper cannot avoid: an element that generates no box has nothing to animate.

**It costs about 1.2 kB gzipped on any component that takes it**, whether or not a caller ever passes one, because the effect tables are object literals and a bundler cannot tree-shake a key. That is why the prop is on the eight components that display something and on none of the controls — and it is written here rather than left to be found on a bundle report.

**`prefers-reduced-motion` is honoured throughout**, by the components and by the stylesheet. Nothing here needs a prop for it.

## Naming

- **Icon slots are `startIcon` / `endIcon`.** `leftIcon` and `rightIcon` invert their meaning under RTL.
- **Booleans are positive.** `disabled` yes, `notDisabled` no.
- **Filling the container is `fullWidth`.**
- **Event handlers keep their native names** and are passed straight through — except where the native event cannot be trusted, which so far is exactly one case: `MPTextField`'s `onChange` hands over a string, because mid-composition an event's `target.value` is the provisional text that must not be read.
- **A named callback reports what the component is _for_.** `onValueChange` is the choice, `onSubmit` is the plain Enter. The raw event underneath it is a separate prop — see [Raw events](#raw-events).

## State props

| Prop | Meaning |
| --- | --- |
| `disabled` | Unavailable. Uses the native `disabled` attribute, and the Material disabled treatment: content at 38%, an outline at 12% |
| `readOnly` | It exists, but not here. Stays selectable and **stays in the tab order** |

`readOnly` deliberately does not use native `disabled`: dropping out of the focus order costs keyboard users their sense of the page, and a value someone may need to copy has to be reachable.

## Where state lives in the DOM

State is published as `data-*` attributes rather than kept in JavaScript, which is what lets it be styled with no runtime at all. Those attributes come from Base UI, so they are the same on every component:

| Attribute                     | Present when                          |
| ----------------------------- | ------------------------------------- |
| `data-focused`                | The control has focus                 |
| `data-invalid` / `data-valid` | The field's validity                  |
| `data-disabled`               | The field is disabled                 |
| `data-filled`                 | The field has a value                 |
| `data-touched` / `data-dirty` | It has been interacted with / changed |

The library also publishes `data-mp-size` on a component's root, so a consumer can style against the rung in use.

```html
<!-- Tailwind, if you have it -->
<div class="group-data-invalid:border-mp-error">…</div>
```

Every component also takes a `className` and a `style`, and each one's props table names the element they land on. What they can and cannot take over is in [Class names and styles](../guide/getting-started#class-names-and-styles).

## Raw events

Most components take every DOM prop already: their props extend `React.ComponentPropsWithoutRef` and spread the rest onto an element they own, so `onKeyDown` on an `MPButton` is the `<button>`'s own.

The controls that draw a box, a label, an input and a supporting line cannot do that — there are four elements a handler could land on, and spreading would pick the wrong one. Those take `MPControlEventProps` instead, and there are two things to know about it.

**They go on the control, not on the box.** Which is the opposite of where `className` goes, and for the reason that makes them different questions: a class describes the whole thing, and an event came from one element. On an `MPTextField` that means `onKeyDown` is a keystroke that landed in the field and never one that landed on the reveal toggle beside it, and `onFocus` is the input taking focus rather than anything in the row taking it. Each props table names the element.

**Yours runs first**, and a control with its own answer for a key checks `defaultPrevented` before giving it:

```tsx
<MPTextField
  value={draft}
  onChange={setDraft}
  onSubmit={send} // plain Enter
  onKeyDown={(event) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault(); // ⌘Enter is yours; onSubmit does not also fire
      sendAndClose();
    }
  }}
/>
```

A `<div onKeyDown>` wrapped around the control gets the keystroke by bubbling, and that is what a caller had to write before. What it cannot do is go first.

The components that take these are `MPTextField`, `MPNumberField`, `MPSelect`, `MPCombobox`, the four pickers — `MPDatePicker`, `MPDateRangePicker`, `MPDateTimePicker`, `MPTimePicker`, which share one trigger — and `MPDialog`.

`MPDialog` is the one that is not a control, and it follows the same rule for the same reason: its props are a closed set rather than a spread, so there was no element a caller could reach at all. The handlers land on the **sheet**, which is where a keystroke inside the dialog arrives by bubbling — the trigger that opened it and the page behind it are both somewhere else. Base UI's own handling of the keys it owns, Escape included, runs alongside rather than being replaced.

The rest either take every DOM prop already or have no single element these would belong to: an `MPOtpField` is six inputs, and a `blur` that fired between two of its boxes would be reporting something that did not happen.

## Checklist for a new component

1. `src/components/{lowercase-name}/` with `{PascalCase}.tsx` and an `index.ts` barrel
2. Named exports only, never `export default`
3. Re-export the barrel from `src/index.ts`
4. Delegate behaviour and accessibility to a Base UI primitive
5. Take the axes you need from `MPStyleProps`; define only what genuinely has no name yet
6. Read the colour, type, shape and motion it needs from the tokens — and **add a token only if the component reads it**
7. `test/components/{name}/{Name}.test.tsx`, in the same commit
8. `docs/{locale}/components/{group}/{name}.md`, one page per locale
9. Its rows in `docs/.vitepress/data/props.ts` and its demos in `docs/.vitepress/demos/{name}/`
10. A card in `demos/gallery/all.tsx` so it appears on [All components](../components/)
11. `npm run typecheck && npm test && npm run lint` all pass

## Next

- [Colour](./color) — the roles, and how to change them.
- [All components](../components/) — every component, running.
