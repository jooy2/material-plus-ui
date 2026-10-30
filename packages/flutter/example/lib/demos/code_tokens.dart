import 'package:material_plus_ui/material_plus_ui.dart';

/// A small highlighter for the gallery's code samples.
///
/// `MPCodeBlock` carries no grammar of its own, and an app hands it whichever
/// highlighter it already uses. This is the gallery doing that: a handful of
/// patterns, enough for the TypeScript and the shell in its demos, and not a
/// grammar anyone should ship.
List<MPCodeLine>? demoHighlighter(String code, String language) {
  final List<(RegExp, MPCodeTokenKind)>? rules = switch (language) {
    'typescript' || 'javascript' => _script,
    'bash' => _shell,
    _ => null,
  };

  if (rules == null) {
    return null;
  }

  return <MPCodeLine>[for (final String line in code.split('\n')) _tokenise(line, rules)];
}

final List<(RegExp, MPCodeTokenKind)> _script = <(RegExp, MPCodeTokenKind)>[
  (RegExp(r'//.*'), MPCodeTokenKind.comment),
  (
    RegExp(
      r"'[^']*'|"
      r'"[^"]*"',
    ),
    MPCodeTokenKind.string,
  ),
  (
    RegExp(r'\b(import|from|export|function|return|const|let|void|type)\b'),
    MPCodeTokenKind.keyword,
  ),
  (RegExp(r'</?[A-Z][A-Za-z]*'), MPCodeTokenKind.tag),
  (RegExp(r'\b[a-z][A-Za-z]*(?==)'), MPCodeTokenKind.attribute),
  (RegExp(r'\b[A-Z][A-Za-z]*\b'), MPCodeTokenKind.type),
  (RegExp(r'\b\d+\b'), MPCodeTokenKind.number),
];

final List<(RegExp, MPCodeTokenKind)> _shell = <(RegExp, MPCodeTokenKind)>[
  (RegExp(r'#.*'), MPCodeTokenKind.comment),
  (RegExp(r'^\S+'), MPCodeTokenKind.function),
  (RegExp(r'\s--?[\w-]+'), MPCodeTokenKind.attribute),
];

MPCodeLine _tokenise(String line, List<(RegExp, MPCodeTokenKind)> rules) {
  final List<MPCodeToken> runs = <MPCodeToken>[];
  int at = 0;

  while (at < line.length) {
    (int, int, MPCodeTokenKind)? first;

    for (final (RegExp pattern, MPCodeTokenKind kind) in rules) {
      final RegExpMatch? match = pattern.allMatches(line, at).firstOrNull;

      if (match != null && match.end > match.start && (first == null || match.start < first.$1)) {
        first = (match.start, match.end, kind);
      }
    }

    if (first == null) {
      runs.add(MPCodeToken(line.substring(at)));
      break;
    }

    if (first.$1 > at) {
      runs.add(MPCodeToken(line.substring(at, first.$1)));
    }

    runs.add(MPCodeToken(line.substring(first.$1, first.$2), first.$3));
    at = first.$2;
  }

  return runs;
}
