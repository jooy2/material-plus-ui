/// The library's words, translated into eighteen languages.
///
/// A library of its own rather than part of `material_plus_ui.dart`, for the
/// reason the React package keeps them out of its barrel: a table is data, and
/// the only way to leave data out of an app is for nothing to import it. An
/// application that speaks Korean says so, once, at startup:
///
/// ```dart
/// import 'package:material_plus_ui/material_plus_ui.dart';
/// import 'package:material_plus_ui/locales.dart';
///
/// void main() {
///   registerMPMessages(<MPLocale>[ko]);
///   runApp(const App());
/// }
/// ```
///
/// After that a component whose locale resolves to `ko` speaks Korean.
/// `registerMPMessages(mpLocales)` takes all eighteen.
library;

import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/locales/ar.dart';
import 'package:material_plus_ui/src/locales/de.dart';
import 'package:material_plus_ui/src/locales/es.dart';
import 'package:material_plus_ui/src/locales/fr.dart';
import 'package:material_plus_ui/src/locales/hi.dart';
import 'package:material_plus_ui/src/locales/id.dart';
import 'package:material_plus_ui/src/locales/it.dart';
import 'package:material_plus_ui/src/locales/ja.dart';
import 'package:material_plus_ui/src/locales/ko.dart';
import 'package:material_plus_ui/src/locales/nl.dart';
import 'package:material_plus_ui/src/locales/pl.dart';
import 'package:material_plus_ui/src/locales/pt.dart';
import 'package:material_plus_ui/src/locales/ru.dart';
import 'package:material_plus_ui/src/locales/th.dart';
import 'package:material_plus_ui/src/locales/tr.dart';
import 'package:material_plus_ui/src/locales/vi.dart';
import 'package:material_plus_ui/src/locales/zh_hans.dart';
import 'package:material_plus_ui/src/locales/zh_hant.dart';

export 'src/locales/ar.dart';
export 'src/locales/de.dart';
export 'src/locales/es.dart';
export 'src/locales/fr.dart';
export 'src/locales/hi.dart';
export 'src/locales/id.dart';
export 'src/locales/it.dart';
export 'src/locales/ja.dart';
export 'src/locales/ko.dart';
export 'src/locales/nl.dart';
export 'src/locales/pl.dart';
export 'src/locales/pt.dart';
export 'src/locales/ru.dart';
export 'src/locales/th.dart';
export 'src/locales/tr.dart';
export 'src/locales/vi.dart';
export 'src/locales/zh_hans.dart';
export 'src/locales/zh_hant.dart';

/// Every table this package ships, ready for `registerMPMessages`.
const List<MPLocale> mpLocales = <MPLocale>[
  ko,
  ja,
  zhHans,
  zhHant,
  es,
  pt,
  fr,
  de,
  it,
  nl,
  pl,
  ru,
  tr,
  ar,
  hi,
  id,
  vi,
  th,
];
