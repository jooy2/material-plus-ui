---
title: Localisation
order: 3
---

# Localisation

<p class="mp-lede">Almost nothing in this library writes text a reader sees. What it does write — a calendar's month names, the name on a back arrow, the word on a button that empties a field — comes from two places, and knowing which is which is the whole of this page.</p>

<Demo src="locale/provider" :minHeight="520">

<<< @/.vitepress/demos/locale/provider.tsx

</Demo>

## Two systems, one tag

A locale is a BCP 47 tag — `ko`, `ja`, `pt-BR`, `zh-Hant` — and it reaches two things that degrade differently.

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

## Registering a language

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

Call it once, before anything renders — it is module-level state, and a table that arrives after a component has resolved its strings only takes effect at the next render.

### A language this library does not ship

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

## Setting it

Three places, in the order they win.

### 1. The component's own `locale`

```tsx
<MPDatePicker locale="ja" label="期限" />
```

(Registered as above. Everything in this section is about which tag reaches a component; whether there is a table behind that tag is the section before it.)

One control in a different language from the page around it is a real thing — an admin editing a Japanese listing from a Korean dashboard — and a library that cannot draw it has decided the page's language on the caller's behalf.

### 2. `MPLocaleProvider`

Which is what an application actually has: one language, set once, at the root.

```tsx
import { MPLocaleProvider } from 'material-plus-ui';

<MPLocaleProvider locale="ko">
  <App />
</MPLocaleProvider>;
```

<PropsTable name="MPLocaleProvider" />

Providers nest, and the nearest one wins. A page in Korean with one section showing a Japanese listing's dates is two providers, and the inner one does not have to restate anything — there is only the one value.

`useMPLocale()` reads it back, so an application that has told this library its language does not have to tell itself the same thing twice:

```tsx
const locale = useMPLocale();
const price = new Intl.NumberFormat(locale, { style: 'currency', currency: 'KRW' });
```

### 3. Nothing at all

`undefined`, and it is a real answer rather than a missing one.

`Intl` formats against the platform's own locale, so a page that never mentions a language still writes dates the way its reader expects. Only the words in this library's table fall back to English.

What it deliberately does **not** do is read `navigator.language`. That value differs between the server rendering the markup and the browser hydrating it, and text that changes between those two is a hydration mismatch in the one part of the page a reader is looking at. A component that should follow the reader is _told_ which language to follow.

## Why this is the only provider in the library

Everything else a theme provider might carry here is already a CSS custom property: the colour roles, the type scale, the corners, the motion durations. Those reach a component through the cascade, which means a section of a page can differ from the rest of it without a second provider and without a re-render.

A locale cannot travel that way. It decides which **string** is rendered, not how one is painted. So it is the one thing left that genuinely needs React context, and this provider carries that and nothing else.

## The languages with a table

Arabic, Chinese (Simplified and Traditional), Dutch, English, French, German, Hindi, Indonesian, Italian, Japanese, Korean, Polish, Portuguese, Russian, Spanish, Thai, Turkish, Vietnamese.

English is the one that is always there. The other eighteen are modules under `material-plus-ui/locales`, exported under their tag with the hyphenated ones camel-cased — `ko`, `ja`, `zhHans`, `zhHant`, `pt` — and each is also its own path, `material-plus-ui/locales/zh-hant`. A tag nobody registered is not an error: it falls back to English exactly the way a tag with no table at all does, so forgetting the line costs you the words and never the render.

Tags are matched broadest-match-last: `pt-BR` asks for `pt-br` and then `pt`; `zh-Hant-TW` asks for `zh-hant`, then `zh-tw`, then `zh`. Chinese is keyed by **script** rather than by region, because that is the axis the words actually differ on — a reader in Taipei asking for `zh-TW` and one in Hong Kong asking for `zh-HK` want the same characters. Bare `zh` resolves to Simplified.

## Overriding a word

Every component that reads the table takes a `labels` prop, and the overrides win over the translation, which wins over English:

```tsx
<MPDatePicker locale="ko" labels={{ today: '오늘 날짜' }} />
```

That order is what makes a partial answer possible. Supplying one word does not lose the other seventeen — they stay Korean rather than falling back to English.

`MPAlert` takes `closeLabel` for the same reason, which is the same thing with one string.

### The words that are not any one component's

A handful of them are shared rather than owned: the × on a dialog, a drawer, a popover and a snackbar is _close_ four times over, and the same is true of the clear and open adornments on a combobox, the remove button on a chip and on a file, and the spinner inside a loading button.

They come from one namespace, so a translation cannot disagree with itself about them, and every one of those components takes `locale` plus its own override prop:

```tsx
<MPLocaleProvider locale="ko">
  <MPDialog showClose /> {/* 닫기 */}
  <MPChip onDelete={remove} /> {/* 제거 */}
  <MPButton loading /> {/* 불러오는 중 */}
</MPLocaleProvider>
```

A button that removes something is named for **what** it removes — `report.pdf 제거` in Korean, `Remove report.pdf` in English — because a row of five buttons all called "Remove" is a row a screen reader cannot tell apart, and because where the name goes is not the same in every language.

Most of the invented strings are read out and never drawn: a page button's number is the number, and the word behind it is for the readers the number says nothing to. The ones that are **drawn** are the ones it would be least forgivable to leave in English, and there are five — `MPEmpty`'s headline, `MPSpoiler`'s cover, `MPPageLayout`'s skip link, `MPTransfer`'s two column headings, and `MPCommandPalette`'s placeholder — plus the word `MPColorPicker`'s trigger shows before a colour has been chosen. A Korean page with an empty list should not say "Nothing here" in the middle of it.

## What it does not translate

Anything you handed the component. A button says whatever it was given, a dialog's title is yours, an alert's message is yours. This library never puts a translation layer between a caller and their own content — the strings above exist only because those components had nowhere to take a word from.

## Next

- [MPDatePicker](../components/inputs/date-picker) — where most of this is visible at once.
- [Colour](./color) — the other axis a page sets once, and the reason it is not in this provider.
