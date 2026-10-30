import 'package:flutter/widgets.dart';

/// Off the web there is no page around the app, so both halves are no-ops.
class HostBridge {
  /// Creates a bridge that does nothing.
  const HostBridge();

  /// Whether the app is embedded in a documentation page. Never, here.
  bool get embedded => false;

  /// The query the page launched this preview with. Empty, here.
  Map<String, String> get query => const <String, String>{};

  /// Reports the rendered height to the page. No-op.
  void reportHeight(double height) {}

  /// Listens for theme changes from the page. No-op.
  void onTheme(void Function(Brightness brightness) handler) {}
}
