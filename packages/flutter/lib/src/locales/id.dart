/// Indonesian.
///
/// One of the tables `package:material_plus_ui/locales.dart` holds. Nothing in
/// the library imports it: a translation reaches a component only once the
/// application has handed it to `registerMPMessages`. Anything it leaves out
/// falls back to English, a namespace at a time.
library;

import 'package:material_plus_ui/src/internal/i18n.dart';

/// The library's words in Indonesian.
const MPLocale id = MPLocale(
  locale: 'id',
  messages: <String, Map<String, String>>{
    'common': <String, String>{
      'close': 'Tutup',
      'clear': 'Bersihkan',
      'open': 'Buka',
      'remove': 'Hapus',
      'removeNamed': 'Hapus {label}',
      'loading': 'Memuat',
      'required': 'Wajib diisi',
    },
    'textField': <String, String>{
      'showPassword': 'Tampilkan kata sandi',
      'hidePassword': 'Sembunyikan kata sandi',
    },
    'empty': <String, String>{'title': 'Tidak ada apa-apa di sini'},
    'picker': <String, String>{
      'previousMonth': 'Bulan sebelumnya',
      'nextMonth': 'Bulan berikutnya',
      'previousYear': 'Tahun sebelumnya',
      'nextYear': 'Tahun berikutnya',
      'previousYears': 'Tahun-tahun sebelumnya',
      'nextYears': 'Tahun-tahun berikutnya',
      'chooseMonth': 'Pilih bulan',
      'chooseYear': 'Pilih tahun',
      'today': 'Hari ini',
      'thisMonth': 'Bulan ini',
      'thisYear': 'Tahun ini',
      'now': 'Sekarang',
      'clear': 'Hapus',
      'done': 'Selesai',
      'hour': 'Jam',
      'minute': 'Menit',
      'second': 'Detik',
      'meridiem': 'AM/PM',
      'start': 'Mulai',
      'end': 'Akhir',
    },
    'numberField': <String, String>{'increase': 'Tambah', 'decrease': 'Kurangi'},
    'carousel': <String, String>{
      'label': 'Karosel',
      'previous': 'Slide sebelumnya',
      'next': 'Slide berikutnya',
      'slide': 'Slide {index} dari {total}',
    },
    'scroll': <String, String>{
      'label': 'Konten yang dapat digulir',
      'previous': 'Gulir mundur',
      'next': 'Gulir maju',
    },
    'anchor': <String, String>{'label': 'Di halaman ini'},
    'code': <String, String>{
      'copy': 'Salin',
      'copied': 'Tersalin',
      'copyFailed': 'Gagal menyalin',
      'raw': 'Teks polos',
      'label': 'Kode',
    },
    'breadcrumb': <String, String>{
      'label': 'Remah roti',
      'expand': 'Tampilkan langkah tersembunyi',
    },
    'combobox': <String, String>{'empty': 'Tidak ada yang cocok', 'add': 'Tambahkan “{label}”'},
    'tour': <String, String>{
      'previous': 'Kembali',
      'next': 'Berikutnya',
      'done': 'Selesai',
      'skip': 'Lewati',
      'position': 'Langkah {index} dari {total}',
    },
    'chart': <String, String>{
      'label': 'Bagan',
      'table': 'Data bagan',
      'category': 'Kategori',
      'total': 'Total',
      'showAll': 'Tampilkan semua',
    },
    'sparkline': <String, String>{'summary': '{count} titik, dari {first} ke {last}'},
    'table': <String, String>{'empty': 'Tidak ada data'},
    'dataTable': <String, String>{
      'selectAll': 'Pilih semua baris',
      'selectRow': 'Pilih baris',
      'total': '{total} baris',
      'selected': '{count} dipilih',
      'download': 'Unduh CSV',
      'perPage': 'Baris per halaman',
      'resize': 'Ubah lebar kolom',
    },
    'filePicker': <String, String>{'prompt': 'Letakkan berkas di sini, atau klik untuk menelusuri'},
    'textLink': <String, String>{'newTab': 'Membuka di tab baru'},
    'overlay': <String, String>{'label': 'Hamparan'},
    'alert': <String, String>{'dismiss': 'Tutup'},
    'chat': <String, String>{
      'sending': 'Mengirim',
      'sent': 'Terkirim',
      'delivered': 'Diterima',
      'read': 'Dibaca',
      'failed': 'Gagal terkirim',
      'typing': 'Sedang mengetik',
    },
    'spoiler': <String, String>{
      'reveal': 'Tampilkan',
      'hide': 'Sembunyikan',
      'notice': 'Disembunyikan agar tidak terbaca tanpa sengaja',
    },
    'pagination': <String, String>{
      'label': 'Penomoran halaman',
      'page': 'Halaman {page}',
      'status': 'Halaman {page} dari {total}',
      'previous': 'Halaman sebelumnya',
      'next': 'Halaman berikutnya',
      'first': 'Halaman pertama',
      'last': 'Halaman terakhir',
    },
    'rating': <String, String>{
      'label': 'Peringkat',
      'value': '{value} dari {max}',
      'empty': 'Belum dinilai',
    },
    'colorPicker': <String, String>{
      'area': 'Saturasi dan kecerahan',
      'hue': 'Rona',
      'alpha': 'Opasitas',
      'value': 'Nilai warna',
      'swatches': 'Warna preset',
      'clear': 'Hapus',
      'empty': 'Tanpa warna',
    },
    'transfer': <String, String>{
      'source': 'Tersedia',
      'target': 'Terpilih',
      'toTarget': 'Pindahkan ke terpilih',
      'toSource': 'Kembalikan ke tersedia',
      'search': 'Cari',
      'empty': 'Tidak ada apa pun',
      'moved': 'Dipindahkan ke {list}: {count}',
    },
    'command': <String, String>{
      'label': 'Palet perintah',
      'search': 'Ketik perintah atau cari…',
      'empty': 'Perintah tidak ditemukan',
    },
    'layout': <String, String>{
      'skipToContent': 'Lewati ke konten',
      'sidebar': 'Bilah sisi',
      'openSidebar': 'Buka bilah sisi',
      'closeSidebar': 'Tutup bilah sisi',
      'resizeSidebar': 'Ubah lebar bilah sisi',
    },
    'confirm': <String, String>{'confirm': 'Konfirmasi', 'cancel': 'Batal', 'ok': 'OK'},
  },
);
