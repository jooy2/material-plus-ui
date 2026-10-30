/// The language the components under it speak.
library;

import 'package:flutter/widgets.dart';

/// The language the components under it speak.
///
/// A BCP 47 tag such as `ko` or `pt-BR`. A component's own `locale` parameter
/// still wins, and with no provider anywhere the components follow the app's
/// own `Localizations`, then English.
///
/// The words come from the tables handed to `registerMPMessages`; a tag nobody
/// registered speaks English. The dates the pickers draw follow the same tag.
///
/// ```dart
/// MPLocaleProvider(locale: 'ko', child: const App())
/// ```
class MPLocaleProvider extends InheritedWidget {
  /// Sets the language for [child] and its subtree.
  const MPLocaleProvider({required this.locale, required super.child, super.key});

  /// The tag in force under this provider.
  final String locale;

  /// The tag set by the nearest provider above [context], or `null`.
  static String? maybeOf(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<MPLocaleProvider>()?.locale;
  }

  @override
  bool updateShouldNotify(MPLocaleProvider oldWidget) => oldWidget.locale != locale;
}
