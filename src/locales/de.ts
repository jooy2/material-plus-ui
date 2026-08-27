/**
 * German — Deutsch.
 *
 * One of the tables `material-plus-ui/locales` holds. Nothing in the library
 * imports it: a translation reaches a component only once the application has
 * handed it over, which is what keeps eighteen languages out of a bundle that
 * needs one. See `internal/i18n.ts` for the whole of that reasoning.
 *
 *     import { registerMPMessages } from 'material-plus-ui';
 *     import { de } from 'material-plus-ui/locales/de';
 *
 *     registerMPMessages(de);
 *
 * Anything this table leaves out falls back to English, a namespace at a time.
 */
import type { MPLocale } from '../internal/i18n';

export const de: MPLocale = {
  locale: 'de',
  messages: {
    common: {
      close: 'Schließen',
      clear: 'Löschen',
      open: 'Öffnen',
      remove: 'Entfernen',
      removeNamed: '{label} entfernen',
      loading: 'Wird geladen'
    },
    textField: { showPassword: 'Passwort anzeigen', hidePassword: 'Passwort verbergen' },
    empty: { title: 'Nichts vorhanden' },
    picker: {
      previousMonth: 'Voriger Monat',
      nextMonth: 'Nächster Monat',
      previousYear: 'Voriges Jahr',
      nextYear: 'Nächstes Jahr',
      previousYears: 'Vorige Jahre',
      nextYears: 'Nächste Jahre',
      chooseMonth: 'Monat auswählen',
      chooseYear: 'Jahr auswählen',
      today: 'Heute',
      now: 'Jetzt',
      clear: 'Löschen',
      done: 'Fertig',
      hour: 'Stunde',
      minute: 'Minute',
      second: 'Sekunde',
      meridiem: 'AM/PM',
      start: 'Beginn',
      end: 'Ende'
    },
    alert: { dismiss: 'Schließen' },
    chat: {
      sending: 'Wird gesendet',
      sent: 'Gesendet',
      delivered: 'Zugestellt',
      read: 'Gelesen',
      failed: 'Nicht gesendet',
      typing: 'Schreibt'
    },
    spoiler: {
      reveal: 'Anzeigen',
      hide: 'Verbergen',
      notice: 'Verborgen, damit es nicht versehentlich gelesen wird'
    },
    pagination: {
      label: 'Seitennummerierung',
      page: 'Seite {page}',
      status: 'Seite {page} von {total}',
      previous: 'Vorherige Seite',
      next: 'Nächste Seite',
      first: 'Erste Seite',
      last: 'Letzte Seite'
    },
    rating: {
      label: 'Bewertung',
      value: '{value} von {max}',
      empty: 'Nicht bewertet'
    }
  }
};
