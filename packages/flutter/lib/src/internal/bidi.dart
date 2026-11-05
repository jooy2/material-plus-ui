/// The direction a piece of text is written in, apart from the page's.
///
/// None of this is exported from `material_plus_ui.dart`: it is the library
/// talking to itself.
library;

import 'package:flutter/widgets.dart';

/// The direction [text] is written in: that of its first letter, as HTML's
/// `<bdi>` and `dir="auto"` decide it, and left to right when it has none.
///
/// Digits, punctuation, spaces and symbols have no direction of their own and
/// are passed over, so `2026. 11. 5.` is left to right and an Arabic month
/// name right to left.
TextDirection mpTextDirectionOf(String text) {
  for (final int rune in text.runes) {
    if (_rightToLeft(rune)) {
      return TextDirection.rtl;
    }

    if (_leftToRight(rune)) {
      return TextDirection.ltr;
    }
  }

  return TextDirection.ltr;
}

/// A letter of a script written right to left: Hebrew, Arabic, Syriac, Thaana,
/// N'Ko and their neighbours, and their presentation forms. Arabic's own
/// digits are numbers, not letters, and are passed over.
bool _rightToLeft(int rune) {
  if ((rune >= 0x0660 && rune <= 0x0669) || (rune >= 0x06F0 && rune <= 0x06F9)) {
    return false;
  }

  return _rightToLeftBlock(rune);
}

/// The blocks of the scripts written right to left, digits and all.
bool _rightToLeftBlock(int rune) {
  return (rune >= 0x0590 && rune <= 0x08FF) ||
      (rune >= 0xFB1D && rune <= 0xFDFF) ||
      (rune >= 0xFE70 && rune <= 0xFEFF) ||
      (rune >= 0x10800 && rune <= 0x10FFF) ||
      (rune >= 0x1E800 && rune <= 0x1EFFF);
}

/// A letter of any other script. Below U+0370 that is the Latin letters; above
/// it, everything outside the right-to-left blocks, whose digits are passed
/// over rather than read as this, and the blocks of punctuation, symbols and
/// combining marks that carry no direction.
bool _leftToRight(int rune) {
  if (rune < 0x0370) {
    return (rune >= 0x41 && rune <= 0x5A) ||
        (rune >= 0x61 && rune <= 0x7A) ||
        (rune >= 0xC0 && rune <= 0x024F && rune != 0xD7 && rune != 0xF7);
  }

  return !_rightToLeftBlock(rune) &&
      !(rune >= 0x2000 && rune <= 0x2BFF) &&
      !(rune >= 0x3000 && rune <= 0x303F) &&
      !(rune >= 0xFE00 && rune <= 0xFE6F) &&
      !(rune >= 0xFF00 && rune <= 0xFF20) &&
      !(rune >= 0xFF3B && rune <= 0xFF40) &&
      !(rune >= 0xFF5B && rune <= 0xFF65);
}

/// A value a field shows, a date or a time, drawn in the direction it is
/// written in and placed where the page's text starts.
///
/// A date written in one language on a page laid out in the other is
/// otherwise reordered: `2026. 11. 5.` reads `.5 .11 .2026` under an Arabic
/// page, and `3:30 PM` reads `PM 3:30`.
class MPValueText extends StatelessWidget {
  /// Draws [text].
  const MPValueText(this.text, {this.style, super.key});

  /// What the field shows.
  final String text;

  /// Over the ambient style.
  final TextStyle? style;

  @override
  Widget build(BuildContext context) {
    final bool pageRightToLeft = Directionality.maybeOf(context) == TextDirection.rtl;

    return Text(
      text,
      style: style,
      textDirection: mpTextDirectionOf(text),
      textAlign: pageRightToLeft ? TextAlign.right : TextAlign.left,
    );
  }
}
