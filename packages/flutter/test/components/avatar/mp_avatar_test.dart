import 'dart:convert';

import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/avatar/mp_avatar.dart';
import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// One transparent pixel, which is all a picture that loads needs to be.
final MemoryImage _pixel = MemoryImage(
  base64Decode(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  ),
);

/// Bytes that are not a picture at all, so decoding them fails.
final MemoryImage _broken = MemoryImage(base64Decode('AAAA'));

BoxDecoration _surfaceOf(WidgetTester tester) {
  return tester
          .widget<AnimatedContainer>(
            find.descendant(of: find.byType(MPAvatar), matching: find.byType(AnimatedContainer)),
          )
          .decoration!
      as BoxDecoration;
}

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('the fallback', () {
    testWidgets('is never an empty box', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPAvatar()));

      expect(
        find.descendant(of: find.byType(MPAvatar), matching: find.byType(CustomPaint)),
        findsWidgets,
      );
    });

    testWidgets('derives two initials from a two-word name', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPAvatar(name: 'Jane Doe')));

      expect(find.text('JD'), findsOneWidget);
    });

    testWidgets('derives one from a single-token name', (WidgetTester tester) async {
      // Korean, Japanese and Chinese names are one token, and two of their
      // characters at 32px is a smudge where one is a name.
      await tester.pumpWidget(host(const MPAvatar(name: '홍길동')));

      expect(find.text('홍'), findsOneWidget);
    });

    testWidgets('does not cut an astral character in half', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPAvatar(name: '🚀 Team')));

      expect(find.text('🚀T'), findsOneWidget);
    });

    testWidgets('takes written-out initials over the derived ones', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPAvatar(name: 'Jane Doe', initials: 'JVD')));

      expect(find.text('JVD'), findsOneWidget);
    });

    testWidgets('lets a child beat both', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPAvatar(name: 'Jane Doe', child: Text('★'))));

      expect(find.text('★'), findsOneWidget);
      expect(find.text('JD'), findsNothing);
    });

    testWidgets('waits out a delay before drawing it', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(MPAvatar(image: _broken, name: 'Jane Doe', delay: const Duration(milliseconds: 300))),
      );

      expect(find.text('JD'), findsNothing);

      await tester.pump(const Duration(milliseconds: 300));

      expect(find.text('JD'), findsOneWidget);
    });
  });

  group('accessibility', () {
    testWidgets('reads the name rather than the initials', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(const MPAvatar(name: 'Jane Doe')));

      expect(semanticsLabels(tester), <String>['Jane Doe']);
      semantics.dispose();
    });

    testWidgets('says nothing beside a silhouette', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(const MPAvatar()));

      expect(semanticsLabels(tester), isEmpty);
      semantics.dispose();
    });

    testWidgets('names a picture from the name, as an image', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(MPAvatar(image: _pixel, name: 'Jane Doe')));

      expect(
        tester.getSemantics(find.byType(MPAvatar)),
        matchesSemantics(label: 'Jane Doe', isImage: true),
      );
      semantics.dispose();
    });

    testWidgets('lets semanticLabel override it', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(MPAvatar(image: _pixel, name: 'Jane Doe', semanticLabel: 'Portrait')),
      );

      expect(find.bySemanticsLabel('Portrait'), findsOneWidget);
      expect(find.bySemanticsLabel('Jane Doe'), findsNothing);
      semantics.dispose();
    });
  });

  group('the picture', () {
    testWidgets('falls back for good when it fails, and says so', (WidgetTester tester) async {
      final List<MPAvatarLoadingStatus> statuses = <MPAvatarLoadingStatus>[];

      await tester.runAsync(() async {
        await tester.pumpWidget(
          host(MPAvatar(image: _broken, name: 'Jane Doe', onLoadingStatusChange: statuses.add)),
        );
        await Future<void>.delayed(const Duration(milliseconds: 100));
      });
      await tester.pumpAndSettle();

      expect(find.text('JD'), findsOneWidget);
      expect(find.byType(Image), findsNothing);
      expect(statuses, <MPAvatarLoadingStatus>[
        MPAvatarLoadingStatus.loading,
        MPAvatarLoadingStatus.error,
      ]);
    });

    testWidgets('reports idle when there is no picture', (WidgetTester tester) async {
      final List<MPAvatarLoadingStatus> statuses = <MPAvatarLoadingStatus>[];

      await tester.pumpWidget(
        host(MPAvatar(image: _pixel, name: 'Jane Doe', onLoadingStatusChange: statuses.add)),
      );
      await tester.pumpWidget(
        host(MPAvatar(name: 'Jane Doe', onLoadingStatusChange: statuses.add)),
      );
      await tester.pump();

      expect(statuses.last, MPAvatarLoadingStatus.idle);
    });
  });

  group('shape', () {
    testWidgets('is a circle by default', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPAvatar(name: 'Jane Doe')));

      expect(_surfaceOf(tester).borderRadius, BorderRadius.circular(28));
    });

    testWidgets('cuts the corners off instead when squared', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPAvatar(name: 'Jane Doe', shape: MPAvatarShape.square)));

      expect(_surfaceOf(tester).borderRadius, BorderRadius.circular(12));
    });
  });

  group('the size ladder', () {
    testWidgets('is the control heights: 32, 40, 56, 64, 72', (WidgetTester tester) async {
      final List<double> sides = <double>[];

      for (final MPSize size in MPSize.values) {
        await tester.pumpWidget(host(MPAvatar(name: 'Jane Doe', size: size)));
        sides.add(tester.getSize(find.byType(MPAvatar)).width);
      }

      expect(sides, <double>[32, 40, 56, 64, 72]);
    });

    testWidgets('takes its size from an MPConfigProvider', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const MPConfigProvider(
            size: MPSize.xs,
            child: MPAvatar(name: 'Jane Doe'),
          ),
        ),
      );

      expect(tester.getSize(find.byType(MPAvatar)), const Size(32, 32));
    });
  });

  group('variant and colour', () {
    testWidgets('draws a monogram on the container tone by default', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPAvatar(name: 'Jane Doe')));

      expect(_surfaceOf(tester).color, light.primaryContainer);
      expect(styleOf(tester, 'JD').color, light.onPrimaryContainer);
    });

    testWidgets('reads the accent family asked for', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(const MPAvatar(name: 'Jane Doe', variant: MPVariant.filled, color: MPColor.tertiary)),
      );

      expect(_surfaceOf(tester).color, light.tertiary);
    });

    testWidgets('outlines the outlined variant and lifts the elevated', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(const MPAvatar(name: 'J', variant: MPVariant.outlined)));
      expect((_surfaceOf(tester).border! as Border).top.color, light.outline);

      await tester.pumpWidget(host(const MPAvatar(name: 'J', variant: MPVariant.elevated)));
      await tester.pumpAndSettle();
      expect(_surfaceOf(tester).boxShadow, MPShadows.of(1));
    });
  });
}
