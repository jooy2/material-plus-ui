---
title: Breakpoints
order: 4
---

# Breakpoints

<p class="mp-lede">Material Plus changes at Material's five <strong>window size classes</strong>, not at Tailwind's breakpoints. One ladder, read by the grid, the measures, the sidebar's collapse, <code>MPShow</code> and the hook — so a page cannot disagree with itself at one width.</p>

## The ladder

| Class         | From   | What it usually is               | MD3 columns |
| ------------- | ------ | -------------------------------- | ----------- |
| `compact`     | 0      | A phone, portrait                | 4           |
| `medium`      | 600dp  | A tablet, portrait               | 12          |
| `expanded`    | 840dp  | A tablet landscape, small laptop | 12          |
| `large`       | 1200dp | A desktop                        | 12          |
| `extra-large` | 1600dp | A wide desktop                   | 12          |

A class runs from its own floor up to the next one's, and the widest match wins. `compact` starts at zero because there is no window narrower than no window.

::: fw flutter

In Dart the classes are the values of `MPWindowClass`, with `MPWindowClass.extraLarge` for `extra-large`, and the floors are in logical pixels, which is what dp means. They are in `mpWindowClassMinimums` if you need the numbers themselves.

:::

::: fw react

## Why not Tailwind's

Tailwind changes at 640, 768, 1024, 1280 and 1536. Those are different numbers describing the same idea, and a page with both ladders on it is wrong in a way that is very hard to look at and see: an `MPGrid` reflowing at 600 while the `md:` utility beside it reflows at 768 is correct at every width except the band between them, where the two halves of one layout disagree.

Given two ladders, this library takes the one the specification defines. And it publishes it, so your own utilities can join it rather than compete with it:

```tsx
<div className="mp-medium:flex mp-below-expanded:hidden">
```

Eight variants are registered — `mp-medium`, `mp-expanded`, `mp-large`, `mp-extra-large`, and a `mp-below-*` for each. They work on both installation paths. There is no `mp-compact`: everything is at least that wide.

:::

## Where a class is named

::: fw react

| Where | Prop | Resolved by |
| --- | --- | --- |
| [`MPGrid`](../components/layout/grid) | `columns`, `spacing`, `rowSpacing`, `columnSpacing` | CSS |
| [`MPGridItem`](../components/layout/grid) | `span`, `offset` | CSS |
| [`MPContainer`](../components/layout/container), [`MPHeader`](../components/layout/header), [`MPFooter`](../components/layout/footer) | `maxWidth` | CSS |
| [`MPShow`](../components/layout/show) | `from`, `until`, `only` | CSS |
| [`MPPageLayout`](../components/layout/page-layout), [`MPSidebar`](../components/layout/sidebar) | `collapseBelow` | JavaScript |
| [`useMPWindowClass`](../guide/hooks#usempwindowclass) | — | JavaScript |

:::

::: fw flutter

There is no CSS column here. Every one of these is decided in Dart, from the window's width as `MediaQuery` reports it, against the same ladder:

| Where | Parameter |
| --- | --- |
| A responsive parameter, such as a grid item's `span` or a container's `maxWidth` | An `MPResponsive` |
| [`MPPageLayout`](../components/layout/page-layout), [`MPSidebar`](../components/layout/sidebar) | `collapseBelow` |
| A widget of your own | `MPConfigProvider.of(context).windowClassOf(width)` |

Each component's page says whether the Flutter package has it.

The class is read off the window and not off the box a widget was given, which is what a media query measures too: two grids side by side are in the same class however wide each one ended up. A widget that wants its own box measured is a `LayoutBuilder`'s job.

:::

## A value per class

::: fw react

Every responsive prop takes either a value or a map keyed by class. Each entry applies **from its own class upward**, so two entries usually describe a whole layout and anything unnamed keeps whatever the class below it said:

```tsx
<MPGridItem span={{ compact: 12, medium: 6, expanded: 4 }} />
<MPContainer maxWidth={{ compact: 'none', expanded: 'lg' }} />
```

Full width on a phone, half from 600dp, a third from 840dp.

Only the classes you name are written down — a `span` that names `expanded` alone is one custom property on the element and not five — and the stylesheet falls each class back to the one below it. That matters when the element is one of two hundred rows in a list.

:::

::: fw flutter

In Dart a value per class is an `MPResponsive`. TypeScript lets one prop take a bare value or a map, and Dart has no such union, so there are two constructors, one for each half of it:

```dart
const MPResponsive<int>(12, medium: 6, expanded: 4) // from the narrowest window up
const MPResponsive<int>.from(expanded: 4) // from 840dp up; below it, the parameter's own default
```

The first is full width on a phone, half from 600dp and a third from 840dp. Each entry applies **from its own class upward**, so two entries usually describe a whole layout, and anything unnamed keeps whatever the class below it said.

`MPResponsive.from` with no `compact` is what a React map with no `compact` key means: "from here up, this instead", and not "and nothing below".

:::

::: fw react

## CSS or the hook

Both answers are available and they are not interchangeable.

**CSS** — the responsive props above, `MPShow`, and the `mp-*` variants. A media query is resolved by the browser **before it paints anything**, including the markup a server sent, so the first frame is already right and a change of class costs no re-render. The cost is that both branches exist in the DOM.

**The hook** — [`useMPWindowClass`](../guide/hooks#usempwindowclass). Real JavaScript, so the branch not taken is not rendered at all. The cost is that it cannot answer until the page has hydrated: the first paint is a guess (`onServer`) and the correction is a second render.

```tsx
// Which arrangement is on screen → CSS.
<MPShow until="expanded">
  <MPBottomNavigation items={nav} />
</MPShow>;

// Whether to build something expensive at all → the hook.
const size = useMPWindowClass();
{
  size !== 'compact' && <RevenueChart />;
}
```

The rule of thumb: if the off-screen branch is cheap, prefer the answer that has no first render to be wrong.

:::

::: fw flutter

## In a widget of your own

Flutter has no stylesheet that answers before anything runs, so there is one way to ask, and it has no wrong first frame: the window's width is already known when the widget builds.

```dart
final MPWindowClass windowClass =
    MPConfigProvider.of(context).windowClassOf(MediaQuery.sizeOf(context).width);

if (windowClass == MPWindowClass.compact) {
  return MPBottomNavigation(/* … */);
}
```

`windowClassOf` reads the boundaries from the nearest `MPConfigProvider`, so a moved boundary moves this answer along with everything else. `MediaQuery.sizeOf` subscribes to the size alone, so the widget rebuilds when the window is resized and not when the keyboard's inset changes.

A value per class of your own resolves the same way:

```dart
const MPResponsive<int> columns = MPResponsive<int>(1, medium: 2, expanded: 3);

final int count = columns.resolve(windowClass, 1);
```

:::

## Moving them

::: fw react

The boundaries are a default, not a constant — but they live in two places that cannot read each other, and **both have to move together**.

A media query is resolved before any JavaScript runs and cannot name a custom property. So the widths exist once in the stylesheet, as registrations, and once in the library's JavaScript. A page that moves one and not the other is wrong across the band between the old boundary and the new one.

### The stylesheet

Only on the Tailwind path — a project that imports `material-plus-ui/tailwind.css` into its own build. Redeclare both halves after importing it; the later definition wins:

```css
@import 'tailwindcss';
@import 'material-plus-ui/tailwind.css';

@custom-variant mp-medium (@media (width >= 700px));
@custom-variant mp-below-medium (@media (width < 700px));
```

Both halves, because they are two registrations rather than one boundary a pair is derived from. This moves the grid, the measures, the visibility rules and your own `mp-medium:` utilities together.

A project on the compiled `material-plus-ui/styles.css` cannot do this: that file is Tailwind's output and the queries in it are already numbers.

### The JavaScript

```tsx
<MPConfigProvider breakpoints={{ medium: 700 }}>
```

Partial, merged over MD3's, in CSS pixels. `compact` is always nought whatever it is given.

This prop is **not** the source of the boundary — it is how you tell the JavaScript side what you already did in CSS. Setting it alone moves half the layout. [`MPConfigProvider`](../guide/config#moving-the-window-size-classes) has the detail.

:::

::: fw flutter

The boundaries are a default, and in Flutter they live in one place:

```dart
MPConfigProvider(
  breakpoints: const <MPWindowClass, double>{MPWindowClass.medium: 700},
  child: child,
)
```

Partial, merged over MD3's, in logical pixels. `compact` is always nought whatever it is given.

It moves everything under the provider: every responsive parameter, every `collapseBelow` and your own `windowClassOf`. There is no stylesheet compiled ahead of time for a boundary to be stuck in, so there is no second half to move. [`MPConfigProvider`](../guide/config#moving-the-window-size-classes) has the rest.

:::

## How the library keeps the two in step

::: fw react

Its own two copies are checked rather than trusted. `test/styles/breakpoints.test.tsx` reads the registrations out of `src/styles.css` and the numbers out of `src/internal/window-class.ts` and fails if they stop agreeing — and fails on a literal width written anywhere else in the stylesheet, so a fifth boundary cannot quietly appear.

:::

::: fw flutter

There is nothing to keep in step inside the Flutter package. It has one copy of the numbers, `mpWindowClassMinimums`, and every responsive decision in it reads them through `MPConfigProvider`, so a boundary written anywhere else would be a bug rather than a second copy.

:::

## Next

- [`MPGrid`](../components/layout/grid) — the layout grid, and the arithmetic behind a column.
- [`MPShow`](../components/layout/show) — showing at some widths and not others.
- [`useMPWindowClass`](../guide/hooks#usempwindowclass) — the same question in JavaScript.
- [`MPConfigProvider`](../guide/config) — where an application sets its defaults.
