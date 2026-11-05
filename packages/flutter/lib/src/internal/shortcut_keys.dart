/// What a key in a shortcut is called on each platform, for `MPShortcut` and
/// for the text a menu row sets at its end.
///
/// None of this is exported from `material_plus_ui.dart`: it is the library
/// talking to itself.
library;

import 'package:flutter/foundation.dart';

import 'package:material_plus_ui/src/components/shortcut/mp_shortcut.dart';
import 'package:material_plus_ui/src/internal/keys.dart';

/// What a key is called, and what it is drawn as.
///
/// `symbol` is what a sighted reader sees and `name` is what a screen reader
/// says. They differ on exactly the keys macOS draws as glyphs: `⌘` announced
/// by its Unicode name is "place of interest sign", which is not a key anybody
/// has on their keyboard.
typedef MPKeyLabel = ({String symbol, String name});

MPKeyLabel _word(String text) => (symbol: text, name: text);

/// One entry per key spelled differently somewhere, keyed by the canonical
/// token `mpCanonicalKey` gives.
///
/// `mod` is the entry the rest exist for. It is the only token whose *meaning*
/// changes with the platform rather than only its spelling: the modifier a
/// shortcut is built on, Command on a Mac and Control everywhere else.
final Map<String, Map<MPShortcutOS, MPKeyLabel>> _keyLabels =
    <String, Map<MPShortcutOS, MPKeyLabel>>{
      'mod': <MPShortcutOS, MPKeyLabel>{
        MPShortcutOS.mac: (symbol: '⌘', name: 'Command'),
        MPShortcutOS.windows: _word('Ctrl'),
        MPShortcutOS.linux: _word('Ctrl'),
      },
      'meta': <MPShortcutOS, MPKeyLabel>{
        MPShortcutOS.mac: (symbol: '⌘', name: 'Command'),
        MPShortcutOS.windows: _word('Win'),
        MPShortcutOS.linux: _word('Super'),
      },
      'ctrl': <MPShortcutOS, MPKeyLabel>{
        MPShortcutOS.mac: (symbol: '⌃', name: 'Control'),
        MPShortcutOS.windows: _word('Ctrl'),
        MPShortcutOS.linux: _word('Ctrl'),
      },
      'alt': <MPShortcutOS, MPKeyLabel>{
        MPShortcutOS.mac: (symbol: '⌥', name: 'Option'),
        MPShortcutOS.windows: _word('Alt'),
        MPShortcutOS.linux: _word('Alt'),
      },
      'shift': <MPShortcutOS, MPKeyLabel>{
        MPShortcutOS.mac: (symbol: '⇧', name: 'Shift'),
        MPShortcutOS.windows: _word('Shift'),
        MPShortcutOS.linux: _word('Shift'),
      },
      'enter': <MPShortcutOS, MPKeyLabel>{
        MPShortcutOS.mac: (symbol: '↩', name: 'Enter'),
        MPShortcutOS.windows: _word('Enter'),
        MPShortcutOS.linux: _word('Enter'),
      },
      'tab': <MPShortcutOS, MPKeyLabel>{
        MPShortcutOS.mac: (symbol: '⇥', name: 'Tab'),
        MPShortcutOS.windows: _word('Tab'),
        MPShortcutOS.linux: _word('Tab'),
      },
      'escape': <MPShortcutOS, MPKeyLabel>{
        MPShortcutOS.mac: (symbol: '⎋', name: 'Escape'),
        MPShortcutOS.windows: _word('Esc'),
        MPShortcutOS.linux: _word('Esc'),
      },
      'backspace': <MPShortcutOS, MPKeyLabel>{
        MPShortcutOS.mac: (symbol: '⌫', name: 'Backspace'),
        MPShortcutOS.windows: _word('Backspace'),
        MPShortcutOS.linux: _word('Backspace'),
      },
      'delete': <MPShortcutOS, MPKeyLabel>{
        MPShortcutOS.mac: (symbol: '⌦', name: 'Delete'),
        MPShortcutOS.windows: _word('Del'),
        MPShortcutOS.linux: _word('Del'),
      },
      'capslock': <MPShortcutOS, MPKeyLabel>{
        MPShortcutOS.mac: (symbol: '⇪', name: 'Caps Lock'),
        MPShortcutOS.windows: _word('Caps Lock'),
        MPShortcutOS.linux: _word('Caps Lock'),
      },
    };

/// The keys drawn as arrows on every platform. An arrow is not a Mac
/// convention: it is what is printed on the key.
const Map<String, MPKeyLabel> _arrowLabels = <String, MPKeyLabel>{
  'up': (symbol: '↑', name: 'Arrow up'),
  'down': (symbol: '↓', name: 'Arrow down'),
  'left': (symbol: '←', name: 'Arrow left'),
  'right': (symbol: '→', name: 'Arrow right'),
  'arrowup': (symbol: '↑', name: 'Arrow up'),
  'arrowdown': (symbol: '↓', name: 'Arrow down'),
  'arrowleft': (symbol: '←', name: 'Arrow left'),
  'arrowright': (symbol: '→', name: 'Arrow right'),
};

/// The platform `auto` resolves to.
MPShortcutOS mpShortcutPlatform() {
  if (mpModIsMeta) {
    return MPShortcutOS.mac;
  }

  return defaultTargetPlatform == TargetPlatform.windows
      ? MPShortcutOS.windows
      : MPShortcutOS.linux;
}

/// The keys of [keys], a string split on `+` or a list as it is.
List<String> mpShortcutTokens(Object keys) {
  final List<String> parts = keys is List<String> ? keys : (keys as String).split('+');

  return parts.map((String part) => part.trim()).where((String part) => part.isNotEmpty).toList();
}

/// What [token] is drawn as and called on [os].
MPKeyLabel mpKeyLabel(String token, MPShortcutOS os) {
  final String canonical = mpCanonicalKey(token);
  final MPKeyLabel? arrow = _arrowLabels[canonical];

  if (arrow != null) {
    return arrow;
  }

  final Map<MPShortcutOS, MPKeyLabel>? known = _keyLabels[canonical];

  if (known != null) {
    return known[os]!;
  }

  // Everything else is printed as it was written, with the one courtesy that a
  // single letter is capitalised: `mod+k` should draw a K, because that is what
  // is on the key.
  return _word(token.length == 1 ? token.toUpperCase() : token);
}

/// A shortcut as one line of text rather than a row of key caps: what a menu
/// row sets at its end, where MD3 has trailing text and no caps. The keys are
/// named as a cap names them on [os], and joined the way that platform joins
/// them. `shown` is drawn, and `spoken` is what a screen reader reads.
({String shown, String spoken}) mpShortcutText(Object keys, {MPShortcutOS os = MPShortcutOS.auto}) {
  final MPShortcutOS resolved = os == MPShortcutOS.auto ? mpShortcutPlatform() : os;
  final List<MPKeyLabel> labels = mpShortcutTokens(
    keys,
  ).map((String token) => mpKeyLabel(token, resolved)).toList();

  return (
    shown: labels
        .map((MPKeyLabel label) => label.symbol)
        .join(resolved == MPShortcutOS.mac ? '' : '+'),
    spoken: labels.map((MPKeyLabel label) => label.name).join(' '),
  );
}
