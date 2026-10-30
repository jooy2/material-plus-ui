import 'dart:async';

import 'package:flutter/gestures.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/locales.dart';
import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/components/snackbar/mp_snackbar.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/disposal.dart';
import '../../support/host.dart';

/// The same questions the React suite asks, asked the way Flutter asks them.
///
/// A browser test reads `--_mp-plate` off the plate's inline style; here the
/// plate is the [DecoratedBox] the snackbar built, and its colour is read off
/// that.

/// A provider over a page 800 by 600, with the controller handed back.
Future<MPSnackbarController> _provider(
  WidgetTester tester, {
  MPColor? color,
  MPSnackbarPosition position = MPSnackbarPosition.bottomStart,
  Duration timeout = const Duration(seconds: 5),
  int limit = 3,
  double width = 600,
  MPSize? size,
  bool showClose = true,
  String? closeLabel,
  String? locale,
  double hostWidth = 800,
  bool disableAnimations = false,
  TextDirection textDirection = TextDirection.ltr,
  Widget Function(Widget child)? wrap,
}) async {
  late MPSnackbarController controller;

  final Widget provider = MPSnackbarProvider(
    // A fresh provider every time: a test that pumps a second one wants an
    // empty stack, not the first one's state under new parameters.
    key: UniqueKey(),
    color: color,
    position: position,
    timeout: timeout,
    limit: limit,
    width: width,
    size: size,
    showClose: showClose,
    closeLabel: closeLabel,
    locale: locale,
    child: Builder(
      builder: (BuildContext context) {
        controller = MPSnackbarProvider.of(context);

        return const SizedBox.expand(key: Key('page'));
      },
    ),
  );

  await tester.pumpWidget(
    host(
      wrap == null ? provider : wrap(provider),
      width: hostWidth,
      height: 600,
      disableAnimations: disableAnimations,
      textDirection: textDirection,
    ),
  );

  return controller;
}

Future<void> _raise(WidgetTester tester, MPSnackbarController controller, String message) async {
  controller.add(MPSnackbarOptions(message: Text(message)));
  await tester.pumpAndSettle();
}

/// The plate a message is written on.
Finder _plateOf(String message) {
  return find.ancestor(of: find.text(message), matching: find.byType(DecoratedBox)).first;
}

BoxDecoration _decorationOf(WidgetTester tester, String message) {
  return tester.widget<DecoratedBox>(_plateOf(message)).decoration as BoxDecoration;
}

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('raising one', () {
    testWidgets('puts nothing on the screen until something is raised', (
      WidgetTester tester,
    ) async {
      await _provider(tester);

      expect(find.byType(DecoratedBox), findsNothing);
    });

    testWidgets('shows the message a caller handed it', (WidgetTester tester) async {
      final MPSnackbarController controller = await _provider(tester);

      await _raise(tester, controller, 'Draft saved');

      expect(find.text('Draft saved'), findsOneWidget);
    });

    testWidgets('hands back an id, and its own when given one', (WidgetTester tester) async {
      final MPSnackbarController controller = await _provider(tester);

      final String made = controller.add(const MPSnackbarOptions(message: Text('One')));
      final String named = controller.add(
        const MPSnackbarOptions(id: 'upload', message: Text('Two')),
      );
      await tester.pumpAndSettle();

      expect(made, isNotEmpty);
      expect(named, 'upload');
      expect(controller.snackbars.map((MPSnackbarOptions s) => s.id), <String>['upload', made]);
    });

    testWidgets('draws no action at all when there is none', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();
      final MPSnackbarController controller = await _provider(tester, closeLabel: 'Dismiss');

      await _raise(tester, controller, 'Deleted');

      // Not merely unlabelled: absent. The × is the one button on the plate.
      expect(semanticsLabelsWithAction(tester, SemanticsAction.tap), <String>['Dismiss']);
      semantics.dispose();
    });

    testWidgets('calls back when the action is pressed, and stays up', (WidgetTester tester) async {
      int pressed = 0;
      final MPSnackbarController controller = await _provider(tester);

      controller.add(
        MPSnackbarOptions(
          message: const Text('Deleted'),
          actionLabel: const Text('Undo'),
          onAction: () => pressed += 1,
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Undo'));
      await tester.pumpAndSettle();

      expect(pressed, 1);
      expect(find.text('Deleted'), findsOneWidget);
    });

    testWidgets('closes from its ×, and says so twice', (WidgetTester tester) async {
      final List<String> heard = <String>[];
      final SemanticsHandle semantics = tester.ensureSemantics();
      final MPSnackbarController controller = await _provider(tester, closeLabel: 'Dismiss');

      controller.add(
        MPSnackbarOptions(
          message: const Text('Draft saved'),
          onClose: () => heard.add('close'),
          onRemove: () => heard.add('remove'),
        ),
      );
      await tester.pumpAndSettle();

      final Finder close = find.bySemanticsLabel('Dismiss');

      expect(close, findsOneWidget);

      await tester.tap(close);
      await tester.pump();

      expect(heard, <String>['close']);

      await tester.pumpAndSettle();

      expect(find.text('Draft saved'), findsNothing);
      expect(heard, <String>['close', 'remove']);
      semantics.dispose();
    });

    testWidgets('drops the × when the stack says not to show one', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();
      final MPSnackbarController controller = await _provider(
        tester,
        showClose: false,
        closeLabel: 'Dismiss',
      );

      await _raise(tester, controller, 'Draft saved');

      expect(find.bySemanticsLabel('Dismiss'), findsNothing);
      semantics.dispose();
    });

    testWidgets('names the × in the language it was given', (WidgetTester tester) async {
      registerMPMessages(<MPLocale>[ko]);
      addTearDown(resetMPMessages);

      final SemanticsHandle semantics = tester.ensureSemantics();
      final MPSnackbarController controller = await _provider(tester, locale: 'ko');

      await _raise(tester, controller, 'Draft saved');

      expect(find.bySemanticsLabel('닫기'), findsOneWidget);
      semantics.dispose();
    });

    testWidgets('announces the message, and only the message', (WidgetTester tester) async {
      // A live region round the whole plate would read "Close" after every
      // message that went past. The message is the announcement, and it is not
      // a heading either.
      final SemanticsHandle semantics = tester.ensureSemantics();
      final MPSnackbarController controller = await _provider(tester);

      await _raise(tester, controller, 'Draft saved');

      final SemanticsNode node = semanticsNodeLabelled(tester, 'Draft saved')!;
      final SemanticsData data = node.getSemanticsData();

      expect(data.flagsCollection.isLiveRegion, isTrue);
      expect(data.flagsCollection.isHeader, isFalse);
      expect(
        semanticsNodeLabelled(tester, 'Close')!.getSemanticsData().flagsCollection.isLiveRegion,
        isFalse,
      );
      semantics.dispose();
    });
  });

  group('the plate', () {
    testWidgets('reads the inverse surface unless a family is asked for', (
      WidgetTester tester,
    ) async {
      final MPSnackbarController controller = await _provider(tester);

      controller.add(
        MPSnackbarOptions(
          message: const Text('Saved'),
          actionLabel: const Text('Undo'),
          onAction: () {},
        ),
      );
      await tester.pumpAndSettle();

      expect(_decorationOf(tester, 'Saved').color, light.inverseSurface);
      expect(styleOf(tester, 'Saved').color, light.inverseOnSurface);
      // `primary` is derived to contrast with the page, so on a plate that
      // inverts the page it is the one colour guaranteed not to read.
      expect(styleOf(tester, 'Undo').color, light.inversePrimary);
    });

    testWidgets('swaps in an accent container when one is named', (WidgetTester tester) async {
      final MPSnackbarController controller = await _provider(tester);

      controller.add(
        MPSnackbarOptions(
          message: const Text('Saved'),
          color: MPColor.error,
          actionLabel: const Text('Undo'),
          onAction: () {},
        ),
      );
      await tester.pumpAndSettle();

      expect(_decorationOf(tester, 'Saved').color, light.errorContainer);
      expect(styleOf(tester, 'Saved').color, light.onErrorContainer);
      expect(styleOf(tester, 'Undo').color, light.error);
    });

    testWidgets('lets one snackbar override the provider’s family', (WidgetTester tester) async {
      final MPSnackbarController controller = await _provider(tester, color: MPColor.primary);

      controller.add(const MPSnackbarOptions(message: Text('Saved'), color: MPColor.tertiary));
      controller.add(const MPSnackbarOptions(message: Text('Kept')));
      await tester.pumpAndSettle();

      expect(_decorationOf(tester, 'Saved').color, light.tertiaryContainer);
      expect(_decorationOf(tester, 'Kept').color, light.primaryContainer);
    });

    testWidgets('has the extra-small corner and a level-3 shadow', (WidgetTester tester) async {
      final MPSnackbarController controller = await _provider(tester);

      await _raise(tester, controller, 'Saved');

      expect(_decorationOf(tester, 'Saved').borderRadius, BorderRadius.circular(4));
      expect(_decorationOf(tester, 'Saved').boxShadow, MPShadows.of(3));
    });

    testWidgets('is MD3’s 48 tall at md, and follows the size ladder', (WidgetTester tester) async {
      final List<double> heights = <double>[];

      for (final MPSize size in MPSize.values) {
        final MPSnackbarController controller = await _provider(
          tester,
          size: size,
          showClose: false,
        );

        await _raise(tester, controller, 'Saved');
        heights.add(tester.getSize(_plateOf('Saved')).height);
        controller.close();
        await tester.pumpAndSettle();
      }

      expect(heights, <double>[36, 40, 48, 56, 64]);
    });

    testWidgets('takes its size from an MPConfigProvider', (WidgetTester tester) async {
      final MPSnackbarController controller = await _provider(
        tester,
        showClose: false,
        wrap: (Widget child) => MPConfigProvider(size: MPSize.xs, child: child),
      );

      await _raise(tester, controller, 'Saved');

      expect(tester.getSize(_plateOf('Saved')).height, 36);
    });

    testWidgets('is as wide as `width`, or the screen when that is narrower', (
      WidgetTester tester,
    ) async {
      MPSnackbarController controller = await _provider(tester);

      await _raise(tester, controller, 'Saved');

      expect(tester.getSize(_plateOf('Saved')).width, 600);

      controller = await _provider(tester, hostWidth: 300);
      await _raise(tester, controller, 'Narrow');

      // The stack keeps 16 from either edge.
      expect(tester.getSize(_plateOf('Narrow')).width, 268);
    });

    testWidgets('draws a glyph before the message in the plate’s ink', (WidgetTester tester) async {
      final MPSnackbarController controller = await _provider(tester);
      Color? seen;

      controller.add(
        MPSnackbarOptions(
          message: const Text('Saved'),
          icon: Builder(
            builder: (BuildContext context) {
              seen = IconTheme.of(context).color;

              return const SizedBox(key: Key('glyph'), width: 16, height: 16);
            },
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(seen, light.inverseOnSurface);
      expect(
        tester.getCenter(find.byKey(const Key('glyph'))).dx,
        lessThan(tester.getCenter(find.text('Saved')).dx),
      );
    });
  });

  group('the stack', () {
    testWidgets('sits at the bottom start by default, 16 from the edges', (
      WidgetTester tester,
    ) async {
      final MPSnackbarController controller = await _provider(tester, width: 300);

      await _raise(tester, controller, 'Saved');

      final Rect page = tester.getRect(find.byKey(const Key('page')));
      final Rect plate = tester.getRect(_plateOf('Saved'));

      expect(plate.left - page.left, 16);
      expect(page.bottom - plate.bottom, 16);
    });

    testWidgets('pins itself where the provider says', (WidgetTester tester) async {
      final MPSnackbarController controller = await _provider(
        tester,
        width: 300,
        position: MPSnackbarPosition.topCenter,
      );

      await _raise(tester, controller, 'Saved');

      final Rect page = tester.getRect(find.byKey(const Key('page')));
      final Rect plate = tester.getRect(_plateOf('Saved'));

      expect(plate.top - page.top, 16);
      expect(plate.center.dx, closeTo(page.center.dx, 0.5));
    });

    testWidgets('lets one snackbar leave the stack the provider chose', (
      WidgetTester tester,
    ) async {
      final MPSnackbarController controller = await _provider(tester, width: 300);

      controller.add(
        const MPSnackbarOptions(message: Text('Saved'), position: MPSnackbarPosition.topEnd),
      );
      await tester.pumpAndSettle();

      final Rect page = tester.getRect(find.byKey(const Key('page')));
      final Rect plate = tester.getRect(_plateOf('Saved'));

      expect(plate.top - page.top, 16);
      expect(page.right - plate.right, 16);
    });

    testWidgets('reads start as the right under RTL', (WidgetTester tester) async {
      final MPSnackbarController controller = await _provider(
        tester,
        width: 300,
        textDirection: TextDirection.rtl,
      );

      await _raise(tester, controller, 'Saved');

      final Rect page = tester.getRect(find.byKey(const Key('page')));

      expect(page.right - tester.getRect(_plateOf('Saved')).right, 16);
    });

    testWidgets('puts the newest nearest the edge it is pinned to', (WidgetTester tester) async {
      MPSnackbarController controller = await _provider(tester);

      controller
        ..add(const MPSnackbarOptions(message: Text('Older')))
        ..add(const MPSnackbarOptions(message: Text('Newer')));
      await tester.pumpAndSettle();

      expect(
        tester.getCenter(find.text('Newer')).dy,
        greaterThan(tester.getCenter(find.text('Older')).dy),
      );

      controller = await _provider(tester, position: MPSnackbarPosition.topStart);
      controller
        ..add(const MPSnackbarOptions(message: Text('Older')))
        ..add(const MPSnackbarOptions(message: Text('Newer')));
      await tester.pumpAndSettle();

      expect(
        tester.getCenter(find.text('Newer')).dy,
        lessThan(tester.getCenter(find.text('Older')).dy),
      );
    });

    testWidgets('brings the plate in from the edge it is pinned to', (WidgetTester tester) async {
      MPSnackbarController controller = await _provider(tester);

      controller.add(const MPSnackbarOptions(message: Text('Saved')));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 50));

      final double moving = tester.getTopLeft(_plateOf('Saved')).dy;

      await tester.pumpAndSettle();

      expect(moving, greaterThan(tester.getTopLeft(_plateOf('Saved')).dy));

      controller = await _provider(tester, position: MPSnackbarPosition.topCenter);
      controller.add(const MPSnackbarOptions(message: Text('Down')));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 50));

      final double falling = tester.getTopLeft(_plateOf('Down')).dy;

      await tester.pumpAndSettle();

      expect(falling, lessThan(tester.getTopLeft(_plateOf('Down')).dy));
    });

    testWidgets('arrives at once when the reader asked for less motion', (
      WidgetTester tester,
    ) async {
      final MPSnackbarController controller = await _provider(tester, disableAnimations: true);

      controller.add(const MPSnackbarOptions(message: Text('Saved')));
      await tester.pump();

      final FadeTransition fade = tester.widget<FadeTransition>(
        find.ancestor(of: _plateOf('Saved'), matching: find.byType(FadeTransition)).first,
      );

      expect(fade.opacity.value, 1);
    });

    testWidgets('updates a snackbar in place when its id is reused', (WidgetTester tester) async {
      final MPSnackbarController controller = await _provider(tester);

      controller.add(const MPSnackbarOptions(id: 'upload', message: Text('Uploading…')));
      await tester.pumpAndSettle();

      controller.update('upload', const MPSnackbarOptions(message: Text('Uploaded')));
      await tester.pumpAndSettle();

      expect(find.text('Uploaded'), findsOneWidget);
      expect(find.text('Uploading…'), findsNothing);
      expect(controller.snackbars, hasLength(1));

      controller.add(const MPSnackbarOptions(id: 'upload', message: Text('Again')));
      await tester.pumpAndSettle();

      expect(find.text('Again'), findsOneWidget);
      expect(controller.snackbars, hasLength(1));
    });

    testWidgets('shows the newest `limit` and brings the rest back as it drains', (
      WidgetTester tester,
    ) async {
      final MPSnackbarController controller = await _provider(tester, limit: 2);

      for (final String message in <String>['One', 'Two', 'Three']) {
        controller.add(MPSnackbarOptions(id: message, message: Text(message)));
      }

      await tester.pumpAndSettle();

      expect(find.text('One'), findsNothing);
      expect(find.text('Two'), findsOneWidget);
      expect(find.text('Three'), findsOneWidget);

      controller.close('Three');
      await tester.pumpAndSettle();

      expect(find.text('One'), findsOneWidget);
    });

    testWidgets('closes every one of them when called with nothing', (WidgetTester tester) async {
      final MPSnackbarController controller = await _provider(tester);

      controller
        ..add(const MPSnackbarOptions(message: Text('One')))
        ..add(const MPSnackbarOptions(message: Text('Two')));
      await tester.pumpAndSettle();

      controller.close();
      await tester.pumpAndSettle();

      expect(find.text('One'), findsNothing);
      expect(find.text('Two'), findsNothing);
      expect(controller.snackbars, isEmpty);
    });

    testWidgets('is flicked away sideways', (WidgetTester tester) async {
      int closed = 0;
      final MPSnackbarController controller = await _provider(tester);

      controller.add(MPSnackbarOptions(message: const Text('Saved'), onClose: () => closed += 1));
      await tester.pumpAndSettle();

      await tester.fling(find.text('Saved'), const Offset(500, 0), 2000);
      await tester.pumpAndSettle();

      expect(find.text('Saved'), findsNothing);
      expect(closed, 1);
    });

    testWidgets('lets a press beside a plate reach the page', (WidgetTester tester) async {
      int pressed = 0;
      late MPSnackbarController controller;

      await tester.pumpWidget(
        host(
          MPSnackbarProvider(
            width: 200,
            child: Builder(
              builder: (BuildContext context) {
                controller = MPSnackbarProvider.of(context);

                return GestureDetector(
                  behavior: HitTestBehavior.opaque,
                  onTap: () => pressed += 1,
                  child: const SizedBox.expand(),
                );
              },
            ),
          ),
          width: 800,
          height: 600,
        ),
      );

      await _raise(tester, controller, 'Saved');

      final Rect plate = tester.getRect(_plateOf('Saved'));

      // Level with the plate, on the strip the stack spans, past its end.
      await tester.tapAt(Offset(plate.right + 100, plate.center.dy));

      expect(pressed, 1);
    });
  });

  group('the clock', () {
    testWidgets('closes on its own after the provider’s timeout', (WidgetTester tester) async {
      final MPSnackbarController controller = await _provider(tester);

      await _raise(tester, controller, 'Saved');
      await tester.pump(const Duration(seconds: 4));

      expect(find.text('Saved'), findsOneWidget);

      await tester.pump(const Duration(seconds: 2));
      await tester.pumpAndSettle();

      expect(find.text('Saved'), findsNothing);
    });

    testWidgets('stays until it is closed when the timeout is zero', (WidgetTester tester) async {
      final MPSnackbarController controller = await _provider(tester);

      controller.add(const MPSnackbarOptions(message: Text('Saved'), timeout: Duration.zero));
      await tester.pumpAndSettle();
      await tester.pump(const Duration(minutes: 1));

      expect(find.text('Saved'), findsOneWidget);
    });

    testWidgets('waits while the pointer rests on it', (WidgetTester tester) async {
      final MPSnackbarController controller = await _provider(tester);

      await _raise(tester, controller, 'Saved');

      final TestGesture mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);
      addTearDown(mouse.removePointer);
      await mouse.addPointer(location: Offset.zero);
      await mouse.moveTo(tester.getCenter(find.text('Saved')));
      await tester.pump(const Duration(seconds: 10));

      expect(find.text('Saved'), findsOneWidget);

      await mouse.moveTo(Offset.zero);
      await tester.pump(const Duration(seconds: 6));
      await tester.pumpAndSettle();

      expect(find.text('Saved'), findsNothing);
    });

    testWidgets('holds a waiting message open, then answers it in place', (
      WidgetTester tester,
    ) async {
      final MPSnackbarController controller = await _provider(tester);
      final Completer<int> work = Completer<int>();

      final Future<int> outcome = controller.promise<int>(
        work.future,
        loading: const MPSnackbarOptions(message: Text('Saving…')),
        success: (int value) => MPSnackbarOptions(message: Text('Saved $value')),
        error: (Object error) => const MPSnackbarOptions(message: Text('Failed')),
      );
      await tester.pumpAndSettle();
      await tester.pump(const Duration(seconds: 30));

      expect(find.text('Saving…'), findsOneWidget);

      work.complete(3);
      await tester.pumpAndSettle();

      expect(await outcome, 3);
      expect(find.text('Saved 3'), findsOneWidget);
      expect(controller.snackbars, hasLength(1));

      await tester.pump(const Duration(seconds: 6));
      await tester.pumpAndSettle();

      expect(find.text('Saved 3'), findsNothing);
    });

    testWidgets('answers a failure in place and hands the error on', (WidgetTester tester) async {
      final MPSnackbarController controller = await _provider(tester);
      final Completer<int> work = Completer<int>();

      final Future<int> outcome = controller.promise<int>(
        work.future,
        loading: const MPSnackbarOptions(message: Text('Saving…')),
        success: (int value) => const MPSnackbarOptions(message: Text('Saved')),
        error: (Object error) => MPSnackbarOptions(message: Text('Failed: $error')),
      );
      final Future<void> caught = expectLater(outcome, throwsA('offline'));
      await tester.pumpAndSettle();

      work.completeError('offline');
      await tester.pumpAndSettle();
      await caught;

      expect(find.text('Failed: offline'), findsOneWidget);
    });

    testWidgets('lets go of every animation it made', (WidgetTester tester) async {
      final ({int made, int kept}) curves = await disposalOf(tester, 'CurvedAnimation', () async {
        final MPSnackbarController controller = await _provider(tester);

        await _raise(tester, controller, 'One');
        await _raise(tester, controller, 'Two');
        controller.close('One');
        await tester.pumpAndSettle();
      });

      expect(curves.made, greaterThan(0));
      expect(curves.kept, 0);
    });

    testWidgets('leaves no clock running once it is gone', (WidgetTester tester) async {
      final MPSnackbarController controller = await _provider(tester);

      await _raise(tester, controller, 'Saved');
      await tester.pumpWidget(const SizedBox());

      // A pending timer here fails the test on its own.
      expect(find.text('Saved'), findsNothing);
    });
  });
}
