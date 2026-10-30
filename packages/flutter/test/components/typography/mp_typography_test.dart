import 'package:flutter/semantics.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/typography/mp_typography.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('the scale', () {
    testWidgets('sets each level at its Material role’s size and leading', (
      WidgetTester tester,
    ) async {
      const Map<MPTypographyLevel, (double, double)> roles = <MPTypographyLevel, (double, double)>{
        MPTypographyLevel.h1: (36, 44),
        MPTypographyLevel.h2: (32, 40),
        MPTypographyLevel.h3: (28, 36),
        MPTypographyLevel.h4: (24, 32),
        MPTypographyLevel.h5: (22, 28),
        MPTypographyLevel.h6: (16, 24),
        MPTypographyLevel.lead: (22, 28),
        MPTypographyLevel.body: (16, 24),
        MPTypographyLevel.caption: (12, 16),
        MPTypographyLevel.overline: (11, 16),
      };

      for (final MapEntry<MPTypographyLevel, (double, double)> role in roles.entries) {
        await tester.pumpWidget(host(MPTypography('Aa', level: role.key)));

        final TextStyle style = tester.widget<Text>(find.byType(Text)).style!;
        expect(style.fontSize, role.value.$1, reason: role.key.name);
        expect(
          style.fontSize! * style.height!,
          closeTo(role.value.$2, 0.001),
          reason: role.key.name,
        );
      }
    });

    testWidgets('is body by default', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPTypography('Hello')));

      expect(tester.widget<Text>(find.byType(Text)).style!.fontSize, 16);
    });

    testWidgets('upper-cases an overline and spaces it out', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(const MPTypography('Release notes', level: MPTypographyLevel.overline)),
      );

      final Text text = tester.widget<Text>(find.byType(Text));
      expect(text.data, 'RELEASE NOTES');
      expect(text.style!.letterSpacing, closeTo(11 * 0.08, 0.001));
    });
  });

  group('weight', () {
    testWidgets('sets headings at the specification’s regular weight', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPTypography('Title', level: MPTypographyLevel.h2)));

      expect(tester.widget<Text>(find.byType(Text)).style!.fontWeight, FontWeight.w400);
    });

    testWidgets('sets the label-ish levels one weight up', (WidgetTester tester) async {
      for (final MPTypographyLevel level in <MPTypographyLevel>[
        MPTypographyLevel.h6,
        MPTypographyLevel.overline,
      ]) {
        await tester.pumpWidget(host(MPTypography('Aa', level: level)));

        expect(tester.widget<Text>(find.byType(Text)).style!.fontWeight, FontWeight.w500);
      }
    });

    testWidgets('takes an override', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const MPTypography('Title', level: MPTypographyLevel.h2, weight: MPTypographyWeight.bold),
        ),
      );

      expect(tester.widget<Text>(find.byType(Text)).style!.fontWeight, FontWeight.w700);
    });
  });

  group('colour', () {
    testWidgets('takes the ink of what it sits in when no family is asked for', (
      WidgetTester tester,
    ) async {
      const Color ink = Color(0xFF336699);

      await tester.pumpWidget(
        host(
          const DefaultTextStyle(
            style: TextStyle(color: ink),
            child: MPTypography('Hello'),
          ),
        ),
      );

      expect(styleOf(tester, 'Hello').color, ink);
    });

    testWidgets('reads the accent family when one is asked for', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPTypography('Hello', color: MPColor.tertiary)));

      expect(styleOf(tester, 'Hello').color, light.tertiary);
    });
  });

  group('layout', () {
    testWidgets('cuts to the lines asked for', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPTypography('Hello', lines: 2)));

      final Text text = tester.widget<Text>(find.byType(Text));
      expect(text.maxLines, 2);
      expect(text.overflow, TextOverflow.ellipsis);
    });

    testWidgets('aligns the text', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPTypography('Hello', align: TextAlign.center)));

      expect(tester.widget<Text>(find.byType(Text)).textAlign, TextAlign.center);
    });

    testWidgets('leaves no space below by default, and the prose gutter when asked', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(const MPTypography('Hello')));
      final double bare = tester.getSize(find.byType(MPTypography)).height;

      await tester.pumpWidget(host(const MPTypography('Hello', gutter: true)));

      expect(tester.getSize(find.byType(MPTypography)).height, bare + 12);
    });
  });

  group('semantics', () {
    testWidgets('announces h1 to h6 as headings at their own level', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(const MPTypography('Title', level: MPTypographyLevel.h3)));

      final SemanticsData data = tester.getSemantics(find.text('Title')).getSemanticsData();
      expect(data.headingLevel, 3);
      semantics.dispose();
    });

    testWidgets('does not announce a lead as a heading', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(const MPTypography('Intro', level: MPTypographyLevel.lead)));

      expect(tester.getSemantics(find.text('Intro')).getSemanticsData().headingLevel, 0);
      semantics.dispose();
    });

    testWidgets('moves a line to another heading level when asked', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(const MPTypography('Title', level: MPTypographyLevel.h2, headingLevel: 4)),
      );

      expect(tester.getSemantics(find.text('Title')).getSemanticsData().headingLevel, 4);
      semantics.dispose();
    });

    testWidgets('reads an overline in its own case', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(const MPTypography('Release notes', level: MPTypographyLevel.overline)),
      );

      expect(find.bySemanticsLabel('Release notes'), findsOneWidget);
      semantics.dispose();
    });
  });
}
