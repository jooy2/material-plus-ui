import 'dart:js_interop';

import 'package:flutter/widgets.dart';
import 'package:web/web.dart' as web;

/// The channel name both ends agree on. Must match `Demo.vue`.
const String _channel = 'mp-demo';

/// The web half of the bridge. See `host_bridge.dart`.
class HostBridge {
  /// Creates a bridge onto the surrounding page.
  const HostBridge();

  /// A preview is embedded when the page asked for one demo by name.
  bool get embedded => query.containsKey('demo');

  /// The query the page launched this preview with.
  Map<String, String> get query => Uri.base.queryParameters;

  /// Reports the rendered height to the page, so it can size the frame.
  void reportHeight(double height) {
    final parent = web.window.parent;

    if (parent == null || parent == web.window) {
      return;
    }

    parent.postMessage(
      <String, Object?>{'channel': _channel, 'type': 'size', 'height': height}.jsify(),
      web.window.location.origin.toJS,
    );
  }

  /// Listens for the page flipping this preview's theme.
  void onTheme(void Function(Brightness brightness) handler) {
    web.window.addEventListener(
      'message',
      ((web.MessageEvent event) {
        // Same-origin only: the frame is served out of the documentation site's
        // own `public/`, so anything from anywhere else is not the page.
        if (event.origin != web.window.location.origin) {
          return;
        }

        final data = event.data.dartify();

        if (data is! Map || data['channel'] != _channel || data['type'] != 'theme') {
          return;
        }

        handler(data['theme'] == 'dark' ? Brightness.dark : Brightness.light);
      }).toJS,
    );
  }
}
