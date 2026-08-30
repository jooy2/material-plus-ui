/**
 * Indonesian — Bahasa Indonesia.
 *
 * One of the tables `material-plus-ui/locales` holds. Nothing in the library
 * imports it: a translation reaches a component only once the application has
 * handed it over, which is what keeps eighteen languages out of a bundle that
 * needs one. See `internal/i18n.ts` for the whole of that reasoning.
 *
 *     import { registerMPMessages } from 'material-plus-ui';
 *     import { id } from 'material-plus-ui/locales/id';
 *
 *     registerMPMessages(id);
 *
 * Anything this table leaves out falls back to English, a namespace at a time.
 */
import type { MPLocale } from '../internal/i18n';

export const id: MPLocale = {
  locale: 'id',
  messages: {
    common: {
      close: 'Tutup',
      clear: 'Bersihkan',
      open: 'Buka',
      remove: 'Hapus',
      removeNamed: 'Hapus {label}',
      loading: 'Memuat'
    },
    textField: { showPassword: 'Tampilkan kata sandi', hidePassword: 'Sembunyikan kata sandi' },
    empty: { title: 'Tidak ada apa-apa di sini' },
    picker: {
      previousMonth: 'Bulan sebelumnya',
      nextMonth: 'Bulan berikutnya',
      previousYear: 'Tahun sebelumnya',
      nextYear: 'Tahun berikutnya',
      previousYears: 'Tahun-tahun sebelumnya',
      nextYears: 'Tahun-tahun berikutnya',
      chooseMonth: 'Pilih bulan',
      chooseYear: 'Pilih tahun',
      today: 'Hari ini',
      now: 'Sekarang',
      clear: 'Hapus',
      done: 'Selesai',
      hour: 'Jam',
      minute: 'Menit',
      second: 'Detik',
      meridiem: 'AM/PM',
      start: 'Mulai',
      end: 'Akhir'
    },
    alert: { dismiss: 'Tutup' },
    chat: {
      sending: 'Mengirim',
      sent: 'Terkirim',
      delivered: 'Diterima',
      read: 'Dibaca',
      failed: 'Gagal terkirim',
      typing: 'Sedang mengetik'
    },
    spoiler: {
      reveal: 'Tampilkan',
      hide: 'Sembunyikan',
      notice: 'Disembunyikan agar tidak terbaca tanpa sengaja'
    },
    pagination: {
      label: 'Penomoran halaman',
      page: 'Halaman {page}',
      status: 'Halaman {page} dari {total}',
      previous: 'Halaman sebelumnya',
      next: 'Halaman berikutnya',
      first: 'Halaman pertama',
      last: 'Halaman terakhir'
    },
    rating: {
      label: 'Peringkat',
      value: '{value} dari {max}',
      empty: 'Belum dinilai'
    },
    transfer: {
      source: 'Tersedia',
      target: 'Terpilih',
      toTarget: 'Pindahkan ke terpilih',
      toSource: 'Kembalikan ke tersedia',
      search: 'Cari',
      empty: 'Tidak ada apa pun'
    },
    command: {
      label: 'Palet perintah',
      search: 'Ketik perintah atau cari…',
      empty: 'Perintah tidak ditemukan'
    },
    layout: {
      skipToContent: 'Lewati ke konten',
      sidebar: 'Bilah sisi',
      openSidebar: 'Buka bilah sisi',
      closeSidebar: 'Tutup bilah sisi',
      resizeSidebar: 'Ubah lebar bilah sisi'
    }
  }
};
