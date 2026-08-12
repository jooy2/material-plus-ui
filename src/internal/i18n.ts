/**
 * The words the library says on its own behalf.
 *
 * Almost nothing in Material Plus writes text a reader sees — a button says
 * whatever it was handed, a dialog's title is the caller's. The exceptions are
 * the strings a component has to invent because there is nowhere else for them
 * to come from: the name on a calendar's back arrow, the word on the button that
 * empties a picker, the label a screen reader hears for a column of minutes.
 *
 * Those are collected here rather than defaulted inside each component, because
 * they are a *set*. A product in Korean does not want four pickers each
 * defaulting to English and each needing eighteen override props; and the next
 * component that needs a word should get it from the same place rather than
 * starting a second table beside this one.
 *
 * What is *not* in here is anything `Intl` already knows. Month names, weekday
 * names, AM/PM and number formats come from the platform, which speaks more
 * languages than this file ever will — see `internal/date.ts`. This is only for
 * the words the platform has no opinion about.
 *
 * Every component that reads this takes a `locale` and an override prop for the
 * strings themselves, so an unsupported language is never a dead end: `locale`
 * gets you a translation for free, `MPLocaleProvider` gets you one for the whole
 * application at once, and the prop gets you one for anything else.
 *
 * Nothing here is exported from `src/index.ts` — the public surface is
 * `MPLocaleProvider` and the per-component `labels` props.
 */

/**
 * One namespace per component, rather than one flat list of keys.
 *
 * A namespace is what makes a partial translation possible: a locale supplies
 * whatever it has and the rest falls back to English one namespace at a time, so
 * adding a namespace here does not silently blank the strings in every language
 * that has not caught up with it yet.
 */
export interface MPMessages {
  /**
   * The four pickers.
   *
   * One namespace for all of them rather than one each, because they are one
   * vocabulary: a caller who has translated "Previous month" for the date picker
   * has translated it for the range picker in the same breath, and the clock's
   * column names are shared by two components outright.
   */
  picker: {
    /** The calendar's steppers, in day view. */
    previousMonth: string;
    nextMonth: string;
    /** The same steppers in month view, where they move by a year. */
    previousYear: string;
    nextYear: string;
    /** And in year view, where they move by a page of twelve. */
    previousYears: string;
    nextYears: string;
    /** The two header buttons that open the month grid and the year grid. */
    chooseMonth: string;
    chooseYear: string;
    /** The footer's actions. */
    today: string;
    now: string;
    clear: string;
    done: string;
    /** The clock's columns, which are otherwise unlabelled lists of numbers. */
    hour: string;
    minute: string;
    second: string;
    meridiem: string;
    /** Which end of a range the calendar is currently asking for. */
    start: string;
    end: string;
  };
  /** MPAlert. */
  alert: {
    /** The × in the corner, which has no text of its own. */
    dismiss: string;
  };
  /**
   * MPChatBubble.
   *
   * Every string here is read out and never drawn: a delivery state is a mark
   * on the bubble, and the word behind it is for the readers the mark says
   * nothing to. That is exactly why they belong in this table rather than in a
   * prop — a thread is a column of forty of these, and a caller who had to hand
   * over five words per message would hand over the English ones.
   */
  chat: {
    /** On its way. */
    sending: string;
    /** It left. */
    sent: string;
    /** It arrived on their device. */
    delivered: string;
    /** They opened it. */
    read: string;
    /** It did not go — the one step that is not on the ladder. */
    failed: string;
    /** The three dots, which are a picture of somebody writing. */
    typing: string;
  };
  /**
   * MPSpoiler.
   *
   * The one namespace whose strings are *drawn* rather than only announced —
   * they are the words on the cover, and a cover written in a language the page
   * is not in is a cover nobody reads.
   */
  spoiler: {
    /** The button that uncovers the content. */
    reveal: string;
    /** The button that covers it again, when the spoiler is reversible. */
    hide: string;
    /** The line above the button, saying why the content is covered. */
    notice: string;
  };
}

/** A translation may fill in as much or as little of the table as it has. */
type PartialMessages = {
  [Namespace in keyof MPMessages]?: Partial<MPMessages[Namespace]>;
};

/**
 * English is the base, and the only entry that is complete by construction —
 * every other locale is merged over it, so a missing string is an English one
 * rather than an empty box.
 */
const base: MPMessages = {
  picker: {
    previousMonth: 'Previous month',
    nextMonth: 'Next month',
    previousYear: 'Previous year',
    nextYear: 'Next year',
    previousYears: 'Previous years',
    nextYears: 'Next years',
    chooseMonth: 'Choose a month',
    chooseYear: 'Choose a year',
    today: 'Today',
    now: 'Now',
    clear: 'Clear',
    done: 'Done',
    hour: 'Hour',
    minute: 'Minute',
    second: 'Second',
    meridiem: 'AM/PM',
    start: 'Start',
    end: 'End'
  },
  alert: {
    dismiss: 'Dismiss'
  },
  chat: {
    sending: 'Sending',
    sent: 'Sent',
    delivered: 'Delivered',
    read: 'Read',
    failed: 'Not sent',
    typing: 'Typing'
  },
  spoiler: {
    reveal: 'Reveal',
    hide: 'Hide',
    notice: 'Hidden so it is not read by accident'
  }
};

/**
 * The translations, keyed by the lowercased tag they answer to.
 *
 * Chinese is keyed by script rather than by region, because that is the axis the
 * words actually differ on — `zh-TW` and `zh-HK` want the same characters as
 * each other and different ones from `zh-CN`. The regions are mapped onto the
 * two scripts by `aliases` below.
 */
const translations: Record<string, PartialMessages> = {
  ko: {
    picker: {
      previousMonth: '이전 달',
      nextMonth: '다음 달',
      previousYear: '이전 해',
      nextYear: '다음 해',
      previousYears: '이전 연도 목록',
      nextYears: '다음 연도 목록',
      chooseMonth: '월 선택',
      chooseYear: '연도 선택',
      today: '오늘',
      now: '지금',
      clear: '지우기',
      done: '완료',
      hour: '시',
      minute: '분',
      second: '초',
      meridiem: '오전/오후',
      start: '시작',
      end: '종료'
    },
    alert: { dismiss: '닫기' },
    chat: {
      sending: '보내는 중',
      sent: '보냄',
      delivered: '전달됨',
      read: '읽음',
      failed: '전송 실패',
      typing: '입력 중'
    },
    spoiler: {
      reveal: '보기',
      hide: '가리기',
      notice: '실수로 읽지 않도록 가려 두었습니다'
    }
  },
  ja: {
    picker: {
      previousMonth: '前の月',
      nextMonth: '次の月',
      previousYear: '前の年',
      nextYear: '次の年',
      previousYears: '前の年の一覧',
      nextYears: '次の年の一覧',
      chooseMonth: '月を選択',
      chooseYear: '年を選択',
      today: '今日',
      now: '現在',
      clear: 'クリア',
      done: '完了',
      hour: '時',
      minute: '分',
      second: '秒',
      meridiem: '午前/午後',
      start: '開始',
      end: '終了'
    },
    alert: { dismiss: '閉じる' },
    chat: {
      sending: '送信中',
      sent: '送信済み',
      delivered: '配信済み',
      read: '既読',
      failed: '送信できませんでした',
      typing: '入力中'
    },
    spoiler: {
      reveal: '表示する',
      hide: '隠す',
      notice: 'うっかり読まないように隠してあります'
    }
  },
  'zh-hans': {
    picker: {
      previousMonth: '上个月',
      nextMonth: '下个月',
      previousYear: '上一年',
      nextYear: '下一年',
      previousYears: '上一页年份',
      nextYears: '下一页年份',
      chooseMonth: '选择月份',
      chooseYear: '选择年份',
      today: '今天',
      now: '此刻',
      clear: '清除',
      done: '完成',
      hour: '小时',
      minute: '分钟',
      second: '秒',
      meridiem: '上午/下午',
      start: '开始',
      end: '结束'
    },
    alert: { dismiss: '关闭' },
    chat: {
      sending: '发送中',
      sent: '已发送',
      delivered: '已送达',
      read: '已读',
      failed: '未发送',
      typing: '正在输入'
    },
    spoiler: {
      reveal: '显示',
      hide: '隐藏',
      notice: '已隐藏，以免不小心读到'
    }
  },
  'zh-hant': {
    picker: {
      previousMonth: '上個月',
      nextMonth: '下個月',
      previousYear: '上一年',
      nextYear: '下一年',
      previousYears: '上一頁年份',
      nextYears: '下一頁年份',
      chooseMonth: '選擇月份',
      chooseYear: '選擇年份',
      today: '今天',
      now: '此刻',
      clear: '清除',
      done: '完成',
      hour: '小時',
      minute: '分鐘',
      second: '秒',
      meridiem: '上午/下午',
      start: '開始',
      end: '結束'
    },
    alert: { dismiss: '關閉' },
    chat: {
      sending: '傳送中',
      sent: '已傳送',
      delivered: '已送達',
      read: '已讀',
      failed: '未傳送',
      typing: '正在輸入'
    },
    spoiler: {
      reveal: '顯示',
      hide: '隱藏',
      notice: '已隱藏，以免不小心讀到'
    }
  },
  es: {
    picker: {
      previousMonth: 'Mes anterior',
      nextMonth: 'Mes siguiente',
      previousYear: 'Año anterior',
      nextYear: 'Año siguiente',
      previousYears: 'Años anteriores',
      nextYears: 'Años siguientes',
      chooseMonth: 'Elegir un mes',
      chooseYear: 'Elegir un año',
      today: 'Hoy',
      now: 'Ahora',
      clear: 'Borrar',
      done: 'Listo',
      hour: 'Hora',
      minute: 'Minuto',
      second: 'Segundo',
      meridiem: 'a. m./p. m.',
      start: 'Inicio',
      end: 'Fin'
    },
    alert: { dismiss: 'Cerrar' },
    chat: {
      sending: 'Enviando',
      sent: 'Enviado',
      delivered: 'Entregado',
      read: 'Leído',
      failed: 'No enviado',
      typing: 'Escribiendo'
    },
    spoiler: {
      reveal: 'Mostrar',
      hide: 'Ocultar',
      notice: 'Oculto para que no se lea por accidente'
    }
  },
  pt: {
    picker: {
      previousMonth: 'Mês anterior',
      nextMonth: 'Próximo mês',
      previousYear: 'Ano anterior',
      nextYear: 'Próximo ano',
      previousYears: 'Anos anteriores',
      nextYears: 'Próximos anos',
      chooseMonth: 'Escolher um mês',
      chooseYear: 'Escolher um ano',
      today: 'Hoje',
      now: 'Agora',
      clear: 'Limpar',
      done: 'Concluído',
      hour: 'Hora',
      minute: 'Minuto',
      second: 'Segundo',
      meridiem: 'AM/PM',
      start: 'Início',
      end: 'Fim'
    },
    alert: { dismiss: 'Fechar' },
    chat: {
      sending: 'Enviando',
      sent: 'Enviado',
      delivered: 'Entregue',
      read: 'Lido',
      failed: 'Não enviado',
      typing: 'Digitando'
    },
    spoiler: {
      reveal: 'Mostrar',
      hide: 'Ocultar',
      notice: 'Oculto para não ser lido por acidente'
    }
  },
  fr: {
    picker: {
      previousMonth: 'Mois précédent',
      nextMonth: 'Mois suivant',
      previousYear: 'Année précédente',
      nextYear: 'Année suivante',
      previousYears: 'Années précédentes',
      nextYears: 'Années suivantes',
      chooseMonth: 'Choisir un mois',
      chooseYear: 'Choisir une année',
      today: "Aujourd'hui",
      now: 'Maintenant',
      clear: 'Effacer',
      done: 'Terminé',
      hour: 'Heure',
      minute: 'Minute',
      second: 'Seconde',
      meridiem: 'AM/PM',
      start: 'Début',
      end: 'Fin'
    },
    alert: { dismiss: 'Fermer' },
    chat: {
      sending: 'Envoi en cours',
      sent: 'Envoyé',
      delivered: 'Distribué',
      read: 'Lu',
      failed: 'Non envoyé',
      typing: "En train d'écrire"
    },
    spoiler: {
      reveal: 'Afficher',
      hide: 'Masquer',
      notice: 'Masqué pour ne pas être lu par accident'
    }
  },
  de: {
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
    }
  },
  it: {
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
    }
  },
  nl: {
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
    }
  },
  pl: {
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
    }
  },
  ru: {
    picker: {
      previousMonth: 'Предыдущий месяц',
      nextMonth: 'Следующий месяц',
      previousYear: 'Предыдущий год',
      nextYear: 'Следующий год',
      previousYears: 'Предыдущие годы',
      nextYears: 'Следующие годы',
      chooseMonth: 'Выбрать месяц',
      chooseYear: 'Выбрать год',
      today: 'Сегодня',
      now: 'Сейчас',
      clear: 'Очистить',
      done: 'Готово',
      hour: 'Часы',
      minute: 'Минуты',
      second: 'Секунды',
      meridiem: 'ДП/ПП',
      start: 'Начало',
      end: 'Конец'
    },
    alert: { dismiss: 'Закрыть' },
    chat: {
      sending: 'Отправка',
      sent: 'Отправлено',
      delivered: 'Доставлено',
      read: 'Прочитано',
      failed: 'Не отправлено',
      typing: 'Печатает'
    },
    spoiler: {
      reveal: 'Показать',
      hide: 'Скрыть',
      notice: 'Скрыто, чтобы не прочитать случайно'
    }
  },
  tr: {
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
    }
  },
  ar: {
    picker: {
      previousMonth: 'الشهر السابق',
      nextMonth: 'الشهر التالي',
      previousYear: 'السنة السابقة',
      nextYear: 'السنة التالية',
      previousYears: 'السنوات السابقة',
      nextYears: 'السنوات التالية',
      chooseMonth: 'اختيار شهر',
      chooseYear: 'اختيار سنة',
      today: 'اليوم',
      now: 'الآن',
      clear: 'مسح',
      done: 'تم',
      hour: 'الساعة',
      minute: 'الدقيقة',
      second: 'الثانية',
      meridiem: 'ص/م',
      start: 'البداية',
      end: 'النهاية'
    },
    alert: { dismiss: 'إغلاق' },
    chat: {
      sending: 'جارٍ الإرسال',
      sent: 'تم الإرسال',
      delivered: 'تم التسليم',
      read: 'تمت القراءة',
      failed: 'لم يتم الإرسال',
      typing: 'يكتب الآن'
    },
    spoiler: {
      reveal: 'إظهار',
      hide: 'إخفاء',
      notice: 'مخفي حتى لا يُقرأ بالخطأ'
    }
  },
  hi: {
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
    }
  },
  id: {
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
    }
  },
  vi: {
    picker: {
      previousMonth: 'Tháng trước',
      nextMonth: 'Tháng sau',
      previousYear: 'Năm trước',
      nextYear: 'Năm sau',
      previousYears: 'Các năm trước',
      nextYears: 'Các năm sau',
      chooseMonth: 'Chọn tháng',
      chooseYear: 'Chọn năm',
      today: 'Hôm nay',
      now: 'Bây giờ',
      clear: 'Xóa',
      done: 'Xong',
      hour: 'Giờ',
      minute: 'Phút',
      second: 'Giây',
      meridiem: 'SA/CH',
      start: 'Bắt đầu',
      end: 'Kết thúc'
    },
    alert: { dismiss: 'Đóng' },
    chat: {
      sending: 'Đang gửi',
      sent: 'Đã gửi',
      delivered: 'Đã nhận',
      read: 'Đã đọc',
      failed: 'Chưa gửi được',
      typing: 'Đang nhập'
    },
    spoiler: {
      reveal: 'Hiện',
      hide: 'Ẩn',
      notice: 'Đã ẩn để không vô tình đọc phải'
    }
  },
  th: {
    picker: {
      previousMonth: 'เดือนก่อนหน้า',
      nextMonth: 'เดือนถัดไป',
      previousYear: 'ปีก่อนหน้า',
      nextYear: 'ปีถัดไป',
      previousYears: 'ชุดปีก่อนหน้า',
      nextYears: 'ชุดปีถัดไป',
      chooseMonth: 'เลือกเดือน',
      chooseYear: 'เลือกปี',
      today: 'วันนี้',
      now: 'ตอนนี้',
      clear: 'ล้าง',
      done: 'เสร็จสิ้น',
      hour: 'ชั่วโมง',
      minute: 'นาที',
      second: 'วินาที',
      meridiem: 'AM/PM',
      start: 'เริ่ม',
      end: 'สิ้นสุด'
    },
    alert: { dismiss: 'ปิด' },
    chat: {
      sending: 'กำลังส่ง',
      sent: 'ส่งแล้ว',
      delivered: 'ส่งถึงแล้ว',
      read: 'อ่านแล้ว',
      failed: 'ส่งไม่สำเร็จ',
      typing: 'กำลังพิมพ์'
    },
    spoiler: {
      reveal: 'แสดง',
      hide: 'ซ่อน',
      notice: 'ซ่อนไว้เพื่อไม่ให้อ่านโดยบังเอิญ'
    }
  }
};

/**
 * The tags that are a different spelling of an entry above.
 *
 * Only the Chinese ones for now, and they are the reason the table is keyed by
 * script: a reader in Taipei asking for `zh-TW` and one in Hong Kong asking for
 * `zh-HK` want the same words, and a table keyed by region would hold that pair
 * twice. Bare `zh` resolves to Simplified, which is what every other library
 * that has had to pick one has picked.
 */
const aliases: Record<string, string> = {
  zh: 'zh-hans',
  'zh-cn': 'zh-hans',
  'zh-my': 'zh-hans',
  'zh-sg': 'zh-hans',
  'zh-hk': 'zh-hant',
  'zh-mo': 'zh-hant',
  'zh-tw': 'zh-hant'
};

/**
 * A BCP 47 tag, broadest match last.
 *
 * `zh-Hant-TW` asks for `zh-hant`, then `zh-tw`, then `zh`; `pt-BR` asks for
 * `pt-br` and then `pt`. The subtags are found by shape rather than by position,
 * because a tag can carry an extension or a variant between them and
 * `split('-')[1]` would take that for the script.
 */
function candidates(locale: string): string[] {
  const subtags = locale.toLowerCase().split(/[-_]/).filter(Boolean);
  const language = subtags[0];

  if (!language) {
    return [];
  }

  const rest = subtags.slice(1);
  const script = rest.find((subtag) => /^[a-z]{4}$/.test(subtag));
  const region = rest.find((subtag) => /^([a-z]{2}|\d{3})$/.test(subtag));

  return [
    script ? `${language}-${script}` : '',
    region ? `${language}-${region}` : '',
    language
  ].filter(Boolean);
}

/**
 * Resolved tables, keyed by the tag that was asked for.
 *
 * A module-level cache rather than a `useMemo` per component: the merge is the
 * same work for every picker on a page, and a filter bar is where this gets
 * called half a dozen times with the same tag.
 */
const resolved = new Map<string, MPMessages>([['', base]]);

/**
 * The strings for a locale, merged over English.
 *
 * `undefined` is English rather than the runtime's own locale, and that is
 * deliberate: `navigator.language` differs between the server that renders the
 * markup and the browser that hydrates it, and text that changes between those
 * two is a hydration mismatch in the one part of the page a reader is looking
 * at. A component that should follow the reader is *told* which language to
 * follow — by its own `locale` prop, or by an `MPLocaleProvider` above it.
 *
 * Note that this is only about the words in the table. The dates themselves are
 * formatted by `Intl` against the same tag, and `Intl` speaks every language the
 * platform does whether or not there is an entry here.
 */
export function resolveMessages(locale?: string): MPMessages {
  const key = locale?.trim() ?? '';
  const cached = resolved.get(key);

  if (cached) {
    return cached;
  }

  const match = candidates(key)
    .map((candidate) => translations[candidate] ?? translations[aliases[candidate] ?? ''])
    .find(Boolean);

  const messages: MPMessages = match
    ? {
        picker: { ...base.picker, ...match.picker },
        alert: { ...base.alert, ...match.alert },
        chat: { ...base.chat, ...match.chat },
        spoiler: { ...base.spoiler, ...match.spoiler }
      }
    : base;

  resolved.set(key, messages);

  return messages;
}
