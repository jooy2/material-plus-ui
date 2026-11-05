import 'dart:io';
import 'dart:ui' as ui;

import 'package:flutter/foundation.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';

/// Where the screenshots of a run go on the device.
///
/// Inside the app's own temporary directory, so `tool/pull_screenshots.sh` can
/// copy them off a simulator, an emulator or a phone afterwards.
final Directory shotDirectory = Directory('${Directory.systemTemp.path}/mp-shots');

/// Demos of a pattern for a wide window, whose layout is checked only on a
/// screen at least [wideWidth] across: a navigation menu along the top of a
/// page, and a drawer that pushes the page aside rather than covering it.
/// Material puts neither on a phone, and on one both run out of room.
const Set<String> wideOnlyDemos = <String>{'navigation-menu/hero', 'drawer/standard'};

/// Where MD3's medium window class starts.
const double wideWidth = 600;

/// Writes what the screen shows now to [name] in [shotDirectory].
///
/// Reads the layer tree rather than asking the platform, so it needs no plugin
/// channel and works in profile mode, where a run on a real phone is best made.
Future<void> saveShot(WidgetTester tester, String name) async {
  await tester.runAsync(() async {
    final RenderView view = tester.binding.renderViews.first;
    // `debugLayer` is null outside a debug build, so the layer is read directly.
    // ignore: invalid_use_of_protected_member
    final OffsetLayer layer = view.layer! as OffsetLayer;
    // The layer is already in physical pixels. Half of a 3x screen is plenty
    // to judge a layout by, and keeps a run of a few hundred pictures small.
    final double ratio = view.flutterView.devicePixelRatio;
    final ui.Image image = await layer.toImage(
      Offset.zero & view.flutterView.physicalSize,
      pixelRatio: 2 / ratio,
    );
    final ByteData? bytes = await image.toByteData(format: ui.ImageByteFormat.png);

    image.dispose();

    final File file = File('${shotDirectory.path}/${name.replaceAll('/', '__')}.png');

    await file.create(recursive: true);
    await file.writeAsBytes(bytes!.buffer.asUint8List());
  });
}

/// Runs [body] and returns one line for each thing that went wrong in it.
///
/// [ignoreImages] leaves out a picture the network turned away, which says
/// nothing about a component when the device is offline.
Future<List<String>> collectErrors(
  Future<void> Function() body, {
  bool ignoreImages = false,
}) async {
  final List<String> errors = <String>[];
  final FlutterExceptionHandler? previous = FlutterError.onError;

  FlutterError.onError = (FlutterErrorDetails details) {
    if (ignoreImages && details.library == 'image resource service') {
      return;
    }

    errors.add(details.exceptionAsString().split('\n').first);
  };

  try {
    await body();
  } finally {
    FlutterError.onError = previous;
  }

  return errors;
}
