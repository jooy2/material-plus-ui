import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/components/container/mp_container.dart';
import 'package:material_plus_ui/src/components/container/mp_responsive.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The React suite reads `padding-left` and `max-width` off the element. Here
/// the same questions are a measurement: where the child landed inside the
/// container, and how wide the container came out.

/// [child] in a window [width] wide, which is what decides the window class.
Widget _inWindow(double width, Widget child) {
  return MediaQuery(
    data: MediaQueryData(size: Size(width, 900)),
    child: child,
  );
}

const Key _page = Key('page');

/// Gives the test a screen wide enough for the large window classes: the
/// default one is 800 across, and the frame `host` draws is clamped to it.
void _widen(WidgetTester tester) {
  tester.view
    ..physicalSize = const Size(2400, 1200)
    ..devicePixelRatio = 1;
  addTearDown(tester.view.reset);
}

/// The box the container holds its content in: the one the measure caps and
/// the margin pads, inside the alignment that centres it.
Rect _boxOf(WidgetTester tester, [Finder? container]) {
  final Finder align = find
      .descendant(of: container ?? find.byType(MPContainer).first, matching: find.byType(Align))
      .first;
  final RenderBox inner = tester.renderObject<RenderShiftedBox>(align).child!;

  return inner.localToGlobal(Offset.zero) & inner.size;
}

/// Where the content sits inside it.
Rect _pageOf(WidgetTester tester) => tester.getRect(find.byKey(_page));

void main() {
  testWidgets('renders what it was handed', (WidgetTester tester) async {
    await tester.pumpWidget(host(const MPContainer(child: Text('Page'))));

    expect(find.text('Page'), findsOneWidget);
  });

  testWidgets('holds the content off the edge by Material’s own margin', (
    WidgetTester tester,
  ) async {
    // 16 at `md`, which is MD3's compact margin.
    await tester.pumpWidget(
      host(width: 400, const MPContainer(child: SizedBox(key: _page, height: 10))),
    );

    expect(_pageOf(tester).left - _boxOf(tester).left, 16);
    expect(_boxOf(tester).right - _pageOf(tester).right, 16);
  });

  testWidgets('moves the margin up and down the ladder', (WidgetTester tester) async {
    final List<double> margins = <double>[];

    for (final MPSize size in MPSize.values) {
      await tester.pumpWidget(
        host(
          width: 400,
          MPContainer(
            size: size,
            child: const SizedBox(key: _page, height: 10),
          ),
        ),
      );
      margins.add(_pageOf(tester).left - _boxOf(tester).left);
    }

    expect(margins, <double>[10, 12, 16, 20, 24]);
  });

  testWidgets('takes its rung from an MPConfigProvider', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(
        width: 400,
        const MPConfigProvider(
          size: MPSize.xs,
          child: MPContainer(child: SizedBox(key: _page, height: 10)),
        ),
      ),
    );

    expect(_pageOf(tester).left - _boxOf(tester).left, 10);
  });

  testWidgets('drops the margin for full-bleed content', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(width: 400, const MPContainer(padded: false, child: SizedBox(key: _page, height: 10))),
    );

    expect(_pageOf(tester).width, 400);
  });

  testWidgets('takes no measure until it is asked for one', (WidgetTester tester) async {
    _widen(tester);

    await tester.pumpWidget(
      host(width: 2000, _inWindow(2000, const MPContainer(child: SizedBox(height: 10)))),
    );

    expect(_boxOf(tester).width, 2000);
  });

  testWidgets('caps the content at a window size class’s boundary', (WidgetTester tester) async {
    _widen(tester);

    // `md` is 840, where MD3's expanded window starts.
    await tester.pumpWidget(
      host(
        width: 1200,
        _inWindow(
          1200,
          const MPContainer(
            maxWidth: MPResponsive<MPMeasure>(MPMeasure.md),
            child: SizedBox(height: 10),
          ),
        ),
      ),
    );

    expect(_boxOf(tester).width, 840);
  });

  testWidgets('takes a length of its own', (WidgetTester tester) async {
    _widen(tester);

    await tester.pumpWidget(
      host(
        width: 1200,
        const MPContainer(
          maxWidth: MPResponsive<MPMeasure>(MPMeasure.pixels(800)),
          child: SizedBox(height: 10),
        ),
      ),
    );

    expect(_boxOf(tester).width, 800);
  });

  testWidgets('changes its measure at a window size class', (WidgetTester tester) async {
    _widen(tester);

    const MPContainer container = MPContainer(
      maxWidth: MPResponsive<MPMeasure>(MPMeasure.none, large: MPMeasure.sm),
      child: SizedBox(height: 10),
    );

    await tester.pumpWidget(host(width: 1280, _inWindow(1280, container)));
    expect(_boxOf(tester).width, 600);

    await tester.pumpWidget(host(width: 1000, _inWindow(1000, container)));
    expect(_boxOf(tester).width, 1000);
  });

  testWidgets('keeps a class it was not given from the one below it', (WidgetTester tester) async {
    _widen(tester);

    await tester.pumpWidget(
      host(
        width: 1280,
        _inWindow(
          1280,
          const MPContainer(
            maxWidth: MPResponsive<MPMeasure>(MPMeasure.sm, extraLarge: MPMeasure.xl),
            child: SizedBox(height: 10),
          ),
        ),
      ),
    );

    expect(_boxOf(tester).width, 600);
  });

  testWidgets('leaves the classes under a partial map unlimited', (WidgetTester tester) async {
    _widen(tester);

    const MPContainer container = MPContainer(
      maxWidth: MPResponsive<MPMeasure>.from(expanded: MPMeasure.sm),
      child: SizedBox(height: 10),
    );

    await tester.pumpWidget(host(width: 700, _inWindow(700, container)));
    expect(_boxOf(tester).width, 700);

    await tester.pumpWidget(host(width: 900, _inWindow(900, container)));
    expect(_boxOf(tester).width, 600);
  });

  testWidgets('moves a rung with the boundary an MPConfigProvider moved', (
    WidgetTester tester,
  ) async {
    _widen(tester);

    await tester.pumpWidget(
      host(
        width: 1200,
        const MPConfigProvider(
          breakpoints: <MPWindowClass, double>{MPWindowClass.medium: 700},
          child: MPContainer(
            maxWidth: MPResponsive<MPMeasure>(MPMeasure.sm),
            child: SizedBox(height: 10),
          ),
        ),
      ),
    );

    expect(_boxOf(tester).width, 700);
  });

  testWidgets('does not let an inner measure resolve the outer one', (WidgetTester tester) async {
    _widen(tester);

    await tester.pumpWidget(
      host(
        width: 1280,
        _inWindow(
          1280,
          const MPContainer(
            maxWidth: MPResponsive<MPMeasure>(MPMeasure.none, large: MPMeasure.xl),
            padded: false,
            child: MPContainer(
              key: Key('inner'),
              maxWidth: MPResponsive<MPMeasure>(MPMeasure.sm),
              child: SizedBox(height: 10),
            ),
          ),
        ),
      ),
    );

    expect(_boxOf(tester, find.byKey(const Key('inner'))).width, 600);
  });

  testWidgets('centres a capped container, and stops when told to', (WidgetTester tester) async {
    _widen(tester);

    await tester.pumpWidget(
      host(
        width: 1200,
        const Column(
          children: <Widget>[
            MPContainer(
              key: Key('middle'),
              maxWidth: MPResponsive<MPMeasure>(MPMeasure.sm),
              child: SizedBox(height: 10),
            ),
            MPContainer(
              key: Key('start'),
              maxWidth: MPResponsive<MPMeasure>(MPMeasure.sm),
              centered: false,
              child: SizedBox(height: 10),
            ),
          ],
        ),
      ),
    );

    final double frame = tester.getTopLeft(find.byType(Column)).dx;

    expect(_boxOf(tester, find.byKey(const Key('middle'))).left - frame, 300);
    expect(_boxOf(tester, find.byKey(const Key('start'))).left - frame, 0);
  });

  testWidgets('holds to the start edge under right-to-left text', (WidgetTester tester) async {
    _widen(tester);

    await tester.pumpWidget(
      host(
        width: 1200,
        textDirection: TextDirection.rtl,
        const MPContainer(
          maxWidth: MPResponsive<MPMeasure>(MPMeasure.sm),
          centered: false,
          child: SizedBox(key: _page, height: 10),
        ),
      ),
    );

    final double frameRight = tester.getTopRight(find.byType(SizedBox).first).dx;

    expect(_boxOf(tester).right, frameRight);
  });

  testWidgets('keeps the margin inside the measure it was given', (WidgetTester tester) async {
    _widen(tester);

    await tester.pumpWidget(
      host(
        width: 1200,
        const MPContainer(
          maxWidth: MPResponsive<MPMeasure>(MPMeasure.sm),
          child: SizedBox(key: _page, height: 10),
        ),
      ),
    );

    expect(_boxOf(tester).width, 600);
    expect(_pageOf(tester).width, 600 - 32);
  });

  testWidgets('is as tall as what it holds', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(width: 400, height: 600, const MPContainer(child: SizedBox(height: 40))),
    );

    expect(_boxOf(tester).height, 40);
  });

  testWidgets('lays out where there is no width to fill', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(
        const Row(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            MPContainer(
              maxWidth: MPResponsive<MPMeasure>(MPMeasure.pixels(200)),
              child: SizedBox(key: _page, width: 500, height: 10),
            ),
          ],
        ),
      ),
    );

    expect(tester.takeException(), isNull);
    expect(_boxOf(tester).width, 200);
  });

  testWidgets('paints no surface of its own', (WidgetTester tester) async {
    await tester.pumpWidget(host(const MPContainer(child: Text('Page'))));

    expect(
      find.descendant(of: find.byType(MPContainer), matching: find.byType(DecoratedBox)),
      findsNothing,
    );
  });
}
