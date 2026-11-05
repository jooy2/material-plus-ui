import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// What the Settings screen changes for the whole app.
class ShowcaseSettings extends ChangeNotifier {
  Brightness? _brightness;
  TextDirection _direction = TextDirection.ltr;
  String _language = 'en';
  MPDensity _density = 0;
  double? _textScale;
  Color _sourceColor = mpDefaultSourceColor;

  /// The languages the library's own words can be read in, by locale code.
  static const Map<String, String> languages = <String, String>{
    'en': 'English',
    'de': 'Deutsch',
    'es': 'Español',
    'fr': 'Français',
    'ja': '日本語',
    'ko': '한국어',
    'ar': 'العربية',
    'zh-hans': '简体中文',
  };

  /// The source colours a reader can theme the app from, by name.
  static const Map<String, Color> sourceColors = <String, Color>{
    'Blue': mpDefaultSourceColor,
    'Violet': Color(0xFF7C3AED),
    'Green': Color(0xFF2E7D32),
    'Orange': Color(0xFFE65100),
  };

  /// The chosen theme, or `null` to follow the device.
  Brightness? get brightness => _brightness;
  set brightness(Brightness? next) {
    _brightness = next;
    notifyListeners();
  }

  /// The direction every screen is laid out in.
  TextDirection get direction => _direction;
  set direction(TextDirection next) {
    _direction = next;
    notifyListeners();
  }

  /// The locale code of the library's own words.
  String get language => _language;
  set language(String next) {
    _language = next;
    notifyListeners();
  }

  /// How tightly the containers are packed.
  MPDensity get density => _density;
  set density(MPDensity next) {
    _density = next;
    notifyListeners();
  }

  /// A text scale, or `null` to follow the device.
  double? get textScale => _textScale;
  set textScale(double? next) {
    _textScale = next;
    notifyListeners();
  }

  /// The colour every role in the scheme is derived from.
  Color get sourceColor => _sourceColor;
  set sourceColor(Color next) {
    _sourceColor = next;
    notifyListeners();
  }
}

/// Hands the [ShowcaseSettings] to the screens under it.
class SettingsScope extends InheritedNotifier<ShowcaseSettings> {
  /// Creates the scope.
  const SettingsScope({required ShowcaseSettings settings, required super.child, super.key})
    : super(notifier: settings);

  /// The settings in scope.
  static ShowcaseSettings of(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<SettingsScope>()!.notifier!;
  }
}
