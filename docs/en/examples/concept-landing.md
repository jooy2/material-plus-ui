---
title: Landing page
order: 2
aside: false
---

# Landing page

<p class="mp-lede">A marketing page for Kestrel, a deploy tool that does not exist. It is the screen a component library is least obviously for — mostly type, space and one call to action repeated — which makes it the best test of whether the parts compose.</p>

<Demo src="concepts/landing" :minHeight="2600" />

The source is one file: `docs/.vitepress/demos/concepts/landing.tsx`. Everything on the page is a Material Plus component or a Material Plus token; nothing is a bare `div` dressed up as one.

## What it is made of

| Block | Components used | Worth noticing |
| --- | --- | --- |
| Announcement | `MPPill` | A pill with `onClick` is a button, so the banner is reachable from the keyboard with no extra markup around it |
| Header | `MPIcon` `MPButton` `MPIconButton` `MPTooltip` | The nav links are `variant="text"` buttons, which is what keeps them on one baseline with the solid one beside them |
| Hero | `MPTypography` `MPChip` `MPButton` `MPAvatar` | `MPTypography` sets the element as well as the scale, so `level="h1"` is a real `<h1>` |
| Trust strip | `MPDivider` | A divider with children carries the section label, so the rule and the heading over it are one element |
| Numbers | `MPGrid` `MPGridItem` | Two across on a phone, four from the medium window up — each item's `span` is `{ compact: 6, medium: 3 }`, and nothing else |
| Features | `MPCard` `MPIcon` | The glyph sits in `headerAction`, which keeps it on the title's baseline at every size |
| Product tour | `MPTabs` `MPProgressLinear` `MPList` `MPChip` | Three views of the same product; the funnel is `showValue` on a bar rather than a chart |
| Quote | `MPBlockquote` | `author` and `source` are separate slots, so the attribution wraps as two lines on a narrow screen |
| Pricing | `MPSegmentedButton` `MPCard` `MPList` `MPButton` `MPTable` | The billing toggle switches both prices at once; the comparison table is rendered from a column list |
| Questions | `MPAccordion` | One `MPAccordionItem` per question, all closed on arrival |
| Closing form | `MPCard` `MPTextField` `MPButton` | The only field on the page, inside a real `<form>` with its own submit |
| Footer | `MPDivider` `MPTextLink` | `MPTextLink` is the one link that keeps a colour and an underline — every other link in a component takes the component's own type |

## Notes

- Colour carries meaning rather than emphasis. The featured plan is the only `elevated` card in the pricing row and the only `primary` button; the other two stay `outlined` and `secondary`.
- The email field validates on change but only shows `errorMessage` once something has been typed, so an untouched form is never red.
- Nothing in the page sets a width in pixels except the grid gutters. The columns are `repeat(auto-fit, minmax(min(100%, …), 1fr))`, so the layout follows the space it is given rather than the window it is in.
