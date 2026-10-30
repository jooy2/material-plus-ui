import 'package:flutter/foundation.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/command_palette/mp_command_palette.dart';
import 'package:material_plus_ui/src/components/locale/mp_locale_provider.dart';
import 'package:material_plus_ui/src/components/shortcut/mp_shortcut.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';

import '../../support/host.dart';

const List<MPCommand> _commands = <MPCommand>[
  MPCommand(value: 'new', label: 'New document', group: 'File', shortcut: 'Mod+N'),
  MPCommand(value: 'open', label: 'Open…', group: 'File', keywords: <String>['load', 'import']),
  MPCommand(
    value: 'copy',
    label: 'Copy link',
    group: 'Share',
    description: 'Anyone with the link can read',
  ),
  MPCommand(value: 'publish', label: 'Publish', group: 'Share', disabled: true),
];

/// A palette that keeps its own state, with [items], as most callers write it.
Widget palette({
  List<MPCommand> items = _commands,
  bool initialOpen = true,
  String? shortcut = 'Mod+K',
  ValueChanged<MPCommand>? onSelect,
  ValueChanged<bool>? onOpenChange,
  String? locale,
}) {
  return MPCommandPalette(
    items: items,
    initialOpen: initialOpen,
    shortcut: shortcut,
    onSelect: onSelect,
    onOpenChange: onOpenChange,
    locale: locale,
  );
}

Future<void> type(WidgetTester tester, String text) async {
  await tester.enterText(find.byType(EditableText), text);
  await tester.pumpAndSettle();
}

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('the sheet', () {
    testWidgets('is out of the tree until it is opened', (WidgetTester tester) async {
      await tester.pumpWidget(host(palette(initialOpen: false), overlay: true));
      await tester.pumpAndSettle();

      expect(find.text('New document'), findsNothing);
      expect(find.byType(EditableText), findsNothing);
    });

    testWidgets('is a dialog with a name, because it has no visible title', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(host(palette(), overlay: true));
      await tester.pumpAndSettle();

      final SemanticsNode sheet = semanticsNodeLabelled(tester, 'Command palette')!;

      expect(sheet.role, SemanticsRole.dialog);

      handle.dispose();
    });

    testWidgets('names itself in the language it was told to', (WidgetTester tester) async {
      registerMPMessages(const <MPLocale>[
        MPLocale(
          locale: 'xx',
          messages: <String, Map<String, String>>{
            'command': <String, String>{
              'label': 'Palette xx',
              'search': 'Search xx',
              'empty': 'Nothing xx',
            },
          },
        ),
      ]);
      addTearDown(resetMPMessages);
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(host(palette(locale: 'xx'), overlay: true));
      await tester.pumpAndSettle();

      expect(semanticsNodeLabelled(tester, 'Palette xx'), isNotNull);
      expect(find.text('Search xx'), findsOneWidget);

      handle.dispose();
    });

    testWidgets("draws MD3's search view: surface-container-high at corner-extra-large", (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(palette(), overlay: true));
      await tester.pumpAndSettle();

      final BoxDecoration sheet = tester
          .widgetList<Container>(find.byType(Container))
          .map((Container box) => box.decoration)
          .whereType<BoxDecoration>()
          .firstWhere((BoxDecoration decoration) => decoration.boxShadow?.isNotEmpty ?? false);

      expect(sheet.color, light.surfaceContainerHigh);
      expect(sheet.borderRadius, BorderRadius.circular(28));
      expect(sheet.boxShadow, MPShadows.of(3));
    });

    testWidgets('puts the focus in the field as it opens', (WidgetTester tester) async {
      await tester.pumpWidget(host(palette(), overlay: true));
      await tester.pumpAndSettle();

      expect(
        tester.widget<EditableText>(find.byType(EditableText)).focusNode.hasPrimaryFocus,
        isTrue,
      );
    });
  });

  group('the list', () {
    testWidgets('draws every command, with its group above the first of each run', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(palette(), overlay: true));
      await tester.pumpAndSettle();

      expect(find.text('File'), findsOneWidget);
      expect(find.text('Share'), findsOneWidget);
      expect(find.text('New document'), findsOneWidget);
      expect(find.text('Anyone with the link can read'), findsOneWidget);
      expect(
        tester.getTopLeft(find.text('File')).dy,
        lessThan(tester.getTopLeft(find.text('New document')).dy),
      );
    });

    testWidgets('shows the keystroke that does the same thing, without binding it', (
      WidgetTester tester,
    ) async {
      final List<String> ran = <String>[];

      await tester.pumpWidget(
        host(palette(onSelect: (MPCommand item) => ran.add(item.value)), overlay: true),
      );
      await tester.pumpAndSettle();

      expect(find.byType(MPShortcut), findsOneWidget);

      await tester.sendKeyDownEvent(LogicalKeyboardKey.controlLeft);
      await tester.sendKeyEvent(LogicalKeyboardKey.keyN);
      await tester.sendKeyUpEvent(LogicalKeyboardKey.controlLeft);
      await tester.pumpAndSettle();

      expect(ran, isEmpty);
    });

    testWidgets('narrows on the query, and matches keywords nobody drew', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(palette(), overlay: true));
      await tester.pumpAndSettle();
      await type(tester, 'import');

      expect(find.text('Open…'), findsOneWidget);
      expect(find.text('New document'), findsNothing);
    });

    testWidgets('matches the group as well as the label', (WidgetTester tester) async {
      await tester.pumpWidget(host(palette(), overlay: true));
      await tester.pumpAndSettle();
      await type(tester, 'share');

      expect(find.text('Copy link'), findsOneWidget);
      expect(find.text('Publish'), findsOneWidget);
      expect(find.text('New document'), findsNothing);
    });

    testWidgets('does not match across the seam between a label and a keyword', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          palette(
            items: const <MPCommand>[
              MPCommand(value: 'copy', label: 'Copy', keywords: <String>['link']),
            ],
          ),
          overlay: true,
        ),
      );
      await tester.pumpAndSettle();
      await type(tester, 'copy link');

      expect(find.text('Copy'), findsNothing);
    });

    testWidgets('says so when nothing matched', (WidgetTester tester) async {
      await tester.pumpWidget(host(palette(), overlay: true));
      await tester.pumpAndSettle();
      await type(tester, 'zzz');

      expect(find.text('No commands found'), findsOneWidget);
      expect(styleOf(tester, 'No commands found').color, light.onSurfaceVariant);
    });
  });

  group('running a command', () {
    testWidgets("calls the command's own handler, then the palette's, then closes", (
      WidgetTester tester,
    ) async {
      final List<String> calls = <String>[];

      await tester.pumpWidget(
        host(
          palette(
            items: <MPCommand>[
              MPCommand(value: 'new', label: 'New document', onSelect: () => calls.add('own')),
            ],
            onSelect: (MPCommand item) => calls.add('palette:${item.value}'),
          ),
          overlay: true,
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('New document'));
      await tester.pumpAndSettle();

      expect(calls, <String>['own', 'palette:new']);
      expect(find.text('New document'), findsNothing);
    });

    testWidgets('runs the row the arrows lit with enter, lighting nothing at first', (
      WidgetTester tester,
    ) async {
      final List<String> ran = <String>[];

      await tester.pumpWidget(
        host(palette(onSelect: (MPCommand item) => ran.add(item.value)), overlay: true),
      );
      await tester.pumpAndSettle();

      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pump();

      expect(ran, isEmpty);

      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pumpAndSettle();

      expect(ran, <String>['open']);
    });

    testWidgets('leaves a disabled command alone, and the arrows pass over it', (
      WidgetTester tester,
    ) async {
      final List<String> ran = <String>[];

      await tester.pumpWidget(
        host(palette(onSelect: (MPCommand item) => ran.add(item.value)), overlay: true),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Publish'));
      await tester.pumpAndSettle();

      expect(ran, isEmpty);
      expect(find.text('Publish'), findsOneWidget);
      expect(
        styleOf(tester, 'Publish').color,
        light.onSurface.withValues(alpha: MPStateOpacity.disabledContent),
      );

      for (int step = 0; step < 6; step += 1) {
        await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      }

      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pumpAndSettle();

      expect(ran, <String>['copy']);
    });

    testWidgets('closes on escape', (WidgetTester tester) async {
      final List<bool> seen = <bool>[];

      await tester.pumpWidget(host(palette(onOpenChange: seen.add), overlay: true));
      await tester.pumpAndSettle();
      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.pumpAndSettle();

      expect(seen, <bool>[false]);
      expect(find.text('New document'), findsNothing);
    });
  });

  group('the key that opens it', () {
    Future<void> chord(WidgetTester tester, LogicalKeyboardKey key, {bool shift = false}) async {
      await tester.sendKeyDownEvent(LogicalKeyboardKey.controlLeft);
      if (shift) {
        await tester.sendKeyDownEvent(LogicalKeyboardKey.shiftLeft);
      }
      await tester.sendKeyEvent(key);
      if (shift) {
        await tester.sendKeyUpEvent(LogicalKeyboardKey.shiftLeft);
      }
      await tester.sendKeyUpEvent(LogicalKeyboardKey.controlLeft);
      await tester.pumpAndSettle();
    }

    testWidgets('binds Mod+K by default', (WidgetTester tester) async {
      debugDefaultTargetPlatformOverride = TargetPlatform.windows;

      await tester.pumpWidget(host(palette(initialOpen: false), overlay: true));
      await chord(tester, LogicalKeyboardKey.keyK);

      expect(find.text('New document'), findsOneWidget);

      debugDefaultTargetPlatformOverride = null;
    });

    testWidgets('leaves a chord that merely contains it alone', (WidgetTester tester) async {
      debugDefaultTargetPlatformOverride = TargetPlatform.windows;

      await tester.pumpWidget(host(palette(initialOpen: false), overlay: true));
      await chord(tester, LogicalKeyboardKey.keyK, shift: true);

      expect(find.text('New document'), findsNothing);

      debugDefaultTargetPlatformOverride = null;
    });

    testWidgets('binds nothing at all when told not to', (WidgetTester tester) async {
      debugDefaultTargetPlatformOverride = TargetPlatform.windows;

      await tester.pumpWidget(host(palette(initialOpen: false, shortcut: null), overlay: true));
      await chord(tester, LogicalKeyboardKey.keyK);

      expect(find.text('New document'), findsNothing);

      debugDefaultTargetPlatformOverride = null;
    });

    testWidgets('ignores the same key without its modifier', (WidgetTester tester) async {
      await tester.pumpWidget(host(palette(initialOpen: false), overlay: true));
      await tester.sendKeyEvent(LogicalKeyboardKey.keyK);
      await tester.pumpAndSettle();

      expect(find.text('New document'), findsNothing);
    });
  });

  testWidgets('drops the query on the way out, so the sheet never flashes the last search', (
    WidgetTester tester,
  ) async {
    bool open = true;

    await tester.pumpWidget(
      host(
        StatefulBuilder(
          builder: (BuildContext context, StateSetter setState) => MPCommandPalette(
            items: _commands,
            open: open,
            onOpenChange: (bool next) => setState(() => open = next),
          ),
        ),
        overlay: true,
      ),
    );
    await tester.pumpAndSettle();
    await type(tester, 'import');
    await tester.sendKeyEvent(LogicalKeyboardKey.escape);
    await tester.pump();

    expect(tester.widget<EditableText>(find.byType(EditableText)).controller.text, isEmpty);
  });

  testWidgets('grows in for a reader who allows motion, and appears for one who does not', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(host(palette(), overlay: true));
    await tester.pump();
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 50));

    expect(tester.widget<ScaleTransition>(find.byType(ScaleTransition)).scale.value, lessThan(1));

    await tester.pumpWidget(const SizedBox.shrink());
    await tester.pumpWidget(host(palette(), disableAnimations: true, overlay: true));
    await tester.pump();
    await tester.pump();

    expect(tester.widget<ScaleTransition>(find.byType(ScaleTransition)).scale.value, 1);
  });

  testWidgets('takes its words from a locale provider', (WidgetTester tester) async {
    registerMPMessages(const <MPLocale>[
      MPLocale(
        locale: 'yy',
        messages: <String, Map<String, String>>{
          'command': <String, String>{'label': 'L', 'search': 'Search yy', 'empty': 'E'},
        },
      ),
    ]);
    addTearDown(resetMPMessages);

    await tester.pumpWidget(host(MPLocaleProvider(locale: 'yy', child: palette()), overlay: true));
    await tester.pumpAndSettle();

    expect(find.text('Search yy'), findsOneWidget);
  });
}
