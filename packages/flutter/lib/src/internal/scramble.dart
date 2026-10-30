/// The arithmetic behind `MPAnimateScramble`, and the one decision in it worth
/// writing down.
///
/// **The pool a character is drawn from is the text's own characters**, not a
/// table of Latin letters. Every scrambler that ships with a default alphabet
/// ships an English one, and English noise over a Korean, Greek or Arabic
/// headline is not a word resolving — it is a different script flickering where
/// a word is about to be. Shuffling the string's own glyphs is script-agnostic
/// for nothing, and it also keeps the line's colour and width steady, because
/// every frame is drawn out of exactly the characters the finished line is made
/// of.
///
/// **A character is a grapheme**, what a reader counts as one: an emoji, a flag,
/// a letter with its accent. Cut by UTF-16 code unit instead, an emoji is halved
/// into two pieces that each draw as a broken glyph.
///
/// Not exported from `material_plus_ui.dart`.
library;

// `String.characters` arrives through `widgets.dart`, which re-exports the
// `characters` package the Flutter SDK ships, so it needs no entry in
// `pubspec.yaml`.
import 'package:flutter/widgets.dart' show StringCharacters;

/// Everything in the text that is worth scrambling: no whitespace, no repeats.
String poolOf(String text) {
  final seen = <String>{};

  for (final String character in text.characters) {
    if (character.trim().isNotEmpty) {
      seen.add(character);
    }
  }

  return seen.join();
}

/// The line as it looks part of the way through.
///
/// [progress] is `0`…`1`, and what it decides is **how many characters have
/// settled**, counted from the start. Resolving left to right rather than at
/// random is what makes it read as a word arriving rather than as a slot
/// machine: a reader can follow it, and a reader who looks away and back has not
/// lost their place.
///
/// Whitespace is never scrambled. The gaps between words are what makes a line
/// of noise still look like a sentence, and a space that flickered into a letter
/// would change the word count on every frame.
String scrambleAt(String text, String pool, double progress, int seed) {
  final characters = text.characters.toList();
  final glyphs = pool.characters.toList();

  if (glyphs.isEmpty) {
    return text;
  }

  final settled = (characters.length * progress.clamp(0.0, 1.0)).floor();
  final buffer = StringBuffer();

  for (int index = 0; index < characters.length; index += 1) {
    final String character = characters[index];

    if (index < settled || character.trim().isEmpty) {
      buffer.write(character);

      continue;
    }

    // A seed rather than a random source, so one frame is one draw for the whole
    // line and a rebuild mid-frame does not reshuffle what has already been
    // painted.
    buffer.write(glyphs[(index * 31 + seed * 17) % glyphs.length]);
  }

  return buffer.toString();
}

/// A line cut into the parts an entrance is told off across.
///
/// Whitespace is glued onto the end of the part before it rather than becoming
/// a part of its own, which is what keeps a `Wrap` breaking lines between words
/// rather than in front of a lone space — and what stops the gap between two
/// words taking a step of the stagger with it.
List<String> splitParts(String text, {required bool byCharacter}) {
  final parts = <String>[];
  final buffer = StringBuffer();
  bool afterSpace = false;

  void flush() {
    if (buffer.isNotEmpty) {
      parts.add(buffer.toString());
      buffer.clear();
    }

    afterSpace = false;
  }

  for (final String character in text.characters) {
    if (character.trim().isEmpty) {
      buffer.write(character);
      afterSpace = true;

      continue;
    }

    // A space ends the part it was written into, and cutting by character ends
    // every part after one glyph.
    if (afterSpace || (byCharacter && buffer.isNotEmpty)) {
      flush();
    }

    buffer.write(character);
  }

  flush();

  return parts;
}
