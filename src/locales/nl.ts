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
      thisMonth: 'Deze maand',
      thisYear: 'Dit jaar',
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
    numberField: { increase: 'Verhogen', decrease: 'Verlagen' },
    carousel: {
      label: 'Carrousel',
      previous: 'Vorige dia',
      next: 'Volgende dia',
      slide: 'Dia {index} van {total}'
    },
    scroll: { label: 'Scrollbare inhoud', previous: 'Terugscrollen', next: 'Vooruitscrollen' },
    breadcrumb: { label: 'Kruimelpad', expand: 'Verborgen stappen tonen' },
    combobox: { empty: 'Geen resultaten', add: '‘{label}’ toevoegen' },
    table: { empty: 'Geen gegevens' },
    filePicker: { prompt: 'Sleep bestanden hierheen of klik om te bladeren' },
    textLink: { newTab: 'Wordt geopend in een nieuw tabblad' },
    overlay: { label: 'Overlay' },
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
    },
    colorPicker: {
      area: 'Verzadiging en helderheid',
      hue: 'Kleurtoon',
      alpha: 'Dekking',
      value: 'Kleurwaarde',
      swatches: 'Vooraf ingestelde kleuren',
      clear: 'Wissen',
      empty: 'Geen kleur'
    },
    transfer: {
      source: 'Beschikbaar',
      target: 'Geselecteerd',
      toTarget: 'Naar geselecteerd verplaatsen',
      toSource: 'Terug naar beschikbaar',
      search: 'Zoeken',
      empty: 'Niets aanwezig'
    },
    command: {
      label: 'Opdrachtenpalet',
      search: 'Typ een opdracht of zoek…',
      empty: 'Geen opdrachten gevonden'
    },
    layout: {
      skipToContent: 'Naar inhoud springen',
      sidebar: 'Zijbalk',
      openSidebar: 'Zijbalk openen',
      closeSidebar: 'Zijbalk sluiten',
      resizeSidebar: 'Zijbalk verbreden of versmallen'
    },
    confirm: {
      confirm: 'Bevestigen',
      cancel: 'Annuleren',
      ok: 'OK'
    }
  }
};
