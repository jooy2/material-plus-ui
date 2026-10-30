import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/icon/mp_icon.dart';

import '../../support/host.dart';

/// The React suite reads the box's inline style and the glyph's attributes;
/// here the same questions are asked of the laid-out box and of the
/// [IconTheme] the glyph reads.

/// Records the icon theme it is built under, the way an icon set's widget reads
/// its size and colour.
class _Glyph extends StatelessWidget {
  const _Glyph();

  static IconThemeData? seen;

  @override
  Widget build(BuildContext context) {
    seen = IconTheme.of(context);

    return SizedBox.square(dimension: seen!.size ?? 24);
  }
}

const IconData _data = IconData(0xe000, fontFamily: 'Test');

void main() {
  group('rendering', () {
    testWidgets('renders a glyph given as a widget', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPIcon(icon: _Glyph(), label: 'Status')));

      expect(find.byType(_Glyph), findsOneWidget);
    });

    testWidgets('renders a glyph given as IconData', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPIcon(icon: _data, label: 'Status')));

      expect(tester.widget<Icon>(find.byType(Icon)).icon, _data);
    });

    testWidgets('reflects a changed glyph on rebuild', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPIcon(icon: Text('before'))));
      expect(find.text('before'), findsOneWidget);

      await tester.pumpWidget(host(const MPIcon(icon: Text('after'))));
      expect(find.text('after'), findsOneWidget);
      expect(find.text('before'), findsNothing);
    });

    test('refuses anything that is neither', () {
      expect(() => MPIcon(icon: 42), throwsAssertionError);
    });
  });

  group('size', () {
    testWidgets('draws at the theme’s size when none is given', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const IconTheme(
            data: IconThemeData(size: 18),
            child: MPIcon(icon: _Glyph()),
          ),
        ),
      );

      expect(tester.getSize(find.byType(MPIcon)), const Size(18, 18));
    });

    testWidgets('sets the box from a size', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPIcon(icon: _Glyph(), size: 20)));

      expect(tester.getSize(find.byType(MPIcon)), const Size(20, 20));
    });

    testWidgets('hands the size to a glyph given as a widget', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPIcon(icon: _Glyph(), size: 20)));

      expect(_Glyph.seen!.size, 20);
    });

    testWidgets('sets the font size too, for a glyph that is a character', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(const MPIcon(icon: Text('★'), size: 30)));

      expect(styleOf(tester, '★').fontSize, 30);
    });

    testWidgets('sizes an IconData glyph', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPIcon(icon: _data, size: 32)));

      expect(tester.widget<Icon>(find.byType(Icon)).size, 32);
      expect(tester.getSize(find.byType(MPIcon)), const Size(32, 32));
    });
  });

  group('color', () {
    testWidgets('inherits the surrounding colour when none is given', (WidgetTester tester) async {
      const Color ink = Color(0xFF123456);

      await tester.pumpWidget(
        host(
          const IconTheme(
            data: IconThemeData(color: ink),
            child: MPIcon(icon: _Glyph()),
          ),
        ),
      );

      expect(_Glyph.seen!.color, ink);
    });

    testWidgets('applies a colour to the glyph', (WidgetTester tester) async {
      const Color ink = Color(0xFFB00020);

      await tester.pumpWidget(host(const MPIcon(icon: _Glyph(), color: ink)));

      expect(_Glyph.seen!.color, ink);
    });
  });

  group('accessibility', () {
    testWidgets('is announced as an image when it carries a label', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(const MPIcon(icon: Text('x'), label: 'Status')));

      expect(
        tester.getSemantics(find.byType(MPIcon)),
        matchesSemantics(label: 'Status', isImage: true),
      );
      expect(find.bySemanticsLabel('x'), findsNothing);
      semantics.dispose();
    });

    testWidgets('leaves the semantics tree entirely without a label', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(const MPIcon(icon: Text('x'))));

      expect(semanticsLabels(tester), isEmpty);
      semantics.dispose();
    });
  });
}
