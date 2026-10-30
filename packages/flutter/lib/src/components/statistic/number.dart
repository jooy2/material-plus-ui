/// How `MPStatistic` writes a number when nobody said how.
///
/// The React build hands every figure to `Intl.NumberFormat`. This package
/// takes no dependency on `package:intl`, so the two notations a statistic
/// uses by default are written out here, the way `Intl` writes them in
/// English: digits grouped in threes by a comma, and the compact notation's
/// `K`, `M`, `B` and `T`. A `formatValue` is how a statistic writes its
/// numbers any other way, in any other language.
///
/// Not exported from `material_plus_ui.dart`.
library;

/// From how many digits a figure is compacted: five. Four digits stay,
/// because `1,284` is a figure anybody takes in at a glance and `1.3K` has
/// thrown away two of them to save two characters.
const double compactFrom = 10000;

const List<String> _units = <String>['K', 'M', 'B', 'T'];

/// [value] with at most [places] decimals and no trailing zeros.
String _trimmed(double value, int places) {
  final String text = value.toStringAsFixed(places);

  if (!text.contains('.')) {
    return text;
  }

  return text.replaceFirst(RegExp(r'\.?0+$'), '');
}

/// [text], an unsigned number, with its whole part grouped in threes.
String _grouped(String text) {
  final int point = text.indexOf('.');
  final String whole = point < 0 ? text : text.substring(0, point);
  final StringBuffer buffer = StringBuffer();

  for (int index = 0; index < whole.length; index += 1) {
    if (index > 0 && (whole.length - index) % 3 == 0) {
      buffer.write(',');
    }

    buffer.write(whole[index]);
  }

  if (point >= 0) {
    buffer.write(text.substring(point));
  }

  return buffer.toString();
}

/// The magnitude of [value], written plainly or compactly, with no sign.
String _magnitude(double value, {required bool compact}) {
  final double size = value.abs();

  if (!compact || size < compactFrom) {
    // `Intl`'s decimal default: up to three decimals, grouped.
    return _grouped(_trimmed(size, 3));
  }

  double scaled = size;
  int unit = -1;

  while (scaled >= 1000 && unit < _units.length - 1) {
    scaled /= 1000;
    unit += 1;
  }

  // A figure that rounds up to a thousand moves a unit along, so 999,960 is
  // `1M` rather than `1000K`.
  if (double.parse(scaled.toStringAsFixed(1)) >= 1000 && unit < _units.length - 1) {
    scaled /= 1000;
    unit += 1;
  }

  return '${_trimmed(scaled, 1)}${_units[unit]}';
}

/// [value] as a statistic writes it with no `formatValue`: grouped, and
/// compacted from five digits up when [compact] is on.
String writeFigure(num value, {required bool compact}) {
  final double number = value.toDouble();

  if (!number.isFinite) {
    return '';
  }

  final String written = _magnitude(number, compact: compact);

  return number < 0 && written != '0' ? '-$written' : written;
}

/// [text] with the sign of [value] in front of it, as `signDisplay:
/// 'exceptZero'` writes it: `+` for a rise, `-` for a fall, nothing for zero.
String signed(String text, num value) {
  if (value > 0) {
    return '+$text';
  }

  if (value < 0) {
    return '-$text';
  }

  return text;
}

/// A move of [value] in the figure's own units, signed.
String writeMove(num value, {required bool compact, String Function(num value)? format}) {
  final double number = value.toDouble();

  if (!number.isFinite) {
    return '';
  }

  // The magnitude is written and the sign put in front of it, so a
  // `formatValue` written for the figure, a currency, writes the move too.
  final String written = format != null
      ? format(number.abs())
      : _magnitude(number, compact: compact);

  return signed(written, _trimmed(number.abs(), 3) == '0' ? 0 : number);
}

/// A share of [percent] percent, signed, to one decimal at most: `+7.7%`.
String writePercent(double percent) {
  final String written = _trimmed(percent.abs(), 1);

  return signed('${_grouped(written)}%', written == '0' ? 0 : percent);
}
