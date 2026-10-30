import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/shortcut/mp_shortcut.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// What is printed on each cap, in order.
List<String> _caps(WidgetTester tester) {
  return tester
      .widgetList<Text>(find.descendant(of: find.byType(Container), matching: find.byType(Text)))
      .map((Text text) => text.data!)
      .toList();
}

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('keys', () {
    testWidgets('splits a string on plus', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(const MPShortcut(keys: 'Ctrl+Shift+P', os: MPShortcutOS.windows)),
      );

      expect(_caps(tester), <String>['Ctrl', 'Shift', 'P']);
    });

    testWidgets('takes a list for a shortcut whose key is a plus', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(const MPShortcut(keys: <String>['Ctrl', '+'], os: MPShortcutOS.windows)),
      );

      expect(_caps(tester), <String>['Ctrl', '+']);
    });

    testWidgets('capitalises a single letter, and leaves a word alone', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(const MPShortcut(keys: 'k', os: MPShortcutOS.windows)));
      expect(_caps(tester), <String>['K']);

      await tester.pumpWidget(host(const MPShortcut(keys: 'PageDown', os: MPShortcutOS.windows)));
      expect(_caps(tester), <String>['PageDown']);
    });
  });

  group('Mod', () {
    testWidgets('is Command on a Mac and Control everywhere else', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPShortcut(keys: 'Mod+K', os: MPShortcutOS.mac)));
      expect(_caps(tester), <String>['⌘', 'K']);

      await tester.pumpWidget(host(const MPShortcut(keys: 'Mod+K', os: MPShortcutOS.linux)));
      expect(_caps(tester), <String>['Ctrl', 'K']);
    });

    testWidgets('follows the platform on auto', (WidgetTester tester) async {
      debugDefaultTargetPlatformOverride = TargetPlatform.macOS;
      await tester.pumpWidget(host(const MPShortcut(keys: 'Mod+K')));
      expect(_caps(tester), <String>['⌘', 'K']);

      debugDefaultTargetPlatformOverride = TargetPlatform.windows;
      await tester.pumpWidget(host(const MPShortcut(keys: 'Mod+K')));
      expect(_caps(tester), <String>['Ctrl', 'K']);

      debugDefaultTargetPlatformOverride = null;
    });

    testWidgets('answers to the names one key already has', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPShortcut(keys: 'Cmd+Option+Esc', os: MPShortcutOS.mac)));

      expect(_caps(tester), <String>['⌘', '⌥', '⎋']);
    });

    testWidgets('names Meta per platform', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPShortcut(keys: 'Meta', os: MPShortcutOS.windows)));
      expect(_caps(tester), <String>['Win']);

      await tester.pumpWidget(host(const MPShortcut(keys: 'Meta', os: MPShortcutOS.linux)));
      expect(_caps(tester), <String>['Super']);
    });

    testWidgets('draws arrows everywhere', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPShortcut(keys: 'Alt+Up', os: MPShortcutOS.windows)));

      expect(_caps(tester), <String>['Alt', '↑']);
    });
  });

  group('the joiner', () {
    testWidgets('is a plus off a Mac, and nothing on one', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPShortcut(keys: 'Mod+K', os: MPShortcutOS.windows)));
      expect(find.text('+'), findsOneWidget);

      await tester.pumpWidget(host(const MPShortcut(keys: 'Mod+K', os: MPShortcutOS.mac)));
      expect(find.text('+'), findsNothing);
    });

    testWidgets('takes one of its own', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(const MPShortcut(keys: 'G G', separator: Text('then'), os: MPShortcutOS.mac)),
      );

      await tester.pumpWidget(
        host(
          const MPShortcut(keys: <String>['G', 'G'], separator: Text('then'), os: MPShortcutOS.mac),
        ),
      );
      expect(find.text('then'), findsOneWidget);
    });
  });

  group('semantics', () {
    testWidgets('names a glyph key by what it is called, in one node', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(const MPShortcut(keys: 'Mod+Shift+P', os: MPShortcutOS.mac)));

      expect(semanticsLabels(tester), <String>['Command Shift P']);
      semantics.dispose();
    });

    testWidgets('leaves the joiner out of what is read', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(const MPShortcut(keys: 'Ctrl+K', os: MPShortcutOS.windows)));

      expect(semanticsLabels(tester), <String>['Ctrl K']);
      semantics.dispose();
    });
  });

  group('the cap', () {
    testWidgets('is a hairline box in the supporting ink by default', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPShortcut(keys: 'K', os: MPShortcutOS.windows)));

      final BoxDecoration cap =
          tester.widget<Container>(find.byType(Container)).decoration! as BoxDecoration;
      expect((cap.border! as Border).top.color, light.outlineVariant);
      expect(styleOf(tester, 'K').color, light.onSurfaceVariant);
    });

    testWidgets('sits on its own ladder: 20, 24, 32, 40, 48', (WidgetTester tester) async {
      final List<double> heights = <double>[];

      for (final MPSize size in MPSize.values) {
        await tester.pumpWidget(host(MPShortcut(keys: 'K', size: size, os: MPShortcutOS.windows)));
        heights.add(tester.getSize(find.byType(Container)).height);
      }

      expect(heights, <double>[20, 24, 32, 40, 48]);
    });

    testWidgets('is at least as wide as it is tall', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPShortcut(keys: 'K', os: MPShortcutOS.windows)));

      final Size cap = tester.getSize(find.byType(Container));
      expect(cap.width, greaterThanOrEqualTo(cap.height));
    });

    testWidgets('reads the family when filled', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(const MPShortcut(keys: 'K', variant: MPVariant.filled, os: MPShortcutOS.windows)),
      );

      final BoxDecoration cap =
          tester.widget<Container>(find.byType(Container)).decoration! as BoxDecoration;
      expect(cap.color, light.secondary);
    });
  });
}
