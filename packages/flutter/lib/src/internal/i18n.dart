/// The words a component says about itself, and how a translation reaches it.
///
/// The React package's model, kept: the library carries English, every other
/// language is a table the application hands over once with
/// [registerMPMessages], and a component resolves one namespace at a time, so a
/// language that has translated one namespace and not another keeps English for
/// the rest rather than losing both.
///
/// The tables, the namespaces and the keys are the React package's, which is
/// what lets one translation serve both.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/components/locale/mp_locale_provider.dart';

/// One namespace's English strings, carrying the name they answer to.
///
/// The name travels with the strings, so a call site cannot name one
/// namespace while passing another's words.
@immutable
class MPNamespace {
  /// Creates a namespace called [name] whose English is [en].
  const MPNamespace(this.name, this.en);

  /// The key this namespace occupies in a translation.
  final String name;

  /// English, which every other language is merged over.
  final Map<String, String> en;
}

/// One language, ready to be handed to [registerMPMessages].
@immutable
class MPLocale {
  /// A table for [locale].
  const MPLocale({required this.locale, required this.messages, this.aliases = const <String>[]});

  /// The BCP 47 tag this table answers to, lowercased on the way in.
  ///
  /// Broad rather than narrow: `pt` serves a reader who asked for `pt-BR`, and a
  /// table registered as `pt-BR` would not serve one who asked for `pt`.
  final String locale;

  /// Other tags that resolve to this same table: `zh-hant` answers for
  /// `zh-TW`, `zh-HK` and `zh-MO`.
  final List<String> aliases;

  /// The strings, by namespace and key. Anything left out falls back to
  /// English, a namespace at a time.
  final Map<String, Map<String, String>> messages;
}

final Map<String, Map<String, Map<String, String>>> _registry =
    <String, Map<String, Map<String, String>>>{};

final Map<String, Map<String, String>> _resolved = <String, Map<String, String>>{};

/// Teaches the library [locales].
///
/// Call it once, at startup, before anything renders. Registering a tag that is
/// already registered replaces it, which is how one word is corrected without
/// forking a table, although a component's own `labels` parameter is the
/// lighter tool for that.
void registerMPMessages(Iterable<MPLocale> locales) {
  for (final MPLocale entry in locales) {
    _registry[entry.locale.toLowerCase()] = entry.messages;

    for (final String alias in entry.aliases) {
      _registry[alias.toLowerCase()] = entry.messages;
    }
  }

  // Keyed by the tag that was asked for, so a tag that resolved to English
  // before this call would go on resolving to English.
  _resolved.clear();
}

/// Forgets every table [registerMPMessages] was given. For tests.
@visibleForTesting
void resetMPMessages() {
  _registry.clear();
  _resolved.clear();
}

/// A BCP 47 tag, broadest match last: `zh-Hant-TW` asks for `zh-hant`, then
/// `zh-tw`, then `zh`.
///
/// The subtags are found by shape rather than by position, because a tag can
/// carry a variant between them.
List<String> _candidates(String locale) {
  final List<String> subtags = locale
      .toLowerCase()
      .split(RegExp('[-_]'))
      .where((String subtag) => subtag.isNotEmpty)
      .toList();

  if (subtags.isEmpty) {
    return const <String>[];
  }

  final String language = subtags.first;
  final Iterable<String> rest = subtags.skip(1);
  final String? script = rest
      .where((String subtag) => RegExp(r'^[a-z]{4}$').hasMatch(subtag))
      .firstOrNull;
  final String? region = rest
      .where((String subtag) => RegExp(r'^([a-z]{2}|\d{3})$').hasMatch(subtag))
      .firstOrNull;

  return <String>[
    if (script != null) '$language-$script',
    if (region != null) '$language-$region',
    language,
  ];
}

/// One namespace's strings for [locale], merged over English.
///
/// `null` is English. Note that this is only about the words in the table: a
/// date is formatted by the component against the same tag whether or not
/// there is an entry here.
Map<String, String> mpResolveNamespace(MPNamespace namespace, String? locale) {
  final String tag = locale?.trim() ?? '';
  final String key = '${namespace.name}\u0000$tag';
  final Map<String, String>? cached = _resolved[key];

  if (cached != null) {
    return cached;
  }

  Map<String, String>? translated;

  for (final String candidate in _candidates(tag)) {
    final Map<String, Map<String, String>>? table = _registry[candidate];

    if (table != null) {
      translated = table[namespace.name];
      break;
    }
  }

  final Map<String, String> messages = translated == null
      ? namespace.en
      : Map<String, String>.unmodifiable(<String, String>{...namespace.en, ...translated});

  // Bounded: the tag is a caller's, and an app that passes each screen's
  // language through would otherwise keep every spelling it was ever given.
  if (_resolved.length > 256) {
    _resolved.remove(_resolved.keys.first);
  }

  _resolved[key] = messages;

  return messages;
}

/// [message] with its `{placeholders}` filled from [values].
///
/// Named rather than positional, because the order of two numbers in a sentence
/// is not the same in every language. A placeholder with nothing to put in it is
/// left as written: a visible `{page}` is a bug report, a sentence with a hole in
/// it is a sentence somebody has to guess at.
String mpFillMessage(String message, Map<String, String> values) {
  return message.replaceAllMapped(RegExp(r'\{(\w+)\}'), (Match match) {
    return values[match.group(1)] ?? match.group(0)!;
  });
}

/// The locale in force at [context]: [locale] if one is given, then the
/// nearest [MPLocaleProvider], then the nearest [MPConfigProvider], then the
/// app's own `Localizations`.
///
/// The last step is where Flutter and the React package differ, on purpose. A
/// browser's language can differ between the server that renders a page and
/// the browser that hydrates it, so the React package never reads it; a Flutter
/// app has no such split, and its `Localizations` is the locale it already
/// chose.
String? mpLocaleOf(BuildContext context, [String? locale]) {
  return locale ??
      MPLocaleProvider.maybeOf(context) ??
      MPConfigProvider.maybeOf(context)?.locale ??
      Localizations.maybeLocaleOf(context)?.toLanguageTag();
}

/// One namespace's strings at [context], in [locale] if one is given, with a
/// caller's [overrides] on top.
///
/// The overrides win over the translation, which wins over English.
Map<String, String> mpMessagesOf(
  BuildContext context,
  MPNamespace namespace, {
  String? locale,
  Map<String, String>? overrides,
}) {
  final Map<String, String> messages = mpResolveNamespace(namespace, mpLocaleOf(context, locale));

  if (overrides == null || overrides.isEmpty) {
    return messages;
  }

  return <String, String>{...messages, ...overrides};
}
