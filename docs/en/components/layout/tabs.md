---
title: MPTabs
order: 11
---

# MPTabs

<p class="mp-lede">One set of panels, one of which is shown. Material's two kinds of tab are here as <code>variant</code> — <code>primary</code> for the top level of a screen and <code>secondary</code> for a division inside one of its panels — with the specification's indicator, heights and type roles for each.</p>

<Demo src="tabs/hero" :minHeight="200" />

```tsx
import { MPTab, MPTabPanel, MPTabs } from 'material-plus-ui';

<MPTabs aria-label="Trip" defaultValue="flights">
  <MPTab value="flights">Flights</MPTab>
  <MPTab value="stays">Stays</MPTab>

  <MPTabPanel value="flights">…</MPTabPanel>
  <MPTabPanel value="stays">…</MPTabPanel>
</MPTabs>;
```

Tabs and panels go in as one list of children and are sorted into the bar and the body for you. There is no `<MPTabList>` to remember: a wrapper whose only job is to say what the elements already say is one more thing to get wrong.

## Props

<PropsTable name="MPTabs" />

### MPTab

<PropsTable name="MPTab" />

### MPTabPanel

<PropsTable name="MPTabPanel" />

## primary and secondary are depths, not weights

<Demo src="tabs/variants" :minHeight="260">

<<< @/.vitepress/demos/tabs/variants.tsx

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

## The panel fades through

The arriving panel fades in over 200ms, which is MD3's own answer and the other half of the indicator sliding: a bar that animated its decoration while the content it points at cut was animating the wrong thing.

There is no matching fade out, and the reason is structural rather than aesthetic. A leaving panel is still in the layout while a transition on it plays, so a panel that faded out would put both in the flow at once — the page would grow to hold the pair, then collapse onto the new one. A snap is better than that.

Nothing fades on the first paint either. A bar that faded its own content in on page load would be answering a question nobody asked.

## activateOnFocus

Off by default, so an arrow key moves focus and <kbd>Enter</kbd> or <kbd>Space</kbd> chooses.

Automatic activation is only kind when every panel is already on the page. The moment one of them fetches, walking past four tabs fires four requests — and a reader on a keyboard cannot get past a tab without loading it.

## keepMounted

A hidden panel is unmounted, which is right for the common case — four panels of which one is on screen — and wrong for a panel holding a half-filled form.

```tsx
<MPTabPanel value="compose" keepMounted>
  …
</MPTabPanel>
```

## Horizontal only

There is no `orientation`, and the omission is the specification's.

MD3 has no vertical tabs. A column of destinations down the side of a screen is a **navigation rail**, which is a different component with different behaviour: it switches what the _screen_ is rather than which panel of one is showing, and it is not one tab stop with arrow keys inside it. A tab bar turned on its side would claim the tab contract while looking like the other thing.

A bar with more tabs than room scrolls rather than wrapping — MD3's scrollable tabs. A tab bar on two lines has stopped being a bar, and the indicator has nowhere sensible to sit.

## When this is the wrong component

**For switching what the whole screen is**, use [MPBottomNavigation](./bottom-navigation) on a phone or a rail down the side. Tabs divide one screen; navigation moves between screens, and the two sound completely different to a screen reader.

**For two or three mutually exclusive options that change what a list shows**, use [MPSegmentedButton](../inputs/segmented-button). It has no panels, which is the difference.

**For sections that can all be open at once**, use [MPAccordion](./accordion).

## Accessibility

- Base UI is underneath, which is what makes this a tab bar rather than a row of buttons: one tab stop for the whole set, arrow keys within it, <kbd>Home</kbd> and <kbd>End</kbd>, the `tab` and `tabpanel` roles, and the `aria-controls` wiring between them.
- A panel with nothing focusable inside it takes focus itself, so the keyboard can reach the content the tab just revealed.
- Pass `aria-label` — it names the bar. The tabs only name themselves.
- A disabled tab stays in the bar and stays announced. It is a place that exists and is unavailable, which is not the same as a place that is gone.

## See also

- [MPSegmentedButton](../inputs/segmented-button) — the same question with no panels behind it.
- [MPAccordion](./accordion) — sections that open in place, more than one at a time.
- [Base UI Tabs](https://base-ui.com/react/components/tabs) — the behaviour underneath.
