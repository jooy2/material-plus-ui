// The names and patterns below are Unicode CLDR data, read through ICU 78
// (CLDR 48). The Unicode License requires this notice to travel with them.
//
// UNICODE LICENSE V3
//
// COPYRIGHT AND PERMISSION NOTICE
//
// Copyright © 2016-2025 Unicode, Inc.
//
// NOTICE TO USER: Carefully read the following legal agreement. BY
// DOWNLOADING, INSTALLING, COPYING OR OTHERWISE USING DATA FILES, AND/OR
// SOFTWARE, YOU UNEQUIVOCALLY ACCEPT, AND AGREE TO BE BOUND BY, ALL OF THE
// TERMS AND CONDITIONS OF THIS AGREEMENT. IF YOU DO NOT AGREE, DO NOT
// DOWNLOAD, INSTALL, COPY, DISTRIBUTE OR USE THE DATA FILES OR SOFTWARE.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of data files and any associated documentation (the "Data Files") or
// software and any associated documentation (the "Software") to deal in the
// Data Files or Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute, and/or sell
// copies of the Data Files or Software, and to permit persons to whom the
// Data Files or Software are furnished to do so, provided that either (a)
// this copyright and permission notice appear with all copies of the Data
// Files or Software, or (b) this copyright and permission notice appear in
// associated Documentation.
//
// THE DATA FILES AND SOFTWARE ARE PROVIDED "AS IS", WITHOUT WARRANTY OF ANY
// KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT OF
// THIRD PARTY RIGHTS.
//
// IN NO EVENT SHALL THE COPYRIGHT HOLDER OR HOLDERS INCLUDED IN THIS NOTICE
// BE LIABLE FOR ANY CLAIM, OR ANY SPECIAL INDIRECT OR CONSEQUENTIAL DAMAGES,
// OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS,
// WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION,
// ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THE DATA
// FILES OR SOFTWARE.
//
// Except as contained in this notice, the name of a copyright holder shall
// not be used in advertising or otherwise to promote the sale, use or other
// dealings in these Data Files or Software without prior written
// authorization of the copyright holder.
//
// SPDX-License-Identifier: Unicode-3.0

/// The month and weekday names, and the shapes dates are written in, for the
/// eighteen languages the library ships words for.
///
/// Generated from ICU 78's CLDR data, by asking `Intl.DateTimeFormat` the same
/// questions the React package asks it at run time: the month and weekday
/// names, AM and PM, whether the month is written before the year, which day
/// the week starts on, whether the clock is a 12-hour one, and the patterns of
/// a full date, a medium date, a month and year and a time. Western digits and
/// the Gregorian calendar throughout: see `MPDateNames` for why.
///
/// Keyed by the same tags `registerMPMessages` is given, with the same
/// aliases for Chinese, so one locale string reaches the words and the dates
/// alike. Only the language decides: `en-GB` reads the `en` table, which is
/// the United States' (Sunday first, a 12-hour clock). A region that writes
/// dates differently passes its own `MPDateNames`.
///
/// None of it is exported from `material_plus_ui.dart`.
library;

import 'package:material_plus_ui/src/internal/date.dart';
import 'package:material_plus_ui/src/types.dart';

/// The names for [locale], or English when the library has no table for it.
///
/// The tag is matched the way a translation is: `zh-Hant-TW` asks for
/// `zh-hant`, then `zh-tw`, then `zh`.
MPDateNames mpDateNamesFor(String? locale) {
  final List<String> subtags = (locale ?? '')
      .toLowerCase()
      .split(RegExp('[-_]'))
      .where((String subtag) => subtag.isNotEmpty)
      .toList();

  if (subtags.isEmpty) {
    return MPDateNames.english;
  }

  final String language = subtags.first;
  final Iterable<String> rest = subtags.skip(1);
  final String? script = rest.where((String subtag) => subtag.length == 4).firstOrNull;
  final String? region = rest
      .where((String subtag) => RegExp(r'^([a-z]{2}|\d{3})$').hasMatch(subtag))
      .firstOrNull;

  for (final String candidate in <String>[
    if (script != null) '$language-$script',
    if (region != null) '$language-$region',
    language,
  ]) {
    final MPDateNames? names = _tables[candidate];

    if (names != null) {
      return names;
    }
  }

  return MPDateNames.english;
}

const Map<String, MPDateNames> _tables = <String, MPDateNames>{
  'en': MPDateNames.english,
  'ar': _ar,
  'de': _de,
  'es': _es,
  'fr': _fr,
  'hi': _hi,
  'id': _id,
  'it': _it,
  'ja': _ja,
  'ko': _ko,
  'nl': _nl,
  'pl': _pl,
  'pt': _pt,
  'ru': _ru,
  'th': _th,
  'tr': _tr,
  'vi': _vi,
  'zh-hans': _zhHans,
  'zh': _zhHans,
  'zh-cn': _zhHans,
  'zh-my': _zhHans,
  'zh-sg': _zhHans,
  'zh-hant': _zhHant,
  'zh-tw': _zhHant,
  'zh-hk': _zhHant,
  'zh-mo': _zhHant,
};

/// Arabic, `ar`.
const MPDateNames _ar = MPDateNames(
  months: <String>[
    'يناير',
    'فبراير',
    'مارس',
    'أبريل',
    'مايو',
    'يونيو',
    'يوليو',
    'أغسطس',
    'سبتمبر',
    'أكتوبر',
    'نوفمبر',
    'ديسمبر',
  ],
  monthsShort: <String>[
    'يناير',
    'فبراير',
    'مارس',
    'أبريل',
    'مايو',
    'يونيو',
    'يوليو',
    'أغسطس',
    'سبتمبر',
    'أكتوبر',
    'نوفمبر',
    'ديسمبر',
  ],
  weekdays: <String>['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  weekdaysShort: <String>['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  weekdaysNarrow: <String>['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  am: 'ص',
  pm: 'م',
  firstDayOfWeek: MPWeekday.saturday,
  patterns: MPDatePatterns(
    fullDate: 'EEEE، d MMMM y',
    mediumDate: 'dd\u200F/MM\u200F/y',
    dateTime: '{date}، {time}',
  ),
);

/// German, `de`.
const MPDateNames _de = MPDateNames(
  months: <String>[
    'Januar',
    'Februar',
    'März',
    'April',
    'Mai',
    'Juni',
    'Juli',
    'August',
    'September',
    'Oktober',
    'November',
    'Dezember',
  ],
  monthsShort: <String>[
    'Jan',
    'Feb',
    'Mär',
    'Apr',
    'Mai',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Okt',
    'Nov',
    'Dez',
  ],
  weekdays: <String>[
    'Sonntag',
    'Montag',
    'Dienstag',
    'Mittwoch',
    'Donnerstag',
    'Freitag',
    'Samstag',
  ],
  weekdaysShort: <String>['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
  weekdaysNarrow: <String>['S', 'M', 'D', 'M', 'D', 'F', 'S'],
  am: 'AM',
  pm: 'PM',
  firstDayOfWeek: MPWeekday.monday,
  hour12: false,
  patterns: MPDatePatterns(
    fullDate: 'EEEE, d. MMMM y',
    mediumDate: 'dd.MM.y',
    time24: 'H:mm',
    time24Seconds: 'H:mm:ss',
    shortTime12: 'hh:mm a',
  ),
);

/// Spanish, `es`.
const MPDateNames _es = MPDateNames(
  months: <String>[
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ],
  monthsShort: <String>[
    'ene',
    'feb',
    'mar',
    'abr',
    'may',
    'jun',
    'jul',
    'ago',
    'sept',
    'oct',
    'nov',
    'dic',
  ],
  weekdays: <String>['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  weekdaysShort: <String>['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
  weekdaysNarrow: <String>['D', 'L', 'M', 'X', 'J', 'V', 'S'],
  am: 'a. m.',
  pm: 'p. m.',
  firstDayOfWeek: MPWeekday.monday,
  hour12: false,
  patterns: MPDatePatterns(
    fullDate: "EEEE, d' de 'MMMM' de 'y",
    mediumDate: 'd MMM y',
    yearMonth: "MMMM' de 'y",
    time24: 'H:mm',
    time24Seconds: 'H:mm:ss',
    shortTime24: 'H:mm',
  ),
);

/// French, `fr`.
const MPDateNames _fr = MPDateNames(
  months: <String>[
    'janvier',
    'février',
    'mars',
    'avril',
    'mai',
    'juin',
    'juillet',
    'août',
    'septembre',
    'octobre',
    'novembre',
    'décembre',
  ],
  monthsShort: <String>[
    'janv.',
    'févr.',
    'mars',
    'avr.',
    'mai',
    'juin',
    'juil.',
    'août',
    'sept.',
    'oct.',
    'nov.',
    'déc.',
  ],
  weekdays: <String>['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  weekdaysShort: <String>['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  weekdaysNarrow: <String>['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  am: 'AM',
  pm: 'PM',
  firstDayOfWeek: MPWeekday.monday,
  hour12: false,
  patterns: MPDatePatterns(
    fullDate: 'EEEE d MMMM y',
    mediumDate: 'd MMM y',
    time24: 'H:mm',
    time24Seconds: 'H:mm:ss',
    shortTime12: 'hh:mm a',
  ),
);

/// Hindi, `hi`.
const MPDateNames _hi = MPDateNames(
  months: <String>[
    'जनवरी',
    'फ़रवरी',
    'मार्च',
    'अप्रैल',
    'मई',
    'जून',
    'जुलाई',
    'अगस्त',
    'सितंबर',
    'अक्टूबर',
    'नवंबर',
    'दिसंबर',
  ],
  monthsShort: <String>[
    'जन॰',
    'फ़र॰',
    'मार्च',
    'अप्रैल',
    'मई',
    'जून',
    'जुल॰',
    'अग॰',
    'सित॰',
    'अक्टू॰',
    'नव॰',
    'दिस॰',
  ],
  weekdays: <String>['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'],
  weekdaysShort: <String>['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'],
  weekdaysNarrow: <String>['र', 'सो', 'मं', 'बु', 'गु', 'शु', 'श'],
  am: 'am',
  pm: 'pm',
  firstDayOfWeek: MPWeekday.sunday,
  patterns: MPDatePatterns(fullDate: 'EEEE, d MMMM y', mediumDate: 'd MMM y'),
);

/// Indonesian, `id`.
const MPDateNames _id = MPDateNames(
  months: <String>[
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ],
  monthsShort: <String>[
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'Mei',
    'Jun',
    'Jul',
    'Agu',
    'Sep',
    'Okt',
    'Nov',
    'Des',
  ],
  weekdays: <String>['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
  weekdaysShort: <String>['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
  weekdaysNarrow: <String>['M', 'S', 'S', 'R', 'K', 'J', 'S'],
  am: 'AM',
  pm: 'PM',
  firstDayOfWeek: MPWeekday.sunday,
  hour12: false,
  patterns: MPDatePatterns(
    fullDate: 'EEEE, dd MMMM y',
    mediumDate: 'd MMM y',
    time12: 'h.mm a',
    time12Seconds: 'h.mm.ss a',
    time24: 'H.mm',
    time24Seconds: 'H.mm.ss',
    shortTime12: 'hh.mm a',
    shortTime24: 'HH.mm',
  ),
);

/// Italian, `it`.
const MPDateNames _it = MPDateNames(
  months: <String>[
    'gennaio',
    'febbraio',
    'marzo',
    'aprile',
    'maggio',
    'giugno',
    'luglio',
    'agosto',
    'settembre',
    'ottobre',
    'novembre',
    'dicembre',
  ],
  monthsShort: <String>[
    'gen',
    'feb',
    'mar',
    'apr',
    'mag',
    'giu',
    'lug',
    'ago',
    'set',
    'ott',
    'nov',
    'dic',
  ],
  weekdays: <String>['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'],
  weekdaysShort: <String>['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'],
  weekdaysNarrow: <String>['D', 'L', 'M', 'M', 'G', 'V', 'S'],
  am: 'AM',
  pm: 'PM',
  firstDayOfWeek: MPWeekday.monday,
  hour12: false,
  patterns: MPDatePatterns(
    fullDate: 'EEEE d MMMM y',
    mediumDate: 'd MMM y',
    time24: 'H:mm',
    time24Seconds: 'H:mm:ss',
    shortTime12: 'hh:mm a',
  ),
);

/// Japanese, `ja`.
const MPDateNames _ja = MPDateNames(
  months: <String>['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  monthsShort: <String>['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  weekdays: <String>['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
  weekdaysShort: <String>['日', '月', '火', '水', '木', '金', '土'],
  weekdaysNarrow: <String>['日', '月', '火', '水', '木', '金', '土'],
  am: '午前',
  pm: '午後',
  monthBeforeYear: false,
  firstDayOfWeek: MPWeekday.sunday,
  hour12: false,
  patterns: MPDatePatterns(
    fullDate: 'y年M月d日EEEE',
    mediumDate: 'y/MM/dd',
    yearMonth: 'y年M月',
    year: 'y年',
    time12: 'ah:mm',
    time12Seconds: 'ah:mm:ss',
    time24: 'H:mm',
    time24Seconds: 'H:mm:ss',
    shortTime12: 'ah:mm',
    shortTime24: 'H:mm',
    dateTime: '{date} {time}',
  ),
);

/// Korean, `ko`.
const MPDateNames _ko = MPDateNames(
  months: <String>['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  monthsShort: <String>['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  weekdays: <String>['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  weekdaysShort: <String>['일', '월', '화', '수', '목', '금', '토'],
  weekdaysNarrow: <String>['일', '월', '화', '수', '목', '금', '토'],
  am: '오전',
  pm: '오후',
  monthBeforeYear: false,
  firstDayOfWeek: MPWeekday.sunday,
  patterns: MPDatePatterns(
    fullDate: 'y년 MMMM d일 EEEE',
    mediumDate: 'y. M. d.',
    yearMonth: 'y년 MMMM',
    year: 'y년',
    time12: 'a h:mm',
    time12Seconds: 'a h:mm:ss',
    time24Seconds: 'H:mm:ss',
    shortTime12: 'a h:mm',
    dateTime: '{date} {time}',
  ),
);

/// Dutch, `nl`.
const MPDateNames _nl = MPDateNames(
  months: <String>[
    'januari',
    'februari',
    'maart',
    'april',
    'mei',
    'juni',
    'juli',
    'augustus',
    'september',
    'oktober',
    'november',
    'december',
  ],
  monthsShort: <String>[
    'jan',
    'feb',
    'mrt',
    'apr',
    'mei',
    'jun',
    'jul',
    'aug',
    'sep',
    'okt',
    'nov',
    'dec',
  ],
  weekdays: <String>[
    'zondag',
    'maandag',
    'dinsdag',
    'woensdag',
    'donderdag',
    'vrijdag',
    'zaterdag',
  ],
  weekdaysShort: <String>['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'],
  weekdaysNarrow: <String>['Z', 'M', 'D', 'W', 'D', 'V', 'Z'],
  am: 'a.m.',
  pm: 'p.m.',
  firstDayOfWeek: MPWeekday.monday,
  hour12: false,
  patterns: MPDatePatterns(
    fullDate: 'EEEE d MMMM y',
    mediumDate: 'd MMM y',
    time24: 'H:mm',
    time24Seconds: 'H:mm:ss',
    shortTime12: 'hh:mm a',
  ),
);

/// Polish, `pl`.
const MPDateNames _pl = MPDateNames(
  months: <String>[
    'styczeń',
    'luty',
    'marzec',
    'kwiecień',
    'maj',
    'czerwiec',
    'lipiec',
    'sierpień',
    'wrzesień',
    'październik',
    'listopad',
    'grudzień',
  ],
  monthsShort: <String>[
    'sty',
    'lut',
    'mar',
    'kwi',
    'maj',
    'cze',
    'lip',
    'sie',
    'wrz',
    'paź',
    'lis',
    'gru',
  ],
  formatMonths: <String>[
    'stycznia',
    'lutego',
    'marca',
    'kwietnia',
    'maja',
    'czerwca',
    'lipca',
    'sierpnia',
    'września',
    'października',
    'listopada',
    'grudnia',
  ],
  weekdays: <String>[
    'niedziela',
    'poniedziałek',
    'wtorek',
    'środa',
    'czwartek',
    'piątek',
    'sobota',
  ],
  weekdaysShort: <String>['niedz.', 'pon.', 'wt.', 'śr.', 'czw.', 'pt.', 'sob.'],
  weekdaysNarrow: <String>['N', 'P', 'W', 'Ś', 'C', 'P', 'S'],
  am: 'AM',
  pm: 'PM',
  firstDayOfWeek: MPWeekday.monday,
  hour12: false,
  patterns: MPDatePatterns(
    fullDate: 'EEEE, d MMMM y',
    mediumDate: 'd MMM y',
    yearMonth: 'LLLL y',
    time24: 'H:mm',
    time24Seconds: 'H:mm:ss',
    shortTime12: 'hh:mm a',
  ),
);

/// Portuguese, `pt`.
const MPDateNames _pt = MPDateNames(
  months: <String>[
    'janeiro',
    'fevereiro',
    'março',
    'abril',
    'maio',
    'junho',
    'julho',
    'agosto',
    'setembro',
    'outubro',
    'novembro',
    'dezembro',
  ],
  monthsShort: <String>[
    'jan.',
    'fev.',
    'mar.',
    'abr.',
    'mai.',
    'jun.',
    'jul.',
    'ago.',
    'set.',
    'out.',
    'nov.',
    'dez.',
  ],
  weekdays: <String>[
    'domingo',
    'segunda-feira',
    'terça-feira',
    'quarta-feira',
    'quinta-feira',
    'sexta-feira',
    'sábado',
  ],
  weekdaysShort: <String>['dom.', 'seg.', 'ter.', 'qua.', 'qui.', 'sex.', 'sáb.'],
  weekdaysNarrow: <String>['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
  am: 'AM',
  pm: 'PM',
  firstDayOfWeek: MPWeekday.sunday,
  hour12: false,
  patterns: MPDatePatterns(
    fullDate: "EEEE, d' de 'MMMM' de 'y",
    mediumDate: "d' de 'MMM' de 'y",
    yearMonth: "MMMM' de 'y",
    time24: 'H:mm',
    time24Seconds: 'H:mm:ss',
    shortTime12: 'hh:mm a',
  ),
);

/// Russian, `ru`.
const MPDateNames _ru = MPDateNames(
  months: <String>[
    'январь',
    'февраль',
    'март',
    'апрель',
    'май',
    'июнь',
    'июль',
    'август',
    'сентябрь',
    'октябрь',
    'ноябрь',
    'декабрь',
  ],
  monthsShort: <String>[
    'янв.',
    'февр.',
    'март',
    'апр.',
    'май',
    'июнь',
    'июль',
    'авг.',
    'сент.',
    'окт.',
    'нояб.',
    'дек.',
  ],
  formatMonths: <String>[
    'января',
    'февраля',
    'марта',
    'апреля',
    'мая',
    'июня',
    'июля',
    'августа',
    'сентября',
    'октября',
    'ноября',
    'декабря',
  ],
  formatMonthsShort: <String>[
    'янв.',
    'февр.',
    'мар.',
    'апр.',
    'мая',
    'июн.',
    'июл.',
    'авг.',
    'сент.',
    'окт.',
    'нояб.',
    'дек.',
  ],
  weekdays: <String>[
    'воскресенье',
    'понедельник',
    'вторник',
    'среда',
    'четверг',
    'пятница',
    'суббота',
  ],
  weekdaysShort: <String>['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
  weekdaysNarrow: <String>['В', 'П', 'В', 'С', 'Ч', 'П', 'С'],
  am: 'AM',
  pm: 'PM',
  firstDayOfWeek: MPWeekday.monday,
  hour12: false,
  patterns: MPDatePatterns(
    fullDate: 'EEEE, d MMMM y г.',
    mediumDate: 'd MMM y г.',
    yearMonth: 'LLLL y г.',
    time24: 'H:mm',
    time24Seconds: 'H:mm:ss',
    shortTime12: 'hh:mm a',
  ),
);

/// Thai, `th`.
const MPDateNames _th = MPDateNames(
  months: <String>[
    'มกราคม',
    'กุมภาพันธ์',
    'มีนาคม',
    'เมษายน',
    'พฤษภาคม',
    'มิถุนายน',
    'กรกฎาคม',
    'สิงหาคม',
    'กันยายน',
    'ตุลาคม',
    'พฤศจิกายน',
    'ธันวาคม',
  ],
  monthsShort: <String>[
    'ม.ค.',
    'ก.พ.',
    'มี.ค.',
    'เม.ย.',
    'พ.ค.',
    'มิ.ย.',
    'ก.ค.',
    'ส.ค.',
    'ก.ย.',
    'ต.ค.',
    'พ.ย.',
    'ธ.ค.',
  ],
  weekdays: <String>[
    'วันอาทิตย์',
    'วันจันทร์',
    'วันอังคาร',
    'วันพุธ',
    'วันพฤหัสบดี',
    'วันศุกร์',
    'วันเสาร์',
  ],
  weekdaysShort: <String>['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์'],
  weekdaysNarrow: <String>['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'],
  am: 'AM',
  pm: 'PM',
  firstDayOfWeek: MPWeekday.sunday,
  hour12: false,
  patterns: MPDatePatterns(
    fullDate: 'EEEEที่ d MMMM ค.ศ. y',
    mediumDate: 'd MMM y',
    time24: 'H:mm',
    time24Seconds: 'H:mm:ss',
    shortTime12: 'hh:mm a',
    dateTime: '{date} {time}',
  ),
);

/// Turkish, `tr`.
const MPDateNames _tr = MPDateNames(
  months: <String>[
    'Ocak',
    'Şubat',
    'Mart',
    'Nisan',
    'Mayıs',
    'Haziran',
    'Temmuz',
    'Ağustos',
    'Eylül',
    'Ekim',
    'Kasım',
    'Aralık',
  ],
  monthsShort: <String>[
    'Oca',
    'Şub',
    'Mar',
    'Nis',
    'May',
    'Haz',
    'Tem',
    'Ağu',
    'Eyl',
    'Eki',
    'Kas',
    'Ara',
  ],
  weekdays: <String>['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
  weekdaysShort: <String>['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'],
  weekdaysNarrow: <String>['P', 'P', 'S', 'Ç', 'P', 'C', 'C'],
  am: 'ÖÖ',
  pm: 'ÖS',
  firstDayOfWeek: MPWeekday.monday,
  hour12: false,
  patterns: MPDatePatterns(
    fullDate: 'd MMMM y EEEE',
    mediumDate: 'd MMM y',
    time12: 'a h:mm',
    time12Seconds: 'a h:mm:ss',
    time24: 'H:mm',
    time24Seconds: 'H:mm:ss',
    shortTime12: 'a hh:mm',
    dateTime: '{date} {time}',
  ),
);

/// Vietnamese, `vi`.
const MPDateNames _vi = MPDateNames(
  months: <String>[
    'Tháng 1',
    'Tháng 2',
    'Tháng 3',
    'Tháng 4',
    'Tháng 5',
    'Tháng 6',
    'Tháng 7',
    'Tháng 8',
    'Tháng 9',
    'Tháng 10',
    'Tháng 11',
    'Tháng 12',
  ],
  monthsShort: <String>[
    'Tháng 1',
    'Tháng 2',
    'Tháng 3',
    'Tháng 4',
    'Tháng 5',
    'Tháng 6',
    'Tháng 7',
    'Tháng 8',
    'Tháng 9',
    'Tháng 10',
    'Tháng 11',
    'Tháng 12',
  ],
  formatMonths: <String>[
    'tháng 1',
    'tháng 2',
    'tháng 3',
    'tháng 4',
    'tháng 5',
    'tháng 6',
    'tháng 7',
    'tháng 8',
    'tháng 9',
    'tháng 10',
    'tháng 11',
    'tháng 12',
  ],
  formatMonthsShort: <String>[
    'thg 1',
    'thg 2',
    'thg 3',
    'thg 4',
    'thg 5',
    'thg 6',
    'thg 7',
    'thg 8',
    'thg 9',
    'thg 10',
    'thg 11',
    'thg 12',
  ],
  weekdays: <String>['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'],
  weekdaysShort: <String>['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'],
  weekdaysNarrow: <String>['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
  am: 'SA',
  pm: 'CH',
  firstDayOfWeek: MPWeekday.monday,
  hour12: false,
  patterns: MPDatePatterns(
    fullDate: 'EEEE, d MMMM, y',
    mediumDate: 'd MMM, y',
    yearMonth: "MMMM' năm 'y",
    time24: 'H:mm',
    time24Seconds: 'H:mm:ss',
    shortTime12: 'hh:mm a',
    dateTime: '{time} {date}',
  ),
);

/// Chinese, simplified script, `zh-Hans`.
const MPDateNames _zhHans = MPDateNames(
  months: <String>['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
  monthsShort: <String>['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  weekdays: <String>['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  weekdaysShort: <String>['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
  weekdaysNarrow: <String>['日', '一', '二', '三', '四', '五', '六'],
  am: '上午',
  pm: '下午',
  monthBeforeYear: false,
  firstDayOfWeek: MPWeekday.monday,
  hour12: false,
  patterns: MPDatePatterns(
    fullDate: 'y年M月d日EEEE',
    mediumDate: 'y年M月d日',
    yearMonth: 'y年M月',
    year: 'y年',
    time12: 'ah:mm',
    time12Seconds: 'ah:mm:ss',
    time24: 'H:mm',
    time24Seconds: 'H:mm:ss',
    shortTime12: 'ahh:mm',
    dateTime: '{date} {time}',
  ),
);

/// Chinese, traditional script, `zh-Hant`.
const MPDateNames _zhHant = MPDateNames(
  months: <String>['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  monthsShort: <String>['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  weekdays: <String>['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  weekdaysShort: <String>['週日', '週一', '週二', '週三', '週四', '週五', '週六'],
  weekdaysNarrow: <String>['日', '一', '二', '三', '四', '五', '六'],
  am: '上午',
  pm: '下午',
  monthBeforeYear: false,
  firstDayOfWeek: MPWeekday.sunday,
  patterns: MPDatePatterns(
    fullDate: 'y年M月d日 EEEE',
    mediumDate: 'y年M月d日',
    yearMonth: 'y年M月',
    year: 'y年',
    time12: 'ah:mm',
    time12Seconds: 'ah:mm:ss',
    shortTime12: 'ah:mm',
    dateTime: '{date} {time}',
  ),
);
