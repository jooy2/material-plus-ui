import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/components/mockup/mp_mockup.dart';
import 'package:material_plus_ui/src/internal/mockup.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The React suite measures the screen element and reads the hardware's custom
/// properties. Here the screen is the box the content was laid out in, before
/// the one scale at the top, and the hardware is the decoration it was painted
/// with.

const Key _content = Key('content');

/// How big [finder] is drawn on the page, after the scale.
Size _drawnOf(WidgetTester tester, Finder finder) {
  final Offset from = tester.getTopLeft(finder);
  final Offset to = tester.getBottomRight(finder);

  return Size(to.dx - from.dx, to.dy - from.dy);
}

/// The size the content was laid out at, in the device's own pixels.
Size _screenOf(WidgetTester tester) {
  return tester.renderObject<RenderBox>(find.byKey(_content)).size;
}

Widget _mockup({
  MPMockupDevice device = MPMockupDevice.mobile,
  MPMockupOs? os,
  MPMockupHardware hardware = MPMockupHardware.monitor,
  MPSize? size,
  MPMockupResolution? resolution,
  MPMockupOrientation orientation = MPMockupOrientation.portrait,
  MPMockupBezel bezel = MPMockupBezel.standard,
  MPMockupFinish finish = MPMockupFinish.graphite,
  MPMockupNotch? notch,
  bool systemUi = false,
  double? width = 200,
  double? height,
}) {
  return host(
    MPMockup(
      device: device,
      os: os,
      hardware: hardware,
      size: size,
      resolution: resolution,
      orientation: orientation,
      bezel: bezel,
      finish: finish,
      notch: notch,
      systemUi: systemUi,
      width: width,
      height: height,
      child: const SizedBox.expand(key: _content),
    ),
  );
}

void main() {
  testWidgets('lays the content out at the device’s own resolution', (WidgetTester tester) async {
    await tester.pumpWidget(_mockup());

    expect(_screenOf(tester), const Size(390, 844));
  });

  testWidgets('scales the whole device down to the room it was given', (WidgetTester tester) async {
    await tester.pumpWidget(_mockup());

    // 390 + 14 a side is 418 across, drawn 200 wide.
    expect(_drawnOf(tester, find.byKey(_content)).width, closeTo(390 * 200 / 418, 0.01));
    expect(tester.getSize(find.byType(MPMockup)).width, 200);
  });

  testWidgets('keeps the device’s proportions whatever it is scaled to', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(_mockup(width: 100));
    final Size small = tester.getSize(find.byType(MPMockup));

    await tester.pumpWidget(_mockup(width: 250));
    final Size large = tester.getSize(find.byType(MPMockup));

    expect(small.width / small.height, closeTo(large.width / large.height, 0.001));
    expect(small.width / small.height, closeTo(418 / 872, 0.001));
  });

  testWidgets('fills the width it is given when told no size', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(
        width: 300,
        const MPMockup(
          device: MPMockupDevice.mobile,
          child: SizedBox.expand(key: _content),
        ),
      ),
    );

    expect(tester.getSize(find.byType(MPMockup)).width, 300);
  });

  testWidgets('takes a rendered height on its own, and the width follows', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(_mockup(width: null, height: 436));

    expect(tester.getSize(find.byType(MPMockup)), const Size(209, 436));
  });

  testWidgets('picks a real resolution off the ladder, and takes one it is handed', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(_mockup(size: MPSize.xs));
    expect(_screenOf(tester), const Size(320, 568));

    await tester.pumpWidget(
      host(
        const MPConfigProvider(
          size: MPSize.xl,
          child: MPMockup(
            device: MPMockupDevice.mobile,
            systemUi: false,
            width: 200,
            child: SizedBox.expand(key: _content),
          ),
        ),
      ),
    );
    expect(_screenOf(tester), const Size(430, 932));

    await tester.pumpWidget(_mockup(resolution: const MPMockupResolution(375, 667)));
    expect(_screenOf(tester), const Size(375, 667));
  });

  testWidgets('turns the screen and the hardware together in landscape', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(_mockup(orientation: MPMockupOrientation.landscape));

    expect(_screenOf(tester), const Size(844, 390));
  });

  testWidgets('leaves a desktop alone when it is asked to turn', (WidgetTester tester) async {
    await tester.pumpWidget(
      _mockup(device: MPMockupDevice.desktop, orientation: MPMockupOrientation.landscape),
    );

    expect(_screenOf(tester), const Size(1440, 900));
  });

  testWidgets('draws no hardware at all at bezel none', (WidgetTester tester) async {
    await tester.pumpWidget(_mockup(bezel: MPMockupBezel.none));

    expect(_drawnOf(tester, find.byKey(_content)).width, closeTo(200, 0.01));
    expect(
      tester
          .widgetList<DecoratedBox>(find.byType(DecoratedBox))
          .map((DecoratedBox box) => (box.decoration as BoxDecoration).color),
      isNot(contains(mockupFinishes[MPMockupFinish.graphite]!.$1)),
    );
  });

  testWidgets('gives an older device a forehead and a chin', (WidgetTester tester) async {
    final MockupMetrics metrics = mockupMetrics(
      device: MPMockupDevice.mobile,
      bezel: MPMockupBezel.thick,
      hardware: MPMockupHardware.monitor,
      orientation: MPMockupOrientation.portrait,
      resolution: const MPMockupResolution(390, 844),
    );

    expect(metrics.shell.top, greaterThan(metrics.shell.side));
    expect(metrics.body, const MPMockupResolution(390 + 24, 844 + 62 + 82));
  });

  testWidgets('holds a desktop up on a stand, or on a keyboard, and a handheld on nothing', (
    WidgetTester tester,
  ) async {
    MockupMetrics of(MPMockupDevice device, MPMockupHardware hardware) {
      return mockupMetrics(
        device: device,
        bezel: MPMockupBezel.standard,
        hardware: hardware,
        orientation: MPMockupOrientation.portrait,
        resolution: mockupResolutions[device]![MPSize.md]!,
      );
    }

    expect(of(MPMockupDevice.desktop, MPMockupHardware.monitor).stand, isNotNull);
    expect(of(MPMockupDevice.desktop, MPMockupHardware.laptop).laptop, isNotNull);
    expect(of(MPMockupDevice.desktop, MPMockupHardware.laptop).stand, isNull);
    expect(of(MPMockupDevice.mobile, MPMockupHardware.laptop).laptop, isNull);
    expect(of(MPMockupDevice.mobile, MPMockupHardware.monitor).stand, isNull);
  });

  testWidgets('corrects a system the device cannot run rather than refusing it', (
    WidgetTester tester,
  ) async {
    expect(mockupOs(MPMockupDevice.mobile, MPMockupOs.macos), MPMockupOs.ios);
    expect(mockupOs(MPMockupDevice.tablet, null), MPMockupOs.ipados);
    expect(mockupOs(MPMockupDevice.desktop, MPMockupOs.linux), MPMockupOs.linux);
  });

  testWidgets('takes room out of the screen for the system’s bars', (WidgetTester tester) async {
    await tester.pumpWidget(_mockup(systemUi: true));

    expect(_screenOf(tester).width, 390);
    expect(_screenOf(tester).height, lessThan(844));

    await tester.pumpWidget(
      _mockup(device: MPMockupDevice.desktop, os: MPMockupOs.windows, systemUi: true),
    );
    expect(_screenOf(tester).height, lessThan(900));
  });

  testWidgets('draws the cut-out the device would have, and the one it was told to', (
    WidgetTester tester,
  ) async {
    expect(mockupNotch(MPMockupDevice.mobile, MPMockupOs.ios), MPMockupNotch.dynamicIsland);
    expect(mockupNotch(MPMockupDevice.mobile, MPMockupOs.android), MPMockupNotch.punchHole);
    expect(mockupNotch(MPMockupDevice.tablet, MPMockupOs.ipados), MPMockupNotch.none);

    await tester.pumpWidget(_mockup(notch: MPMockupNotch.notch));
    expect(tester.widget<MockupCutout>(find.byType(MockupCutout)).notch, MPMockupNotch.notch);
  });

  testWidgets('draws the cut-out whether or not the chrome is on', (WidgetTester tester) async {
    await tester.pumpWidget(_mockup());

    expect(
      tester.widget<MockupCutout>(find.byType(MockupCutout)).notch,
      MPMockupNotch.dynamicIsland,
    );
  });

  testWidgets('keeps the hardware’s colour whatever the page is doing', (
    WidgetTester tester,
  ) async {
    Color faceOf() {
      return (tester.widget<DecoratedBox>(find.byType(DecoratedBox).first).decoration
              as BoxDecoration)
          .color!;
    }

    await tester.pumpWidget(_mockup());
    final Color light = faceOf();

    await tester.pumpWidget(
      host(
        brightness: Brightness.dark,
        const MPMockup(device: MPMockupDevice.mobile, width: 200, child: SizedBox.expand()),
      ),
    );

    expect(faceOf(), light);
    expect(light, mockupFinishes[MPMockupFinish.graphite]!.$1);
  });

  testWidgets('hands the screen a window the size of the device', (WidgetTester tester) async {
    late Size window;

    await tester.pumpWidget(
      host(
        MPMockup(
          device: MPMockupDevice.mobile,
          width: 200,
          child: Builder(
            builder: (BuildContext context) {
              window = MediaQuery.sizeOf(context);

              return const SizedBox.expand();
            },
          ),
        ),
      ),
    );

    expect(window, const Size(390, 844));
  });
}
