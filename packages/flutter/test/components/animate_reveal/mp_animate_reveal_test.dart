import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/animate_reveal/mp_animate_reveal.dart';
import 'package:material_plus_ui/src/internal/animate.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

const Size _box = Size(200, 40);

/// The rectangle the wipe is painting, inside the content's own box.
Rect _clip(WidgetTester tester) {
  final ClipRect clip = tester.widget<ClipRect>(
    find.descendant(of: find.byType(MPAnimateReveal), matching: find.byType(ClipRect)),
  );

  return clip.clipper!.getClip(_box);
}

double _opacity(WidgetTester tester) {
  return tester
      .widget<MPAnimateOpacity>(
        find.descendant(of: find.byType(MPAnimateReveal), matching: find.byType(MPAnimateOpacity)),
      )
      .opacity;
}

const Widget _content = SizedBox(width: 200, height: 40, child: Text('Shipped'));

void main() {
  testWidgets('opens at the left when nobody said, and ends as the whole box', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(host(const MPAnimateReveal(child: _content)));

    expect(_clip(tester).width, 0);
    expect(_clip(tester).left, 0);

    await tester.pumpAndSettle();

    expect(_clip(tester), Offset.zero & _box);
  });

  testWidgets('opens at each edge it is given', (WidgetTester tester) async {
    for (final MPSide side in MPSide.values) {
      await tester.pumpWidget(
        host(
          MPAnimateReveal(
            key: ValueKey<MPSide>(side),
            from: side,
            duration: const Duration(seconds: 1),
            easing: MPEasing.linear,
            child: _content,
          ),
        ),
      );
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 500));

      final Rect clip = _clip(tester);
      final Rect expected = switch (side) {
        MPSide.left => const Rect.fromLTWH(0, 0, 100, 40),
        MPSide.right => const Rect.fromLTWH(100, 0, 100, 40),
        MPSide.top => const Rect.fromLTWH(0, 0, 200, 20),
        MPSide.bottom => const Rect.fromLTWH(0, 20, 200, 20),
      };

      expect(clip.left, closeTo(expected.left, 2), reason: side.name);
      expect(clip.top, closeTo(expected.top, 2), reason: side.name);
      expect(clip.width, closeTo(expected.width, 2), reason: side.name);
      expect(clip.height, closeTo(expected.height, 2), reason: side.name);
    }
  });

  testWidgets('leaves the content where it is and does not fade', (WidgetTester tester) async {
    await tester.pumpWidget(host(const MPAnimateReveal(child: _content)));

    final Offset start = tester.getTopLeft(find.text('Shipped'));

    expect(_opacity(tester), 1);

    await tester.pumpAndSettle();

    expect(tester.getTopLeft(find.text('Shipped')), start);
  });

  testWidgets('fades as well for a caller who asked for both', (WidgetTester tester) async {
    await tester.pumpWidget(host(const MPAnimateReveal(fade: true, child: _content)));

    expect(_opacity(tester), 0);
  });

  testWidgets('covers again by running the wipe backwards', (WidgetTester tester) async {
    await tester.pumpWidget(host(const MPAnimateReveal(mode: MPAnimateMode.exit, child: _content)));

    expect(_clip(tester), Offset.zero & _box);

    await tester.pump();
    await tester.pump(MPMotion.short4 + const Duration(milliseconds: 10));

    expect(_clip(tester).width, 0);
  });

  testWidgets('adds nothing to the layout', (WidgetTester tester) async {
    await tester.pumpWidget(host(const MPAnimateReveal(child: _content)));

    expect(tester.getSize(find.byType(MPAnimateReveal)), _box);
    expect(tester.renderObject(find.byType(ClipRect)), isA<RenderClipRect>());
  });
}
