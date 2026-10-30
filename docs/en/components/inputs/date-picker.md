---
title: MPDatePicker
order: 2
---

# MPDatePicker

<p class="mp-lede">One day, chosen from a calendar. The trigger is a text field's shell wearing a calendar glyph, so a date field in a form is the same object as the fields around it.</p>

<Demo src="date-picker/hero" :minHeight="96" />

::: fw react

```tsx
import { MPDatePicker } from 'material-plus-ui';

const [due, setDue] = useState(null);

<MPDatePicker label="Due date" value={due} onValueChange={setDue} />;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPDatePicker(
  label: const Text('Due date'),
  value: due,
  onChanged: (DateTime? next) => setState(() => due = next),
);
```

The calendar lifts itself out of the tree, so a picker needs an `Overlay` above it; `WidgetsApp` with a navigator provides one.

:::

## Props

<PropsTable name="MPDatePicker" />

::: fw flutter

The trigger is built on the same field shell as `MPTextField`, from `package:flutter/widgets.dart` alone, so it works in an app with no `MaterialApp` above it. What does not carry across from the React package is in [differences from the React build](#differences-from-the-react-build).

### MPDateNames

The words and shapes a picker writes dates with. See [localisation](#localisation) for when you would build one.

<PropsTable name="MPDateNames" />

:::

## What the calendar is actually for

Its header.

A picker that only steps a month at a time puts a birthday thirty years back a hundred and eighty clicks away. So the month name and the year are each a **button** that opens a grid of its own — twelve months, then twelve years at a time. Any month of the year on screen is two clicks; any year at all is three.

The three views are deliberately the same width _and_ the same height. The day view is seven rows counting its header, and the other two stretch four rows and three rows across that same height, so switching view never resizes the popup under the pointer that opened it.

Stepping a month **turns the page**: the arriving weeks come in from the side they were fetched from and settle. A grid that swapped in place said which month it was in the header and nothing at all about which way the reader had gone, on a control whose whole job is moving between them.

Only the weeks turn. The weekday names above them do not change from one month to the next, and a Monday sliding in to become Monday is motion that says something happened when nothing did.

A reader who has asked for less motion gets the swap, which loses the direction and nothing else.

## A day, a month, or a year

`precision` decides which of the three the calendar stops at.

<Demo src="date-picker/precision" :minHeight="420">

::: fw react

<<< @/.vitepress/demos/date-picker/precision.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/date_picker/precision.dart

:::

</Demo>

A card's expiry, a fiscal year, the month a report covers — the questions where a day is not something the reader has to give, and where a control that asked for one anyway would be recording an answer nobody meant.

It stops by **leaving the finer views out** rather than by refusing them. A `month` picker opens on the grid of twelve months and has no day grid to reach through; a `year` picker opens on the years. The view _above_ the one it answers with is still there, because that is how the other years are reached: pressing the year on a month picker opens the page of years, and choosing one comes back to the months.

What follows the precision with it:

|                         | `'day'`         | `'month'`                | `'year'`      |
| ----------------------- | --------------- | ------------------------ | ------------- |
| The value               | the day pressed | the **1st** of the month | **1 January** |
| The trigger, by default | `Jul 15, 2026`  | `July 2026`              | `2026`        |
| `name` submits          | `2026-07-15`    | `2026-07`                | `2026`        |
| The footer's shortcut   | Today           | This month               | This year     |

::: fw flutter

In Flutter the `name` row is what an [MPForm](./form) hands its `onSubmit` under the picker's `name`. The `DateTime` itself arrives through `onChanged`.

:::

The value is trimmed to the unit because it stands for the unit. A picker whose trigger says _July 2026_ and whose form submits the 31st is printing one thing and sending another. The time of day survives, exactly as it does at day precision.

`minDate` and `maxDate` are read at the precision too: a minimum of 10 July still leaves July pickable on a month picker, because there the bound is about which months exist. `shouldDisableDate` is the one thing that does **not** carry over — it is asked about days, and a rule written about weekends has no answer for "is July available". Inventing one out of the 1st would block whichever months happened to start on a Sunday, so a coarser picker never consults it.

## No date library, and no typing

Two decisions that are really one.

::: fw react

**There is no date library under this.** The whole of the arithmetic is `Date`, and every name a picker draws comes from `Intl`. A component library that quietly added `date-fns` — or worse, picked a side in the dayjs/luxon/Temporal argument on its consumer's behalf — would have made a decision that was not its to make. A picker adds nothing to what the package already installs.

:::

::: fw flutter

**There is no date library under this.** The whole of the arithmetic is `DateTime`, and the names come from tables the package carries. A component library that quietly added `package:intl`, or picked a side between the date packages on its consumer's behalf, would have made a decision that was not its to make. The Flutter package has no dependencies beyond the framework, and a picker adds none.

:::

**And you cannot type into the trigger.** Parsing a date out of free text is locale-dependent in a way that cannot be done honestly without one: `27/7/26` is three different days depending on who is reading it. A field that understands it in one browser and not the next is worse than one that never claimed to. So the trigger is a button, exactly as a [select](./select)'s is, and the calendar is where the answer comes from.

## Localisation

Everything that moves comes from the platform.

<Demo src="date-picker/locale" :minHeight="480">

::: fw react

<<< @/.vitepress/demos/date-picker/locale.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/date_picker/locale.dart

:::

</Demo>

::: fw react

`Intl` supplies the month names, the weekday initials, which day the week starts on (Sunday in the US and Korea, Monday across most of Europe), the order of the header's two buttons — `July 2026` against `2026년 7월` — and how the trigger writes the date. Getting that order wrong is subtle and reads as broken to exactly the readers it is wrong for, so it is asked for rather than guessed at.

The only strings this library supplies are the ones `Intl` has no opinion about: "Previous month", "Today", "Clear". Those are translated for eighteen languages, fall back to English for anything else, and are overridable one at a time with `labels`. The whole of it is on the [Localisation](../../design/localization) page.

:::

::: fw flutter

The Flutter framework has no `Intl`, so the package carries what it would have said. For each of the eighteen languages it ships words for, and English, there is a table of month and weekday names, AM and PM, which day the week starts on (Sunday in the US and Korea, Monday across most of Europe), whether the clock is a 12-hour one, the order of the header's two buttons (`July 2026` against `2026년 7월`) and the shapes a date and a time are written in. The tables were generated from the CLDR data ICU ships, by asking `Intl.DateTimeFormat` the questions the React package asks it at run time, so a trigger writes `2026. 7. 15.` in Korean and `15.07.2026` in German in both packages.

The table is picked by the same tag as the words: the picker's `locale`, then the nearest `MPLocaleProvider`, then `MPConfigProvider`, then the app's own `Localizations`. A language without a table is English. The words ("Previous month", "Today", "Clear") still come from the tables handed to `registerMPMessages`, and are overridable one at a time with `labels`.

Two things are always the same whatever the language: the digits are Western, and the calendar is Gregorian. An Arabic date is written `15/07/2026` with Western digits rather than in Arabic-Indic ones, and a Thai year is the Gregorian year rather than the Buddhist era's.

For a language or a region the package does not carry, pass `names`. Only the language decides which table is read, so `en-GB` gets the United States' Sunday-first week and 12-hour clock unless you say otherwise:

```dart
MPDatePicker(
  locale: 'en-GB',
  names: MPDateNames.english.copyWith(
    firstDayOfWeek: MPWeekday.monday,
    hour12: false,
    patterns: const MPDatePatterns(
      fullDate: 'EEEE d MMMM y',
      mediumDate: 'd MMM y',
      time24: 'HH:mm',
    ),
  ),
  value: due,
  onChanged: (DateTime? next) => setState(() => due = next),
);
```

The patterns are ICU's letters (`y`, `M` to `MMMM`, `d`, `E`, `h`, `H`, `mm`, `a`, and literals in single quotes); [MPDateNames](#mpdatenames) lists the rest. An app that already depends on `package:intl` can fill the name lists from `DateFormat.LLLL(tag)`, `DateFormat.EEEE(tag)` and the rest, a line each.

:::

## Bounds

<Demo src="date-picker/bounds" :minHeight="300">

::: fw react

<<< @/.vitepress/demos/date-picker/bounds.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/date_picker/bounds.dart

:::

</Demo>

`minDate` and `maxDate` are **day-granular** here: a maximum of 27 July at 09:00 still leaves the 27th pickable, because the bound is about which days exist and the time of day is a clock's problem. [`MPDateTimePicker`](./date-time-picker) reads the same props at full precision, which is the one real difference between the two.

`shouldDisableDate` blocks whatever a rule says — weekends, holidays, a room already booked.

Every blocked day is still **drawn**, and none of them leaves the focus order. A grid with holes in it is a grid a reader arrowing across a month falls into, and "this day does not exist" and "this day is not for you" are different claims.

## Examples

### The time of day survives a change of date

Choosing a day changes the day and nothing else. A picker bound to a field that also carries a time should not silently reset it to midnight every time the date is corrected:

::: fw react

```tsx
// value is 10 July at 14:30; choosing the 15th gives 15 July at 14:30.
<MPDatePicker value={value} onValueChange={setValue} />
```

:::

::: fw flutter

```dart
// value is 10 July at 14:30; choosing the 15th gives 15 July at 14:30.
MPDatePicker(value: value, onChanged: (DateTime? next) => setState(() => value = next));
```

:::

### floatingLabel

Every notched control in this library rests its label on its own line while there is nothing to make room for — see [MPTextField](./text-field#floatinglabel). A picker is the exception in practice, because it draws a calendar glyph exactly where a resting label would stand, and of the two the glyph is what says the trigger opens a calendar.

So the label stays in the notch unless the glyph is asked away:

::: fw react

```tsx
<MPDatePicker label="Due date" startIcon={null} value={due} onValueChange={setDue} />
```

:::

::: fw flutter

```dart
MPDatePicker(
  label: const Text('Due date'),
  startIcon: null,
  value: due,
  onChanged: (DateTime? next) => setState(() => due = next),
);
```

:::

The same is true of `MPDateRangePicker`, `MPDateTimePicker` and `MPTimePicker`.

### clearable

Offers the × in the trigger, and the word in the footer. It does not appear while the picker is empty, read only or disabled — there is nothing to clear.

### readOnly

Shows the value, stays in the tab order, and **does not open**. What a read-only picker holds is something to read, and a calendar whose every cell was inert would be a menu of nothing.

### name

::: fw react

Adds a hidden input, so the whole thing submits with a form:

```html
<input type="hidden" name="due" value="2026-07-15" />
```

:::

::: fw flutter

Files the value with the [MPForm](./form) around the picker, so a submit hands `{'due': '2026-07-15'}` to `onSubmit`, and a `required` picker that is empty holds the submit back with the word for "required" under it.

:::

Local, not UTC, and that is the whole point: `toISOString()` on a `Date` standing for 15 July in Seoul gives `2026-07-14T15:00:00Z`, and a form field that quietly reports the day before the one on screen is the single most expensive bug a date picker can ship. The shape is the one `<input type="date">` submits, so a server that already parses those needs no new code.

## Accessibility

::: fw react

- The trigger is a button named by the label in the notch, wired by `id`.

:::

::: fw flutter

- The trigger is one button node: the label in the notch names it, the date it holds is its **value**, and the line under it is read with it. `semanticLabel` names a picker with no visible label.

:::

- The grid has one **roving tab stop**, which is the ARIA date-picker practice: `Tab` leaves the calendar instead of walking forty-two cells.
- Arrow keys move by a day, `Home`/`End` to the ends of the week, `PageUp`/`PageDown` by a month — with Shift, by a year. Running off an edge steps the calendar rather than stopping.
- Every cell is named as a whole date rather than as a bare number, so a reader hears "Wednesday, July 15, 2026" and not "15".
- Today is marked with an **outlined** circle rather than only with a fill, and the outline is a border so it can coexist with the focus ring.

::: fw flutter

## Differences from the React build

Most of this page is the same in both packages. These are the places where it is not, and why.

| React | Flutter | Why |
| --- | --- | --- |
| `onValueChange` | `onChanged` | Flutter's name for a plain change. `onOpenChange` keeps its name. |
| `defaultValue`, `defaultOpen` | `initialValue`, `initialOpen` | Flutter's names. A `value` the parent changes, `null` included, replaces whatever the picker held; left out, the picker keeps its own. |
| `locale` reaching `Intl` | `locale` reaching the package's own tables, and `names` | The framework has no `Intl`. Eighteen languages and English are carried; `names` covers the rest. |
| `format` (`Intl.DateTimeFormatOptions`) | `format` (`String Function(DateTime)`) | There is no `Intl` to hand options to. |
| `label`, `description`, `errorMessage`, `placeholder` as nodes | `Widget?`, and `placeholder` as `String?` | As `MPNumberField` takes them. The placeholder is measured, so it is a string. |
| `weekStartsOn: 0`–`6` | `weekStartsOn: MPWeekday` | Dart's own numbering, `MPWeekday.monday` to `MPWeekday.sunday`. |
| the hidden input under `name` | `name` filing the value with an `MPForm` | Flutter has no native form; the string is the same. |
| `onKeyDown`, `onKeyUp` | `onKeyEvent` | One callback, which hears the keys the trigger does not answer itself. |
| `onFocus`, `onBlur` | `onFocusChange` | One callback with a `bool`. |
| `onClick`, `onDoubleClick`, `onContextMenu` | — | Wrap the picker in a `GestureDetector` for the pointer. |
| `id`, `className`, `style` | — | There is nothing to pass them through to. |
| — | `semanticLabel`, `focusNode`, `autofocus` | A name for a picker with no visible label, and the focus from outside. |
| Arabic-Indic digits and the Buddhist era where `Intl` uses them | Western digits and the Gregorian calendar everywhere | The tables write the shapes and the names; the numbers are always the ones the cells show. |

A popup wider than the screen scrolls inside its sheet rather than running off the edge. The rest is matched deliberately: the shell, the three views, the page turn, the keys, the precision rules, the bounds, and the footer.

:::

## See also

- [MPDateRangePicker](./date-range-picker) — two days, and everything between them.
- [MPDateTimePicker](./date-time-picker) — a day and a time, in one popup.
- [MPTimePicker](./time-picker) — a time of day on its own.
- [Localisation](../../design/localization) — what `locale` reaches, and what it does not.
