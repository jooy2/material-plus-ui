---
title: App-wide defaults
order: 3
---

# App-wide defaults

<p class="mp-lede">A design that runs at <code>size="sm"</code> should be one decision, not one per call site. <code>MPConfigProvider</code> is where that decision goes.</p>

<Demo src="config/hero" :minHeight="380" />

```tsx
import { MPConfigProvider } from 'material-plus-ui';

<MPConfigProvider size="sm" color="tertiary" locale="ko">
  <App />
</MPConfigProvider>;
```

## Props

<PropsTable name="MPConfigProvider" />

## The order of specificity

Three places can answer, and the nearest one wins:

```
the prop at the call site  →  a group around it  →  MPConfigProvider  →  Material's own
```

A `size` written on a button beats everything. An [`MPButtonGroup`](../components/inputs/button-group.md) or [`MPAvatarGroup`](../components/display/avatar-group.md) around it is a statement about _those_ controls and beats the provider, which is a statement about the page. And what Material says — `md`, `primary` — is what is left when nobody says anything at all.

```tsx
<MPConfigProvider size="xl">
  <MPButtonGroup size="sm">
    <MPButton>One</MPButton> {/* sm — the group is nearer */}
  </MPButtonGroup>
  <MPButton size="lg">Two</MPButton> {/* lg — the call site wins */}
  <MPButton>Three</MPButton> {/* xl — the provider */}
</MPConfigProvider>
```

## Why these two and not a theme

Everything a theme normally holds is already a **CSS custom property** here — the colour roles, the type scale, the corners, the motion durations. Those reach a component through the cascade, which means a section of a page can differ from the rest without a provider at all and without a re-render. A JavaScript theme object would be a second place the same values live, and the two would drift. See [Colour](../design/color.md) for how the token side works.

`size` is the one thing that cannot travel that way. It resolves to **literal Tailwind class strings** — `h-14`, `text-mp-body-large` — because Tailwind finds classes by scanning source text, and an interpolated `h-${n}` generates no rule at all. A value that cannot be a custom property and still has to reach every call site is exactly what context is for.

`color` joins it because the two are the axes a whole product is usually set on together, and because a `color` prop is a _role name_ rather than a colour: changing what `primary` **is** stays a token, and this only changes which of the four roles a control reads.

## Why `variant` is not here

Because there is no such thing as _the_ default variant.

| Component     | Its default |
| ------------- | ----------- |
| `MPButton`    | `filled`    |
| `MPChip`      | `outlined`  |
| `MPAlert`     | `tonal`     |
| `MPAccordion` | `outlined`  |
| `MPBadge`     | `filled`    |

Five answers to five different questions about emphasis. One global value would overwrite all five with an arbitrary one, and the component that looked wrong afterwards would give no clue why.

## What it deliberately does not reach

**A component that had chosen its own default keeps it.** The rule is that the provider supplies _the library's_ default, not _a component's_ answer:

| Component | Keeps | Because |
| --- | --- | --- |
| `MPBadge` | `color="error"` | A badge is usually a count of something wanting attention |
| `MPTooltip` | `size="sm"` | A tooltip at a control's height is a slab |
| `MPDialog`, `MPPill`, `MPShortcut` | `color="secondary"` | They are furniture rather than the action |

Set the prop to move any of them.

A component whose prop has **no** default is also left alone — `MPSkeleton`'s `color` is unset on purpose, meaning "neutral", and an app-wide accent does not fill it in.

## Nesting

Providers nest and **merge**, nearest wins per field. A section that only changes the accent keeps the size from above:

```tsx
<MPConfigProvider size="sm">
  <App />
  <MPConfigProvider color="error">
    <DangerZone /> {/* size="sm" still, color="error" now */}
  </MPConfigProvider>
</MPConfigProvider>
```

## The locale comes with it

`MPConfigProvider` carries `locale` too, so an application needs one provider rather than two:

```tsx
<MPConfigProvider size="sm" locale="ko">
  <App />
</MPConfigProvider>
```

[`MPLocaleProvider`](../design/localization.md#2-mplocaleprovider) still exists and still works — it is the narrow one, for a subtree that only changes language. A `MPConfigProvider` with no `locale` inherits whatever is above it rather than resetting to the platform default.

## Reading it back

```tsx
import { useMPConfig } from 'material-plus-ui';

const { size, color } = useMPConfig();
```

For a wrapper component of your own around one of these, so it resolves a prop the way the component underneath will. The fields are **optional**, and `undefined` means _nobody set one_ rather than `md` or `primary` — the library's own defaults are applied by the components, not stored here, so a future change of default is one place.

## Sharp edges

- **It is not `defaultProps`.** There is no per-component override map, and adding one would mean a second, name-keyed way to say the same thing. Two props cover the case that comes up; anything narrower is a wrapper component of your own.
- **It re-renders what is under it.** The value is memoised on the fields rather than the object, so a parent re-rendering with the same configuration costs nothing — but _changing_ `size` at runtime does re-render every consumer, which is what the demo above is doing. That is a settings screen's job, not a scroll handler's.

## Next

- [Prop conventions](../design/prop-conventions.md) — what `size` and `color` mean.
- [Colour](../design/color.md) — the token side, which is the other half of theming.
- [Hooks](./hooks.md) — the rest of what the library exports without a component.
