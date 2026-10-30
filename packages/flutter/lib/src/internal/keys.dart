/// The shortcut vocabulary, read rather than written.
///
/// `MPShortcut` turns `Mod+Enter` into a pair of key caps; this turns the same
/// string into a predicate over a real key event. They share this file because a
/// shortcut a widget **displays** and a shortcut it **binds** have to be spelled
/// the same way — otherwise the cap on the screen is a claim nobody checked.
///
/// Nothing here is exported from `material_plus_ui.dart`.
library;

import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';

/// Whether this host spells `Mod` as ⌘.
///
/// Read from [defaultTargetPlatform], which is also where `MPShortcut`'s platform
/// reads it, so a `debugDefaultTargetPlatformOverride` in a test or a preview
/// moves the cap and the binding together rather than one of them.
bool get mpModIsMeta {
  return defaultTargetPlatform == TargetPlatform.macOS ||
      defaultTargetPlatform == TargetPlatform.iOS;
}

/// The spellings that mean the same key, folded onto one name.
///
/// A caller writes what is printed on their own keyboard — `Cmd`, `Option`,
/// `Return`, `Esc` — and every one of those has to reach the same cap and the
/// same binding.
const Map<String, String> mpKeyAliases = <String, String>{
  'cmdorctrl': 'mod',
  'commandorcontrol': 'mod',
  'cmd': 'meta',
  'command': 'meta',
  'super': 'meta',
  'win': 'meta',
  'windows': 'meta',
  'control': 'ctrl',
  'option': 'alt',
  'opt': 'alt',
  'return': 'enter',
  // A numpad Enter is an Enter. The framework labels it apart; a key cap does
  // not, and neither does anyone reaching for it.
  'numpadenter': 'enter',
  'esc': 'escape',
  'del': 'delete',
  'caps': 'capslock',
};

/// One token of a chord, folded: case, spacing and the aliases above.
String mpCanonicalKey(String token) {
  final normalized = token.toLowerCase().replaceAll(RegExp(r'[\s_-]'), '');

  return mpKeyAliases[normalized] ?? normalized;
}

/// The handful of keys whose `keyLabel` is not what is printed on the cap.
///
/// A cap says `↑` and the framework says `Arrow Up`, which folds to `arrowup`;
/// a cap says `Space` and the framework says a literal space. Everything else —
/// `Enter`, `Escape`, `Tab`, a letter — matches once both sides are folded.
const Map<String, String> _labelKeys = <String, String>{
  'up': 'arrowup',
  'down': 'arrowdown',
  'left': 'arrowleft',
  'right': 'arrowright',
  'space': ' ',
  'plus': '+',
};

/// Is this the chord?
///
/// Every modifier is checked in **both** directions, which is the difference
/// between binding a shortcut and binding a key: `'Enter'` must not fire on
/// `Mod+Enter`, or a field that saves on Enter also saves on every chord that
/// happens to end in one.
bool mpMatchesHotKey(String chord, KeyEvent event) {
  final List<String> parts = chord.split('+').map(mpCanonicalKey).toList(growable: false);
  final Set<String> wanted = parts.sublist(0, parts.length - 1).toSet();
  final String last = parts.last;
  final String key = _labelKeys[last] ?? last;

  final HardwareKeyboard keyboard = HardwareKeyboard.instance;
  final bool mod = mpModIsMeta ? keyboard.isMetaPressed : keyboard.isControlPressed;

  if (wanted.contains('mod') != mod) {
    return false;
  }

  if (wanted.contains('shift') != keyboard.isShiftPressed ||
      wanted.contains('alt') != keyboard.isAltPressed) {
    return false;
  }

  // Only when `Mod` was not asked for. It *is* one of these two, and checking
  // both would make `Mod+K` require a Ctrl that a Mac never sends.
  if (!wanted.contains('mod')) {
    if (wanted.contains('ctrl') != keyboard.isControlPressed ||
        wanted.contains('meta') != keyboard.isMetaPressed) {
      return false;
    }
  }

  return _foldLabel(event.logicalKey.keyLabel) == key;
}

/// What the framework calls a key, folded onto the name a cap is written with.
///
/// A one-character label is lower-cased and left alone — anything else would
/// turn the space bar's own label, which is a space, into an empty string. The
/// rest goes through the full fold, so `Arrow Up` reaches `arrowup` and
/// `Numpad Enter` reaches `enter` by way of the alias table.
String _foldLabel(String label) {
  return label.length == 1 ? label.toLowerCase() : mpCanonicalKey(label);
}
