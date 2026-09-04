/**
 * Italian — Italiano.
 *
 * One of the tables `material-plus-ui/locales` holds. Nothing in the library
 * imports it: a translation reaches a component only once the application has
 * handed it over, which is what keeps eighteen languages out of a bundle that
 * needs one. See `internal/i18n.ts` for the whole of that reasoning.
 *
 *     import { registerMPMessages } from 'material-plus-ui';
 *     import { it } from 'material-plus-ui/locales/it';
 *
 *     registerMPMessages(it);
 *
 * Anything this table leaves out falls back to English, a namespace at a time.
 */
import type { MPLocale } from '../internal/i18n';

export const it: MPLocale = {
  locale: 'it',
  messages: {
    common: {
      close: 'Chiudi',
      clear: 'Cancella',
      open: 'Apri',
      remove: 'Rimuovi',
      removeNamed: 'Rimuovi {label}',
      loading: 'Caricamento'
    },
    textField: { showPassword: 'Mostra la password', hidePassword: 'Nascondi la password' },
    empty: { title: "Non c'è nulla qui" },
    picker: {
      previousMonth: 'Mese precedente',
      nextMonth: 'Mese successivo',
      previousYear: 'Anno precedente',
      nextYear: 'Anno successivo',
      previousYears: 'Anni precedenti',
      nextYears: 'Anni successivi',
      chooseMonth: 'Scegli un mese',
      chooseYear: 'Scegli un anno',
      today: 'Oggi',
      thisMonth: 'Questo mese',
      thisYear: "Quest'anno",
      now: 'Adesso',
      clear: 'Cancella',
      done: 'Fatto',
      hour: 'Ora',
      minute: 'Minuto',
      second: 'Secondo',
      meridiem: 'AM/PM',
      start: 'Inizio',
      end: 'Fine'
    },
    numberField: { increase: 'Aumenta', decrease: 'Diminuisci' },
    carousel: {
      label: 'Carosello',
      previous: 'Diapositiva precedente',
      next: 'Diapositiva successiva',
      slide: 'Diapositiva {index} di {total}'
    },
    scroll: { label: 'Contenuto scorrevole', previous: 'Scorri indietro', next: 'Scorri avanti' },
    breadcrumb: { label: 'Percorso di navigazione', expand: 'Mostra i passaggi nascosti' },
    combobox: { empty: 'Nessuna corrispondenza', add: 'Aggiungi «{label}»' },
    table: { empty: 'Nessun dato' },
    filePicker: { prompt: 'Trascina qui i file, oppure fai clic per sfogliare' },
    textLink: { newTab: 'Si apre in una nuova scheda' },
    overlay: { label: 'Sovrapposizione' },
    alert: { dismiss: 'Chiudi' },
    chat: {
      sending: 'Invio in corso',
      sent: 'Inviato',
      delivered: 'Consegnato',
      read: 'Letto',
      failed: 'Non inviato',
      typing: 'Sta scrivendo'
    },
    spoiler: {
      reveal: 'Mostra',
      hide: 'Nascondi',
      notice: 'Nascosto per non essere letto per sbaglio'
    },
    pagination: {
      label: 'Impaginazione',
      page: 'Pagina {page}',
      status: 'Pagina {page} di {total}',
      previous: 'Pagina precedente',
      next: 'Pagina successiva',
      first: 'Prima pagina',
      last: 'Ultima pagina'
    },
    rating: {
      label: 'Valutazione',
      value: '{value} su {max}',
      empty: 'Non valutato'
    },
    colorPicker: {
      area: 'Saturazione e luminosità',
      hue: 'Tonalità',
      alpha: 'Opacità',
      value: 'Valore del colore',
      swatches: 'Colori predefiniti',
      clear: 'Cancella',
      empty: 'Nessun colore'
    },
    transfer: {
      source: 'Disponibili',
      target: 'Selezionati',
      toTarget: 'Sposta tra i selezionati',
      toSource: 'Riporta tra i disponibili',
      search: 'Cerca',
      empty: 'Nessun elemento'
    },
    command: {
      label: 'Tavolozza comandi',
      search: 'Digita un comando o cerca…',
      empty: 'Nessun comando trovato'
    },
    layout: {
      skipToContent: 'Vai al contenuto',
      sidebar: 'Barra laterale',
      openSidebar: 'Apri la barra laterale',
      closeSidebar: 'Chiudi la barra laterale',
      resizeSidebar: 'Ridimensiona la barra laterale'
    },
    confirm: {
      confirm: 'Conferma',
      cancel: 'Annulla',
      ok: 'OK'
    }
  }
};
