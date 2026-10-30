/// Italian.
///
/// One of the tables `package:material_plus_ui/locales.dart` holds. Nothing in
/// the library imports it: a translation reaches a component only once the
/// application has handed it to `registerMPMessages`. Anything it leaves out
/// falls back to English, a namespace at a time.
library;

import 'package:material_plus_ui/src/internal/i18n.dart';

/// The library's words in Italian.
const MPLocale it = MPLocale(
  locale: 'it',
  messages: <String, Map<String, String>>{
    'common': <String, String>{
      'close': 'Chiudi',
      'clear': 'Cancella',
      'open': 'Apri',
      'remove': 'Rimuovi',
      'removeNamed': 'Rimuovi {label}',
      'loading': 'Caricamento',
      'required': 'Obbligatorio',
    },
    'textField': <String, String>{
      'showPassword': 'Mostra la password',
      'hidePassword': 'Nascondi la password',
    },
    'empty': <String, String>{'title': 'Non c\'è nulla qui'},
    'picker': <String, String>{
      'previousMonth': 'Mese precedente',
      'nextMonth': 'Mese successivo',
      'previousYear': 'Anno precedente',
      'nextYear': 'Anno successivo',
      'previousYears': 'Anni precedenti',
      'nextYears': 'Anni successivi',
      'chooseMonth': 'Scegli un mese',
      'chooseYear': 'Scegli un anno',
      'today': 'Oggi',
      'thisMonth': 'Questo mese',
      'thisYear': 'Quest\'anno',
      'now': 'Adesso',
      'clear': 'Cancella',
      'done': 'Fatto',
      'hour': 'Ora',
      'minute': 'Minuto',
      'second': 'Secondo',
      'meridiem': 'AM/PM',
      'start': 'Inizio',
      'end': 'Fine',
    },
    'numberField': <String, String>{'increase': 'Aumenta', 'decrease': 'Diminuisci'},
    'carousel': <String, String>{
      'label': 'Carosello',
      'previous': 'Diapositiva precedente',
      'next': 'Diapositiva successiva',
      'slide': 'Diapositiva {index} di {total}',
    },
    'scroll': <String, String>{
      'label': 'Contenuto scorrevole',
      'previous': 'Scorri indietro',
      'next': 'Scorri avanti',
    },
    'anchor': <String, String>{'label': 'In questa pagina'},
    'code': <String, String>{
      'copy': 'Copia',
      'copied': 'Copiato',
      'copyFailed': 'Copia non riuscita',
      'raw': 'Testo semplice',
      'label': 'Codice',
    },
    'breadcrumb': <String, String>{
      'label': 'Percorso di navigazione',
      'expand': 'Mostra i passaggi nascosti',
    },
    'combobox': <String, String>{'empty': 'Nessuna corrispondenza', 'add': 'Aggiungi «{label}»'},
    'tour': <String, String>{
      'previous': 'Indietro',
      'next': 'Avanti',
      'done': 'Fatto',
      'skip': 'Salta',
      'position': 'Passo {index} di {total}',
    },
    'chart': <String, String>{
      'label': 'Grafico',
      'table': 'Dati del grafico',
      'category': 'Categoria',
      'total': 'Totale',
      'showAll': 'Mostra tutto',
    },
    'sparkline': <String, String>{'summary': '{count} punti, da {first} a {last}'},
    'table': <String, String>{'empty': 'Nessun dato'},
    'dataTable': <String, String>{
      'selectAll': 'Seleziona tutte le righe',
      'selectRow': 'Seleziona la riga',
      'total': 'Righe: {total}',
      'selected': 'Selezionate: {count}',
      'download': 'Scarica il CSV',
      'perPage': 'Righe per pagina',
      'resize': 'Ridimensiona la colonna',
    },
    'filePicker': <String, String>{'prompt': 'Trascina qui i file, oppure fai clic per sfogliare'},
    'textLink': <String, String>{'newTab': 'Si apre in una nuova scheda'},
    'overlay': <String, String>{'label': 'Sovrapposizione'},
    'alert': <String, String>{'dismiss': 'Chiudi'},
    'chat': <String, String>{
      'sending': 'Invio in corso',
      'sent': 'Inviato',
      'delivered': 'Consegnato',
      'read': 'Letto',
      'failed': 'Non inviato',
      'typing': 'Sta scrivendo',
    },
    'spoiler': <String, String>{
      'reveal': 'Mostra',
      'hide': 'Nascondi',
      'notice': 'Nascosto per non essere letto per sbaglio',
    },
    'pagination': <String, String>{
      'label': 'Impaginazione',
      'page': 'Pagina {page}',
      'status': 'Pagina {page} di {total}',
      'previous': 'Pagina precedente',
      'next': 'Pagina successiva',
      'first': 'Prima pagina',
      'last': 'Ultima pagina',
    },
    'rating': <String, String>{
      'label': 'Valutazione',
      'value': '{value} su {max}',
      'empty': 'Non valutato',
    },
    'colorPicker': <String, String>{
      'area': 'Saturazione e luminosità',
      'hue': 'Tonalità',
      'alpha': 'Opacità',
      'value': 'Valore del colore',
      'swatches': 'Colori predefiniti',
      'clear': 'Cancella',
      'empty': 'Nessun colore',
    },
    'transfer': <String, String>{
      'source': 'Disponibili',
      'target': 'Selezionati',
      'toTarget': 'Sposta tra i selezionati',
      'toSource': 'Riporta tra i disponibili',
      'search': 'Cerca',
      'empty': 'Nessun elemento',
      'moved': 'Spostati in {list}: {count}',
    },
    'command': <String, String>{
      'label': 'Tavolozza comandi',
      'search': 'Digita un comando o cerca…',
      'empty': 'Nessun comando trovato',
    },
    'layout': <String, String>{
      'skipToContent': 'Vai al contenuto',
      'sidebar': 'Barra laterale',
      'openSidebar': 'Apri la barra laterale',
      'closeSidebar': 'Chiudi la barra laterale',
      'resizeSidebar': 'Ridimensiona la barra laterale',
    },
    'confirm': <String, String>{'confirm': 'Conferma', 'cancel': 'Annulla', 'ok': 'OK'},
  },
);
