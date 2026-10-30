/// The name a [MPCodeBlock] gives the language a caller wrote.
///
/// It is here rather than in the widget for the reason `internal/gallery.dart`
/// is: **the React build needs the same answers.** That side resolves a
/// `language` against highlight.js, which only answers to its own names, so it
/// keeps a table of the spellings a caller actually writes, and the name on the
/// bar is the one the table resolves to. A block that said `TS` here and
/// `TYPESCRIPT` there would be one component with two names for its own
/// language. This build colours nothing, so the table decides only the name.
///
/// [languageAliases] is the table in `internal/highlight.ts`, entry for entry,
/// and `test/package/code_language_parity_test.dart` reads that file and fails
/// when the two differ.
///
/// It is not exported from `material_plus_ui.dart`.
library;

/// What a caller writes, against the name it is drawn under.
///
/// A `language` is copied out of a fenced code block or a file extension —
/// `tsx`, `yml`, `sh` — so those are the spellings here. The mapping is one-way
/// and the full names are not in it: a name the table does not hold is already
/// the one it is drawn under.
const Map<String, String> languageAliases = <String, String>{
  'c++': 'cpp',
  'cc': 'cpp',
  'cjs': 'javascript',
  'console': 'bash',
  'cs': 'csharp',
  'cts': 'typescript',
  'docker': 'dockerfile',
  'gql': 'graphql',
  'golang': 'go',
  'h': 'cpp',
  'hpp': 'cpp',
  'htm': 'xml',
  'html': 'xml',
  'js': 'javascript',
  'jsx': 'javascript',
  'kt': 'kotlin',
  'kts': 'kotlin',
  'md': 'markdown',
  'mdx': 'markdown',
  'mjs': 'javascript',
  'mm': 'objectivec',
  'mts': 'typescript',
  'mysql': 'sql',
  'node': 'javascript',
  'none': 'plaintext',
  'objc': 'objectivec',
  'plain': 'plaintext',
  'posh': 'powershell',
  'ps1': 'powershell',
  'psql': 'sql',
  'py': 'python',
  'rb': 'ruby',
  'rs': 'rust',
  'sh': 'bash',
  'svelte': 'xml',
  'svg': 'xml',
  'text': 'plaintext',
  'toml': 'ini',
  'ts': 'typescript',
  'tsx': 'typescript',
  'txt': 'plaintext',
  'vue': 'xml',
  'yml': 'yaml',
  'zsh': 'bash',
};

/// The name [language] is drawn under, or `null` for none.
///
/// Trimmed and lower-cased first, and a blank one is no language at all, as it
/// is in the React build, so it does not stand in front of the word for code
/// with an empty name.
String? canonicalLanguage(String? language) {
  final String? key = language?.trim().toLowerCase();

  if (key == null || key.isEmpty) {
    return null;
  }

  return languageAliases[key] ?? key;
}
