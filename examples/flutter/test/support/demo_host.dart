import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/locales.dart';
import 'package:material_plus_ui/material_plus_ui.dart';
import 'package:material_plus_ui_example/canvas.dart';

/// Where the gallery's Roboto files are, from `examples/flutter`.
const String _fonts = '../../packages/flutter/example/assets/fonts';

/// Loads the font the app runs with and the library's translations.
///
/// Without the font `flutter test` draws every glyph as a square as wide as the
/// font size, and a label then overflows a box it fits in on a device.
Future<void> prepareHost() async {
  registerMPMessages(mpLocales);

  final FontLoader loader = FontLoader('packages/material_plus_ui_example/Roboto');

  for (final String name in <String>['Roboto-Regular.ttf', 'Roboto-Medium.ttf']) {
    final Uint8List bytes = await File('$_fonts/$name').readAsBytes();

    loader.addFont(Future<ByteData>.value(ByteData.sublistView(bytes)));
  }

  await loader.load();
}

/// A transparent PNG, one pixel square.
final Uint8List _dot = base64Decode(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
);

/// Answers every request for a picture with [_dot], and remembers the address.
class _ImageClient extends Fake implements HttpClient {
  _ImageClient(this.asked);

  final List<Uri> asked;

  @override
  bool autoUncompress = true;

  @override
  Future<HttpClientRequest> getUrl(Uri url) async {
    asked.add(url);

    return _ImageRequest();
  }
}

class _ImageRequest extends Fake implements HttpClientRequest {
  @override
  final HttpHeaders headers = _NoHeaders();

  @override
  Future<HttpClientResponse> close() async => _ImageResponse();
}

class _NoHeaders extends Fake implements HttpHeaders {
  @override
  void add(String name, Object value, {bool preserveHeaderCase = false}) {}
}

class _ImageResponse extends Fake implements HttpClientResponse {
  @override
  int get statusCode => HttpStatus.ok;

  @override
  int get contentLength => _dot.length;

  @override
  HttpClientResponseCompressionState get compressionState =>
      HttpClientResponseCompressionState.notCompressed;

  @override
  StreamSubscription<List<int>> listen(
    void Function(List<int>)? onData, {
    Function? onError,
    void Function()? onDone,
    bool? cancelOnError,
  }) {
    return Stream<List<int>>.value(
      _dot,
    ).listen(onData, onError: onError, onDone: onDone, cancelOnError: cancelOnError);
  }
}

/// Puts [child] on a screen of [size], the way the app shows a demo.
Widget screen(
  Widget child, {
  required Size size,
  EdgeInsets padding = EdgeInsets.zero,
  double textScale = 1,
  Brightness brightness = Brightness.light,
}) {
  return MediaQuery(
    data: MediaQueryData(
      size: size,
      padding: padding,
      viewPadding: padding,
      platformBrightness: brightness,
      textScaler: TextScaler.linear(textScale),
    ),
    child: Directionality(
      textDirection: TextDirection.ltr,
      child: DefaultTextStyle(
        style: const TextStyle(fontFamily: 'Roboto', package: 'material_plus_ui_example'),
        child: MPTheme(
          brightness: brightness,
          child: Overlay.wrap(child: MPCanvas(child: child)),
        ),
      ),
    ),
  );
}

/// Runs [body] and returns what went wrong during it, one line for each failure.
///
/// Every picture off the network is answered with a dot, since `flutter test`
/// has no network. An address that is not a full one is reported as a failure
/// as well: on a phone there is no website for `/samples/...` to be read from.
Future<List<String>> collectErrors(Future<void> Function() body) async {
  final List<String> errors = <String>[];
  final List<Uri> asked = <Uri>[];
  final FlutterExceptionHandler? previous = FlutterError.onError;

  FlutterError.onError = (FlutterErrorDetails details) {
    errors.add(details.exceptionAsString().split('\n').first);
  };
  debugNetworkImageHttpClientProvider = () => _ImageClient(asked);

  try {
    await body();
  } finally {
    debugNetworkImageHttpClientProvider = null;
    FlutterError.onError = previous;
  }

  for (final Uri url in asked) {
    if (url.scheme != 'https' && url.scheme != 'http') {
      errors.add('A picture is named by a path a phone cannot load: $url');
    }
  }

  return errors;
}
