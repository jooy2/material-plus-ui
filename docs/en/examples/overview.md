---
title: Overview
order: 1
aside: false
---

# Overview

<p class="mp-lede">Every part of the library on one screen. Not a grid of specimens — the components are laid out the way an application would lay them out, so you can see whether the sizes, the baselines and the surfaces agree with each other once they are side by side.</p>

<Demo src="showcase/app" :minHeight="2000" />

## What to look at

| Block | Components used | Worth noticing |
| --- | --- | --- |
| App bar | `MPIcon` `MPTextField` `MPBadge` `MPTooltip` `MPIconButton` `MPMenu` `MPAvatar` | The bar itself is a `<header>` with `bg-mp-surface-container` on it — the tokens are the API for the parts that are not components |
| Trail | `MPBreadcrumb` `MPPill` | A pill is where the state that belongs to no single control goes; the spinner inside it is `MPProgressCircular` at `xs` |
| Alert | `MPAlert` | One thing needs attention, said once, at the top, with its own `action` |
| Figures | `MPGrid` `MPGridItem` `MPCard` `MPChip` | `MPGrid` divides on Material's window size classes — 600, 840, 1200dp — not on Tailwind's breakpoints |
| Controls | `MPSegmentedButton` `MPSelect` `MPButtonGroup` `MPButton` | At `size="sm"` all four are the same height, so the row keeps one baseline with no margins written down |
| What's new | `MPCarousel` | Built on scroll snap, so it swipes on a phone and reverses direction under RTL |
| Deploys | `MPTabs` `MPTable` `MPChip` `MPPagination` | The table is rendered from a column list, so the headings and the cells cannot drift apart |
| Forms | `MPCard` `MPTextField` `MPDivider` `MPChip` `MPCheckbox` `MPRadioGroup` `MPSwitch` `MPSlider` | Every control takes `label`, and the ones with something more to say take `description` — the same two slots on all of them |
| Release | `MPTimeline` `MPHighlight` `MPShortcut` `MPBlockquote` `MPProgressLinear` `MPList` `MPRating` | Type in the search field at the top: `MPHighlight` **is** the search, and the marks in the release note appear as you type |
| Bottom bar | `MPBottomNavigation` | `position="static"` puts it in the layout instead of against the window, which is what makes it previewable at all |

Messages come from `MPSnackbarProvider`, once, around the whole screen — the buttons that post them only say what happened.

## Next

- The same parts, built into three whole screens: [Landing page](./concept-landing), [Admin dashboard](./concept-dashboard), [Sign-up page](./concept-signup).
- Per-component props and examples are under [Components](../components/).
- What the shared props mean is in [Prop conventions](../design/prop-conventions).
