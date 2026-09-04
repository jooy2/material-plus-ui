/**
 * Turkish — Türkçe.
 *
 * One of the tables `material-plus-ui/locales` holds. Nothing in the library
 * imports it: a translation reaches a component only once the application has
 * handed it over, which is what keeps eighteen languages out of a bundle that
 * needs one. See `internal/i18n.ts` for the whole of that reasoning.
 *
 *     import { registerMPMessages } from 'material-plus-ui';
 *     import { tr } from 'material-plus-ui/locales/tr';
 *
 *     registerMPMessages(tr);
 *
 * Anything this table leaves out falls back to English, a namespace at a time.
 */
import type { MPLocale } from '../internal/i18n';

export const tr: MPLocale = {
  locale: 'tr',
  messages: {
    common: {
      close: 'Kapat',
      clear: 'Temizle',
      open: 'Aç',
      remove: 'Kaldır',
      removeNamed: '{label} kaldır',
      loading: 'Yükleniyor'
    },
    textField: { showPassword: 'Parolayı göster', hidePassword: 'Parolayı gizle' },
    empty: { title: 'Burada bir şey yok' },
    picker: {
      previousMonth: 'Önceki ay',
      nextMonth: 'Sonraki ay',
      previousYear: 'Önceki yıl',
      nextYear: 'Sonraki yıl',
      previousYears: 'Önceki yıllar',
      nextYears: 'Sonraki yıllar',
      chooseMonth: 'Ay seçin',
      chooseYear: 'Yıl seçin',
      today: 'Bugün',
      thisMonth: 'Bu ay',
      thisYear: 'Bu yıl',
      now: 'Şimdi',
      clear: 'Temizle',
      done: 'Tamam',
      hour: 'Saat',
      minute: 'Dakika',
      second: 'Saniye',
      meridiem: 'ÖÖ/ÖS',
      start: 'Başlangıç',
      end: 'Bitiş'
    },
    numberField: { increase: 'Artır', decrease: 'Azalt' },
    carousel: {
      label: 'Döngü',
      previous: 'Önceki slayt',
      next: 'Sonraki slayt',
      slide: '{total} slayttan {index}. slayt'
    },
    scroll: { label: 'Kaydırılabilir içerik', previous: 'Geri kaydır', next: 'İleri kaydır' },
    anchor: { label: 'Bu sayfada' },
    breadcrumb: { label: 'Gezinme yolu', expand: 'Gizli adımları göster' },
    combobox: { empty: 'Eşleşme yok', add: '“{label}” ekle' },
    table: { empty: 'Veri yok' },
    filePicker: { prompt: 'Dosyaları buraya bırakın veya seçmek için tıklayın' },
    textLink: { newTab: 'Yeni sekmede açılır' },
    overlay: { label: 'Yer paylaşımı' },
    alert: { dismiss: 'Kapat' },
    chat: {
      sending: 'Gönderiliyor',
      sent: 'Gönderildi',
      delivered: 'İletildi',
      read: 'Okundu',
      failed: 'Gönderilemedi',
      typing: 'Yazıyor'
    },
    spoiler: {
      reveal: 'Göster',
      hide: 'Gizle',
      notice: 'Yanlışlıkla okunmasın diye gizlendi'
    },
    pagination: {
      label: 'Sayfalama',
      page: 'Sayfa {page}',
      status: '{total} sayfadan {page}. sayfa',
      previous: 'Önceki sayfa',
      next: 'Sonraki sayfa',
      first: 'İlk sayfa',
      last: 'Son sayfa'
    },
    rating: {
      label: 'Değerlendirme',
      value: '{max} üzerinden {value}',
      empty: 'Değerlendirilmedi'
    },
    colorPicker: {
      area: 'Doygunluk ve parlaklık',
      hue: 'Renk tonu',
      alpha: 'Opaklık',
      value: 'Renk değeri',
      swatches: 'Hazır renkler',
      clear: 'Temizle',
      empty: 'Renk yok'
    },
    transfer: {
      source: 'Kullanılabilir',
      target: 'Seçili',
      toTarget: 'Seçilenlere taşı',
      toSource: 'Kullanılabilire geri al',
      search: 'Ara',
      empty: 'Burada bir şey yok'
    },
    command: {
      label: 'Komut paleti',
      search: 'Bir komut yazın veya arayın…',
      empty: 'Komut bulunamadı'
    },
    layout: {
      skipToContent: 'İçeriğe geç',
      sidebar: 'Kenar çubuğu',
      openSidebar: 'Kenar çubuğunu aç',
      closeSidebar: 'Kenar çubuğunu kapat',
      resizeSidebar: 'Kenar çubuğunu yeniden boyutlandır'
    },
    confirm: {
      confirm: 'Onayla',
      cancel: 'İptal',
      ok: 'Tamam'
    }
  }
};
