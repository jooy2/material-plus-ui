---
title: MPIcon
order: 1
---

# MPIcon

<p class="mp-lede">A wrapper that gives an icon glyph a size and a colour. Material Plus draws no icons of its own, so the glyph comes from whichever set you chose — <code>lucide-react</code> ships with the React package, and anything else works just as well.</p>

<Demo src="icon/hero" />

::: fw react

```tsx
import { MPIcon, ICONS } from 'material-plus-ui';

<MPIcon icon={ICONS.success} size={24} color="green" label="Deployed" />;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

const MPIcon(icon: SuccessGlyph(), size: 24, color: Color(0xFF2E7D32), label: 'Deployed');
```

:::

## Props

<PropsTable name="MPIcon" />

::: fw react

Every native `<span>` attribute passes through, and a `ref` reaches the box.

:::

## The glyph is a prop, not children

::: fw react

```tsx
<MPIcon icon={ICONS.search} />       // ✅
<MPIcon>{<SearchIcon />}</MPIcon>    // ✗ — there is no children prop
```

:::

::: fw flutter

```dart
MPIcon(icon: mySet.search)           // an IconData
const MPIcon(icon: SearchGlyph())    // a widget
```

:::

The reason is that the two things you always want to decide about an icon — how big it is and what colour it is — are the two things you cannot reach once it is a child of something. As a prop it is content `MPIcon` _sizes_, not content it merely wraps.

## Examples

### icon

Two forms are accepted, because icon sets hand back two different things.

<Demo src="icon/custom">

::: fw react

<<< @/.vitepress/demos/icon/custom.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/icon/custom.dart

:::

</Demo>

::: fw react

**A component** is what `lucide-react`, `react-icons` and most sets export, and it is the form that lets `MPIcon` pass the size and the colour _into_ the glyph rather than trying to style an element from the outside.

```tsx
<MPIcon icon={ICONS.close} size={20} />
```

**An element** is a drawing of your own, a glyph already constructed by some other set, or an `<img>`. It is scaled by the box it is laid into.

```tsx
<MPIcon icon={<svg viewBox="0 0 24 24">…</svg>} size={20} />
<MPIcon icon={<DeleteIcon />} size={20} />
```

The distinction is made with `React.isValidElement` and nothing else, which is why a `forwardRef` object — what every modern icon set actually exports — is correctly treated as a component rather than as something already drawn.

:::

::: fw flutter

**An `IconData`** is what an icon font hands back, and it is drawn as an `Icon` at the size and in the colour `MPIcon` was given.

```dart
MPIcon(icon: mySet.close, size: 20)
```

**A widget** is a drawing of your own, an SVG from a package, or a glyph another set built. It is told its size and colour three ways at once — through `IconTheme`, through `DefaultTextStyle`, and by the box it is laid into — so a drawing that reads `IconTheme.of(context)`, a widget that fills its box and a bare character all come out the same size.

```dart
const MPIcon(icon: SpiralGlyph(), size: 20)
MPIcon(icon: SvgPicture.asset('assets/delete.svg'), size: 20)
```

`icon` is typed `Object`, because Dart has no union type. Anything other than an `IconData` or a `Widget` fails an assertion in debug.

:::

### size

::: fw react

A number is CSS pixels; a string is any CSS length, so `size="1em"` tracks the surrounding text.

:::

::: fw flutter

A number of logical pixels. To track the surrounding text, read its size: `size: DefaultTextStyle.of(context).style.fontSize`.

:::

<Demo src="icon/sizes">

::: fw react

<<< @/.vitepress/demos/icon/sizes.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/icon/sizes.dart

:::

</Demo>

There is no size ladder — no `sm`/`md`/`lg`. Icon sets are drawn on a pixel grid at specific sizes, and a wrapper inventing five steps of its own would be a second opinion about a decision the set already made. Left unset, the glyph draws at whatever size it was authored at.

::: fw react

The length is written to the box **and** to its `font-size`, which is what makes an `<svg>` carrying its own `width` and an `<svg>` sized in `em` come out the same.

:::

::: fw flutter

Left unset in Flutter, "the size it was authored at" is the surrounding `IconTheme`'s size, which is 24 with nothing around it and the right size already inside a button.

:::

### color

Any colour: a CSS colour in React, a `Color` in Flutter. Left unset the icon inherits the colour of whatever it sits in, which is right far more often than a colour of its own — an icon in a button label, a muted caption or an `Alert` should be that element's colour.

<Demo src="icon/colors">

::: fw react

<<< @/.vitepress/demos/icon/colors.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/icon/colors.dart

:::

</Demo>

::: fw react

The glyph is told `currentColor` even when no colour is given, so a set whose own default is a fixed colour still follows the text it sits in.

:::

### label

Without `label` the icon leaves the accessibility tree. That is the default because most icons sit beside text that already says the same thing, and reading both aloud is worse than reading one.

::: fw react

```tsx
// The text next to it already says "Delete".
<Button startIcon={<MPIcon icon={ICONS.close} />}>Delete</Button>

// There is nothing but the glyph, so it needs a name.
<MPIcon icon={ICONS.close} label="Dismiss" />
```

With a `label` the box becomes `role="img"` with that name.

:::

::: fw flutter

```dart
// The text next to it already says "Delete".
MPButton(onPressed: delete, startIcon: const MPIcon(icon: CloseGlyph()), child: const Text('Delete'))

// There is nothing but the glyph, so it needs a name.
const MPIcon(icon: CloseGlyph(), label: 'Dismiss')
```

With a `label` the icon is an image node with that name; without one it is wrapped in `ExcludeSemantics`. An icon that is the whole of a button belongs inside the button: give the button its `semanticLabel` and leave the icon unnamed.

:::

:::: fw react

## Space around the icon goes on the box

The glyph fills the box `MPIcon` draws, so a margin belongs on that box rather than on the artwork inside it. Every box the component renders carries `.mp-icon`, which is what the class is there for.

```css
.toolbar .mp-icon {
  margin-inline-end: 5px;
} /* the box */

.toolbar svg {
  margin-inline-end: 5px;
} /* the artwork */
```

The second rule is what a migration off Material UI leaves behind, where the `SvgIcon` _was_ the element to put a margin on. Here it lands on a flex item that already fills the box, so the margin has nowhere to go: it overflows, visibly. That is deliberate — it used to be taken out of the glyph instead, which drew a `size={16}` icon at 11×16 and merely looked a size too small.

## The bundled icon set

`lucide-react` is a dependency of this package, and every glyph the library's own components draw is named in one file — `src/constants/icons.ts`. There are two ways to reach it.

```tsx
import { ICONS, SearchIcon } from 'material-plus-ui';

<MPIcon icon={ICONS.search} />     // by role name
<MPIcon icon={SearchIcon} />       // as a named import
```

The keys are the roles the components ask for (`visibility`), not the drawings lucide happens to ship (`Eye`). A component asks for the idea, so the drawing behind it can be swapped without touching a component.

::: tip Which one to use

`ICONS` is an object literal, so a bundler cannot tree-shake it property by property — importing it pulls in every glyph in the table. Reach for the named imports when you only need one or two, and for `ICONS` when you want a name-keyed registry.

:::

You are not limited to this set. `MPIcon` takes anything shaped like an icon component, so `react-icons`, `@material-symbols`, another Material icon package or your own SVGs all work without a wrapper.

::::

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| a component or an element in `icon` | an `IconData` or a widget | Those are the two shapes an icon takes in Flutter: a glyph in an icon font, or a widget. |
| `size` as a CSS length | `double?` | There are no CSS lengths. Read the text's own size when the icon should track it. |
| `color` as a CSS colour | `Color?` | A `Color`, and `null` inherits through `IconTheme`. |
| `strokeWidth` | — | A widget draws itself and takes no stroke from outside. A variable icon font's weight is `IconThemeData.weight`. |
| `center` | — | Wrap the icon in a `Center` or an `Align`; a grid track is the parent's to place things in. |
| `ICONS` and the named glyph exports | — | No icon set ships with the Flutter package: Flutter has none outside Material, which this package does not import. The glyphs in these previews are drawn by the gallery, which is what an app does with the set it chose. |
| `className`, `style`, `ref`, attributes | — | There is no class list, style attribute or element to pass through. |

:::
