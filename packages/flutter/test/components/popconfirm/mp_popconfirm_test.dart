import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
// The component files directly rather than the barrel, which pulls in every
// other component in the package and fails with any of them.
import 'package:material_plus_ui/locales.dart';
import 'package:material_plus_ui/src/components/button/mp_button.dart';
import 'package:material_plus_ui/src/components/locale/mp_locale_provider.dart';
import 'package:material_plus_ui/src/components/popconfirm/mp_popconfirm.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/popup_arrow.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The same questions the React suite asks, asked the way Flutter asks them.

const String _question = 'Delete this row?';

Widget _trigger(BuildContext context, VoidCallback toggle) {
  return MPButton(onPressed: toggle, child: const Text('Delete'));
}

Future<void> _pump(WidgetTester tester, Widget child) async {
  await tester.pumpWidget(host(child, overlay: true));
  await tester.pumpAndSettle();
}

Future<void> _ask(WidgetTester tester) async {
  await tester.tap(find.text('Delete'));
  await tester.pumpAndSettle();
}

/// The text colour a button's label is drawn in.
Color? _inkOf(WidgetTester tester, String label) => styleOf(tester, label).color;

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('asking', () {
    testWidgets('stays shut until the trigger is pressed', (WidgetTester tester) async {
      await _pump(tester, const MPPopconfirm(trigger: _trigger, title: Text(_question)));

      expect(find.text(_question), findsNothing);
    });

    testWidgets('opens at the control rather than over the page', (WidgetTester tester) async {
      await _pump(tester, const MPPopconfirm(trigger: _trigger, title: Text(_question)));

      await _ask(tester);

      expect(find.text(_question), findsOneWidget);

      // Above the trigger, which is where it is least likely to cover the next
      // row down.
      final Rect trigger = tester.getRect(find.widgetWithText(MPButton, 'Delete'));

      expect(tester.getRect(find.text(_question)).bottom, lessThan(trigger.top));
    });

    testWidgets('draws its wedge unless told not to', (WidgetTester tester) async {
      await _pump(tester, const MPPopconfirm(trigger: _trigger, title: Text(_question)));
      await _ask(tester);

      expect(find.byType(MPPopupArrow), findsOneWidget);
    });
  });

  group('answering', () {
    testWidgets('calls onConfirm for the yes button, and closes', (WidgetTester tester) async {
      int confirmed = 0;

      await _pump(
        tester,
        MPPopconfirm(trigger: _trigger, title: const Text(_question), onConfirm: () => confirmed++),
      );

      await _ask(tester);
      await tester.tap(find.text('Confirm'));
      await tester.pumpAndSettle();

      expect(confirmed, 1);
      expect(find.text(_question), findsNothing);
    });

    testWidgets('calls onCancel for the no button', (WidgetTester tester) async {
      int confirmed = 0;
      int cancelled = 0;

      await _pump(
        tester,
        MPPopconfirm(
          trigger: _trigger,
          title: const Text(_question),
          onConfirm: () => confirmed++,
          onCancel: () => cancelled++,
        ),
      );

      await _ask(tester);
      await tester.tap(find.text('Cancel'));
      await tester.pumpAndSettle();

      expect(cancelled, 1);
      expect(confirmed, 0);
    });

    testWidgets('counts Escape as no', (WidgetTester tester) async {
      int confirmed = 0;
      int cancelled = 0;

      await _pump(
        tester,
        MPPopconfirm(
          trigger: _trigger,
          title: const Text(_question),
          onConfirm: () => confirmed++,
          onCancel: () => cancelled++,
        ),
      );

      await _ask(tester);
      expect(find.text(_question), findsOneWidget);

      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.pumpAndSettle();

      expect(find.text(_question), findsNothing);
      expect(cancelled, 1);
      expect(confirmed, 0);
    });

    testWidgets('counts a press outside as no', (WidgetTester tester) async {
      int cancelled = 0;

      await _pump(
        tester,
        MPPopconfirm(trigger: _trigger, title: const Text(_question), onCancel: () => cancelled++),
      );

      await _ask(tester);
      await tester.tapAt(const Offset(4, 4));
      await tester.pumpAndSettle();

      expect(find.text(_question), findsNothing);
      expect(cancelled, 1);
    });

    testWidgets('does not call either one just for opening', (WidgetTester tester) async {
      int confirmed = 0;
      int cancelled = 0;

      await _pump(
        tester,
        MPPopconfirm(
          trigger: _trigger,
          title: const Text(_question),
          onConfirm: () => confirmed++,
          onCancel: () => cancelled++,
        ),
      );

      await _ask(tester);

      expect(confirmed, 0);
      expect(cancelled, 0);
    });

    testWidgets('puts the focus on Cancel, the safe answer', (WidgetTester tester) async {
      await _pump(tester, const MPPopconfirm(trigger: _trigger, title: Text(_question)));

      await _ask(tester);

      expect(holdsFocus(tester, find.widgetWithText(MPButton, 'Cancel')), isTrue);
    });
  });

  group('what it draws', () {
    testWidgets('takes labels of its own', (WidgetTester tester) async {
      await _pump(
        tester,
        const MPPopconfirm(
          trigger: _trigger,
          title: Text(_question),
          confirmLabel: Text('Delete it'),
          cancelLabel: Text('Keep'),
        ),
      );

      await _ask(tester);

      expect(find.text('Delete it'), findsOneWidget);
      expect(find.text('Keep'), findsOneWidget);
    });

    testWidgets('paints the yes button in the accent it was given', (WidgetTester tester) async {
      await _pump(
        tester,
        const MPPopconfirm(trigger: _trigger, title: Text(_question), color: MPColor.error),
      );

      await _ask(tester);

      expect(_inkOf(tester, 'Confirm'), light.error);
      expect(_inkOf(tester, 'Cancel'), light.primary);
    });

    testWidgets('draws both answers as small text buttons', (WidgetTester tester) async {
      await _pump(tester, const MPPopconfirm(trigger: _trigger, title: Text(_question)));

      await _ask(tester);

      for (final String label in <String>['Confirm', 'Cancel']) {
        final MPButton button = tester.widget<MPButton>(find.widgetWithText(MPButton, label));

        expect(button.variant, MPVariant.text, reason: label);
        expect(button.size, MPSize.sm, reason: label);
        expect(tester.getSize(find.widgetWithText(MPButton, label)).height, 40, reason: label);
      }
    });

    testWidgets('holds a description and anything else it was handed', (WidgetTester tester) async {
      await _pump(
        tester,
        const MPPopconfirm(
          trigger: _trigger,
          title: Text(_question),
          description: Text('It cannot be undone.'),
          child: Text('and this'),
        ),
      );

      await _ask(tester);

      expect(find.text('It cannot be undone.'), findsOneWidget);
      expect(find.text('and this'), findsOneWidget);
    });

    testWidgets('speaks the language in force', (WidgetTester tester) async {
      registerMPMessages(<MPLocale>[ko]);
      addTearDown(resetMPMessages);

      await _pump(
        tester,
        const MPLocaleProvider(
          locale: 'ko',
          child: MPPopconfirm(trigger: _trigger, title: Text(_question)),
        ),
      );

      await _ask(tester);

      expect(find.text('확인'), findsOneWidget);
      expect(find.text('취소'), findsOneWidget);
    });
  });

  group('controlled', () {
    testWidgets('opens and closes from outside', (WidgetTester tester) async {
      final ValueNotifier<bool> open = ValueNotifier<bool>(false);
      addTearDown(open.dispose);

      await _pump(
        tester,
        ValueListenableBuilder<bool>(
          valueListenable: open,
          builder: (BuildContext context, bool value, Widget? child) => MPPopconfirm(
            trigger: _trigger,
            title: const Text(_question),
            open: value,
            onOpenChange: (bool next) => open.value = next,
          ),
        ),
      );

      await _ask(tester);
      expect(open.value, isTrue);

      await tester.tap(find.text('Cancel'));
      await tester.pumpAndSettle();
      expect(open.value, isFalse);
      expect(find.text(_question), findsNothing);
    });
  });
}
