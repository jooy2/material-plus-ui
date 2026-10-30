/**
 * Every translation the library ships, and none of them in your bundle until you
 * say so.
 *
 * This is a data package and nothing more: no component reaches into it, and
 * `material-plus-ui` itself never imports it. That is the whole point. A table
 * a component imported would be a table every consumer paid for — eighteen
 * languages' worth of strings so that a button in São Paulo could say
 * *Carregando* — so the direction is reversed and the application hands the
 * library the languages it actually speaks:
 *
 *     import { registerMPMessages } from 'material-plus-ui';
 *     import { ko, ja } from 'material-plus-ui/locales';
 *
 *     registerMPMessages(ko, ja);
 *
 * Call it once, before anything renders. From then on `locale="ko"` — on
 * `MPLocaleProvider` or on a component — resolves exactly as it would have if
 * the table had been built in, because it is the same table.
 *
 * ## What to import, and from where
 *
 * - `material-plus-ui/locales/ko` is one language and costs one language.
 * - `material-plus-ui/locales` is the same modules behind a barrel. A named
 *   import from it costs the same as the deep path — the barrel exists so a
 *   line that wants three languages can be one line rather than three.
 * - `LOCALES` is all eighteen as an array, for an application that would rather
 *   ship the lot than maintain a list. An array literal cannot be tree-shaken
 *   element by element, so importing it is the choice to carry all of them.
 *
 * ## The tables
 *
 * | Tag | Language |
 * | --- | --- |
 * | `ko` | Korean |
 * | `ja` | Japanese |
 * | `zh-hans` | Chinese (Simplified) |
 * | `zh-hant` | Chinese (Traditional) |
 * | `es` | Spanish |
 * | `pt` | Portuguese |
 * | `fr` | French |
 * | `de` | German |
 * | `it` | Italian |
 * | `nl` | Dutch |
 * | `pl` | Polish |
 * | `ru` | Russian |
 * | `tr` | Turkish |
 * | `ar` | Arabic |
 * | `hi` | Hindi |
 * | `id` | Indonesian |
 * | `vi` | Vietnamese |
 * | `th` | Thai |
 *
 * Chinese is keyed by script rather than by region, because that is the axis the
 * words differ on. `zh-TW` and `zh-HK` are aliases of `zh-hant`, and `zh`,
 * `zh-CN`, `zh-MY` and `zh-SG` of `zh-hans`; each table carries its own aliases,
 * so registering it registers those too.
 *
 * A language that is not here is not a dead end: `MPLocale` is a plain object,
 * and `registerMPMessages({ locale: 'sv', messages: { ... } })` is as good as
 * anything in this directory.
 */
export { ko } from './ko';
export { ja } from './ja';
export { zhHans } from './zh-hans';
export { zhHant } from './zh-hant';
export { es } from './es';
export { pt } from './pt';
export { fr } from './fr';
export { de } from './de';
export { it } from './it';
export { nl } from './nl';
export { pl } from './pl';
export { ru } from './ru';
export { tr } from './tr';
export { ar } from './ar';
export { hi } from './hi';
export { id } from './id';
export { vi } from './vi';
export { th } from './th';

import { ko } from './ko';
import { ja } from './ja';
import { zhHans } from './zh-hans';
import { zhHant } from './zh-hant';
import { es } from './es';
import { pt } from './pt';
import { fr } from './fr';
import { de } from './de';
import { it } from './it';
import { nl } from './nl';
import { pl } from './pl';
import { ru } from './ru';
import { tr } from './tr';
import { ar } from './ar';
import { hi } from './hi';
import { id } from './id';
import { vi } from './vi';
import { th } from './th';
import type { MPLocale } from '../internal/i18n';

/**
 * All eighteen tables, in one array.
 *
 * `registerMPMessages(...LOCALES)` is the one line that restores the behaviour
 * of a library with its translations built in, and it costs what that costs —
 * see the note above about why this is an array and not the default.
 */
export const LOCALES: MPLocale[] = [
  ko,
  ja,
  zhHans,
  zhHant,
  es,
  pt,
  fr,
  de,
  it,
  nl,
  pl,
  ru,
  tr,
  ar,
  hi,
  id,
  vi,
  th
];
