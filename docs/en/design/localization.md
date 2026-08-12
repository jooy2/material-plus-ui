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

## Setting it

Three places, in the order they win.

### 1. The component's own `locale`

```tsx
<MPDatePicker locale="ja" label="期限" />
```

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

Tags are matched broadest-match-last: `pt-BR` asks for `pt-br` and then `pt`; `zh-Hant-TW` asks for `zh-hant`, then `zh-tw`, then `zh`. Chinese is keyed by **script** rather than by region, because that is the axis the words actually differ on — a reader in Taipei asking for `zh-TW` and one in Hong Kong asking for `zh-HK` want the same characters. Bare `zh` resolves to Simplified.

## Overriding a word

Every component that reads the table takes a `labels` prop, and the overrides win over the translation, which wins over English:

```tsx
<MPDatePicker locale="ko" labels={{ today: '오늘 날짜' }} />
```

That order is what makes a partial answer possible. Supplying one word does not lose the other seventeen — they stay Korean rather than falling back to English.

`MPAlert` takes `closeLabel` for the same reason, which is the same thing with one string.

## What it does not translate

Anything you handed the component. A button says whatever it was given, a dialog's title is yours, an alert's message is yours. This library never puts a translation layer between a caller and their own content — the strings above exist only because those components had nowhere to take a word from.

## Next

- [MPDatePicker](../components/inputs/date-picker) — where most of this is visible at once.
- [Colour](./color) — the other axis a page sets once, and the reason it is not in this provider.
