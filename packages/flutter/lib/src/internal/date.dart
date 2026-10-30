/// The arithmetic and the naming the four pickers share.
///
/// The Dart half of the React package's `internal/date.ts`, and it carries the
/// same rule: **no date library under it.** The Flutter package has no
/// dependencies at all beyond the framework, and one that quietly added
/// `package:intl` — or worse, picked a side in the `intl` / `jiffy` / `timezone`
/// argument on its consumer's behalf — would have made a decision that was not
/// its to make.
///
/// Which is also where the two packages part company. React gets `Intl` for
/// free from the platform, so a `locale` string is enough to produce every month
/// name, every weekday name and the order the header writes them in. The Flutter
/// framework ships nothing of the kind, so the words arrive as a [MPDateNames]
/// instead: the library's own table for the locale (`date_locales.dart`, one per
/// language it ships words for), English for anything else, and an object of
/// the caller's for whatever the tables do not cover.
///
/// Two rules hold everywhere below:
///
/// - **Local time, always.** A calendar day is a thing a person is looking at
///   on a wall, not an instant on a line. Every comparison here is made on the
///   local Y/M/D triple, so a picker in Seoul and a picker in São Paulo both
///   light up the cell that says 27.
/// - **Nothing is mutated.** `DateTime` is immutable in Dart, which makes this
///   free — but every function still returns a new value rather than reaching
///   into one it was handed.
///
/// None of it is exported from `material_plus_ui.dart` except [MPDateNames],
/// [MPDatePatterns], [MPDatePrecision] and [MPTimeUnit], which a caller has to
/// be able to name.
library;

import 'package:flutter/foundation.dart';

import 'package:material_plus_ui/src/types.dart';

/// Which unit the calendar is currently letting you pick.
enum MPCalendarView {
  /// The days of one month.
  day,

  /// The twelve months of one year.
  month,

  /// Twelve years at a time.
  year,
}

/// Which unit a picker asks for: the view its calendar stops at.
///
/// The same three words as the calendar's views, and deliberately a second
/// name, as in the React package: one is what is on screen at this moment, the
/// other is what the control is *for*. A day picker passes through all three
/// views and answers with a day; a month picker never draws a day grid, and the
/// year view above it is a way of reaching a month rather than an answer of its
/// own.
enum MPDatePrecision {
  /// A day, from the day grid. The calendar everyone means.
  day,

  /// A month, answered with its 1st. There is no day grid under it.
  month,

  /// A year, answered with 1 January.
  year,
}

/// How many years one page of the year grid holds. Four columns of three.
const int yearPageSize = 12;

/// The shapes a language writes a date and a time in.
///
/// ICU's pattern letters, the subset a picker needs: `y` the year, `M` and
/// `MM` the month as a number, `MMM` and `MMMM` its short and full name as it
/// is written inside a date, `LLL` and `LLLL` the same names standing alone,
/// `d` and `dd` the day, `E` and `EEEE` the weekday, `h` and `hh` the hour on a
/// 12-hour clock, `K` the same from 0, `H` and `HH` the hour on a 24-hour one,
/// `mm` the minute, `ss` the second and `a` AM or PM. Anything else stands for
/// itself, and an ASCII letter meant literally goes in single quotes:
/// `"d 'de' MMMM"`.
///
/// Each is the answer `Intl.DateTimeFormat` gives the React package for the
/// same request, so a trigger writes a day the same way in both: [mediumDate]
/// is `dateStyle: 'medium'`, [time12] is `{ hour: 'numeric', minute:
/// '2-digit', hour12: true }`, and so on.
@immutable
class MPDatePatterns {
  /// Creates a set of patterns. Anything left out is English's.
  const MPDatePatterns({
    this.fullDate = 'EEEE, MMMM d, y',
    this.mediumDate = 'MMM d, y',
    this.yearMonth = 'MMMM y',
    this.year = 'y',
    this.time12 = 'h:mm a',
    this.time12Seconds = 'h:mm:ss a',
    this.time24 = 'HH:mm',
    this.time24Seconds = 'HH:mm:ss',
    this.shortTime12 = 'h:mm a',
    this.shortTime24 = 'HH:mm',
    this.dateTime = '{date}, {time}',
  });

  /// The whole date, weekday included: what a day cell is called to a screen
  /// reader. `dateStyle: 'full'`.
  final String fullDate;

  /// What a day picker's trigger writes. `dateStyle: 'medium'`.
  final String mediumDate;

  /// The month and the year, for a month picker's trigger and a month cell's
  /// name. `{ year: 'numeric', month: 'long' }`.
  final String yearMonth;

  /// The year alone, for a year picker's trigger.
  final String year;

  /// A time on a 12-hour clock.
  final String time12;

  /// The same with seconds.
  final String time12Seconds;

  /// A time on a 24-hour clock.
  final String time24;

  /// The same with seconds.
  final String time24Seconds;

  /// The time half of a date and time, on a 12-hour clock: `timeStyle:
  /// 'short'`, which is not always [time12] (German pads the hour).
  final String shortTime12;

  /// The same on a 24-hour clock.
  final String shortTime24;

  /// How a date and a time are put together, with `{date}` and `{time}` where
  /// the two go: `{date}, {time}` in English, `{time} {date}` in Vietnamese.
  final String dateTime;

  /// A copy with some of the patterns replaced.
  MPDatePatterns copyWith({
    String? fullDate,
    String? mediumDate,
    String? yearMonth,
    String? year,
    String? time12,
    String? time12Seconds,
    String? time24,
    String? time24Seconds,
    String? shortTime12,
    String? shortTime24,
    String? dateTime,
  }) {
    return MPDatePatterns(
      fullDate: fullDate ?? this.fullDate,
      mediumDate: mediumDate ?? this.mediumDate,
      yearMonth: yearMonth ?? this.yearMonth,
      year: year ?? this.year,
      time12: time12 ?? this.time12,
      time12Seconds: time12Seconds ?? this.time12Seconds,
      time24: time24 ?? this.time24,
      time24Seconds: time24Seconds ?? this.time24Seconds,
      shortTime12: shortTime12 ?? this.shortTime12,
      shortTime24: shortTime24 ?? this.shortTime24,
      dateTime: dateTime ?? this.dateTime,
    );
  }

  List<String> get _fields => <String>[
    fullDate,
    mediumDate,
    yearMonth,
    year,
    time12,
    time12Seconds,
    time24,
    time24Seconds,
    shortTime12,
    shortTime24,
    dateTime,
  ];

  @override
  bool operator ==(Object other) => other is MPDatePatterns && listEquals(other._fields, _fields);

  @override
  int get hashCode => Object.hashAll(_fields);
}

/// The words a calendar draws that are not numbers, and the shapes it writes a
/// date in.
///
/// **This is what a `locale` string reaches in the React package**, and it is
/// an object here because the framework has no `Intl` to ask. The pickers find
/// one for their locale on their own: the library carries a table for each of
/// the eighteen languages it ships words for, read off the same tag the words
/// are (`locale`, then `MPLocaleProvider`, then `MPConfigProvider`, then the
/// app's `Localizations`), and English for anything else. Pass one of these as
/// `names` for a language or a region it does not carry. An app that already
/// depends on `package:intl` builds the lists from `DateFormat`:
///
/// ```dart
/// MPDateNames(
///   months: List<String>.generate(12, (int i) => DateFormat.LLLL(locale).format(DateTime(2021, i + 1))),
///   monthsShort: List<String>.generate(12, (int i) => DateFormat.LLL(locale).format(DateTime(2021, i + 1))),
///   weekdays: List<String>.generate(7, (int i) => DateFormat.EEEE(locale).format(DateTime(2021, 8, i + 1))),
///   weekdaysShort: List<String>.generate(7, (int i) => DateFormat.E(locale).format(DateTime(2021, 8, i + 1))),
///   weekdaysNarrow: List<String>.generate(7, (int i) => DateFormat.EEEEE(locale).format(DateTime(2021, 8, i + 1))),
/// )
/// ```
///
/// Every weekday list is **Sunday first**, whatever the week is drawn as
/// starting on: they are indexed by `DateTime.weekday % 7`, and rotating them
/// is the calendar's job rather than the caller's.
///
/// Digits are always Western and the calendar always Gregorian, which is where
/// the tables part from `Intl`: Arabic's dates are written `07/07/2026` rather
/// than in Arabic-Indic digits, and Thai's years are not the Buddhist era's.
/// The React grids number their cells the same way.
@immutable
class MPDateNames {
  /// Creates a set of names. Anything left out is English.
  ///
  /// The month lists want twelve entries and the weekday lists want seven.
  /// Nothing asserts it — the constructor is `const`, and a `const` expression
  /// cannot read `.length` off a parameter — so a short list is a range error
  /// at the cell that reaches past its end.
  const MPDateNames({
    this.months = _englishMonths,
    this.monthsShort = _englishMonthsShort,
    this.formatMonths,
    this.formatMonthsShort,
    this.weekdays = _englishWeekdays,
    this.weekdaysShort = _englishWeekdaysShort,
    this.weekdaysNarrow = _englishWeekdaysNarrow,
    this.am = 'AM',
    this.pm = 'PM',
    this.monthBeforeYear = true,
    this.firstDayOfWeek = MPWeekday.sunday,
    this.hour12 = true,
    this.patterns = const MPDatePatterns(),
  });

  /// English, and the default. Named so a caller can extend it with `copyWith`.
  static const MPDateNames english = MPDateNames();

  /// The twelve month names in full, January first, as they stand on their
  /// own: the header's month button.
  final List<String> months;

  /// The same twelve, abbreviated. What the month grid draws.
  final List<String> monthsShort;

  /// The month names as they are written inside a date, for a language that
  /// inflects them: Polish `lipiec` on its own and `7 lipca 2026` in a date.
  /// Read by `MMMM`. Left out, [months].
  final List<String>? formatMonths;

  /// The same, abbreviated, read by `MMM`. Left out, [monthsShort].
  final List<String>? formatMonthsShort;

  /// The seven weekday names in full, **Sunday first**.
  final List<String> weekdays;

  /// The same seven, abbreviated.
  final List<String> weekdaysShort;

  /// The same seven, as narrow as the language writes them. What the day
  /// grid's column headers draw, as MD3's own calendar does.
  ///
  /// English narrow names collide (`S M T W T F S`), so the full name goes on
  /// each header's semantics and a screen reader hears "Monday" rather than
  /// "M".
  final List<String> weekdaysNarrow;

  /// The first half of the day, for a 12-hour clock.
  final String am;

  /// And the second.
  final String pm;

  /// Whether the header writes the month before the year.
  ///
  /// `July 2026` in English and `2026년 7월` in Korean, and the header is two
  /// separate buttons rather than one string — so it cannot just print what a
  /// formatter gives it and has to be told which comes first. Getting this wrong
  /// is subtle and reads as broken to exactly the people it is wrong for.
  final bool monthBeforeYear;

  /// Which day the week starts on — Sunday in the US and Korea, Monday across
  /// most of Europe, Saturday in much of the Middle East.
  ///
  /// A picker's own `weekStartsOn` overrides it; this is the default for the
  /// language rather than for the screen.
  final MPWeekday firstDayOfWeek;

  /// Whether the language reads a clock on a 12-hour dial. A time picker's own
  /// `hour12` overrides it.
  final bool hour12;

  /// The shapes a date and a time are written in.
  final MPDatePatterns patterns;

  /// A copy with some of the names replaced.
  MPDateNames copyWith({
    List<String>? months,
    List<String>? monthsShort,
    List<String>? formatMonths,
    List<String>? formatMonthsShort,
    List<String>? weekdays,
    List<String>? weekdaysShort,
    List<String>? weekdaysNarrow,
    String? am,
    String? pm,
    bool? monthBeforeYear,
    MPWeekday? firstDayOfWeek,
    bool? hour12,
    MPDatePatterns? patterns,
  }) {
    return MPDateNames(
      months: months ?? this.months,
      monthsShort: monthsShort ?? this.monthsShort,
      formatMonths: formatMonths ?? this.formatMonths,
      formatMonthsShort: formatMonthsShort ?? this.formatMonthsShort,
      weekdays: weekdays ?? this.weekdays,
      weekdaysShort: weekdaysShort ?? this.weekdaysShort,
      weekdaysNarrow: weekdaysNarrow ?? this.weekdaysNarrow,
      am: am ?? this.am,
      pm: pm ?? this.pm,
      monthBeforeYear: monthBeforeYear ?? this.monthBeforeYear,
      firstDayOfWeek: firstDayOfWeek ?? this.firstDayOfWeek,
      hour12: hour12 ?? this.hour12,
      patterns: patterns ?? this.patterns,
    );
  }

  /// The seven column headers, rotated so the first one is [start].
  ///
  /// [short] picks the abbreviated names over the full ones, and [narrow] the
  /// narrow ones over both.
  List<String> weekdayRow(MPWeekday start, {bool short = true, bool narrow = false}) {
    final List<String> source = narrow
        ? weekdaysNarrow
        : short
        ? weekdaysShort
        : weekdays;
    // `MPWeekday` counts as `DateTime.weekday` does, Monday 1 to Sunday 7; the
    // lists are Sunday first.
    final int offset = start.value % 7;

    return <String>[for (int i = 0; i < 7; i += 1) source[(offset + i) % 7]];
  }

  /// [date] written in [pattern], out of these names. See [MPDatePatterns] for
  /// the letters.
  String format(DateTime date, String pattern) => _formatDate(this, date, pattern);

  /// What a cell is called to a screen reader: the whole date, never the
  /// number. [MPDatePatterns.fullDate].
  String spell(DateTime date) => format(date, patterns.fullDate);

  /// The medium form a day picker's trigger writes when no `format` was given.
  String medium(DateTime date) => format(date, patterns.mediumDate);

  /// The month and the year alone, for a picker whose `precision` stops there,
  /// in the order the language writes them.
  String monthYear(DateTime date) => format(date, patterns.yearMonth);

  /// The year alone, for a year picker.
  String year(DateTime date) => format(date, patterns.year);

  /// The time of day, on a 12-hour clock when [hour12] says so, with the
  /// seconds when [seconds] does.
  String time(DateTime date, {required bool hour12, bool seconds = false}) {
    final String pattern = hour12
        ? (seconds ? patterns.time12Seconds : patterns.time12)
        : (seconds ? patterns.time24Seconds : patterns.time24);

    return format(date, pattern);
  }

  /// The day and the time together, as a date-time picker's trigger writes
  /// them: [medium] and the short time, joined the way the language joins them.
  String dateTime(DateTime date, {required bool hour12}) {
    final String time = format(date, hour12 ? patterns.shortTime12 : patterns.shortTime24);

    return patterns.dateTime.replaceFirst('{date}', medium(date)).replaceFirst('{time}', time);
  }

  /// Equal when the words are, rather than when the object is the same one.
  ///
  /// The natural place to write `MPDateNames.english.copyWith(...)` is inside
  /// `build`, and a fresh object every frame with no `==` would rebuild
  /// everything that depends on it for words that did not change.
  @override
  bool operator ==(Object other) {
    return other is MPDateNames &&
        listEquals(other.months, months) &&
        listEquals(other.monthsShort, monthsShort) &&
        listEquals(other.formatMonths, formatMonths) &&
        listEquals(other.formatMonthsShort, formatMonthsShort) &&
        listEquals(other.weekdays, weekdays) &&
        listEquals(other.weekdaysShort, weekdaysShort) &&
        listEquals(other.weekdaysNarrow, weekdaysNarrow) &&
        other.am == am &&
        other.pm == pm &&
        other.monthBeforeYear == monthBeforeYear &&
        other.firstDayOfWeek == firstDayOfWeek &&
        other.hour12 == hour12 &&
        other.patterns == patterns;
  }

  @override
  int get hashCode => Object.hash(
    Object.hashAll(months),
    Object.hashAll(monthsShort),
    formatMonths == null ? null : Object.hashAll(formatMonths!),
    formatMonthsShort == null ? null : Object.hashAll(formatMonthsShort!),
    Object.hashAll(weekdays),
    Object.hashAll(weekdaysShort),
    Object.hashAll(weekdaysNarrow),
    am,
    pm,
    monthBeforeYear,
    firstDayOfWeek,
    hour12,
    patterns,
  );

  static const List<String> _englishMonths = <String>[
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  static const List<String> _englishMonthsShort = <String>[
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  static const List<String> _englishWeekdays = <String>[
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  static const List<String> _englishWeekdaysShort = <String>[
    'Sun',
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
  ];

  static const List<String> _englishWeekdaysNarrow = <String>['S', 'M', 'T', 'W', 'T', 'F', 'S'];
}

/// Whether [unit] is an ASCII letter, which in a pattern is a field rather
/// than itself.
bool _isPatternLetter(int unit) => (unit >= 0x41 && unit <= 0x5A) || (unit >= 0x61 && unit <= 0x7A);

/// Writes [date] in [pattern] out of [names].
///
/// A walk over the pattern rather than a table of formatters: the subset of
/// ICU's letters a picker uses is small, and a run of one letter is all a
/// token is. A quoted run is copied as it is, and `''` is an apostrophe.
String _formatDate(MPDateNames names, DateTime date, String pattern) {
  final StringBuffer out = StringBuffer();
  int i = 0;

  String two(int value) => value.toString().padLeft(2, '0');

  while (i < pattern.length) {
    final String char = pattern[i];

    if (char == "'") {
      // `''` outside a quote is one apostrophe.
      if (i + 1 < pattern.length && pattern[i + 1] == "'") {
        out.write("'");
        i += 2;
        continue;
      }

      i += 1;

      while (i < pattern.length) {
        if (pattern[i] == "'") {
          if (i + 1 < pattern.length && pattern[i + 1] == "'") {
            out.write("'");
            i += 2;
            continue;
          }

          i += 1;
          break;
        }

        out.write(pattern[i]);
        i += 1;
      }

      continue;
    }

    if (!_isPatternLetter(pattern.codeUnitAt(i))) {
      out.write(char);
      i += 1;
      continue;
    }

    int run = 1;

    while (i + run < pattern.length && pattern[i + run] == char) {
      run += 1;
    }

    i += run;

    final int hour12 = date.hour % 12 == 0 ? 12 : date.hour % 12;

    switch (char) {
      case 'y':
        out.write(run == 2 ? two(date.year % 100) : date.year.toString());
      case 'M':
        out.write(switch (run) {
          1 => '${date.month}',
          2 => two(date.month),
          3 => (names.formatMonthsShort ?? names.monthsShort)[date.month - 1],
          _ => (names.formatMonths ?? names.months)[date.month - 1],
        });
      case 'L':
        out.write(switch (run) {
          1 => '${date.month}',
          2 => two(date.month),
          3 => names.monthsShort[date.month - 1],
          _ => names.months[date.month - 1],
        });
      case 'd':
        out.write(run >= 2 ? two(date.day) : '${date.day}');
      case 'E':
        out.write(
          run >= 4 ? names.weekdays[date.weekday % 7] : names.weekdaysShort[date.weekday % 7],
        );
      case 'h':
        out.write(run >= 2 ? two(hour12) : '$hour12');
      case 'K':
        out.write(run >= 2 ? two(date.hour % 12) : '${date.hour % 12}');
      case 'H':
        out.write(run >= 2 ? two(date.hour) : '${date.hour}');
      case 'k':
        final int hour = date.hour == 0 ? 24 : date.hour;
        out.write(run >= 2 ? two(hour) : '$hour');
      case 'm':
        out.write(run >= 2 ? two(date.minute) : '${date.minute}');
      case 's':
        out.write(run >= 2 ? two(date.second) : '${date.second}');
      case 'a':
        out.write(date.hour < 12 ? names.am : names.pm);
      default:
        // A letter this does not know is written as it was, which is what a
        // reader would rather see than nothing.
        out.write(char * run);
    }
  }

  return out.toString();
}

/* ---------------------------------------------------------------------------
 * Construction
 * ------------------------------------------------------------------------ */

/// The same day with the clock wound back to midnight.
DateTime startOfDay(DateTime date) => DateTime(date.year, date.month, date.day);

/// The first day of the month this date is in, at midnight.
DateTime startOfMonth(DateTime date) => DateTime(date.year, date.month);

/// The 1st of January of the year this date is in, at midnight.
DateTime startOfYear(DateTime date) => DateTime(date.year);

/// How many days a month has, leap years included.
///
/// Day `0` of the month after, which `DateTime` normalises to the last day of
/// this one — the same trick the React half uses, and the reason neither has a
/// table of month lengths or a leap-year rule to get wrong.
int daysInMonth(int year, int month) => DateTime(year, month + 1, 0).day;

/// Today, at midnight. The one place the pickers read the clock for a *date*.
DateTime todayDate() => startOfDay(DateTime.now());

/* ---------------------------------------------------------------------------
 * Arithmetic
 * ------------------------------------------------------------------------ */

/// [amount] days later, keeping the time of day.
///
/// Built out of Y/M/D rather than by adding a [Duration], and that is not
/// fussiness: a `Duration` of 24 hours is not a day across a daylight-saving
/// boundary, and a calendar that skips or repeats a cell twice a year is a
/// calendar nobody can explain.
DateTime addDays(DateTime date, int amount) {
  return DateTime(date.year, date.month, date.day + amount, date.hour, date.minute, date.second);
}

/// [amount] months later, with the day of the month **clamped** rather than
/// allowed to overflow.
///
/// 31 January plus one month is 28 February, not 3 March. `DateTime` gives the
/// second answer on its own, which is why stepping a calendar forward from a
/// 31st without this skips February entirely.
DateTime addMonths(DateTime date, int amount) {
  final target = DateTime(date.year, date.month + amount);

  return DateTime(
    target.year,
    target.month,
    date.day < daysInMonth(target.year, target.month)
        ? date.day
        : daysInMonth(target.year, target.month),
    date.hour,
    date.minute,
    date.second,
  );
}

/// [amount] years later, through [addMonths] so the clamp comes with it.
DateTime addYears(DateTime date, int amount) => addMonths(date, amount * 12);

/* ---------------------------------------------------------------------------
 * Comparison
 *
 * All of it on the local Y/M/D triple. Two `DateTime`s that are the same
 * calendar day differ by milliseconds far more often than not — a value carrying
 * a time of day, a `min` built at noon — and every one of those comparisons has
 * to come out true.
 * ------------------------------------------------------------------------ */

/// Negative, zero or positive, the way a sort comparator wants it.
int compareDay(DateTime a, DateTime b) {
  return startOfDay(a).compareTo(startOfDay(b));
}

/// Are these the same calendar day?
bool isSameDay(DateTime? a, DateTime? b) {
  return a != null && b != null && compareDay(a, b) == 0;
}

/// Are these in the same calendar month?
bool isSameMonth(DateTime? a, DateTime? b) {
  return a != null && b != null && a.year == b.year && a.month == b.month;
}

/// Is this calendar *day* outside the allowed span?
///
/// Day-granular on purpose. A `maxDate` of 27 July at 09:00 still leaves the
/// 27th pickable — the bound is about which days exist, and the time of day is
/// the time picker's problem.
bool isDayOutside(DateTime date, DateTime? min, DateTime? max) {
  if (min != null && compareDay(date, min) < 0) {
    return true;
  }

  return max != null && compareDay(date, max) > 0;
}

/// Is *every* day of this month outside the allowed span?
///
/// A month is unreachable only when nothing in it is reachable: the month a
/// `minDate` of the 15th falls in still exists, it just starts late. That is the
/// rule the month grid has always drawn, and it is also what a `month` picker
/// reads its bounds at — a bound on a control that returns a month is a bound on
/// months.
bool isMonthOutside(DateTime date, DateTime? min, DateTime? max) {
  return isDayOutside(
        DateTime(date.year, date.month, daysInMonth(date.year, date.month)),
        min,
        null,
      ) ||
      isDayOutside(DateTime(date.year, date.month), null, max);
}

/// The same question about a whole year, for a `year` picker.
bool isYearOutside(DateTime date, DateTime? min, DateTime? max) {
  return (min != null && date.year < min.year) || (max != null && date.year > max.year);
}

/// The first instant of the day, month or year [date] falls in.
///
/// Which of the three is the picker's question rather than the calendar's. A
/// control asked for a month holds a `DateTime` standing for a whole month, and
/// the only honest one is that month's first day: a picker whose trigger says
/// *July 2026* and whose form submits the 31st is printing one thing and
/// sending another.
DateTime startOfUnit(DateTime date, MPDatePrecision unit) {
  return switch (unit) {
    MPDatePrecision.day => startOfDay(date),
    MPDatePrecision.month => startOfMonth(date),
    MPDatePrecision.year => startOfYear(date),
  };
}

/// Is the whole day, month or year [date] falls in outside `[min, max]`?
///
/// A unit is outside only when *every* day in it is, which is what leaves July
/// reachable under a `minDate` of 10 July: the bound is about which months
/// exist, and where inside one it falls is a day grid's problem.
bool isUnitOutside(DateTime date, MPDatePrecision unit, DateTime? min, DateTime? max) {
  return switch (unit) {
    MPDatePrecision.day => isDayOutside(date, min, max),
    MPDatePrecision.month => isMonthOutside(date, min, max),
    MPDatePrecision.year => isYearOutside(date, min, max),
  };
}

/* ---------------------------------------------------------------------------
 * The machine-readable spellings
 *
 * What a picker hands an `MPForm`, in the shapes the native `<input
 * type="date">`, `type="month"`, `type="time"` and `type="datetime-local"`
 * submit. Local, not UTC, and that is the whole point: 15 July in Seoul is the
 * 14th in UTC, and a form that reported the day before the one on screen is
 * the single most expensive bug a date picker can ship.
 * ------------------------------------------------------------------------ */

String _two(int value) => value.toString().padLeft(2, '0');

/// `YYYY`.
String toIsoYear(DateTime date) => date.year.toString().padLeft(4, '0');

/// `YYYY-MM`.
String toIsoMonth(DateTime date) => '${toIsoYear(date)}-${_two(date.month)}';

/// `YYYY-MM-DD`.
String toIsoDate(DateTime date) => '${toIsoMonth(date)}-${_two(date.day)}';

/// The spelling [precision] submits: a day, a month or a year, with the parts
/// nobody chose taken off rather than left for a server to know to ignore.
String toIsoUnit(DateTime date, MPDatePrecision precision) {
  return switch (precision) {
    MPDatePrecision.day => toIsoDate(date),
    MPDatePrecision.month => toIsoMonth(date),
    MPDatePrecision.year => toIsoYear(date),
  };
}

/// `HH:MM`, or `HH:MM:SS` with [seconds].
String toIsoTime(DateTime date, {bool seconds = false}) {
  final String base = '${_two(date.hour)}:${_two(date.minute)}';

  return seconds ? '$base:${_two(date.second)}' : base;
}

/// `YYYY-MM-DDTHH:MM`, or with the seconds.
String toIsoDateTime(DateTime date, {bool seconds = false}) {
  return '${toIsoDate(date)}T${toIsoTime(date, seconds: seconds)}';
}

/// The two ends of a band, smallest first, whichever way round they arrived.
List<DateTime>? orderedRange(DateTime? a, DateTime? b) {
  if (a == null || b == null) {
    return null;
  }

  return compareDay(a, b) <= 0 ? <DateTime>[a, b] : <DateTime>[b, a];
}

/* ---------------------------------------------------------------------------
 * Time of day
 * ------------------------------------------------------------------------ */

/// Seconds since local midnight — what a time bound is compared on.
int secondsOfDay(DateTime date) => date.hour * 3600 + date.minute * 60 + date.second;

/// Which column of a clock a candidate time is being offered for.
enum MPTimeUnit {
  /// The hours column.
  hour,

  /// The minutes column.
  minute,

  /// The seconds column, when it is drawn.
  second,

  /// The AM/PM column, on a 12-hour dial.
  meridiem,
}

/// The span of the day one row of one column covers, in seconds since midnight.
///
/// This is the detail that separates a working time picker from a frustrating
/// one. A bound has to be checked against the *span* a row stands for, not
/// against one instant inside it: with a `minTime` of 09:30, the hour `9` covers
/// 09:00:00–09:59:59, which overlaps what is allowed, so it stays available and
/// the minute column is where `00` through `25` grey out. Comparing the whole
/// candidate instead hides the 9 and makes half past nine unreachable.
List<int> timeUnitSpan(MPTimeUnit unit, DateTime at) {
  final seconds = secondsOfDay(at);

  switch (unit) {
    case MPTimeUnit.hour:
      final start = seconds ~/ 3600 * 3600;

      return <int>[start, start + 3599];
    case MPTimeUnit.minute:
      final start = seconds ~/ 60 * 60;

      return <int>[start, start + 59];
    case MPTimeUnit.second:
      return <int>[seconds, seconds];
    case MPTimeUnit.meridiem:
      final start = at.hour < 12 ? 0 : 12 * 3600;

      return <int>[start, start + 12 * 3600 - 1];
  }
}

/// The same instant with one or more clock fields replaced.
DateTime withTime(DateTime date, {int? hours, int? minutes, int? seconds}) {
  return DateTime(
    date.year,
    date.month,
    date.day,
    hours ?? date.hour,
    minutes ?? date.minute,
    seconds ?? date.second,
  );
}

/// Holds a moment inside `[min, max]`, on a whole second when [seconds] is set
/// and a whole minute when it is not — the smallest step the clock can show.
///
/// The bounds are read at full precision, so a moment is rounded into the span
/// rather than onto a bound it would then sit outside of: up from a minimum and
/// down from a maximum. Two bounds inside one step leave no whole step between
/// them, and the bound itself is returned.
DateTime clampMoment(DateTime date, DateTime? min, DateTime? max, {required bool seconds}) {
  final step = seconds ? const Duration(seconds: 1) : const Duration(minutes: 1);
  DateTime floor(DateTime moment) => withTime(moment, seconds: seconds ? moment.second : 0);

  if (min != null && date.isBefore(min)) {
    final down = floor(min);
    final up = down.isBefore(min) ? down.add(step) : down;

    return max != null && up.isAfter(max) ? min : up;
  }

  if (max != null && date.isAfter(max)) {
    final down = floor(max);

    return min != null && down.isBefore(min) ? max : down;
  }

  return date;
}

/// [date]'s calendar day wearing [time]'s clock.
DateTime mergeDateAndTime(DateTime date, DateTime time) {
  return DateTime(date.year, date.month, date.day, time.hour, time.minute, time.second);
}

/* ---------------------------------------------------------------------------
 * The grid
 * ------------------------------------------------------------------------ */

/// Six weeks of seven days, always — including the leading and trailing days
/// that belong to the neighbouring months.
///
/// Six rows whatever the month, and that is the whole point. A February that
/// starts on a Sunday needs four rows and a 31-day month starting on a Saturday
/// needs six; a grid that renders only the rows it needs is a grid that changes
/// height when you step a month forward, moving every cell out from under the
/// finger that just pressed one.
List<List<DateTime>> calendarWeeks(DateTime month, MPWeekday weekStartsOn) {
  final first = startOfMonth(month);
  // `DateTime.weekday` and `MPWeekday` both count Monday as 1 through Sunday as
  // 7; the modulo turns each into a Sunday-is-0 numbering so the two subtract.
  final lead = (first.weekday % 7 - weekStartsOn.value % 7 + 7) % 7;
  final origin = addDays(first, -lead);

  return <List<DateTime>>[
    for (var week = 0; week < 6; week += 1)
      <DateTime>[for (var day = 0; day < 7; day += 1) addDays(origin, week * 7 + day)],
  ];
}

/// The first year on the page a given year falls on. 2026 becomes 2016 at 12 a
/// page.
int yearPageStart(int year) => year - ((year % yearPageSize) + yearPageSize) % yearPageSize;

/* ---------------------------------------------------------------------------
 * The trigger
 * ------------------------------------------------------------------------ */

/// Twenty-five instants that between them exercise everything a picker's display
/// can vary by: all twelve month names, all seven weekday names, a two-digit
/// day, every hour of the clock and a two-digit minute and second.
///
/// They exist to be measured, not read. A trigger is sized by its content, so
/// `Jul 1, 2026` and `Sep 28, 2026` are different widths and the field would
/// jump every time a date was chosen — with the whole row of controls beside it
/// shuffling along. Laying all of these out invisibly pins the trigger to the
/// widest thing it could ever say.
///
/// The first twenty-four walk two cycles at once — `i % 12` walks the months
/// and `i % 7` walks the days 21…27 — so every month name appears without the
/// two being multiplied out into eighty-four samples. The days they land on
/// fall on every weekday but Friday, so the last instant is a Friday. The four
/// pickers share this one list, as they share `DISPLAY_SAMPLES` in the React
/// half, so no trigger is held open against a different set from the others.
final List<DateTime> displaySamples = List<DateTime>.unmodifiable(<DateTime>[
  ...List<DateTime>.generate(
    24,
    (int index) => DateTime(2027, index % 12 + 1, 21 + index % 7, index, 58, 58),
  ),
  DateTime(2027, 1, 22, 12, 58, 58),
]);
