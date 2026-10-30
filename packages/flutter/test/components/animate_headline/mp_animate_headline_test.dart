import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/animate_headline/mp_animate_headline.dart';
import 'package:material_plus_ui/src/internal/animate.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';

import '../../support/host.dart';

const List<Widget> _lines = <Widget>[
  Text('a component library'),
  Text('Material Design 3'),
  Text('built on widgets'),
];

/// Whether [text] is the line showing: drawn, and at full strength.
bool _showing(WidgetTester tester, String text) {
  final Visibility visibility = tester.widget<Visibility>(
    find.ancestor(of: find.text(text), matching: find.byType(Visibility)).first,
  );

  return visibility.visible;
}

double _opacity(WidgetTester tester, String text) {
  return tester
      .widget<MPAnimateOpacity>(
        find.ancestor(of: find.text(text), matching: find.byType(MPAnimateOpacity)).first,
      )
      .opacity;
}

/// How far [text] is drawn below where it is laid out.
double _rise(WidgetTester tester, String text) {
  final RenderBox line = tester.renderObject<RenderBox>(find.text(text));
  final RenderBox box = tester.renderObject<RenderBox>(find.byType(MPAnimateHeadline));

  return line.localToGlobal(Offset.zero).dy - box.localToGlobal(Offset.zero).dy;
}

void main() {
  testWidgets('stacks every line in one place, as large as the largest', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(host(const MPAnimateHeadline(children: _lines)));

    final Size box = tester.getSize(find.byType(MPAnimateHeadline));

    expect(box.width, tester.getSize(find.text('a component library')).width);
    expect(box.height, tester.getSize(find.text('Material Design 3')).height);

    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('shows the first line and hides the rest, from the reader too', (
    WidgetTester tester,
  ) async {
    final SemanticsHandle handle = tester.ensureSemantics();

    await tester.pumpWidget(host(const MPAnimateHeadline(children: _lines)));

    expect(_showing(tester, 'a component library'), isTrue);
    expect(_showing(tester, 'Material Design 3'), isFalse);
    expect(semanticsLabels(tester), <String>['a component library']);

    await tester.pumpWidget(const SizedBox());
    handle.dispose();
  });

  testWidgets('turns on its own after the interval, and tells the caller', (
    WidgetTester tester,
  ) async {
    final List<int> changes = <int>[];

    await tester.pumpWidget(host(MPAnimateHeadline(onIndexChange: changes.add, children: _lines)));
    await tester.pump(const Duration(milliseconds: 2600));
    await tester.pump();

    expect(changes, <int>[1]);
    expect(_showing(tester, 'Material Design 3'), isTrue);

    await tester.pumpWidget(const SizedBox());
  });

  group('the two halves of the emphasized curve', () {
    testWidgets('brings the next line up as the last one leaves, over long2', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(const MPAnimateHeadline(children: _lines)));
      await tester.pump(const Duration(milliseconds: 2600));
      await tester.pump();
      await tester.pump(MPMotion.long2 ~/ 2);

      final double height = tester.getSize(find.text('Material Design 3')).height;
      final double arriving = MPMotion.emphasizedDecelerate.transform(0.5);
      final double leaving = MPMotion.emphasizedAccelerate.transform(0.5);

      // Arriving decelerates: most of the way up and most of the way in.
      expect(_rise(tester, 'Material Design 3'), closeTo(height * (1 - arriving), 1));
      expect(_opacity(tester, 'Material Design 3'), closeTo(arriving, 0.02));

      // Leaving accelerates: barely gone yet.
      expect(_rise(tester, 'a component library'), closeTo(-height * leaving, 1));
      expect(_opacity(tester, 'a component library'), closeTo(1 - leaving, 0.02));

      await tester.pump(MPMotion.long2);

      expect(_showing(tester, 'a component library'), isFalse);

      await tester.pumpWidget(const SizedBox());
    });
  });

  group('index', () {
    testWidgets('is driven by the caller when one is given', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPAnimateHeadline(index: 2, children: _lines)));

      expect(_showing(tester, 'built on widgets'), isTrue);

      await tester.pumpWidget(host(const MPAnimateHeadline(index: 1, children: _lines)));
      await tester.pumpAndSettle();

      expect(_showing(tester, 'Material Design 3'), isTrue);
    });

    testWidgets('does not turn on its own once it is controlled', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPAnimateHeadline(index: 0, children: _lines)));
      await tester.pump(const Duration(seconds: 10));

      expect(_showing(tester, 'a component library'), isTrue);
      expect(await redrawsIn(tester), isFalse);
    });
  });

  group('loop', () {
    testWidgets('stops on the last line when it is off', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const MPAnimateHeadline(
            loop: false,
            interval: Duration(milliseconds: 100),
            children: _lines,
          ),
        ),
      );

      for (int step = 0; step < 50; step += 1) {
        await tester.pump(const Duration(milliseconds: 100));
      }

      expect(_showing(tester, 'built on widgets'), isTrue);
      expect(await redrawsIn(tester), isFalse);
    });
  });

  testWidgets('waits out the delay once, before the first line only', (WidgetTester tester) async {
    final List<int> changes = <int>[];

    await tester.pumpWidget(
      host(
        MPAnimateHeadline(
          delay: const Duration(seconds: 1),
          interval: const Duration(seconds: 2),
          onIndexChange: changes.add,
          children: _lines,
        ),
      ),
    );
    await tester.pump(const Duration(milliseconds: 2500));

    expect(changes, isEmpty);

    await tester.pump(const Duration(milliseconds: 600));

    expect(changes, <int>[1]);

    await tester.pump(MPMotion.long2);
    await tester.pump(const Duration(seconds: 2));

    expect(changes, <int>[1, 2]);

    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('holds the line it is on while paused', (WidgetTester tester) async {
    await tester.pumpWidget(host(const MPAnimateHeadline(paused: true, children: _lines)));
    await tester.pump(const Duration(seconds: 10));

    expect(_showing(tester, 'a component library'), isTrue);
  });

  testWidgets('still turns under reduced motion, swapping rather than travelling', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      host(const MPAnimateHeadline(children: _lines), disableAnimations: true),
    );
    await tester.pump(const Duration(milliseconds: 2600));
    await tester.pump();

    expect(_showing(tester, 'Material Design 3'), isTrue);
    expect(_showing(tester, 'a component library'), isFalse);
    expect(_rise(tester, 'Material Design 3'), 0);
    expect(_opacity(tester, 'Material Design 3'), 1);

    await tester.pumpWidget(const SizedBox());
  });
}
