/**
 * Polish — Polski.
 *
 * One of the tables `material-plus-ui/locales` holds. Nothing in the library
 * imports it: a translation reaches a component only once the application has
 * handed it over, which is what keeps eighteen languages out of a bundle that
 * needs one. See `internal/i18n.ts` for the whole of that reasoning.
 *
 *     import { registerMPMessages } from 'material-plus-ui';
 *     import { pl } from 'material-plus-ui/locales/pl';
 *
 *     registerMPMessages(pl);
 *
 * Anything this table leaves out falls back to English, a namespace at a time.
 */
import type { MPLocale } from '../internal/i18n';

export const pl: MPLocale = {
  locale: 'pl',
  messages: {
    common: {
      close: 'Zamknij',
      clear: 'Wyczyść',
      open: 'Otwórz',
      remove: 'Usuń',
      removeNamed: 'Usuń {label}',
      loading: 'Ładowanie'
    },
    textField: { showPassword: 'Pokaż hasło', hidePassword: 'Ukryj hasło' },
    empty: { title: 'Nic tu nie ma' },
    picker: {
      previousMonth: 'Poprzedni miesiąc',
      nextMonth: 'Następny miesiąc',
      previousYear: 'Poprzedni rok',
      nextYear: 'Następny rok',
      previousYears: 'Poprzednie lata',
      nextYears: 'Następne lata',
      chooseMonth: 'Wybierz miesiąc',
      chooseYear: 'Wybierz rok',
      today: 'Dzisiaj',
      thisMonth: 'Bieżący miesiąc',
      thisYear: 'Bieżący rok',
      now: 'Teraz',
      clear: 'Wyczyść',
      done: 'Gotowe',
      hour: 'Godzina',
      minute: 'Minuta',
      second: 'Sekunda',
      meridiem: 'AM/PM',
      start: 'Początek',
      end: 'Koniec'
    },
    numberField: { increase: 'Zwiększ', decrease: 'Zmniejsz' },
    carousel: {
      label: 'Karuzela',
      previous: 'Poprzedni slajd',
      next: 'Następny slajd',
      slide: 'Slajd {index} z {total}'
    },
    breadcrumb: { label: 'Ścieżka nawigacji', expand: 'Pokaż ukryte kroki' },
    combobox: { empty: 'Brak wyników', add: 'Dodaj „{label}”' },
    table: { empty: 'Brak danych' },
    filePicker: { prompt: 'Upuść pliki tutaj albo kliknij, aby wybrać' },
    textLink: { newTab: 'Otwiera się w nowej karcie' },
    overlay: { label: 'Nakładka' },
    alert: { dismiss: 'Zamknij' },
    chat: {
      sending: 'Wysyłanie',
      sent: 'Wysłano',
      delivered: 'Dostarczono',
      read: 'Przeczytano',
      failed: 'Nie wysłano',
      typing: 'Pisze'
    },
    spoiler: {
      reveal: 'Pokaż',
      hide: 'Ukryj',
      notice: 'Ukryte, aby nie przeczytać przez przypadek'
    },
    pagination: {
      label: 'Paginacja',
      page: 'Strona {page}',
      status: 'Strona {page} z {total}',
      previous: 'Poprzednia strona',
      next: 'Następna strona',
      first: 'Pierwsza strona',
      last: 'Ostatnia strona'
    },
    rating: {
      label: 'Ocena',
      value: '{value} z {max}',
      empty: 'Brak oceny'
    },
    colorPicker: {
      area: 'Nasycenie i jasność',
      hue: 'Barwa',
      alpha: 'Krycie',
      value: 'Wartość koloru',
      swatches: 'Kolory predefiniowane',
      clear: 'Wyczyść',
      empty: 'Brak koloru'
    },
    transfer: {
      source: 'Dostępne',
      target: 'Wybrane',
      toTarget: 'Przenieś do wybranych',
      toSource: 'Przenieś do dostępnych',
      search: 'Szukaj',
      empty: 'Nic tu nie ma'
    },
    command: {
      label: 'Paleta poleceń',
      search: 'Wpisz polecenie lub wyszukaj…',
      empty: 'Nie znaleziono poleceń'
    },
    layout: {
      skipToContent: 'Przejdź do treści',
      sidebar: 'Panel boczny',
      openSidebar: 'Otwórz panel boczny',
      closeSidebar: 'Zamknij panel boczny',
      resizeSidebar: 'Zmień szerokość panelu bocznego'
    }
  }
};
