---
title: Spec coverage
order: 5
---

# Spec coverage

<p class="mp-lede">Which Material Design this library implements, how much of it, where it goes further, and how that compares with Material UI. Every row was read off the source of Material Plus 1.10.0 and checked against the published specification and Material UI's own API pages in October 2026.</p>

## In short

- **It is Material Design 3, the baseline specification.** The token names and values are M3's: 29 colour roles derived from one source colour, 13 of the 15 type roles, the corner scale, the five elevation levels, the state-layer opacities and the standard and emphasized easing curves. Most components the specification names are here. Some are here in part, and a few are not here at all; both are listed below.
- **It is not M3 Expressive.** None of Expressive's foundations are implemented: spring-based motion, emphasized type, the extended corner scale, the shape library and shape morphing. Neither are the components it introduced, such as the split button, the FAB menu, the toolbars, the loading indicator and wavy progress. A few things happen to line up with it. The button heights 32, 40 and 56px are Expressive's XS, S and M, there are toggle buttons, and button groups are drawn connected.
- **It goes further than the specification in two directions.** The components the specification names come with a five-step size ladder, a density scale, more variants, all four colour families and states such as `loading`. Next to them are about ninety components the specification does not name, including charts, a data table and a command palette.
- **Material UI implements Material Design 2.** Its own documentation says so, and its issue for adopting M3, opened in 2021, is still open and on hold. In the tables below, its column shows how a different system answers the same need, not an older version of this one.

Google has no supported web implementation of Expressive either. Material Web has been in maintenance mode since June 2024, and the specification's web page states that Expressive is not implemented on the web.

## Reading the tables

The **Defined by** column says where a feature comes from.

| Defined by | Meaning |
| --- | --- |
| `M3` | The Material Design 3 specification as published before Expressive. |
| `Expressive` | Added or changed by M3 Expressive, from May 2025. |
| `M3 (replaced in Expressive)` | Still in the specification, but Expressive no longer recommends it. |
| `Material Plus` | Not in the specification. This library's own addition. |

The last two columns are a checklist: **✓** is supported, **Partial** names what is missing, and **—** is not supported. Material UI means `@mui/material` 9.4.0. Where its answer lives in MUI X instead, the row says so and names the licence tier, because the date range picker, the heatmap and parts of the data grid are paid.

A row marked `M3` with **—** under Material Plus is a gap in this library. A row marked `Material Plus` is something it adds.

## Foundations

### Colour

| Feature | Defined by | Material Plus | Material UI |
| --- | --- | --- | --- |
| A whole scheme generated from one source colour | M3 | ✓ `--mp-source-color` | — (`main` per colour, `light` and `dark` offset from it) |
| Tonal palettes in HCT | M3 | Partial: an OKLCh approximation, matched to M3's baseline scheme | — |
| Light and dark as one palette read at two tones | M3 | ✓ | Partial: `colorSchemes` with a palette per scheme |
| `primary`, `secondary`, `tertiary` with `-container` and `on-` roles | M3 | ✓ | Partial: `primary`, `secondary`; no tertiary, no containers |
| `error` family, fixed whatever the source | M3 | ✓ | ✓ `error` |
| `surface` and the surface containers | M3 | Partial: `surface`, `-low`, base, `-high`, `-highest`; no `-lowest`, `-dim`, `-bright` | — (`background.default`, `background.paper`) |
| `outline`, `outline-variant` | M3 | ✓ | — (`divider`) |
| `inverse-surface`, `inverse-on-surface`, `inverse-primary` | M3 | ✓ | — |
| `scrim` | M3 | ✓ | — |
| Fixed and fixed-dim roles | M3 | — | — |
| Scheme variants (tonal spot, vibrant, expressive and others) | M3 | — | — |
| Standard, medium and high contrast levels | M3 | — | Partial: an `enhanceHighContrast` helper since 9.1 |
| Dynamic colour from an image | M3 | — | — |
| Reads the page's own `--md-sys-color-*` tokens | Material Plus | ✓ | — |
| A different source colour or scheme for one subtree, in CSS | Material Plus | ✓ | Partial: a nested `ThemeProvider` |
| Chart palettes: eight categorical slots, a five-step ramp | Material Plus | ✓ | Partial: MUI X Charts has its own |

There is no `success`, `info` or `warning` family, on purpose. M3 defines no such roles, so the token sheet would have no way to derive them. See [Colour](./color.md).

### Typography, shape and elevation

| Feature | Defined by | Material Plus | Material UI |
| --- | --- | --- | --- |
| The 15 type roles, display to label | M3 | Partial: 13; no `display-large`, `display-medium` | — (MD2 scale: `h1`–`h6`, `subtitle`, `body`, `caption`) |
| 15 emphasized type roles | Expressive | — | — |
| A smaller control moves down the type scale | Material Plus | ✓ | — |
| Corner scale: extra-small 4, small 8, medium 12, large 16, extra-large 28, full | M3 | ✓ | Partial: one `shape.borderRadius`, 4px by default |
| Corners large-increased 20, extra-large-increased 32, extra-extra-large 48 | Expressive | — | — |
| The 35-shape library and shape morphing | Expressive | — | — |
| `rounded` and `sharp` corner presets for a subtree | Material Plus | ✓ `data-mp-shape` | — |
| Elevation levels 0–5 | M3 | ✓ | Partial: MD2's 0–24 |
| Height changes the surface tone as well as the shadow | M3 | ✓ | — (MD2's white overlay in dark mode) |

### States, motion and layout

| Feature | Defined by | Material Plus | Material UI |
| --- | --- | --- | --- |
| State layer: hover 8%, focus 10%, pressed 10% | M3 | ✓ | Partial: MD2 opacities |
| Dragged 16% | M3 | Partial: the slider only | — |
| Ripple on press | M3 | — (a flat 10% layer) | ✓ |
| Disabled: content 38%, container 12% | M3 | ✓ | ✓ |
| Standard and emphasized easing curves | M3 | ✓ all six, plus linear | — (MD2 curves) |
| Duration tokens | M3 | Partial: 6 of 16 | Partial: MD2 durations |
| Spring motion: spatial and effects, expressive and standard schemes | Expressive | — | — |
| `prefers-reduced-motion` in every component | Material Plus | ✓ | ✓ since 9.1 |
| Window classes compact, medium, expanded | M3 | ✓ 600, 840 | — (its own 600, 900, 1200, 1536) |
| Window classes large and extra-large | M3 | ✓ 1200, 1600 | — |
| Density scale 0 to −3 | M3 | ✓ on containers | Partial: `dense` and `size="small"` per component |
| Five sizes on every control, `md` at the spec's own | Material Plus | ✓ `xs` to `xl` | Partial: `small`, `medium`, and `large` on some |

## Actions

### Buttons

[`MPButton`](../components/inputs/button)

| Feature | Defined by | Material Plus | Material UI |
| --- | --- | --- | --- |
| Elevated, filled, tonal, outlined, text | M3 | ✓ | Partial: `contained`, `outlined`, `text` |
| Leading and trailing icon | M3 | ✓ `startIcon`, `endIcon` | ✓ |
| 40dp height | M3 | ✓ `sm` | — (about 37px) |
| Sizes XS 32, S 40, M 56 | Expressive | ✓ `xs`, `sm`, `md` (the default is `md`) | — |
| Sizes L 96, XL 136 | Expressive | — (`lg` and `xl` are 64 and 72) | — |
| Round or square shape | Expressive | — | — |
| Shape morph on press and on selection | Expressive | — | — |
| Toggle buttons | Expressive | ✓ [`MPToggle`](../components/inputs/toggle) | Partial: `ToggleButton`, MD2 look |
| Sizes 64 and 72 | Material Plus | ✓ `lg`, `xl` | Partial: `small`, `medium`, `large` (31–42px) |
| `secondary`, `tertiary`, `error` families | Material Plus | ✓ | Partial: `secondary`, `error`, plus `success`, `info`, `warning` |
| `loading` | Material Plus | ✓ | ✓ since 6.4 |
| Rendered as a link or a router component | Material Plus | ✓ `render` | ✓ `href`, `component` |

### Icon buttons

[`MPIconButton`](../components/inputs/icon-button), and [`MPToggle`](../components/inputs/toggle) with only an icon for the toggle form.

| Feature | Defined by | Material Plus | Material UI |
| --- | --- | --- | --- |
| Standard, filled, tonal, outlined | M3 | ✓ (`text` is the standard one) | Partial: one style, coloured by `color` |
| Toggle (selected) icon button | M3 | ✓ through `MPToggle` | Partial: `ToggleButton` |
| Sizes 32, 40, 56 | Expressive | ✓ `xs`, `sm`, `md` | — |
| Sizes 96, 136 | Expressive | — | — |
| Narrow, default and wide widths | Expressive | — | — |
| Round or square, morphing on press | Expressive | — | — |
| Sizes 64, 72 and an `elevated` style | Material Plus | ✓ | — |
| `loading` | Material Plus | ✓ | ✓ |

### FAB and extended FAB

[`MPFloatingActionButton`](../components/inputs/floating-action-button)

| Feature | Defined by | Material Plus | Material UI |
| --- | --- | --- | --- |
| FAB, 56dp | M3 | ✓ `md` | ✓ `size="large"`, the default |
| Large FAB, 96dp | M3 | ✓ `xl` | — |
| Small FAB, 40dp | M3 (replaced in Expressive) | ✓ `xs` | ✓ `size="small"` |
| Medium FAB, 80dp | Expressive | — (`lg` is 72) | — |
| Extended FAB | M3 | ✓ `extended`, animated | ✓ `variant="extended"` |
| Extended FAB in small, medium and large (56, 80, 96) | Expressive | Partial: `extended` at every rung, no 80dp rung | — (34 to 48px) |
| Container colours: primary, secondary, tertiary | M3 | ✓ `tonal` | — |
| Solid colours: primary, secondary, tertiary | Expressive | ✓ `filled` | Partial: `primary`, `secondary`, MD2 intents |
| Surface FAB | M3 (replaced in Expressive) | ✓ `elevated` | — |
| Lowered FAB | M3 | — | — |
| FAB menu | Expressive | — | Partial: `SpeedDial`, the MD2 pattern |
| Pinned to a corner with an offset, RTL-aware | Material Plus | ✓ `position`, `corner`, `offset` | — |

### Button groups

[`MPButtonGroup`](../components/inputs/button-group), and [`MPToggleGroup`](../components/inputs/toggle) for the selectable form.

| Feature | Defined by | Material Plus | Material UI |
| --- | --- | --- | --- |
| Connected group: 2dp gap, inner corners cut | Expressive | ✓ | Partial: `ButtonGroup`, shared borders |
| Standard group: neighbours make room on press | Expressive | — | — |
| Inner corners morph, and round out when selected | Expressive | — | — |
| Single and multiple selection | Expressive | ✓ `MPToggleGroup` | ✓ `ToggleButtonGroup` |
| Selection required | Expressive | — | — |
| Vertical orientation | Material Plus | ✓ | ✓ |
| One `variant`, `size` and `color` for every child | Material Plus | ✓ | ✓ |

### Segmented buttons

[`MPSegmentedButton`](../components/inputs/segmented-button). Expressive no longer recommends this component and points to the connected button group, which is above.

| Feature | Defined by | Material Plus | Material UI |
| --- | --- | --- | --- |
| Single and multiple selection | M3 (replaced in Expressive) | ✓ | ✓ `ToggleButtonGroup` |
| Icon, label and a check mark when selected | M3 (replaced in Expressive) | ✓ `showCheck` | Partial: no check mark |
| 40dp height | M3 (replaced in Expressive) | ✓ `md` | — |
| Density | M3 (replaced in Expressive) | — | Partial: `size` |
| Five sizes | Material Plus | ✓ | Partial: three |

## Communication

### Badges

[`MPBadge`](../components/display/badge)

| Feature | Defined by | Material Plus | Material UI |
| --- | --- | --- | --- |
| Small badge, a 6dp dot | M3 | ✓ `dot` | ✓ `variant="dot"` |
| Large badge with a count, capped with `+` | M3 | ✓ `max`, 99 by default | ✓ `max`, 99 by default |
| Five variants and five sizes | Material Plus | ✓ | — |
| Any of the four families, `error` by default | Material Plus | ✓ | ✓ |
| Four corners and a square or circle overlap | Material Plus | ✓ `placement`, `overlap` | ✓ `anchorOrigin`, `overlap` |

### Progress indicators

[`MPProgressLinear`](../components/feedback/progress-linear), [`MPProgressCircular`](../components/feedback/progress-circular)

| Feature | Defined by | Material Plus | Material UI |
| --- | --- | --- | --- |
| Linear and circular | M3 | ✓ | ✓ |
| Determinate and indeterminate | M3 | ✓ | ✓ |
| 4dp track | M3 | ✓ `md` | ✓ |
| Gap between indicator and track, end stop (2023) | M3 | — | — |
| Track in `secondary-container` | M3 | — (`on-surface` at 12%) | — |
| Wavy shape | Expressive | — | — |
| Track thickness as its own setting | Expressive | Partial: follows `size` | Partial: `thickness` on the circular one |
| Five sizes, a label and a formatted value | Material Plus | ✓ | Partial: `size` on the circular one |

### Snackbar

[`MPSnackbar`](../components/feedback/snackbar)

| Feature | Defined by | Material Plus | Material UI |
| --- | --- | --- | --- |
| One line at 48dp, inverse surface | M3 | ✓ `md` | Partial: MD2 look |
| Two lines | M3 | Partial: the text wraps, no 68dp rung | ✓ |
| One action | M3 | ✓ `actionLabel` | ✓ `action` |
| Close icon | M3 | ✓ on by default | Partial: through `action` |
| A longer action on a line of its own | M3 | — | — |
| A queue, with up to three on screen | Material Plus | ✓ `limit` | — (the docs point to notistack) |
| Six positions | Material Plus | ✓ | ✓ `anchorOrigin` |
| Accent colours, `promise`, `update` | Material Plus | ✓ | — |

### Tooltips

[`MPTooltip`](../components/feedback/tooltip)

| Feature | Defined by | Material Plus | Material UI |
| --- | --- | --- | --- |
| Plain tooltip | M3 | ✓ | ✓ |
| Rich tooltip: title, body, up to two actions | M3 | — ([`MPHoverCard`](../components/feedback/hover-card) and [`MPPopover`](../components/feedback/popover) cover the need) | Partial: `title` takes any node |
| Arrow | Material Plus | ✓ on by default | ✓ `arrow` |
| Five sizes and an accent plate | Material Plus | ✓ | — |

## Containment

### Cards

[`MPCard`](../components/layout/card)

| Feature | Defined by | Material Plus | Material UI |
| --- | --- | --- | --- |
| Elevated, filled, outlined | M3 | ✓ | Partial: `elevation` and `outlined`, no filled |
| 12dp corner | M3 | ✓ | — (4px) |
| Media, headline, subhead, supporting text, actions | M3 | ✓ as slots | ✓ `CardMedia`, `CardHeader`, `CardContent`, `CardActions` |
| A pressable card with states | M3 | — (not pressable, by design) | ✓ `CardActionArea` |
| `tonal` and `text` variants, density, elevation 0–5 | Material Plus | ✓ | Partial: elevation 0–24 |

### Carousel

[`MPCarousel`](../components/layout/carousel)

| Feature | Defined by | Material Plus | Material UI |
| --- | --- | --- | --- |
| Multi-browse, uncontained, hero, center-aligned hero | M3 | — | — |
| Full-screen: one item to a view | M3 | ✓ | — |
| 28dp item corner, 8dp gap, parallax | M3 | — | — |
| Arrows, dots, autoplay, loop | Material Plus | ✓ | — |

### Dialogs

[`MPDialog`](../components/feedback/dialog)

| Feature | Defined by | Material Plus | Material UI |
| --- | --- | --- | --- |
| Basic dialog: icon, headline, supporting text, actions | M3 | ✓ | Partial: no icon slot |
| 28dp corner, level 3, 280 to 560dp wide | M3 | Partial: 560 at `md`, no 280 minimum | — (MD2 corner and widths) |
| Full-screen dialog | M3 | Partial: no top bar with close and confirm | ✓ `fullScreen` |
| A width ladder, a close button, non-dismissible | Material Plus | ✓ | ✓ `maxWidth` |

### Sheets

[`MPDrawer`](../components/layout/drawer) draws both kinds of sheet from one of its edges. Nothing here is named a sheet.

| Feature | Defined by | Material Plus | Material UI |
| --- | --- | --- | --- |
| Modal bottom sheet | M3 | Partial: `side="bottom"`; no drag handle, swipe or 640dp limit | Partial: `Drawer` or `SwipeableDrawer` at the bottom |
| Standard bottom sheet | M3 | — | Partial: a persistent `Drawer` |
| Modal side sheet | M3 | Partial: `side="right"` | Partial: `Drawer anchor="right"` |
| Standard side sheet | M3 | Partial: `mode="standard"` | Partial: a persistent `Drawer` |
| A sheet from the top edge | Material Plus | ✓ | ✓ `anchor="top"` |

### Lists

[`MPList`](../components/display/list)

| Feature | Defined by | Material Plus | Material UI |
| --- | --- | --- | --- |
| One-line and two-line items | M3 (replaced in Expressive) | ✓ (a two-line row is 76px at `md`, not 72) | ✓ |
| Three-line items | M3 (replaced in Expressive) | — | Partial: the secondary text wraps |
| Leading icon or avatar, trailing icon or control | M3 (replaced in Expressive) | ✓ `startIcon`, `endIcon`, `action` | ✓ |
| Overline and trailing supporting text | M3 (replaced in Expressive) | — | Partial: `secondaryAction` |
| Expressive list: segmented style, selection modes, shape morph, expand | Expressive | — | — |
| Rows as links or buttons, density, dividers | Material Plus | ✓ | ✓ `selected`, `dense`, `divider` |

### Dividers

[`MPDivider`](../components/display/divider)

| Feature                   | Defined by    | Material Plus | Material UI                     |
| ------------------------- | ------------- | ------------- | ------------------------------- |
| Full-width                | M3            | ✓             | ✓                               |
| Inset and middle-inset    | M3            | —             | ✓ `variant="inset"`, `"middle"` |
| Vertical                  | M3            | ✓             | ✓                               |
| A label set into the rule | Material Plus | ✓             | ✓                               |

## Navigation

### App bars

[`MPHeader`](../components/layout/header)

| Feature | Defined by | Material Plus | Material UI |
| --- | --- | --- | --- |
| Small app bar, 64dp | M3 | ✓ `md` | Partial: `AppBar` and `Toolbar`, 56 or 64px |
| Centered title | M3 | ✓ `align="center"` | — |
| Medium (112dp) and large (152dp) app bars | M3 (replaced in Expressive) | — | Partial: a "prominent" demo |
| Surface fills on scroll, bar collapses on scroll | M3 | — (`tonal` is always the scrolled colour) | Partial: `useScrollTrigger` demos |
| Subtitle | Expressive | — | — |
| Medium and large flexible app bars | Expressive | — | — |
| Search app bar | Expressive | — | Partial: a search-field demo |
| Five heights, a middle slot, a measure | Material Plus | ✓ | Partial: `variant="dense"` |

### Navigation bar

[`MPBottomNavigation`](../components/layout/bottom-navigation), [`MPFloatingBottomNavigation`](../components/layout/floating-bottom-navigation)

| Feature | Defined by | Material Plus | Material UI |
| --- | --- | --- | --- |
| 80dp bar with a 64×32dp pill indicator | M3 (replaced in Expressive) | ✓ `md` | Partial: `BottomNavigation`, no pill |
| Labels on all items, on the selected one, or none | M3 (replaced in Expressive) | ✓ `labels` | Partial: `showLabels` |
| Badges on items | M3 (replaced in Expressive) | — (no badge slot) | Partial: wrap the icon in `Badge` |
| Flexible bar: 64dp, side-by-side items in medium windows | Expressive | — | — |
| A floating bar clear of the edge | Material Plus | ✓ `MPFloatingBottomNavigation` | — |
| Five sizes, a safe-area inset, router links | Material Plus | ✓ | — |

### Navigation drawer

[`MPSidebar`](../components/layout/sidebar), [`MPDrawer`](../components/layout/drawer), and [`MPPageLayout`](../components/layout/page-layout) to switch between the two.

| Feature | Defined by | Material Plus | Material UI |
| --- | --- | --- | --- |
| Standard drawer, 360dp | M3 (replaced in Expressive) | ✓ `MPSidebar` at `md` | ✓ `Drawer`, `permanent` or `persistent` |
| Modal drawer | M3 (replaced in Expressive) | ✓ `MPDrawer`, or `MPSidebar` below its breakpoint | ✓ `variant="temporary"` |
| Active indicator, section headings, badges inside | M3 (replaced in Expressive) | Partial: built from what you put in it, such as `MPList` | Partial: built from `List` |
| Turns modal below a window class | Material Plus | ✓ `collapseBelow` | Partial: a "responsive drawer" demo |
| Resizable, at the start or the end | Material Plus | ✓ | — |

### Tabs

[`MPTabs`](../components/layout/tabs)

| Feature | Defined by | Material Plus | Material UI |
| --- | --- | --- | --- |
| Primary and secondary tabs | M3 | ✓ `variant` | — (one style) |
| Fixed and scrollable | M3 | ✓ `fullWidth`, or scrolling by default | ✓ `variant` |
| Icon above or beside the label | M3 | ✓ `iconPosition` | ✓ `iconPosition` |
| Badges on tabs | M3 | — (a tab clips what overhangs it) | Partial: wrap the label |
| Five sizes, all four families | Material Plus | ✓ | Partial: `primary`, `secondary` |

## Selection

### Checkbox

[`MPCheckbox`](../components/inputs/checkbox)

| Feature | Defined by | Material Plus | Material UI |
| --- | --- | --- | --- |
| Selected, unselected, indeterminate | M3 | ✓ | ✓ |
| Error state | M3 | ✓ through `errorMessage` | Partial: `color="error"` |
| 18dp box, 40dp state layer | M3 | ✓ `md` | Partial: MD2 sizes |
| Label and description built in | Material Plus | ✓ | Partial: `FormControlLabel`, `FormHelperText` |
| Five sizes, all four families | Material Plus | ✓ | Partial: two sizes |

### Radio button

[`MPRadioGroup`](../components/inputs/radio-group)

| Feature | Defined by | Material Plus | Material UI |
| --- | --- | --- | --- |
| 20dp radio, 40dp state layer | M3 | ✓ `md` | Partial: MD2 sizes |
| A group with a label, an error and an orientation | Material Plus | ✓ | ✓ `RadioGroup`, `FormControl` |
| Five sizes, all four families | Material Plus | ✓ | Partial: two sizes |

### Switch

[`MPSwitch`](../components/inputs/switch)

| Feature | Defined by | Material Plus | Material UI |
| --- | --- | --- | --- |
| 52×32dp track, a handle that grows from 16 to 24dp | M3 | ✓ `md` | — (MD2: a thin track under a 20px thumb) |
| Icons in the handle | M3 | Partial: on both states, not on selected only | Partial: `icon` and `checkedIcon` replace the thumb |
| Handle grows to 28dp while pressed | M3 | — | — |
| Error state, label on either side, five sizes | Material Plus | ✓ | Partial: two sizes |

### Chips

[`MPChip`](../components/display/chip)

| Feature | Defined by | Material Plus | Material UI |
| --- | --- | --- | --- |
| Assist, filter, input, suggestion | M3 | Partial: one component, shaped by `onClick`, `selected` and `onDelete` | Partial: one `Chip`, shaped by `clickable` and `onDelete` |
| 32dp height, 8dp corner | M3 | ✓ `md` | Partial: 32px, but a full pill |
| Elevated chips | M3 | ✓ `elevated` | — |
| Check mark on a selected filter chip | M3 | ✓ (unless `startIcon` is set) | — |
| Input chip with an avatar and a remove button | M3 | Partial: `startIcon` and `onDelete`, no avatar sizing | ✓ `avatar`, `onDelete` |
| Five sizes, `filled`, `tonal`, `text`, a count | Material Plus | ✓ | Partial: two sizes, `filled`, `outlined` |

### Date pickers

[`MPDatePicker`](../components/inputs/date-picker), [`MPDateRangePicker`](../components/inputs/date-range-picker), [`MPCalendar`](../components/inputs/calendar)

| Feature | Defined by | Material Plus | Material UI |
| --- | --- | --- | --- |
| Docked date picker | M3 | ✓ | ✓ `DesktopDatePicker` (MUI X, free) |
| Modal date picker | M3 | — | ✓ `MobileDatePicker` (MUI X, free) |
| Modal input: typing the date | M3 | — (no typing, by design) | ✓ `DateField` (MUI X, free) |
| Range selection | M3 | Partial: a docked two-month popup, not the full-screen modal | Partial: `DateRangePicker` (MUI X Pro, paid) |
| Month and year views | M3 | ✓ | ✓ |
| Day, month or year precision | Material Plus | ✓ `precision` | ✓ `views` |
| Range presets | Material Plus | ✓ `presets` | Partial: shortcuts, on the paid range picker |
| Date and time in one popup | Material Plus | ✓ [`MPDateTimePicker`](../components/inputs/date-time-picker) | ✓ `DateTimePicker` (MUI X, free) |
| The calendar on its own, on the page | Material Plus | ✓ `MPCalendar` | ✓ `DateCalendar` (MUI X, free) |

### Time pickers

[`MPTimePicker`](../components/inputs/time-picker)

| Feature | Defined by | Material Plus | Material UI |
| --- | --- | --- | --- |
| Dial (clock face) | M3 | — (scrolling columns instead, by design) | ✓ `TimeClock` (MUI X, free) |
| Input: typing hours and minutes | M3 | — | ✓ `TimeField` (MUI X, free) |
| 12-hour and 24-hour, with AM and PM | M3 | ✓ from the locale | ✓ |
| Vertical and horizontal layouts | M3 | — | ✓ `orientation` |
| Seconds, steps, minimum and maximum | Material Plus | ✓ | ✓ |

### Menus

[`MPMenu`](../components/inputs/menu)

| Feature | Defined by | Material Plus | Material UI |
| --- | --- | --- | --- |
| 112 to 280dp wide, 4dp corner, level 2, 48dp rows | M3 | ✓ `md` | Partial: MD2 menu |
| Leading and trailing icons, shortcut text, dividers | M3 | ✓ | Partial: no shortcut slot |
| Submenus | M3 | ✓ `MPMenuSubmenu` | — (an open issue) |
| Selectable items: check and radio | Expressive | ✓ | Partial: `selected` on `MenuItem` |
| Vertical menus: 16dp corner, standard and vibrant, grouped with gaps | Expressive | — | — |
| Context menu | Material Plus | ✓ `MPContextMenu` | Partial: a demo |
| Five sizes | Material Plus | ✓ | Partial: `dense` |

### Sliders

[`MPSlider`](../components/inputs/slider)

| Feature | Defined by | Material Plus | Material UI |
| --- | --- | --- | --- |
| Standard (continuous), stops (discrete), range | M3 | ✓ | ✓ |
| Value indicator above the handle | M3 | — (a readout beside the label) | ✓ `valueLabelDisplay` |
| Centered slider | M3 | — | — |
| Bar handle with a gap, 16dp track (2023) | M3 | — (a round handle, by design) | — |
| Vertical | Expressive | ✓ | ✓ |
| Sizes XS to XL (16 to 96dp tracks) | Expressive | — (tracks are 2 to 8px) | — |
| Inset icon | Expressive | — | — |
| Tick labels, a formatted value, five sizes | Material Plus | ✓ | Partial: mark labels, two sizes |

## Text inputs

### Text fields

[`MPTextField`](../components/inputs/text-field). The same outlined shell is drawn by the select, combobox, number field, colour picker and the pickers.

| Feature | Defined by | Material Plus | Material UI |
| --- | --- | --- | --- |
| Outlined | M3 | ✓ | ✓ |
| Filled | M3 | — | ✓ |
| 56dp, floating label | M3 | ✓ `md` | ✓ |
| Supporting text | M3 | Partial: `errorMessage` only on `MPTextField`; other fields also take `description` | ✓ `helperText` |
| Character counter | M3 | — | — |
| Prefix and suffix | M3 | — | ✓ `InputAdornment` |
| Leading icon | M3 | ✓ `startIcon` | ✓ |
| Trailing icon | M3 | Partial: the password toggle only | ✓ |
| Error, read-only, required | M3 | ✓ | ✓ |
| Multi-line and text area | M3 | ✓ `rows` | ✓ `multiline` |
| Survives an IME composition in `onChange` | Material Plus | ✓ | — |
| Five sizes | Material Plus | ✓ | Partial: `small`, `medium` |

### Exposed dropdown menu

[`MPSelect`](../components/inputs/select), [`MPCombobox`](../components/inputs/combobox)

| Feature | Defined by | Material Plus | Material UI |
| --- | --- | --- | --- |
| A field that opens a menu of options | M3 | ✓ `MPSelect` | ✓ `Select` |
| Filtering as you type | Material Plus | ✓ `MPCombobox` | ✓ `Autocomplete` |
| Multiple selection, shown as chips | Material Plus | ✓ `MPCombobox multiple` | ✓ |
| Option groups | Material Plus | — | ✓ `groupBy` |
| A value that is not in the list | Material Plus | ✓ `allowCustom` | ✓ `freeSolo` |

## Not implemented

The specification names these and this library has no component for them.

| Component | Defined by | Closest thing here | Material UI |
| --- | --- | --- | --- |
| Navigation rail | M3 (replaced in Expressive) | — | Partial: a "mini variant" drawer demo |
| Collapsed and expanded navigation rail | Expressive | — | — |
| Search bar and search view | M3 | [`MPCommandPalette`](../components/inputs/command-palette), a modal search | Partial: demos |
| Bottom app bar | M3 (replaced in Expressive) | — | Partial: a demo |
| Docked and floating toolbars | Expressive | [`MPToolbar`](../components/layout/toolbar) is a plain bar of controls | — |
| Split button | Expressive | — | Partial: a `ButtonGroup` demo |
| FAB menu | Expressive | [`MPMenu`](../components/inputs/menu) opened from the FAB | Partial: `SpeedDial` |
| Loading indicator | Expressive | [`MPProgressCircular`](../components/feedback/progress-circular) | — |

## Components the specification does not name

Each of these has its own page with the full props table.

### Inputs

| Component | Material UI |
| --- | --- |
| [`MPNumberField`](../components/inputs/number-field) | Partial: a Base UI composition in the docs, not exported |
| [`MPOtpField`](../components/inputs/otp-field) | — |
| [`MPColorPicker`](../components/inputs/color-picker) | — |
| [`MPFilePicker`](../components/inputs/file-picker) | — (an upload button demo) |
| [`MPTransfer`](../components/inputs/transfer) | Partial: a demo, not exported |
| [`MPTreeSelect`](../components/inputs/tree-select) | — |
| [`MPCommandPalette`](../components/inputs/command-palette) | — |
| [`MPRating`](../components/inputs/rating) | ✓ `Rating` |
| [`MPMenubar`](../components/inputs/menubar) | Partial: a Base UI composition in the docs |
| [`MPFieldset`](../components/inputs/fieldset) | Partial: `FormControl`, `FormGroup`, `FormLabel` |
| [`MPForm`](../components/inputs/form) | — |

### Display

| Component | Material UI |
| --- | --- |
| [`MPAvatar`](../components/display/avatar) | ✓ `Avatar`, `AvatarGroup` |
| [`MPBreadcrumb`](../components/display/breadcrumb) | ✓ `Breadcrumbs` |
| [`MPPagination`](../components/display/pagination) | ✓ `Pagination` |
| [`MPStepper`](../components/display/stepper) | ✓ `Stepper` |
| [`MPTable`](../components/display/table) | ✓ `Table` |
| [`MPDataTable`](../components/display/data-table) | ✓ `DataGrid` (MUI X; free, with paid Pro and Premium tiers) |
| [`MPTreeView`](../components/display/tree-view) | ✓ `SimpleTreeView`, `RichTreeView` (MUI X; free, Pro paid) |
| [`MPTimeline`](../components/display/timeline) | ✓ `Timeline` (`@mui/lab`) |
| [`MPTypography`](../components/display/typography) | Partial: `Typography`, on the MD2 scale |
| [`MPIcon`](../components/display/icon) | ✓ `Icon`, `SvgIcon` |
| [`MPTextLink`](../components/display/text-link) | ✓ `Link` |
| [`MPVisuallyHidden`](../components/display/visually-hidden) | Partial: the `visuallyHidden` style in `@mui/utils` |
| [`MPAnchor`](../components/display/anchor) | — |
| [`MPAppLogo`](../components/display/app-logo) | — |
| [`MPBlockquote`](../components/display/blockquote) | — |
| [`MPChatBubble`](../components/display/chat-bubble) | — (`@mui/x-chat` is in alpha) |
| [`MPCodeBlock`](../components/display/code-block) | — |
| [`MPDataList`](../components/display/data-list) | — |
| [`MPHighlight`](../components/display/highlight) | — |
| [`MPImage`](../components/display/image) | — |
| [`MPPill`](../components/display/pill) | — |
| [`MPShortcut`](../components/display/shortcut) | — |
| [`MPSpoiler`](../components/display/spoiler) | — |
| [`MPStatistic`](../components/display/statistic) | — |

### Feedback

| Component | Material UI |
| --- | --- |
| [`MPAlert`](../components/feedback/alert) | ✓ `Alert` |
| [`MPPopover`](../components/feedback/popover) | ✓ `Popover` |
| [`MPOverlay`](../components/feedback/overlay) | ✓ `Backdrop` |
| [`MPSkeleton`](../components/feedback/skeleton) | ✓ `Skeleton` |
| [`MPHoverCard`](../components/feedback/hover-card) | Partial: a `Tooltip` with interactive content |
| [`MPPopconfirm`](../components/feedback/popconfirm) | — |
| [`MPMeter`](../components/feedback/meter) | — |
| [`MPProgressBox`](../components/feedback/progress-box) | — |
| [`MPEmpty`](../components/feedback/empty) | — |
| [`MPTour`](../components/feedback/tour) | — |
| [`useMPConfirm`](../components/hooks/confirm) | — |

### Layout

| Component | Material UI |
| --- | --- |
| [`MPBox`](../components/layout/box) | ✓ `Box`, `Paper` |
| [`MPContainer`](../components/layout/container) | ✓ `Container` |
| [`MPGrid`](../components/layout/grid) | ✓ `Grid` |
| [`MPFlex`](../components/layout/flex) | ✓ `Stack` |
| [`MPAccordion`](../components/layout/accordion) | ✓ `Accordion` |
| [`MPPortal`](../components/layout/portal) | ✓ `Portal` |
| [`MPCollapsible`](../components/layout/collapsible) | Partial: the `Collapse` transition |
| [`MPToolbar`](../components/layout/toolbar) | Partial: `Toolbar`, a row inside an app bar |
| [`MPShow`](../components/layout/show) | Partial: `useMediaQuery` |
| [`MPStack`](../components/layout/stack) | — (Material UI's `Stack` is a flex row, not a pile) |
| [`MPAspectRatio`](../components/layout/aspect-ratio) | — |
| [`MPFooter`](../components/layout/footer) | — |
| [`MPNavigationMenu`](../components/layout/navigation-menu) | — |
| [`MPPageLayout`](../components/layout/page-layout) | — |
| [`MPPanes`](../components/layout/panes) | — |
| [`MPScrollArea`](../components/layout/scroll-area) | — |
| [`MPScrollZone`](../components/layout/scroll-zone) | — |
| [`MPMockup`](../components/layout/mockup) | — |

### Motion

| Component | Material UI |
| --- | --- |
| [`MPAnimateFade`](../components/transitions/animate-fade), [`MPAnimateGrow`](../components/transitions/animate-grow), [`MPAnimateSlide`](../components/transitions/animate-slide), [`MPAnimateZoom`](../components/transitions/animate-zoom) | ✓ `Fade`, `Grow`, `Slide`, `Zoom` |
| The other thirteen: [`MPAnimateAppear`](../components/transitions/animate-appear), [`MPAnimateBlink`](../components/transitions/animate-blink), [`MPAnimateCounter`](../components/transitions/animate-counter), [`MPAnimateFloat`](../components/transitions/animate-float), [`MPAnimateHeadline`](../components/transitions/animate-headline), [`MPAnimateLighting`](../components/transitions/animate-lighting), [`MPAnimateMarquee`](../components/transitions/animate-marquee), [`MPAnimateReveal`](../components/transitions/animate-reveal), [`MPAnimateRotate`](../components/transitions/animate-rotate), [`MPAnimateScramble`](../components/transitions/animate-scramble), [`MPAnimateShake`](../components/transitions/animate-shake), [`MPAnimateSplit`](../components/transitions/animate-split), [`MPAnimateTyping`](../components/transitions/animate-typing) | — |

### Charts

| Component | Material UI |
| --- | --- |
| [`MPLineChart`](../components/charts/line-chart) | ✓ `LineChart` (MUI X, free) |
| [`MPAreaChart`](../components/charts/area-chart) | ✓ `LineChart` with an area (MUI X, free) |
| [`MPBarChart`](../components/charts/bar-chart) | ✓ `BarChart` (MUI X, free) |
| [`MPPieChart`](../components/charts/pie-chart) | ✓ `PieChart` (MUI X, free) |
| [`MPScatterChart`](../components/charts/scatter-chart) | ✓ `ScatterChart` (MUI X, free) |
| [`MPSparkline`](../components/charts/sparkline) | ✓ `SparkLineChart` (MUI X, free) |
| [`MPGaugeChart`](../components/charts/gauge-chart) | ✓ `Gauge` (MUI X, free) |
| [`MPHeatmapChart`](../components/charts/heatmap-chart) | Partial: `Heatmap` (MUI X Pro, paid) |
| [`MPTimelineChart`](../components/charts/timeline-chart) | — |

## What Material UI has that this library leaves out

The tables above already list the filled text field, inset dividers, the interactive card and the modal pickers. Beyond those:

- `success`, `info` and `warning` colour intents. They are left out on purpose, because M3 has no roles to derive them from.
- Vertical tabs, and scroll buttons on a scrolling tab bar.
- The `buffer` and `query` modes of the linear progress bar.
- A multi-line field that grows with its content.
- `ImageList`, and `Masonry` in `@mui/lab`.

## Sources

- The M3 specification at [m3.material.io](https://m3.material.io/components), as published on 23 September 2026. The web status is on [its web page](https://m3.material.io/develop/web).
- The [Compose Material 3 release notes](https://developer.android.com/jetpack/androidx/releases/compose-material3), which show the Expressive pieces that have shipped and the ones still experimental.
- Material Web's [maintenance announcement](https://github.com/material-components/material-web/discussions/5642).
- Material UI's [overview](https://mui.com/material-ui/getting-started/) and [component list](https://mui.com/material-ui/all-components/), its API pages at version 9.4.0, the [M3 adoption issue](https://github.com/mui/material-ui/issues/29345) and the [MUI X licensing page](https://mui.com/x/introduction/licensing/).

This page is kept by hand. When a component gains or drops a feature, its row here has to change in the same pull request.

## Next

- [Design language](./design-language.md) — why the library follows the specification, and the places it knowingly goes past it.
- [Colour](./color.md) — the roles, and how to theme them.
- [Prop conventions](./prop-conventions.md) — the size ladder, density and elevation, axis by axis.
- [All components](../components/) — every component, one page each.
