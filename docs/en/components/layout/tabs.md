---
title: MPTabs
order: 12
---

# MPTabs

<p class="mp-lede">One set of panels, one of which is shown. Material's two kinds of tab are here as <code>variant</code> — <code>primary</code> for the top level of a screen and <code>secondary</code> for a division inside one of its panels — with the specification's indicator, heights and type roles for each.</p>

<Demo src="tabs/hero" :minHeight="200" />

::: fw react

```tsx
import { MPTab, MPTabPanel, MPTabs } from 'material-plus-ui';

<MPTabs aria-label="Trip" defaultValue="flights">
  <MPTab value="flights">Flights</MPTab>
  <MPTab value="stays">Stays</MPTab>

  <MPTabPanel value="flights">…</MPTabPanel>
  <MPTabPanel value="stays">…</MPTabPanel>
</MPTabs>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPTabs<String>(
  semanticLabel: 'Trip',
  initialValue: 'flights',
  children: const <Widget>[
    MPTab<String>(value: 'flights', child: Text('Flights')),
    MPTab<String>(value: 'stays', child: Text('Stays')),
    MPTabPanel<String>(value: 'flights', child: FlightsPanel()),
    MPTabPanel<String>(value: 'stays', child: StaysPanel()),
  ],
);
```

:::

Tabs and panels go in as one list of children and are sorted into the bar and the body for you. There is no `<MPTabList>` to remember: a wrapper whose only job is to say what the elements already say is one more thing to get wrong.

::: fw flutter

Every child is an `MPTab` or an `MPTabPanel` of the same value type, and the bar runs in the order the tabs are written. Anything else is an assertion in debug: a widget that is neither has no place in the bar and none in the body.

:::

## Props

<PropsTable name="MPTabs" />

### MPTab

<PropsTable name="MPTab" />

### MPTabPanel

<PropsTable name="MPTabPanel" />

## primary and secondary are depths, not weights

<Demo src="tabs/variants" :minHeight="260">

::: fw react

<<< @/.vitepress/demos/tabs/variants.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/tabs/variants.dart

:::

</Demo>

Primary tabs are the top level of a screen. Secondary tabs divide the content inside one of them — which is why the demo above nests the second inside the first's panel, and why that is the arrangement the specification draws.

MD3 separates them three ways, and all three are here:

|                | `primary`                     | `secondary`            |
| -------------- | ----------------------------- | ---------------------- |
| Indicator      | 3dp, rounded, under the label | 2dp, square, whole tab |
| Chosen label   | The accent                    | `on-surface`           |
| Glyph          | Above the label               | Before it              |
| Height at `md` | 48dp, or 64dp with a glyph    | 48dp                   |

There is deliberately no third variant. A ladder like the buttons' one would be an emphasis axis, and a tab bar has nothing to be emphatic about: it is the map of a screen, not an action on it.

## The indicator hugs the label

On a primary bar it insets itself by exactly the tab's own inline padding, which is what puts it under the words rather than under the tab. One declaration on the root carries that length, so the padding and the inset can never disagree.

The consequence worth knowing: with `fullWidth`, where a tab is much wider than its label, the indicator is the tab minus that padding rather than the width of the text.

It moves by animating `left` and `width` on an empty box — a layout animation on something with no text in it, which is the one kind this library allows.

::: fw flutter

The box is measured rather than worked out from the count, so it lands under the right tab when two labels differ. It is measured again whenever the bar is given a new width or a tab changes size.

:::

## The panel fades through

The arriving panel fades in over 200ms, which is MD3's own answer and the other half of the indicator sliding: a bar that animated its decoration while the content it points at cut was animating the wrong thing.

There is no matching fade out, and the reason is structural rather than aesthetic. A leaving panel is still in the layout while a transition on it plays, so a panel that faded out would put both in the flow at once — the page would grow to hold the pair, then collapse onto the new one. A snap is better than that.

Nothing fades on the first paint either. A bar that faded its own content in on page load would be answering a question nobody asked.

## activateOnFocus

Off by default, so an arrow key moves focus and <kbd>Enter</kbd> or <kbd>Space</kbd> chooses. <kbd>Home</kbd> and <kbd>End</kbd> go to either end of the bar.

Automatic activation is only kind when every panel is already on the page. The moment one of them fetches, walking past four tabs fires four requests — and a reader on a keyboard cannot get past a tab without loading it.

## keepMounted

A hidden panel is unmounted, which is right for the common case — four panels of which one is on screen — and wrong for a panel holding a half-filled form.

::: fw react

```tsx
<MPTabPanel value="compose" keepMounted>
  …
</MPTabPanel>
```

:::

::: fw flutter

```dart
const MPTabPanel<String>(value: 'compose', keepMounted: true, child: ComposeForm())
```

A kept panel stays in the tree in the same place whether it shows or not, so its state survives. While it is hidden it is not painted, takes no focus, is left off the semantics tree, and its animations are paused.

:::

## Horizontal only

There is no `orientation`, and the omission is the specification's.

MD3 has no vertical tabs. A column of destinations down the side of a screen is a **navigation rail**, which is a different component with different behaviour: it switches what the _screen_ is rather than which panel of one is showing, and it is not one tab stop with arrow keys inside it. A tab bar turned on its side would claim the tab contract while looking like the other thing.

A bar with more tabs than room scrolls rather than wrapping — MD3's scrollable tabs. A tab bar on two lines has stopped being a bar, and the indicator has nowhere sensible to sit.

## Saying that it scrolls

It always did. What it had no way of saying was so.

macOS draws an overlay scrollbar that does not exist until it is used, so a bar with four tabs off the edge and a bar with none were the same picture. Windows draws a real one, which is a signal — and also fifteen pixels of furniture under the tabs, on one platform out of two.

The scrollbar is hidden on both, and the bar **fades at the end that has more bar past it**: at the right when there is more to the right, at both when a reader is somewhere in the middle, at neither when everything fits. Fading an end already reached would be the same lie as saying nothing.

Whether it overflows is measured rather than declared, because it depends entirely on the room the bar was given — the same six tabs fit at 640px and do not at 320.

::: fw react

The measurement is written out as `data-mp-overflow` on `.mp-tabs__list`, so a page that wants a different treatment can read the same fact:

```css
/* An arrow instead of a fade, say. */
.mp-tabs__list[data-mp-overflow='right']::after {
  content: '›';
}
```

The value is `left`, `right` or `both`, and it is **physical** — it names a side of the box, not a side of the text. That is the same rule the indicator's `--active-tab-left` follows: a measurement stays a measurement under RTL, and pairing one with a logical property is what would break the direction rather than what would fix it.

:::

::: fw flutter

The fade is a mask over the strip, so it is right on whatever the bar sits on, and it is left out entirely while every tab fits. The gradient runs in the reader's direction, so under RTL it turns round with the strip.

The tab the focus is on is brought into view as the arrow keys move it, and the chosen tab as the bar is first laid out, clear of the fade. Only the strip moves: the page around it stays where it is.

:::

The divider under the bar does not fade with the tabs. It is the boundary between the bar and the panel, and it runs the full width whatever the bar is doing.

## When this is the wrong component

**For switching what the whole screen is**, use [MPBottomNavigation](./bottom-navigation) on a phone or a rail down the side. Tabs divide one screen; navigation moves between screens, and the two sound completely different to a screen reader.

**For two or three mutually exclusive options that change what a list shows**, use [MPSegmentedButton](../inputs/segmented-button). It has no panels, which is the difference.

**For sections that can all be open at once**, use [MPAccordion](./accordion).

## Accessibility

::: fw react

- Base UI is underneath, which is what makes this a tab bar rather than a row of buttons: one tab stop for the whole set, arrow keys within it, <kbd>Home</kbd> and <kbd>End</kbd>, the `tab` and `tabpanel` roles, and the `aria-controls` wiring between them.
- A panel with nothing focusable inside it takes focus itself, so the keyboard can reach the content the tab just revealed.
- Pass `aria-label` — it names the bar. The tabs only name themselves.
- A disabled tab stays in the bar and stays announced. It is a place that exists and is unavailable, which is not the same as a place that is gone.

:::

::: fw flutter

- The bar is one focus stop. The arrow keys move the focus along it and skip a disabled tab, <kbd>Home</kbd> and <kbd>End</kbd> go to either end, and <kbd>Enter</kbd> or <kbd>Space</kbd> chooses. Once the focus leaves the bar, the stop goes back to the chosen tab.
- Under directional navigation, a remote's D-pad, the arrows halt at either end of the bar instead of wrapping, and an arrow past the end goes on to the next control.
- The bar is a node with the tab bar role, named by `semanticLabel`, and each tab a node with the tab role that says whether it is selected. The chosen tab names its panel through `controlsNodes`, and the panel is a node with the tab panel role.
- A disabled tab stays in the bar and stays announced as unavailable.
- The focus ring is drawn inside the tab, in `secondary`, because a ring outside a tab in a row of them is drawn over its neighbours.

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| `onValueChange` | `onChanged` | Flutter's name for a plain change of value. |
| `defaultValue` | `initialValue` | Flutter's name. Left out, the first tab that is not disabled starts chosen. |
| `value={null}` | — | `value: null` means the set keeps its own choice, so a controlled bar with nothing chosen is not expressible. |
| Children sorted through fragments | Children are `MPTab`s and `MPTabPanel`s | Dart has no fragments. A pair that comes and goes together is written with a collection `if`. |
| `aria-label` | `semanticLabel` | Flutter's name. |
| A panel with nothing focusable takes the focus | — | A Flutter screen reader reaches the panel's content through the semantics tree, and Tab goes to the first control in it. A panel that was a focus stop of its own would be a stop with nothing to do. |
| `data-mp-overflow` | — | There is no stylesheet to read it. The fade is drawn by the bar itself. |
| `className`, `style` and the attributes a `div` takes | — | There is no class list or style attribute to pass through. |

:::

## See also

- [MPSegmentedButton](../inputs/segmented-button) — the same question with no panels behind it.
- [MPAccordion](./accordion) — sections that open in place, more than one at a time.
- [Base UI Tabs](https://base-ui.com/react/components/tabs) — the behaviour underneath.
