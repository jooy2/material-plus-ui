---
title: Components
order: 3
aside: false
---

# All components

<p class="mp-lede">Everything released so far. The preview inside each card is not a picture — it is the component, running.</p>

::: fw flutter

The gallery below is the **React** build. It is one page of well over a hundred live previews, and each Flutter preview is a whole engine, so the Flutter half of every component is on its own page instead.

The list is the same in both packages apart from three components that solve problems only the DOM has. They are React-only, and Flutter already has the answer to each:

| React-only                                      | In Flutter                    |
| ----------------------------------------------- | ----------------------------- |
| [`MPFlex`](./layout/flex)                       | `Row`, `Column` and `Wrap`    |
| [`MPPortal`](./layout/portal)                   | `Overlay` and `OverlayPortal` |
| [`MPVisuallyHidden`](./display/visually-hidden) | `Semantics`                   |

Each component's page says which packages it covers.

:::

<Demo src="gallery/all" plain />

## Next

- The same components laid out as whole screens are in [Examples](../examples/overview).
- What the shared props mean is in [Prop conventions](../design/prop-conventions).
- The colour roles, and how to change them, are in [Colour](../design/color).
- Where the layout changes with the window is in [Breakpoints](../design/breakpoints).
- Install and setup is in [Getting started](../guide/getting-started).
