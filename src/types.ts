/**
 * The prop vocabulary shared across Material Plus components.
 *
 * This library implements the Material Design specification rather than wrapping
 * somebody's implementation of it, so the rule is: **where the spec already has a
 * word, use the spec's word.** A colour role is `primary` or `on-surface-variant`
 * because that is what MD3 calls it, a corner is `extra-small`, a type role is
 * `body-large`.
 *
 * In particular they are *not* Material UI's words. MUI's palette is
 * `main`/`light`/`dark`/`contrastText`, which is a different and earlier colour
 * model; borrowing those names would describe a system this library does not
 * implement. See `src/styles.css` for the token side of the same decision.
 *
 * What lives here is only what a component actually needs in its props.
 */
import type * as React from 'react';

/**
 * The size ladder every control is drawn at.
 *
 * **This is the one place the library goes beyond the specification, knowingly.**
 * Material defines a single size per component — a text field is 56dp, full
 * stop — because it is describing a design system for whole products, where one
 * height per control is the point. A component library gets used in places a
 * design system does not plan for: a filter bar, a table's inline editor, a
 * dense settings page, a marketing hero. Those need a ladder, and a consumer
 * who cannot get one from the library builds it out of `!important`.
 *
 * So `md` **is** the spec's size, and the other four are ours. That is the whole
 * rule, and it is why the ladder is centred rather than starting at the spec's
 * value: `md` is what you get by saying nothing, and nobody has to know the
 * scale exists to be given the Material size.
 *
 * `xs` and `xl` are deliberately at the edges of usable rather than merely
 * smaller and larger — below `xs` a control stops meeting a 24px touch target,
 * and there is no sixth step because a ladder long enough to need one is a sign
 * the caller wants a custom control instead.
 */
export type MPSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * How tightly a component that holds other things is packed.
 *
 * Material's own scale, and Material's own numbers: `0` is the component at the
 * size it was asked for, and each step below it takes 4dp out. Nothing here
 * invents a word for that, because the specification already counts — and a
 * `'compact'` of this library's own would be a second name for a thing MD3 has
 * a name for, which is the one rule `MPSize` bends and nothing else should.
 *
 * ## It is not a second size ladder
 *
 * `size` picks which control this is: the height, the type role, and the padding
 * that follows from both. `density` takes room out of the one that was picked,
 * and takes it out of the **spacing only** — the type scale does not move. A
 * table at `-2` is the same words in less room rather than smaller words, which
 * is what a reader of a dense screen actually wants: more rows, at the size they
 * could already read.
 *
 * That is also why the two axes cannot be collapsed into one. `size="sm"` on a
 * list is a small list; `density={-2}` on a list is a normal list with more of
 * it on the screen. A single ladder would make those the same request.
 *
 * ## Where it stops
 *
 * A step that would take a control under 24px is not taken. That floor is the
 * one `MPSize` already names — below it a control stops meeting a touch target —
 * and clamping is the better of the three answers available: refusing the value
 * would make `density={-3}` an error on exactly the rung most likely to be given
 * it, and honouring it would ship a control nobody can hit.
 *
 * ## Only containers take it
 *
 * A button is one control at one height, and `size` is the axis it has. A list,
 * a table, a toolbar, a card — anything whose job is to hold a number of things
 * — changes character with how many of them fit on a screen, and that is the
 * question this answers.
 */
export type MPDensity = 0 | -1 | -2 | -3;

/**
 * How far off the page a surface is lifted.
 *
 * MD3's own levels, and all five of the raised ones. `0` is flat on the page,
 * `1` is where an elevated card and a resting elevated button sit, `2` is a menu
 * or a button under the pointer, `3` is a dialog, and `4` and `5` are there
 * because the specification defines them and a ladder with holes in it is worse
 * than no ladder at all.
 *
 * ## It moves the tone as well as the shadow
 *
 * Which is the whole reason this can exist here, and the reason a naive
 * `elevation` prop cannot. MD3 does not treat height as a free axis: an elevated
 * surface is `surface-container-low` **under** a level-1 shadow, and the tone
 * and the shadow are one decision rather than two. A prop that only cast a
 * shadow would raise a `filled` box into a surface the specification has no name
 * for — a raised object that is somehow still the flattest tone in the system.
 *
 * So each level names a surface role and the shadow that goes with it, which is
 * the pairing MD3 publishes:
 *
 * | `elevation` | Surface role                | Shadow   |
 * | ----------- | --------------------------- | -------- |
 * | `0`         | `surface`                   | none     |
 * | `1`         | `surface-container-low`     | level 1  |
 * | `2`         | `surface-container`         | level 2  |
 * | `3`         | `surface-container-high`    | level 3  |
 * | `4`         | `surface-container-high`    | level 4  |
 * | `5`         | `surface-container-highest` | level 5  |
 *
 * Four and five share a tone on purpose. The specification runs out of container
 * roles before it runs out of levels, and inventing a sixth tone to keep the
 * columns tidy would be inventing a colour role.
 *
 * ## Its relationship to `variant`
 *
 * `variant="elevated"` **is** `elevation={1}`, named. It stays because the
 * vocabulary is about emphasis — a caller choosing between `filled` and
 * `elevated` is choosing how loud a card is, not how many pixels it floats — and
 * because it is the answer nearly every raised surface wants.
 *
 * Given a level, the level decides the surface and `variant` is left holding
 * only its hairline: `outlined` keeps its border, and nothing else paints.
 * Anything else would be two props writing one `background-color`, and the
 * winner would depend on the order two class names happened to be generated in.
 */
export type MPElevation = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * An accent colour role.
 *
 * MD3's four, not Material UI's six: there is no `info`, `success` or `warning`
 * in the specification's colour system, and offering them would promise roles the
 * token sheet has no way to derive.
 */
export type MPColor = 'primary' | 'secondary' | 'tertiary' | 'error';

/**
 * Where a reading changes colour.
 *
 * The one place in this library where an accent family is *computed* rather than
 * chosen, and it lives here rather than inside whichever component needed it
 * first because more than one component reports the same reading. A meter and a
 * gauge are one quantity in two shapes, and a page carrying both must not
 * disagree about where the amber starts.
 *
 * Left to the caller this is a ternary at every call site, and the fourth one
 * would get it wrong.
 *
 * The families are still MD3's four. There is no `warning` in the specification,
 * so an amber band is `tertiary` under whatever source colour the page is
 * themed from — which is the honest answer, and the reason a threshold names a
 * role rather than a colour.
 */
export interface MPThreshold {
  /** The value from which this family applies, in the reading's own units. */
  from: number;
  /** What the reading turns at and above that point. */
  color: MPColor;
}

/**
 * How much of a surface a component paints.
 *
 * These are Material's own five button styles, in the order they get louder, and
 * the vocabulary is deliberately shared with the components that are not buttons
 * — a `filled` segmented button and a `filled` button are the same statement
 * about emphasis, made by two different controls.
 *
 * `elevated` is the odd one: it is a *tonal* surface that also casts a shadow,
 * and MD3 keeps it separate from `filled` precisely because a raised surface and
 * a saturated one solve the same problem two different ways. A component that has
 * no meaningful raised state simply does not offer it.
 */
export type MPVariant = 'filled' | 'tonal' | 'elevated' | 'outlined' | 'text';

/** Which way a set of controls runs. */
export type MPOrientation = 'horizontal' | 'vertical';

/**
 * Where something sits along an axis.
 *
 * `start` and `end` rather than `left` and `right`, for the same reason the icon
 * slots are `startIcon` and `endIcon`: the two words that name a physical side
 * swap meaning under RTL, and a divider whose label was pinned `left` would move
 * to the other end of the rule in Arabic without anybody asking it to.
 */
export type MPAlign = 'start' | 'center' | 'end';

/**
 * Which side of an anchor something is drawn on.
 *
 * These *are* physical sides, and deliberately so — this is the axis a popup
 * travels along, and Base UI's positioner takes the same four words. A tooltip
 * above its trigger is above it in every writing direction.
 */
export type MPSide = 'top' | 'right' | 'bottom' | 'left';

/**
 * Which corner of a box something is pinned to. Logical again: a badge sits at
 * the reading-end corner, which is the left one under RTL.
 */
export type MPCorner = 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';

/**
 * Where a point sits along the category axis.
 *
 * A string is a name and has no position of its own, so it takes the slot its
 * index gives it. A number or a `Date` is a place on a number line, which is
 * what lets a chart of readings taken at uneven times draw the gaps between
 * them rather than spacing them evenly and reporting a pause as a steady rate.
 */
export type MPChartCategory = string | number | Date;

/**
 * One value, and everything a chart might want to know about it.
 *
 * `y: null` is a **gap** rather than a zero — a sensor that was offline, a month
 * that has not closed. A line breaks across it, an area breaks with it, and a
 * bar is not drawn. That distinction is the whole reason a datum may be `null`
 * at all: a chart that draws missing data as zero reports an outage as a
 * collapse, and it does it in the one shape a reader trusts without checking.
 */
export interface MPChartPoint {
  /** The value. `null` is a gap. */
  y: number | null;
  /**
   * Its place on the category axis. Without one the point is placed by its
   * index, against the chart's `categories` if it was given any.
   */
  x?: MPChartCategory;
  /**
   * A second magnitude, for the marks that carry one — a bubble's radius, a
   * cell's weight. The charts with no use for it ignore it.
   */
  z?: number;
  /**
   * Overrides its series' colour for this one point: the slice worth pointing
   * at, the bar that went over budget. An `MPColor` family, or any CSS colour.
   */
  color?: MPColor | (string & {});
  /** What the tooltip, the table and any value label say in place of `y`. */
  label?: React.ReactNode;
}

/** A number, a gap, or a point with more to say about itself. */
export type MPChartDatum = number | null | MPChartPoint;

/**
 * One line, one band of bars, one ring of slices — the unit identity attaches
 * to.
 *
 * Colour follows the series and never its position in the drawing. Hiding
 * Europe has to leave Asia the colour it already was, so the palette slot comes
 * from where a series sits in this array rather than from how many of its
 * neighbours happen to be visible: a reader who learned that blue is Europe
 * learned something a re-render is not allowed to take back.
 */
export interface MPChartSeries {
  /**
   * Its name in the legend, the tooltip and the table. Two series or more
   * always draw a legend, so a series without a name is one the reader has no
   * way to tell from the others.
   */
  name?: string;
  /** Its values, in category order. */
  data: readonly MPChartDatum[];
  /**
   * Overrides the palette slot this series would take. An `MPColor` family, or
   * any CSS colour.
   *
   * The one place in this library where a colour is not a semantic role, and
   * deliberately so: a series is an *entity* — a region, a plan, a competitor —
   * and nothing about being one means success or danger. Reach for it to match
   * a brand, or to hold one entity's colour steady across two charts. Not to
   * say how a number should be felt.
   */
  color?: MPColor | (string & {});
  /**
   * Starts the series hidden. Only means anything beside an interactive legend,
   * which is what turns it back on.
   * @default false
   */
  hidden?: boolean;
}

/**
 * One span on a timeline — a stretch with two ends.
 *
 * Its own type rather than an `end` bolted onto `MPChartPoint`, because a
 * second position on the axis is a field the other seven charts would carry and
 * never read. The trade this file makes is that a name means one thing
 * everywhere, and a point that sometimes has an end and usually does not is the
 * opposite of that.
 *
 * `start` and `end` rather than `x` and `end`: a span has two places on the
 * axis, and naming one of them `x` only reads correctly to somebody who already
 * knows which one it is.
 */
export interface MPTimelineSpan {
  /** When it begins. A `Date`, or a number of milliseconds. */
  start: MPChartCategory;
  /** And when it is done. One that ends before it starts is drawn either way round. */
  end: MPChartCategory;
  /** What the span is called, in the hover panel and the table. */
  label?: React.ReactNode;
  /** Overrides its row's colour for this one span. */
  color?: MPColor | (string & {});
}

/**
 * One row of a timeline, and everything on it.
 *
 * A row is a series — one entity, one name, one colour — but its data are spans
 * rather than values, so it cannot be an `MPChartSeries`. There is no `hidden`
 * here and no legend to pair one with: a timeline's rows **are** its category
 * axis, already named down the side, and a twenty-entry legend restating them
 * is not a filter anybody wants.
 */
export interface MPTimelineSeries {
  /** Its name on the axis, in the hover panel and in the table. */
  name?: string;
  /** The spans on this row. Overlapping ones are drawn over each other. */
  data: readonly MPTimelineSpan[];
  /** Overrides the palette slot this row would otherwise take. */
  color?: MPColor | (string & {});
}

/** How a line gets from one point to the next. */
export type MPChartCurve = 'linear' | 'smooth' | 'step';

/**
 * Which values are written onto the marks themselves.
 *
 * `none` by default everywhere, which is not timidity: a number beside every
 * point is the most reliable way to make a chart unreadable. Label the last one
 * or the two extremes, and let the axis and the hover layer carry the rest.
 * `all` is there for the eight-bar chart where it genuinely is the answer.
 */
export type MPChartValueLabels = 'none' | 'last' | 'extremes' | 'all';

/**
 * What the pointer uncovers.
 *
 * - `index` — every series at the category under the pointer, with a crosshair
 *   dropped through it. The default wherever the series share an x, because the
 *   question a line chart is asked is "what happened in March" and not "what is
 *   this pixel".
 * - `item` — the one mark being pointed at.
 * - `none` — nothing, and then the numbers have to be readable some other way.
 *   The table under every chart is that way.
 */
export type MPChartTooltipMode = 'index' | 'item' | 'none';

/** One series' answer at the category the pointer is resting on. */
export interface MPChartTooltipItem {
  /** Its place in the `series` array — the same index its colour came from. */
  seriesIndex: number;
  name?: string;
  color: string;
  value: number | null;
  /** `value`, written the way this chart writes numbers. */
  formatted: string;
  /** What the point called itself, if it said. */
  label?: React.ReactNode;
}

/** What a replacement tooltip is handed. */
export interface MPChartTooltipContext {
  index: number;
  category: MPChartCategory;
  /** Only the series that are visible and have a value here. */
  items: readonly MPChartTooltipItem[];
}

/** The hover layer, where `true` and `false` are not enough. */
export interface MPChartTooltip {
  /** @default 'index', or 'item' where the marks are not arranged in columns */
  mode?: MPChartTooltipMode;
  /**
   * The line dropped through the plot at the active category. On in `index`
   * mode and never drawn in `item` mode: a crosshair says "these numbers all
   * belong to this column", and where there is no column it is a line through
   * one dot.
   * @default true
   */
  crosshair?: boolean;
  /** Draws the panel yourself. The frame still decides when it opens and where. */
  render?: (context: MPChartTooltipContext) => React.ReactNode;
}

/**
 * One of a chart's two axes.
 *
 * `xAxis` is the category axis and `yAxis` is the value axis on every chart and
 * in both orientations. Turning a bar chart on its side changes the drawing and
 * not what the caller's data means, so it must not also move their axis options
 * from one prop to the other.
 */
export interface MPChartAxis {
  /**
   * Leaves it undrawn — its rule, its ticks and its labels — and gives the room
   * back to the plot.
   */
  hidden?: boolean;
  /** A name for what it measures, set beside it. */
  label?: React.ReactNode;
  /**
   * The gridlines it casts across the plot. On for the value axis and off for
   * the category axis, which is the one arrangement that helps a value be read
   * without turning the plot into graph paper.
   */
  grid?: boolean;
  /**
   * Where the scale starts and ends. Taken from the data otherwise, and from
   * zero on the value axis — a bar's length is proportional to its value only
   * when the baseline is zero. Set `min` where zero genuinely is not it.
   */
  min?: number;
  max?: number;
  /**
   * Roughly how many ticks. The scale still rounds them to numbers a reader can
   * do arithmetic on, so this is a target and not a count.
   */
  tickCount?: number;
  /** How a tick is written, overriding the chart's own `format`. */
  tickFormat?: (value: MPChartCategory, index: number) => React.ReactNode;
  /**
   * How much room it keeps for its ticks and its label, in pixels. Measured off
   * the ticks themselves otherwise. Set it when a long category name needs
   * more, or when two charts stacked on a dashboard have to line their plots up.
   */
  thickness?: number;
}

/** Where the legend sits, and what it does when it is used. */
export interface MPChartLegend {
  /** Which edge of the plot. @default 'bottom' */
  side?: MPSide;
  /** Where along that edge. @default 'center' */
  align?: MPAlign;
  /**
   * Clicking an entry hides and shows its series, and hovering one dims the
   * rest.
   * @default true
   */
  interactive?: boolean;
  /**
   * Writes each series' value at the active category beside its name.
   * @default false
   */
  showValue?: boolean;
}

/**
 * Which day a week is drawn as starting on. `0` is Sunday, the way `Date`
 * counts.
 *
 * `Date`'s numbering rather than a nicer set of words, and rather than CLDR's —
 * which counts Monday as 1 through Sunday as 7. Every calendar in this library
 * is built out of `getDay()`, so a second numbering would be a conversion at
 * every comparison, and an off-by-one there is a week drawn one column out.
 *
 * Left unset, a picker asks `Intl` what the locale does: Sunday in the US and
 * Korea, Monday across most of Europe, Saturday in much of the Middle East.
 */
export type MPWeekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * How something sits in the page's scroll.
 *
 * CSS's own four values, because this is CSS's own question and a second
 * spelling for `fixed` would be a word a caller has to translate. `sticky` and
 * `fixed` are what a bar pinned to an edge of the window wants; `absolute` pins
 * a thing to a *region* instead — a button in a card, in a map, in a preview —
 * and is the one that makes a floating control usable anywhere but the window.
 */
export type MPPosition = 'static' | 'absolute' | 'sticky' | 'fixed';

/**
 * How wide the window is, in Material's own words.
 *
 * MD3 does not describe a layout in pixels, it describes it in **window size
 * classes**: `compact` below 600dp, `medium` from 600, `expanded` from 840,
 * `large` from 1200, `extra-large` from 1600. They are the axis the
 * specification's layout grid changes along — four columns in a compact window,
 * twelve from medium up — and so they are the axis this library's grid changes
 * along too.
 *
 * **They are deliberately not Tailwind's breakpoints.** Tailwind changes at
 * 640/768/1024/1280, which are different numbers describing the same idea, and a
 * `<MPGrid>` that reflowed at one set while the `md:` utility beside it reflowed
 * at another would be a layout that is subtly wrong at exactly one width and
 * impossible to reason about at every other. Given two ladders, the library
 * takes the one the specification defines — see
 * `docs/{locale}/components/layout/grid.md` for how to line the other one up
 * with it.
 */
export type MPWindowClass = 'compact' | 'medium' | 'expanded' | 'large' | 'extra-large';

/**
 * A value, or the same value said differently at each window size class.
 *
 * `span={6}` is six columns at every width; `span={{ compact: 12, medium: 6 }}`
 * is the whole row on a phone and half of it from 600dp up. Each entry applies
 * from its own class **upward**, so a layout is usually two entries rather than
 * five — anything not named keeps whatever the class below it said.
 */
export type MPResponsive<T> = T | Partial<Record<MPWindowClass, T>>;

/**
 * How wide content is allowed to get.
 *
 * Two vocabularies in one prop, because a measure is asked for in two different
 * ways and neither covers the other.
 *
 * A **rung of the size ladder** is the common one, and it is pinned to the
 * window size classes rather than to the type scale: `maxWidth="md"` is "never
 * wider than an expanded window", which is a sentence about the specification
 * rather than a number somebody liked. `xs` is one rung below the ladder, at
 * 480dp, for the column of a form or a sign-in card.
 *
 * A **CSS length** is the other: `'60ch'`, `'42rem'`, `'800px'`, or anything else
 * `max-width` takes. A measure is often a decision about the text rather than
 * about the window — the classic answer is around 60 characters, which no ladder
 * of window widths can spell — and a library that only offered its own five
 * rungs would be making every one of those callers write a `className` to undo
 * one it did not want.
 *
 * `'none'` is neither, and is what nearly every component means by default: no
 * limit at all.
 *
 * The value is not validated. An unusable length reaches `max-width`, which
 * ignores what it cannot parse and leaves the element unbounded — the same
 * answer `'none'` gives, and a better one than a component that renders nothing
 * because a unit was mistyped.
 */
export type MPMeasure = MPSize | 'none' | (string & {});

/**
 * A class name per part, for the parts a `className` cannot reach.
 *
 * `className` lands on a component's **root**, and for most components that is
 * the whole story: one element, one class list, merged with the component's own.
 * A few draw parts that no selector written against the root will ever find,
 * because they are not under it — a select's popup, a dialog's backdrop, a
 * tooltip's bubble all render at the end of `<body>`. Those are what this is
 * for.
 *
 * ## There is never a `root` key
 *
 * `className` is the root, on every component. A second spelling of it is
 * exactly the drift the prop conventions exist to prevent, and a caller reading
 * two names for one thing has to work out which one wins.
 *
 * ## The part classes are still there
 *
 * Every part this library draws already carries a BEM-style class of its own —
 * `mp-select__popup`, `mp-dialog__backdrop` — and a stylesheet of your own can
 * always select those. This prop is for the other path: a class written at the
 * call site, generated in the same Tailwind pass as the component's, which is
 * the only way a *utility* can reach a part.
 *
 * The names are shared where the parts are: `popup` is the same idea on a
 * select, a menu and a popover. What each component adds beyond that is on its
 * own page.
 */
export type MPSlots<Slot extends string> = Partial<Record<Slot, string>>;

/**
 * The axes most components share.
 *
 * A component extends this and adds only what is genuinely its own, which is what
 * keeps `size="md"` meaning the same thing on every one of them. The rule for
 * adding to this interface is the same as the rule for adding a token: an axis
 * arrives when a second component needs it, not in anticipation of one.
 */
export interface MPStyleProps {
  /**
   * The control's height and type scale.
   * @default 'md'
   */
  size?: MPSize;
  /** Stretches the control to the width of its container. */
  fullWidth?: boolean;
}

/**
 * The raw events a control produces, for the handling its own callbacks do not
 * cover.
 *
 * Every control here reports what it is *for* — an `MPTextField` hands over its
 * text, an `MPSelect` its choice, an `MPDatePicker` its day — and that named
 * callback is what a caller should reach for first. These are the other half:
 * the keystroke that was not a change, the combination that means something to
 * the page rather than to the field, the right-click that opens a menu of your
 * own.
 *
 * ## They go on the control, not on the box
 *
 * Which is the opposite of where `className` goes, and for the reason that
 * makes them different questions: a class describes the whole thing, and an
 * event came from one element. So `onKeyDown` is a keystroke that landed in the
 * field and never one that landed on the reveal toggle beside it, and `onFocus`
 * is the control taking focus rather than anything in the row taking it.
 *
 * A `<div onKeyDown>` wrapped around a control gets some of this by bubbling,
 * and that is what a caller had to write before. What it cannot do is go
 * *first*.
 *
 * ## Yours runs first
 *
 * And a control that has its own answer for a key checks `defaultPrevented`
 * before giving it. That is what makes `event.preventDefault()` a real answer
 * rather than a suggestion: Ctrl+Enter can send a message without the field
 * also reporting the plain submission it would otherwise have seen.
 *
 * `Element` is whichever element the component says it puts these on — an
 * `<input>`, a trigger button — so `event.currentTarget` is typed as the thing
 * it actually is.
 */
export interface MPControlEventProps<Element extends HTMLElement = HTMLElement> {
  /**
   * Every keystroke that reaches the control, modifiers included — which makes
   * this the one to reach for for a combination. It is also the only one of
   * these where `preventDefault` still means anything.
   */
  onKeyDown?: React.KeyboardEventHandler<Element>;
  /** The same keystroke released. */
  onKeyUp?: React.KeyboardEventHandler<Element>;
  /**
   * The control took the focus.
   *
   * On the control itself rather than on the row, so it does not fire again for
   * the button beside it — and it is what a form library wants for its "touched"
   * bookkeeping, together with `onBlur`.
   */
  onFocus?: React.FocusEventHandler<Element>;
  /** The control lost it. */
  onBlur?: React.FocusEventHandler<Element>;
  /** A press. The component's own answer to a press still happens. */
  onClick?: React.MouseEventHandler<Element>;
  /** Two presses. Selecting a field's whole value is the usual reason. */
  onDoubleClick?: React.MouseEventHandler<Element>;
  /**
   * The right-click, or whatever opens a context menu on the platform.
   * `event.preventDefault()` is how the browser's own menu is replaced with one
   * of yours.
   */
  onContextMenu?: React.MouseEventHandler<Element>;
}

/**
 * The props a glyph component is handed when Material Plus renders one.
 *
 * Deliberately the shape `lucide-react` icons already take, which is also the
 * shape most icon sets settle on — a size, a colour and a stroke. Any component
 * accepting these can be passed as an `icon`, so an application is not tied to
 * the set this library happens to depend on.
 */
export interface MPIconGlyphProps {
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
  className?: string;
  [key: string]: unknown;
}

/**
 * Something that can be drawn as an icon.
 *
 * Two forms, because icon sets hand back two different things:
 *
 * - **A component** — `<MPIcon icon={ICONS.close} />`. This is what
 *   `lucide-react`, `react-icons` and most sets export, and it is the form that
 *   lets `MPIcon` pass a size and a colour *into* the glyph rather than trying
 *   to style an element from the outside.
 * - **An element** — `<MPIcon icon={<svg>…</svg>} />`. A drawing of your own, a
 *   glyph another set has already constructed, an `<img>`. It is sized by
 *   the box it is laid into.
 *
 * Note that this is *not* `React.ReactNode`. A component and an element are
 * rendered differently, and the distinction has to survive into the type or a
 * caller passing `ICONS.close` would be told to pass `<ICONS.close />` instead.
 */
export type MPIconGlyph = React.ComponentType<MPIconGlyphProps> | React.ReactElement;

/**
 * A Material easing curve, by the specification's own name.
 *
 * These are MD3's motion easing set and nothing else — no arbitrary
 * `cubic-bezier()`, for the same reason `color` takes a family rather than a
 * colour: to change what `emphasized` *is*, set
 * `--mp-sys-motion-easing-emphasized` and every animation in the page moves
 * together. A curve written into one component's props is a curve the theme
 * cannot reach.
 *
 * The pairs are how Material describes a transition rather than four
 * interchangeable options. Something **arriving** decelerates into place;
 * something **leaving** accelerates away; `standard` is for a change that is
 * neither, and `linear` for a loop that has no beginning to arrive at.
 *
 * A note on `emphasized`: the specification's own emphasized curve is two
 * curves joined in the middle, which CSS has no single value for. MD3's web
 * implementation publishes a one-curve stand-in, and that is what the token
 * carries here. Where the halves matter — a line arriving as another leaves —
 * the two `emphasized-*` names are the halves, and they are what the components
 * reach for.
 */
export type MPEasing =
  | 'linear'
  | 'standard'
  | 'standard-decelerate'
  | 'standard-accelerate'
  | 'emphasized'
  | 'emphasized-decelerate'
  | 'emphasized-accelerate';

/**
 * The seven effects the `MPAnimate*` components are built out of.
 *
 * Named after what a reader sees rather than after the CSS property underneath:
 * `zoom` and `grow` are both a change of scale, and they are two words because
 * they are two *gestures* — one arrives from the middle of where it will end
 * up, the other unfolds from an edge of it.
 *
 * Everything past these seven is a component rather than a value. A marquee that
 * duplicates its children, a headline that swaps between them, a typewriter
 * that counts characters — none of those can be a class name and a few numbers.
 */
export type MPAnimation = 'fade' | 'grow' | 'slide' | 'zoom' | 'rotate' | 'blink' | 'reveal';

/**
 * An entrance, on a component that displays something.
 *
 * A bare effect name is the whole of what most callers want —
 * `transition="fade"` — and the object form is there for the rest: a different
 * duration, a slide from another edge, a zoom that starts closer in.
 *
 * ## It runs on mount, once
 *
 * There is no `trigger`, no `repeat` and no scroll timeline here, and their
 * absence is the design. Those are what the `MPAnimate*` components are, and a
 * prop offering half of them would be a second, worse spelling of machinery that
 * already exists. The moment the answer is "when it scrolls into view", the
 * wrapper is the right tool.
 *
 * ## Why the prop exists at all, then
 *
 * Because wrapping is the wrong shape twice. A component that lays its children
 * into boxes of its own — `MPStack` — puts them somewhere nothing outside can
 * reach, so a per-item entrance is only expressible from inside. And wrapping
 * every card of a grid costs a second element per card, which a
 * `display: contents` wrapper cannot avoid: an element that generates no box has
 * nothing to animate.
 *
 * It is on the components that **display** something and on none of the
 * controls. That is a cost decision as much as a taste one — see
 * `internal/transition.ts` — and the taste half is that a button arriving with a
 * flourish is a page's decision about a region, made with a wrapper, rather than
 * something every button in the library should carry the tables for.
 */
export type MPTransition = MPAnimation | MPTransitionOptions;

/** What a `transition` takes when a bare effect name is not enough. */
export interface MPTransitionOptions {
  /** Which of the seven effects runs. */
  effect: MPAnimation;
  /** How long it takes, in milliseconds. Unset takes the effect's own token. */
  duration?: number;
  /**
   * How long before it starts, in milliseconds.
   * @default 0
   */
  delay?: number;
  /** Which Material easing curve it runs on. */
  easing?: MPEasing;
  /**
   * Whether it fades in as it arrives. Every effect does unless told not to,
   * because an entrance that only moves reads as a jump.
   * @default true
   */
  fade?: boolean;
  /** How far a `slide` travels: a CSS length, or a percentage of the element. */
  distance?: number | string;
  /**
   * Which edge a `slide` comes from, or a `reveal` is wiped from.
   * @default 'bottom' for `slide`, 'left' for `reveal`
   */
  from?: MPSide;
  /** Where a `grow` or a `zoom` starts, as a scale. */
  scale?: number;
  /**
   * How far a `rotate` turns from, in degrees.
   * @default -180
   */
  angle?: number;
}

/**
 * What makes an animation run.
 *
 * - `mount` — as soon as it is on the page. The default, and the only one that
 *   needs nothing from the caller.
 * - `visible` — when it is scrolled into view. Once, unless `once` is off.
 * - `hover` — while the pointer is on it, starting again on each entry.
 *   Keyboard focus counts, or the effect would be unreachable without a mouse.
 * - `manual` — never on its own. `play` is what runs it.
 */
export type MPAnimateTrigger = 'mount' | 'visible' | 'hover' | 'manual';

/**
 * Whether an effect brings its content in or takes it away.
 *
 * The two are not the same length in Material: an entrance is given room to be
 * read as an arrival, an exit gets out of the way. That asymmetry is what the
 * default durations carry, so `mode="out"` is quicker than `mode="in"` without
 * anybody having to know the numbers.
 */
export type MPAnimateMode = 'in' | 'out';

/**
 * How many times an animation runs. `'infinite'` rather than `Infinity`,
 * because it is written into CSS as that word and a caller who typed the number
 * would be surprised by which one worked.
 */
export type MPAnimateRepeat = number | 'infinite';

/**
 * The settings every `MPAnimate*` component takes, and the reason they are one
 * interface: a `delay` of 200 has to mean the same thing on a fade and on a
 * marquee, exactly as `size="md"` means one height everywhere.
 *
 * Durations and delays are milliseconds — numbers, not CSS strings. A prop
 * typed `string` invites `'0.4s'`, and then two components on one screen are
 * written in two units.
 */
export interface MPAnimateProps {
  /**
   * How long one run takes, in milliseconds. Left unset, the effect takes its
   * own Material duration token — which is what a theme changes.
   */
  duration?: number;
  /**
   * How long before it starts, in milliseconds.
   * @default 0
   */
  delay?: number;
  /** Which Material easing curve it runs on. */
  easing?: MPEasing;
  /**
   * How many times it runs.
   * @default 1
   */
  repeat?: MPAnimateRepeat;
  /** Runs every other pass backwards, so a repeat returns instead of jumping. */
  alternate?: boolean;
  /**
   * Holds the animation where it is.
   * @default false
   */
  paused?: boolean;
  /**
   * What starts it.
   * @default 'mount'
   */
  trigger?: MPAnimateTrigger;
  /** Runs it, when `trigger` is `manual`. Each `false` → `true` starts it over. */
  play?: boolean;
  /**
   * With `trigger="visible"`, whether it runs only the first time. Off, it runs
   * again every time the element comes back into view.
   * @default true
   */
  once?: boolean;
  /**
   * With `trigger="visible"`, how much of the element has to be on screen
   * before it counts as visible, from `0` to `1`.
   * @default 0.2
   */
  threshold?: number;
}

/**
 * Spreading one effect across a set rather than playing it on the box.
 *
 * Three props rather than an `MPAnimateStagger` component, and that is the
 * whole design: a list settling in is not a different effect from a fade, it is
 * the same fade told when to start. A wrapper component would be a second
 * spelling of something the effects already do, and a caller would have to
 * choose between "fade" and "fade one at a time" at the import.
 *
 * They belong to the effects that are **one `@keyframes` on the element
 * itself**, which is these six. `MPAnimateMarquee` duplicates its children,
 * `MPAnimateHeadline` swaps between them and `MPAnimateTyping` counts their
 * characters; none of the three can hand an arbitrary child an animation, and
 * `MPAnimateLighting` puts its movement on a pseudo-element that a child has
 * no equivalent of. `MPAnimateAppear` is this with `stagger` already on and a
 * default of 80ms, and runs on the same code.
 */
/**
 * What drives an effect: a clock, or the reader's own scrolling.
 *
 * `auto` is `document.timeline` — the animation runs for its `duration` once
 * something starts it, which is what every effect here has always done.
 *
 * `view` hands the animation to CSS's `view()` timeline, so its progress *is*
 * the element's progress through the scrollport. Scrolling back runs it
 * backwards, and stopping halfway leaves it halfway: it is the same keyframe,
 * driven by a position instead of by time.
 */
export type MPAnimateTimeline = 'auto' | 'view';

/**
 * Scroll-driven playback, on the effects that are one `@keyframes` on the
 * element itself.
 *
 * Two props rather than a component, for the reason the stagger ones are: this
 * is not a different effect, it is the same effect on a different clock. Every
 * one of the six gets it, and a component that has to know what its children
 * *are* gets none of it.
 */
export interface MPAnimateTimelineProps {
  /**
   * What drives it.
   *
   * On `view`, three of the props above stop meaning anything: `duration`,
   * `delay` and `repeat` are the clock's units and there is no clock. So is
   * `trigger` — the scroll position *is* the trigger — and the animation is
   * held `running` for it, because a paused scroll-driven animation shows
   * nothing at all. An explicit `paused` is still honoured; it is the one of
   * the four that is a caller saying stop rather than a default.
   *
   * A browser without `view()` falls back to the clock, and the effect plays
   * once the way it always did. Degraded rather than blank, which is the whole
   * reason the declaration is behind an `@supports`.
   * @default 'auto'
   */
  timeline?: MPAnimateTimeline;
  /**
   * Which part of the element's travel through the scrollport the animation is
   * spread over — any CSS `animation-range`. Only read on `timeline="view"`.
   *
   * The default runs from the moment the element's leading edge appears to a
   * little under halfway across, so it has finished arriving by the time it is
   * somewhere a reader would be looking at it. A range that ended at the far
   * edge would leave everything on the page permanently mid-animation.
   * @default 'entry 0% cover 45%'
   */
  range?: string;
}

export interface MPAnimateStaggerProps {
  /**
   * How long after one child the next one starts, in milliseconds.
   *
   * This is what turns the effect into a per-child one. At `0` — the default —
   * the box itself animates, which is what these components have always done
   * and what is right for a single subject.
   *
   * The step is per **child**, so what you pass matters: eight children are
   * eight steps and one child holding eight things is one step. That is also
   * how to opt part of a set out — group it.
   * @default 0
   */
  stagger?: number;
  /**
   * How much longer each child takes than the one before it, in milliseconds.
   * Negative shortens instead, clamped at zero. Only read alongside `stagger`.
   * @default 0
   */
  durationStep?: number;
  /**
   * Runs the set from the last child to the first. Only the order is reversed —
   * each child still plays forwards, which is what separates this from
   * `mode="out"`.
   * @default false
   */
  reverse?: boolean;
}
