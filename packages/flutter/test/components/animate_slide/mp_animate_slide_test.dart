import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/animate_slide/mp_animate_slide.dart';
import 'package:material_plus_ui/src/internal/animate.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// Where the content is drawn, against where it is laid out.
Offset _shift(WidgetTester tester) {
  final Offset laid = tester.getTopLeft(find.byType(MPAnimateSlide));
  final RenderBox box = tester.renderObject<RenderBox>(find.byKey(const Key('content')));

  return box.localToGlobal(Offset.zero) - laid;
}

double _opacity(WidgetTester tester) {
  return tester
      .widget<MPAnimateOpacity>(
        find.descendant(of: find.byType(MPAnimateSlide), matching: find.byType(MPAnimateOpacity)),
      )
      .opacity;
}

const Widget _content = SizedBox(key: Key('content'), width: 100, height: 40);

void main() {
  testWidgets('comes up from below by default, its own height away', (WidgetTester tester) async {
    await tester.pumpWidget(host(const MPAnimateSlide(child: _content)));

    expect(_shift(tester), const Offset(0, 40));

    await tester.pumpAndSettle();

    expect(_shift(tester), Offset.zero);
  });

  testWidgets('travels from each edge, its own size away', (WidgetTester tester) async {
    const Map<MPSide, Offset> starts = <MPSide, Offset>{
      MPSide.top: Offset(0, -40),
      MPSide.right: Offset(100, 0),
      MPSide.bottom: Offset(0, 40),
      MPSide.left: Offset(-100, 0),
    };

    for (final MapEntry<MPSide, Offset> entry in starts.entries) {
      await tester.pumpWidget(
        host(MPAnimateSlide(key: ValueKey<MPSide>(entry.key), from: entry.key, child: _content)),
      );

      expect(_shift(tester), entry.value, reason: entry.key.name);
    }
  });

  testWidgets('stays physical rather than following the reading direction', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      host(
        const MPAnimateSlide(from: MPSide.left, child: _content),
        textDirection: TextDirection.rtl,
      ),
    );

    expect(_shift(tester), const Offset(-100, 0));
  });

  testWidgets('takes a distance in logical pixels', (WidgetTester tester) async {
    await tester.pumpWidget(host(const MPAnimateSlide(distance: 24, child: _content)));

    expect(_shift(tester), const Offset(0, 24));
  });

  testWidgets('leaves by the same edge it would have come from', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(const MPAnimateSlide(mode: MPAnimateMode.exit, from: MPSide.top, child: _content)),
    );

    expect(_shift(tester), Offset.zero);

    await tester.pumpAndSettle();

    expect(_shift(tester), const Offset(0, -40));
  });

  testWidgets('holds full opacity when the fade is off', (WidgetTester tester) async {
    await tester.pumpWidget(host(const MPAnimateSlide(fade: false, child: _content)));

    expect(_opacity(tester), 1);
  });

  testWidgets('moves the content and not the layout', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(
        const Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            MPAnimateSlide(child: _content),
            SizedBox(key: Key('below'), width: 100, height: 10),
          ],
        ),
      ),
    );

    final Offset below = tester.getTopLeft(find.byKey(const Key('below')));

    await tester.pump(const Duration(milliseconds: 100));

    expect(tester.getTopLeft(find.byKey(const Key('below'))), below);
  });
}
