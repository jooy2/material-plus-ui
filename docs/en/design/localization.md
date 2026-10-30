---
title: Localisation
order: 3
---

# Localisation

<p class="mp-lede">Almost nothing in this library writes text a reader sees. What it does write — a calendar's month names, the name on a back arrow, the word on a button that empties a field — comes from two places, and knowing which is which is the whole of this page.</p>

<Demo src="locale/provider" :minHeight="520">

::: fw react

<<< @/.vitepress/demos/locale/provider.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/locale/provider.dart

:::

</Demo>

## Two systems, one tag

A locale is a BCP 47 tag — `ko`, `ja`, `pt-BR`, `zh-Hant` — and it reaches two things that degrade differently.

::: fw react

| What | Where it comes from | For a tag with no translation |
| --- | --- | --- |
| Month names, weekday initials, AM/PM | `Intl` | Still correct |
| Date and number formatting | `Intl` | Still correct |
| Which day the week starts on | `Intl` | Still correct |
| Whether the clock is 12- or 24-hour | `Intl` | Still correct |
| The order of a calendar header's two buttons | `Intl` | Still correct |
| "Previous month", "Today", "Hour", "Dismiss" | This library | Falls back to English |

The split is deliberate and it is the reason there is no bundled list of month names anywhere in `src/`. The platform speaks more languages than this file ever will, and it is already installed.

So a language this library has no table for is **not a dead end**. The calendar is still in that language; only a handful of words are English, and `labels` fills those in one at a time.

:::

::: fw flutter

In Flutter the first of the two is not the platform's. The framework has no `Intl`, and the package depends on nothing that would bring one in, so the library carries the date names itself: a table for English and for each of the eighteen languages it translates, read off the Unicode CLDR data. A picker or a chart looks the table up by the same locale its words follow, and needs nothing registered to do it.

| What | Where it comes from | For a tag with no table |
| --- | --- | --- |
| Month names, weekday names, AM/PM | The library's date table for the locale | English, unless you pass `names` |
| Which day the week starts on | The same table | Sunday, unless `weekStartsOn` says otherwise |
| Whether the month is written before the year, and the date and time patterns | The same table | English order |
| "Previous month", "Today", "Hour", "Dismiss" | This library's message tables, once registered | Falls back to English |

Two things differ from what `Intl` gives the React package. Digits are always Western and the calendar is always Gregorian, so Arabic dates keep `0`–`9` and Thai years are not Buddhist-era years. And regional variants are not told apart: `en-GB` reads the English table.

A language outside the eighteen is still **not a dead end**. Pass an `MPDateNames` of your own to the components that write dates (`names` on the pickers, `dateNames` on the charts). An app that already uses `package:intl` can build one with `DateFormat`:

```dart
MPDateNames(
  months: List<String>.generate(12, (int i) => DateFormat.MMMM(locale).format(DateTime(2021, i + 1))),
  monthsShort: List<String>.generate(12, (int i) => DateFormat.MMM(locale).format(DateTime(2021, i + 1))),
  weekdays: List<String>.generate(7, (int i) => DateFormat.EEEE(locale).format(DateTime(2021, 8, i + 1))),
  weekdaysShort: List<String>.generate(7, (int i) => DateFormat.E(locale).format(DateTime(2021, 8, i + 1))),
)
```

Both weekday lists start on Sunday, which is why the days count from 1 August 2021. `monthBeforeYear`, `firstDayOfWeek` and `hour12` cannot be read off a format, so set those for the language yourself, and let `labels` fill in the few remaining words one at a time.

:::

## Registering a language

::: fw react

The library ships English and nothing else. Every other translation is a module you import, and handing it over is one line at startup:

```ts
import { registerMPMessages } from 'material-plus-ui';
import { ko } from 'material-plus-ui/locales';

registerMPMessages(ko);
```

From then on `locale="ko"` — on a provider or on a component — resolves exactly as it would have if the table had been built in, because it is the same table.

This is the one thing on this page that is not free. A table of every string in every language is twenty kilobytes, and a component that says one word held a static import chain down to all of it: `MPButton` says _Loading_, and a page that rendered a button carried Thai to do it. Nothing in the library imports the tables now, so a bundler leaves out the ones you did not ask for. English costs about a kilobyte; each language you register costs about six hundred bytes more.

Register them all if that is what you want — it is the same cost the library used to charge everybody:

```ts
import { registerMPMessages } from 'material-plus-ui';
import { LOCALES } from 'material-plus-ui/locales';

registerMPMessages(...LOCALES);
```

Or take one language on its own path, which is the smallest thing you can import:

```ts
import { ko } from 'material-plus-ui/locales/ko';
```

Call it once, before anything renders — it is module-level state, and a table that arrives after a component has resolved its strings only takes effect at the next render. Under App Router it has to be called where the components run, which is a client module; see [Getting started](../guide/getting-started#next-js-and-react-server-components) for the shape that works.

:::

::: fw flutter

The library ships English and nothing else here too. Every other table comes from a second library, `package:material_plus_ui/locales.dart`, and handing one over is one line at startup:

```dart
import 'package:material_plus_ui/material_plus_ui.dart';
import 'package:material_plus_ui/locales.dart';

void main() {
  registerMPMessages(<MPLocale>[ko]);
  runApp(const App());
}
```

From then on `locale: 'ko'`, on a provider or on a component, resolves to the same Korean the React package speaks, because it is the same table under the same keys.

`registerMPMessages(mpLocales)` takes all eighteen. The tables are a library of their own because a table is data, and the only way to leave data out of an app is for nothing to import it: an app that never imports `locales.dart` carries none of them.

Call it once, before anything builds. A table registered later reaches a component the next time that component builds.

:::

### A language this library does not ship

::: fw react

`MPLocale` is a plain object, so a table of your own is as good as one of ours:

```ts
registerMPMessages({
  locale: 'sv',
  messages: {
    common: { close: 'Stäng', clear: 'Rensa' },
    picker: { today: 'I dag', done: 'Klar' }
  }
});
```

Anything left out falls back to English, a namespace at a time, exactly as a partial shipped translation does. `aliases` is there for the case Chinese needs — `{ locale: 'zh-hant', aliases: ['zh-TW', 'zh-HK'] }` — one table under several tags.

:::

::: fw flutter

`MPLocale` is a plain value, so a table of your own is as good as one of ours:

```dart
registerMPMessages(<MPLocale>[
  const MPLocale(
    locale: 'sv',
    messages: <String, Map<String, String>>{
      'common': <String, String>{'close': 'Stäng', 'clear': 'Rensa'},
      'picker': <String, String>{'today': 'I dag', 'done': 'Klar'},
    },
  ),
]);
```

Anything left out falls back to English, a namespace at a time, exactly as a partial shipped translation does. `aliases` is there for the case Chinese needs — `aliases: <String>['zh-TW', 'zh-HK']` on a `zh-hant` table — one table under several tags.

:::

## Setting it

::: fw react

Three places, in the order they win.

:::

::: fw flutter

The same places, in the same order, with one more before English. A component takes the first of these that names a language:

1. its own `locale` parameter,
1. the nearest `MPLocaleProvider`,
1. the nearest `MPConfigProvider`'s `locale`,
1. the app's own `Localizations`.

With none of them, or with a tag nobody registered, it speaks English.

:::

### 1. The component's own `locale`

::: fw react

```tsx
<MPDatePicker locale="ja" label="期限" />
```

:::

::: fw flutter

```dart
MPButton(locale: 'ja', loading: true, onPressed: save, child: const Text('保存'))
```

:::

(Registered as above. Everything in this section is about which tag reaches a component; whether there is a table behind that tag is the section before it.)

One control in a different language from the page around it is a real thing — an admin editing a Japanese listing from a Korean dashboard — and a library that cannot draw it has decided the page's language on the caller's behalf.

### 2. `MPLocaleProvider`

Which is what an application actually has: one language, set once, at the root.

::: fw react

```tsx
import { MPLocaleProvider } from 'material-plus-ui';

<MPLocaleProvider locale="ko">
  <App />
</MPLocaleProvider>;
```

:::

::: fw flutter

```dart
MPLocaleProvider(locale: 'ko', child: const App())
```

:::

<PropsTable name="MPLocaleProvider" />

Providers nest, and the nearest one wins. A page in Korean with one section showing a Japanese listing's dates is two providers, and the inner one does not have to restate anything — there is only the one value.

::: fw react

`useMPLocale()` reads it back, so an application that has told this library its language does not have to tell itself the same thing twice:

```tsx
const locale = useMPLocale();
const price = new Intl.NumberFormat(locale, { style: 'currency', currency: 'KRW' });
```

:::

::: fw flutter

`MPLocaleProvider.maybeOf(context)` reads back the tag the nearest provider set, or `null` when there is none. It answers for the provider alone; a `locale` set on `MPConfigProvider` is `MPConfigProvider.maybeOf(context)?.locale`.

:::

### 3. Nothing at all

::: fw flutter

With nothing set, a component follows the app's own `Localizations`: the locale `WidgetsApp` resolved from the device's languages against the app's `supportedLocales`. An app that registered the Korean table and lists `ko` there speaks Korean on a Korean device, with no `locale` anywhere. One that leaves `supportedLocales` at its default, which is English alone, gets English.

This is the step the React package leaves out on purpose: a browser's language can differ between the server that renders a page and the browser that hydrates it. A Flutter app has no such split, and the locale its `Localizations` carries is the one it already chose.

:::

::: fw react

`undefined`, and it is a real answer rather than a missing one.

`Intl` formats against the platform's own locale, so a page that never mentions a language still writes dates the way its reader expects. Only the words in this library's table fall back to English.

What it deliberately does **not** do is read `navigator.language`. That value differs between the server rendering the markup and the browser hydrating it, and text that changes between those two is a hydration mismatch in the one part of the page a reader is looking at. A component that should follow the reader is _told_ which language to follow.

### On a server

The platform's own locale is two locales on a page a server renders. `Intl` on the server answers in the machine's `LANG`, and in the browser in the reader's language, so the same number is `1,234.5` in the markup and `1.234,5` in the first client render — and React, finding the two different, discards the server's markup and renders the page again. The words are safe, because they fall back to English on both sides; the dates and the numbers are not.

So a server-rendered page names its locale. The best answer is the reader's, read from the request on the server — its `Accept-Language` header, or the language in its URL — and passed to the provider, which then agrees on both sides:

```tsx
<MPLocaleProvider locale={localeFromRequest}>
  <App />
</MPLocaleProvider>
```

Where the server cannot know it, `serverLocale` names the language the server pass is written in. The page hydrates in that language and then rewrites its dates and numbers in the reader's own, once, instead of being rendered twice:

```tsx
<MPLocaleProvider serverLocale="en-US">
  <App />
</MPLocaleProvider>
```

A server that formats with neither writes one warning to its log, the first time it happens.

Time zones are the same problem, and no provider solves it. A `Date` is written in the runtime's time zone, so a chart category at midnight UTC is one day on a server in UTC and the day before in a browser in Los Angeles. Where the server's zone may not be the reader's, pass chart categories as the strings you want shown rather than as `Date` objects.

:::

::: fw react

## Why the locale needs context

Most of what a theme provider might carry here is already a CSS custom property: the colour roles, the type scale, the corners, the motion durations. Those reach a component through the cascade, which means a section of a page can differ from the rest of it without a provider and without a re-render.

A locale cannot travel that way. It decides which **string** is rendered, not how one is painted, so it needs React context. `MPLocaleProvider` carries that and nothing else, for a subtree that changes its language and nothing more. [`MPConfigProvider`](../guide/config) carries it too, beside the size, colour and density defaults, which need context for a reason of their own: a size resolves to Tailwind class names rather than to a custom property. The library's other providers, `MPSnackbarProvider`, `MPConfirmProvider` and `MPTooltipProvider`, hold a queue, a dialog or a shared delay for one kind of component, not any part of a theme.

:::

::: fw flutter

## Why the locale has a provider of its own

Flutter has no cascade, so in this package the colours, the type scale and the corners are carried by [`MPTheme`](./color), and the size, the colour family, the density and the locale by [`MPConfigProvider`](../guide/config). `MPLocaleProvider` stays the narrow one, for a subtree that changes its language and nothing else. It carries one string, and the components that read it rebuild only when that string changes.

:::

## The languages with a table

Arabic, Chinese (Simplified and Traditional), Dutch, English, French, German, Hindi, Indonesian, Italian, Japanese, Korean, Polish, Portuguese, Russian, Spanish, Thai, Turkish, Vietnamese.

::: fw react

English is the one that is always there. The other eighteen are modules under `material-plus-ui/locales`, exported under their tag with the hyphenated ones camel-cased — `ko`, `ja`, `zhHans`, `zhHant`, `pt` — and each is also its own path, `material-plus-ui/locales/zh-hant`. A tag nobody registered is not an error: it falls back to English exactly the way a tag with no table at all does, so forgetting the line costs you the words and never the render.

:::

::: fw flutter

English is the one that is always there. The other eighteen are constants exported from `package:material_plus_ui/locales.dart` under the same names — `ko`, `ja`, `zhHans`, `zhHant`, `pt` — and `mpLocales` is all of them in one list. A tag nobody registered is not an error: it falls back to English exactly the way a tag with no table at all does, so forgetting the line costs you the words and never the build.

:::

Tags are matched broadest-match-last: `pt-BR` asks for `pt-br` and then `pt`; `zh-Hant-TW` asks for `zh-hant`, then `zh-tw`, then `zh`. Chinese is keyed by **script** rather than by region, because that is the axis the words actually differ on — a reader in Taipei asking for `zh-TW` and one in Hong Kong asking for `zh-HK` want the same characters. Bare `zh` resolves to Simplified.

## Overriding a word

Every component that reads the table takes a `labels` prop, and the overrides win over the translation, which wins over English:

::: fw react

```tsx
<MPDatePicker locale="ko" labels={{ today: '오늘 날짜' }} />
```

That order is what makes a partial answer possible. Supplying one word does not lose the other seventeen — they stay Korean rather than falling back to English.

:::

::: fw flutter

```dart
MPPagination(
  locale: 'ko',
  labels: const <String, String>{'next': '다음 쪽'},
  // …the pagination's own parameters
)
```

That order is what makes a partial answer possible. Supplying one word does not lose the others — they stay Korean rather than falling back to English.

:::

`MPAlert` takes `closeLabel` for the same reason, which is the same thing with one string.

### The words that are not any one component's

A handful of them are shared rather than owned: the × on a dialog, a drawer, a popover and a snackbar is _close_ four times over, and the same is true of the clear and open adornments on a combobox, the remove button on a chip and on a file, and the spinner inside a loading button.

They come from one namespace, so a translation cannot disagree with itself about them, and every one of those components takes `locale` plus its own override prop:

::: fw react

```tsx
<MPLocaleProvider locale="ko">
  <MPDialog showClose /> {/* 닫기 */}
  <MPChip onDelete={remove} /> {/* 제거 */}
  <MPButton loading /> {/* 불러오는 중 */}
</MPLocaleProvider>
```

A button that removes something is named for **what** it removes — `report.pdf 제거` in Korean, `Remove report.pdf` in English — because a row of five buttons all called "Remove" is a row a screen reader cannot tell apart, and because where the name goes is not the same in every language.

:::

::: fw flutter

```dart
MPLocaleProvider(
  locale: 'ko',
  child: Row(
    children: <Widget>[
      MPChip(onDelete: remove, child: const Text('report.pdf')), // 제거
      MPButton(loading: true, onPressed: save, child: const Text('저장')), // 불러오는 중
    ],
  ),
)
```

A chip's label is a widget, which the chip cannot read words out of, so its remove button is called _remove_ in the reader's language and nothing more. A row of five buttons all called "Remove" is a row a screen reader cannot tell apart, so name each one for what it removes with `deleteLabel: 'report.pdf 제거'`.

:::

Most of the invented strings are read out and never drawn: a page button's number is the number, and the word behind it is for the readers the number says nothing to. The ones that are **drawn** are the ones it would be least forgivable to leave in English, and there are five — `MPEmpty`'s headline, `MPSpoiler`'s cover, `MPPageLayout`'s skip link, `MPTransfer`'s two column headings, and `MPCommandPalette`'s placeholder — plus the word `MPColorPicker`'s trigger shows before a colour has been chosen. A Korean page with an empty list should not say "Nothing here" in the middle of it.

## What it does not translate

Anything you handed the component. A button says whatever it was given, a dialog's title is yours, an alert's message is yours. This library never puts a translation layer between a caller and their own content — the strings above exist only because those components had nowhere to take a word from.

## Next

- [MPDatePicker](../components/inputs/date-picker) — where most of this is visible at once.
- [Colour](./color) — the other axis a page sets once, and the reason it is not in this provider.
