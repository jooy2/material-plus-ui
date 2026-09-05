import { describe, expect, it } from 'vitest';
import { LOCALES } from '../../src/locales';
import { ALERT } from '../../src/internal/messages/alert';
import { BREADCRUMB } from '../../src/internal/messages/breadcrumb';
import { CAROUSEL } from '../../src/internal/messages/carousel';
import { CHAT } from '../../src/internal/messages/chat';
import { COLOR_PICKER } from '../../src/internal/messages/color-picker';
import { COMBOBOX } from '../../src/internal/messages/combobox';
import { COMMAND } from '../../src/internal/messages/command';
import { COMMON } from '../../src/internal/messages/common';
import { DATA_TABLE } from '../../src/internal/messages/data-table';
import { CONFIRM } from '../../src/internal/messages/confirm';
import { EMPTY } from '../../src/internal/messages/empty';
import { FILE_PICKER } from '../../src/internal/messages/file-picker';
import { LAYOUT } from '../../src/internal/messages/layout';
import { NUMBER_FIELD } from '../../src/internal/messages/number-field';
import { OVERLAY } from '../../src/internal/messages/overlay';
import { PAGINATION } from '../../src/internal/messages/pagination';
import { PICKER } from '../../src/internal/messages/picker';
import { RATING } from '../../src/internal/messages/rating';
import { SPOILER } from '../../src/internal/messages/spoiler';
import { TABLE } from '../../src/internal/messages/table';
import { TEXT_FIELD } from '../../src/internal/messages/text-field';
import { TEXT_LINK } from '../../src/internal/messages/text-link';
import { TOUR } from '../../src/internal/messages/tour';
import { TRANSFER } from '../../src/internal/messages/transfer';

/**
 * Whether the eighteen tables still say everything English does.
 *
 * A partial translation is a supported state — `resolveNamespace` merges over
 * English a namespace at a time, precisely so that adding one does not blank the
 * strings in every language that has not caught up. That is what makes this
 * worth asserting rather than leaving to the type checker: a missing namespace
 * is not a type error and is not a runtime error either. It is eighteen pages
 * quietly saying one thing in English, which nobody notices until somebody who
 * reads that language does.
 *
 * `MPPartialMessages` is what the tables are typed as, so `tsc` will not do this
 * and a shipped table should not be partial.
 */
const NAMESPACES = [
  ALERT,
  CONFIRM,
  BREADCRUMB,
  CAROUSEL,
  CHAT,
  COLOR_PICKER,
  COMBOBOX,
  COMMAND,
  COMMON,
  DATA_TABLE,
  EMPTY,
  FILE_PICKER,
  LAYOUT,
  NUMBER_FIELD,
  OVERLAY,
  PAGINATION,
  PICKER,
  RATING,
  SPOILER,
  TABLE,
  TEXT_FIELD,
  TEXT_LINK,
  TOUR,
  TRANSFER
];

/** The `{placeholder}` names a string carries, in the order they appear. */
function placeholders(message: string): string[] {
  return [...message.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
}

describe('the shipped translations', () => {
  for (const locale of LOCALES) {
    describe(locale.locale, () => {
      it('answers every namespace English does', () => {
        const missing = NAMESPACES.filter((namespace) => !(namespace.name in locale.messages)).map(
          (namespace) => namespace.name
        );

        expect(missing).toEqual([]);
      });

      it('answers every key in every namespace', () => {
        const missing: string[] = [];

        for (const namespace of NAMESPACES) {
          const table = (locale.messages as Record<string, Record<string, string> | undefined>)[
            namespace.name
          ];

          if (!table) {
            continue;
          }

          for (const key of Object.keys(namespace.en)) {
            if (typeof table[key] !== 'string' || table[key].length === 0) {
              missing.push(`${namespace.name}.${key}`);
            }
          }
        }

        expect(missing).toEqual([]);
      });

      /*
       * A placeholder is the one part of a string a translator cannot move or
       * rename, only reorder — `fillMessage` leaves an unfilled `{page}` on the
       * screen rather than blanking it, so a typo here is a visible `{tota}` in
       * the middle of a sentence.
       */
      it('keeps the placeholders each string was written with', () => {
        const wrong: string[] = [];

        for (const namespace of NAMESPACES) {
          const table = (locale.messages as Record<string, Record<string, string> | undefined>)[
            namespace.name
          ];

          if (!table) {
            continue;
          }

          for (const [key, english] of Object.entries(namespace.en)) {
            const translated = table[key];

            if (typeof translated !== 'string') {
              continue;
            }

            const expected = placeholders(english as string);
            const actual = placeholders(translated);

            if (expected.join(',') !== actual.join(',')) {
              wrong.push(`${namespace.name}.${key}: ${actual.join(',')} ≠ ${expected.join(',')}`);
            }
          }
        }

        expect(wrong).toEqual([]);
      });
    });
  }
});
