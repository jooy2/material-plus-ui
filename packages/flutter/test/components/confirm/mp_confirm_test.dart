import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/locales.dart';
import 'package:material_plus_ui/src/components/button/mp_button.dart';
import 'package:material_plus_ui/src/components/confirm/mp_confirm.dart';
import 'package:material_plus_ui/src/components/dialog/mp_dialog.dart';
import 'package:material_plus_ui/src/components/locale/mp_locale_provider.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// Every test drives the whole round trip, press, question, answer, future,
/// because that is the thing this exists to provide. Whether a dialog appears
/// is `MPDialog`'s question, and it has its own file.

/// A button that asks, and writes the answer where a test can read it.
class _Asker extends StatelessWidget {
  const _Asker({
    required this.answers,
    this.options = const MPConfirmOptions(title: Text('Delete this?')),
    this.alert = false,
  });

  final List<Object> answers;
  final MPConfirmOptions options;
  final bool alert;

  @override
  Widget build(BuildContext context) {
    return MPButton(
      onPressed: () async {
        final MPConfirmResult asker = MPConfirmProvider.of(context);

        if (alert) {
          await asker.alert(options);
          answers.add('acknowledged');

          return;
        }

        answers.add(await asker.confirm(options));
      },
      child: const Text('ask'),
    );
  }
}

/// The sheet's own box: the one decoration in `surfaceContainerHigh`.
final Finder _sheet = find.byWidgetPredicate(
  (Widget widget) =>
      widget is DecoratedBox &&
      widget.decoration is BoxDecoration &&
      (widget.decoration as BoxDecoration).color == MPColorScheme.fromSource().surfaceContainerHigh,
);

Future<void> _pump(WidgetTester tester, Widget child) async {
  await tester.pumpWidget(host(child, overlay: true));
  await tester.pumpAndSettle();
}

Future<void> _press(WidgetTester tester, String label) async {
  await tester.tap(find.text(label));
  await tester.pumpAndSettle();
}

/// The route a screen reader is in while it reads [text].
SemanticsNode _routeAround(WidgetTester tester, String text) {
  SemanticsNode? node = tester.getSemantics(find.text(text));

  while (node != null && !node.getSemanticsData().flagsCollection.scopesRoute) {
    node = node.parent;
  }

  return node!;
}

void main() {
  group('the round trip', () {
    testWidgets('completes `true` when the confirm button is pressed', (WidgetTester tester) async {
      final List<Object> answers = <Object>[];

      await _pump(tester, MPConfirmProvider(child: _Asker(answers: answers)));
      await _press(tester, 'ask');
      await _press(tester, 'Confirm');

      expect(answers, <Object>[true]);
    });

    testWidgets('completes `false` when cancel is pressed', (WidgetTester tester) async {
      final List<Object> answers = <Object>[];

      await _pump(tester, MPConfirmProvider(child: _Asker(answers: answers)));
      await _press(tester, 'ask');
      await _press(tester, 'Cancel');

      expect(answers, <Object>[false]);
    });

    testWidgets('completes `false` on Escape and on a press outside', (WidgetTester tester) async {
      final List<Object> answers = <Object>[];

      await _pump(tester, MPConfirmProvider(child: _Asker(answers: answers)));
      await _press(tester, 'ask');
      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.pumpAndSettle();

      await _press(tester, 'ask');
      await tester.tapAt(const Offset(4, 4));
      await tester.pumpAndSettle();

      expect(answers, <Object>[false, false]);
    });

    testWidgets('closes the dialog once it has been answered', (WidgetTester tester) async {
      await _pump(tester, MPConfirmProvider(child: _Asker(answers: <Object>[])));
      await _press(tester, 'ask');

      expect(find.text('Delete this?'), findsOneWidget);

      await _press(tester, 'Confirm');

      expect(find.text('Delete this?'), findsNothing);
    });

    testWidgets('waits for the answer when it is not dismissible', (WidgetTester tester) async {
      final List<Object> answers = <Object>[];

      await _pump(
        tester,
        MPConfirmProvider(
          child: _Asker(
            answers: answers,
            options: const MPConfirmOptions(title: Text('Sure?'), dismissible: false),
          ),
        ),
      );
      await _press(tester, 'ask');
      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.tapAt(const Offset(4, 4));
      await tester.pumpAndSettle();

      expect(answers, isEmpty);
      expect(find.text('Sure?'), findsOneWidget);
    });
  });

  group('what it draws', () {
    testWidgets('asks the question it was given', (WidgetTester tester) async {
      await _pump(
        tester,
        MPConfirmProvider(
          child: _Asker(
            answers: <Object>[],
            options: const MPConfirmOptions(
              title: Text('Delete this project?'),
              description: Text('Everything in it goes too.'),
              child: Text('and this', key: Key('extra')),
            ),
          ),
        ),
      );
      await _press(tester, 'ask');

      expect(find.text('Delete this project?'), findsOneWidget);
      expect(find.text('Everything in it goes too.'), findsOneWidget);
      expect(find.byKey(const Key('extra')), findsOneWidget);
    });

    testWidgets('takes labels of its own', (WidgetTester tester) async {
      await _pump(
        tester,
        MPConfirmProvider(
          child: _Asker(
            answers: <Object>[],
            options: const MPConfirmOptions(
              title: Text('Sure?'),
              confirmLabel: Text('Delete'),
              cancelLabel: Text('Keep'),
            ),
          ),
        ),
      );
      await _press(tester, 'ask');

      expect(find.text('Delete'), findsOneWidget);
      expect(find.text('Keep'), findsOneWidget);
    });

    testWidgets('paints the confirm button in the accent it was given, as text buttons', (
      WidgetTester tester,
    ) async {
      await _pump(
        tester,
        MPConfirmProvider(
          child: _Asker(
            answers: <Object>[],
            options: const MPConfirmOptions(title: Text('Sure?'), color: MPColor.error),
          ),
        ),
      );
      await _press(tester, 'ask');

      final MPButton confirm = tester.widget<MPButton>(find.widgetWithText(MPButton, 'Confirm'));
      final MPButton cancel = tester.widget<MPButton>(find.widgetWithText(MPButton, 'Cancel'));

      expect(confirm.color, MPColor.error);
      expect(confirm.variant, MPVariant.text);
      expect(cancel.variant, MPVariant.text);
      expect(tester.widget<MPDialog>(find.byType(MPDialog)).color, MPColor.error);
    });

    testWidgets('asks in an alert dialog', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await _pump(
        tester,
        MPConfirmProvider(
          child: _Asker(
            answers: <Object>[],
            options: const MPConfirmOptions(title: Text('Delete this project?')),
          ),
        ),
      );
      await _press(tester, 'ask');

      final SemanticsData layer = _routeAround(tester, 'Delete this project?').getSemanticsData();

      expect(layer.role, SemanticsRole.alertDialog);
      expect(layer.label, 'Delete this project?');

      semantics.dispose();
    });

    testWidgets('puts the first focus on Cancel', (WidgetTester tester) async {
      await _pump(tester, MPConfirmProvider(child: _Asker(answers: <Object>[])));
      await _press(tester, 'ask');

      expect(holdsFocus(tester, find.widgetWithText(MPButton, 'Cancel')), isTrue);
    });
  });

  group('alert', () {
    testWidgets('draws one button and completes once it is pressed', (WidgetTester tester) async {
      final List<Object> answers = <Object>[];

      await _pump(
        tester,
        MPConfirmProvider(
          child: _Asker(
            answers: answers,
            alert: true,
            options: const MPConfirmOptions(title: Text('Saved')),
          ),
        ),
      );
      await _press(tester, 'ask');

      expect(find.text('Cancel'), findsNothing);
      expect(holdsFocus(tester, find.widgetWithText(MPButton, 'OK')), isTrue);

      await _press(tester, 'OK');

      expect(answers, <Object>['acknowledged']);
    });

    testWidgets('completes on Escape too, because there is nothing to refuse', (
      WidgetTester tester,
    ) async {
      final List<Object> answers = <Object>[];

      await _pump(
        tester,
        MPConfirmProvider(
          child: _Asker(
            answers: answers,
            alert: true,
            options: const MPConfirmOptions(title: Text('Saved')),
          ),
        ),
      );
      await _press(tester, 'ask');
      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.pumpAndSettle();

      expect(answers, <Object>['acknowledged']);
    });
  });

  group('one at a time', () {
    testWidgets('replaces an open confirmation and answers the first one `no`', (
      WidgetTester tester,
    ) async {
      final List<bool> answers = <bool>[];

      await _pump(
        tester,
        MPConfirmProvider(
          child: Builder(
            builder: (BuildContext context) => MPButton(
              onPressed: () {
                final MPConfirmResult asker = MPConfirmProvider.of(context);

                asker.confirm(const MPConfirmOptions(title: Text('First'))).then(answers.add);
                asker.confirm(const MPConfirmOptions(title: Text('Second'))).then(answers.add);
              },
              child: const Text('ask twice'),
            ),
          ),
        ),
      );
      await _press(tester, 'ask twice');

      expect(find.text('Second'), findsOneWidget);
      expect(find.text('First'), findsNothing);
      expect(answers, <bool>[false]);
      // The replacement places the focus again, on its own Cancel.
      expect(holdsFocus(tester, find.widgetWithText(MPButton, 'Cancel')), isTrue);

      await _press(tester, 'Confirm');

      expect(answers, <bool>[false, true]);
    });

    testWidgets('puts the focus on Cancel again for the next question', (
      WidgetTester tester,
    ) async {
      await _pump(tester, MPConfirmProvider(child: _Asker(answers: <Object>[])));

      await _press(tester, 'ask');
      await _press(tester, 'Cancel');
      await _press(tester, 'ask');

      expect(holdsFocus(tester, find.widgetWithText(MPButton, 'Cancel')), isTrue);
    });

    testWidgets('answers an open question `no` when the provider leaves the tree', (
      WidgetTester tester,
    ) async {
      final List<Object> answers = <Object>[];

      await _pump(tester, MPConfirmProvider(child: _Asker(answers: answers)));
      await _press(tester, 'ask');

      await tester.pumpWidget(host(const SizedBox(), overlay: true));
      await tester.pumpAndSettle();

      expect(answers, <Object>[false]);
    });
  });

  group('provider defaults', () {
    testWidgets('are used, and beaten by the question', (WidgetTester tester) async {
      await _pump(
        tester,
        MPConfirmProvider(
          defaults: const MPConfirmOptions(confirmLabel: Text('Yes please'), size: MPSize.sm),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              _Asker(
                answers: <Object>[],
                options: const MPConfirmOptions(title: Text('Plain')),
              ),
              Builder(
                builder: (BuildContext context) => MPButton(
                  onPressed: () => MPConfirmProvider.of(context).confirm(
                    const MPConfirmOptions(title: Text('Loud'), confirmLabel: Text('Do it')),
                  ),
                  child: const Text('loud'),
                ),
              ),
            ],
          ),
        ),
      );

      await _press(tester, 'ask');
      expect(find.text('Yes please'), findsOneWidget);
      expect(tester.widget<MPDialog>(find.byType(MPDialog)).size, MPSize.sm);
      await _press(tester, 'Yes please');

      await _press(tester, 'loud');
      expect(find.text('Do it'), findsOneWidget);
    });

    testWidgets('are read when the question is asked, so a later change is the one used', (
      WidgetTester tester,
    ) async {
      Widget tree(String label) {
        return MPConfirmProvider(
          defaults: MPConfirmOptions(confirmLabel: Text(label)),
          child: _Asker(answers: <Object>[]),
        );
      }

      await _pump(tester, tree('First'));
      await _pump(tester, tree('Second'));
      await _press(tester, 'ask');

      expect(find.text('Second'), findsOneWidget);
    });

    testWidgets('never take the question itself', (WidgetTester tester) async {
      await _pump(
        tester,
        MPConfirmProvider(
          defaults: const MPConfirmOptions(title: Text('A default title')),
          child: _Asker(answers: <Object>[]),
        ),
      );
      await _press(tester, 'ask');

      expect(find.text('A default title'), findsNothing);
    });
  });

  group('localisation', () {
    testWidgets('draws the buttons in the language in force', (WidgetTester tester) async {
      registerMPMessages(<MPLocale>[ko]);
      addTearDown(resetMPMessages);

      await _pump(
        tester,
        MPLocaleProvider(
          locale: 'ko',
          child: MPConfirmProvider(child: _Asker(answers: <Object>[])),
        ),
      );
      await _press(tester, 'ask');

      expect(find.text('확인'), findsOneWidget);
      expect(find.text('취소'), findsOneWidget);
    });
  });

  group('while it is closing', () {
    testWidgets('keeps the question on the sheet until the sheet is gone', (
      WidgetTester tester,
    ) async {
      await _pump(
        tester,
        MPConfirmProvider(
          child: _Asker(
            answers: <Object>[],
            options: const MPConfirmOptions(
              title: Text('Delete this project?'),
              description: Text('Everything in it goes too, and it cannot be undone.'),
            ),
          ),
        ),
      );
      await _press(tester, 'ask');

      final double height = tester.getSize(_sheet).height;

      await tester.tap(find.text('Cancel'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 50));

      // On its way out, and still the question at the question's height: the
      // words go with the sheet rather than before it.
      expect(find.text('Delete this project?'), findsOneWidget);
      expect(find.text('Cancel'), findsOneWidget);
      expect(tester.getSize(_sheet).height, height);

      await tester.pumpAndSettle();

      expect(find.text('Delete this project?'), findsNothing);
    });

    testWidgets('draws the next question rather than the last one', (WidgetTester tester) async {
      await _pump(
        tester,
        MPConfirmProvider(
          child: _Asker(
            answers: <Object>[],
            options: const MPConfirmOptions(title: Text('The first question')),
          ),
        ),
      );
      await _press(tester, 'ask');
      await _press(tester, 'Cancel');

      await _pump(
        tester,
        MPConfirmProvider(
          child: _Asker(
            answers: <Object>[],
            options: const MPConfirmOptions(title: Text('The second question')),
          ),
        ),
      );
      await _press(tester, 'ask');

      expect(find.text('The second question'), findsOneWidget);
      expect(find.text('The first question'), findsNothing);
    });
  });

  group('without a provider', () {
    testWidgets('throws rather than handing back a future that never completes', (
      WidgetTester tester,
    ) async {
      late BuildContext captured;

      await _pump(
        tester,
        Builder(
          builder: (BuildContext context) {
            captured = context;

            return const SizedBox();
          },
        ),
      );

      expect(() => MPConfirmProvider.of(captured), throwsFlutterError);
      expect(MPConfirmProvider.maybeOf(captured), isNull);
    });
  });
}
