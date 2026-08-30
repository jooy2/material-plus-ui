/**
 * Hindi — हिन्दी.
 *
 * One of the tables `material-plus-ui/locales` holds. Nothing in the library
 * imports it: a translation reaches a component only once the application has
 * handed it over, which is what keeps eighteen languages out of a bundle that
 * needs one. See `internal/i18n.ts` for the whole of that reasoning.
 *
 *     import { registerMPMessages } from 'material-plus-ui';
 *     import { hi } from 'material-plus-ui/locales/hi';
 *
 *     registerMPMessages(hi);
 *
 * Anything this table leaves out falls back to English, a namespace at a time.
 */
import type { MPLocale } from '../internal/i18n';

export const hi: MPLocale = {
  locale: 'hi',
  messages: {
    common: {
      close: 'बंद करें',
      clear: 'हटाएँ',
      open: 'खोलें',
      remove: 'निकालें',
      removeNamed: '{label} निकालें',
      loading: 'लोड हो रहा है'
    },
    textField: { showPassword: 'पासवर्ड दिखाएँ', hidePassword: 'पासवर्ड छिपाएँ' },
    empty: { title: 'यहाँ कुछ नहीं है' },
    picker: {
      previousMonth: 'पिछला महीना',
      nextMonth: 'अगला महीना',
      previousYear: 'पिछला वर्ष',
      nextYear: 'अगला वर्ष',
      previousYears: 'पिछले वर्ष',
      nextYears: 'अगले वर्ष',
      chooseMonth: 'महीना चुनें',
      chooseYear: 'वर्ष चुनें',
      today: 'आज',
      now: 'अभी',
      clear: 'हटाएँ',
      done: 'हो गया',
      hour: 'घंटा',
      minute: 'मिनट',
      second: 'सेकंड',
      meridiem: 'AM/PM',
      start: 'प्रारंभ',
      end: 'समाप्ति'
    },
    alert: { dismiss: 'बंद करें' },
    chat: {
      sending: 'भेजा जा रहा है',
      sent: 'भेजा गया',
      delivered: 'पहुँच गया',
      read: 'पढ़ लिया गया',
      failed: 'नहीं भेजा गया',
      typing: 'टाइप कर रहे हैं'
    },
    spoiler: {
      reveal: 'दिखाएँ',
      hide: 'छिपाएँ',
      notice: 'गलती से न पढ़ लिया जाए इसलिए छिपाया गया है'
    },
    pagination: {
      label: 'पृष्ठ क्रमांकन',
      page: 'पृष्ठ {page}',
      status: '{total} में से पृष्ठ {page}',
      previous: 'पिछला पृष्ठ',
      next: 'अगला पृष्ठ',
      first: 'पहला पृष्ठ',
      last: 'अंतिम पृष्ठ'
    },
    rating: {
      label: 'रेटिंग',
      value: '{max} में से {value}',
      empty: 'रेटिंग नहीं दी गई'
    },
    transfer: {
      source: 'उपलब्ध',
      target: 'चयनित',
      toTarget: 'चयनित में ले जाएँ',
      toSource: 'उपलब्ध में वापस भेजें',
      search: 'खोजें',
      empty: 'यहाँ कुछ नहीं है'
    },
    command: {
      label: 'कमांड पैलेट',
      search: 'कमांड लिखें या खोजें…',
      empty: 'कोई कमांड नहीं मिली'
    },
    layout: {
      skipToContent: 'सामग्री पर जाएँ',
      sidebar: 'साइडबार',
      openSidebar: 'साइडबार खोलें',
      closeSidebar: 'साइडबार बंद करें',
      resizeSidebar: 'साइडबार का आकार बदलें'
    }
  }
};
