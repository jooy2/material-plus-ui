/**
 * Dutch — Nederlands.
 *
 * One of the tables `material-plus-ui/locales` holds. Nothing in the library
 * imports it: a translation reaches a component only once the application has
 * handed it over, which is what keeps eighteen languages out of a bundle that
 * needs one. See `internal/i18n.ts` for the whole of that reasoning.
 *
 *     import { registerMPMessages } from 'material-plus-ui';
 *     import { nl } from 'material-plus-ui/locales/nl';
 *
 *     registerMPMessages(nl);
 *
 * Anything this table leaves out falls back to English, a namespace at a time.
 */
import type { MPLocale } from '../internal/i18n';

export const nl: MPLocale = {
  locale: 'nl',
  messages: {
    common: {
      close: 'Sluiten',
      clear: 'Wissen',
      open: 'Openen',
      remove: 'Verwijderen',
      removeNamed: '{label} verwijderen',
      loading: 'Laden'
    },
    textField: { showPassword: 'Wachtwoord tonen', hidePassword: 'Wachtwoord verbergen' },
    empty: { title: 'Hier is niets' },
    picker: {
      previousMonth: 'Vorige maand',
      nextMonth: 'Volgende maand',
      previousYear: 'Vorig jaar',
      nextYear: 'Volgend jaar',
      previousYears: 'Vorige jaren',
      nextYears: 'Volgende jaren',
      chooseMonth: 'Kies een maand',
      chooseYear: 'Kies een jaar',
      today: 'Vandaag',
      now: 'Nu',
      clear: 'Wissen',
      done: 'Klaar',
      hour: 'Uur',
      minute: 'Minuut',
      second: 'Seconde',
      meridiem: 'AM/PM',
      start: 'Begin',
      end: 'Einde'
    },
    alert: { dismiss: 'Sluiten' },
    chat: {
      sending: 'Verzenden',
      sent: 'Verzonden',
      delivered: 'Bezorgd',
      read: 'Gelezen',
      failed: 'Niet verzonden',
      typing: 'Aan het typen'
    },
    spoiler: {
      reveal: 'Tonen',
      hide: 'Verbergen',
      notice: 'Verborgen zodat het niet per ongeluk wordt gelezen'
    },
    pagination: {
      label: 'Paginering',
      page: 'Pagina {page}',
      status: 'Pagina {page} van {total}',
      previous: 'Vorige pagina',
      next: 'Volgende pagina',
      first: 'Eerste pagina',
      last: 'Laatste pagina'
    },
    rating: {
      label: 'Beoordeling',
      value: '{value} van {max}',
      empty: 'Niet beoordeeld'
    }
  }
};
