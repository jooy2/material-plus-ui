import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/button/mp_button.dart';
import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/components/overlay/mp_overlay.dart';
import 'package:material_plus_ui/src/internal/surface.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The same questions the React suite asks, asked the way Flutter asks them.
///
/// A browser test reads the backdrop's class list; a widget test reads the
/// [ColoredBox] the layer washes the screen with, and the [BackdropFilter]
/// under it. The screen the host lays out is 800 by 600.

/// Every colour the screen is washed with.
Iterable<Color> _washes(WidgetTester tester) =>
    tester.widgetList<ColoredBox>(find.byType(ColoredBox)).map((ColoredBox box) => box.color);

/// An overlay wired to a variable, which is how a controlled one is used.
class _Harness extends StatefulWidget {
  const _Harness({this.dismissible = false, this.modal = true, this.onPage});

  final bool dismissible;
  final bool modal;
  final VoidCallback? onPage;

  @override
  State<_Harness> createState() => _HarnessState();
}

class _HarnessState extends State<_Harness> {
  bool open = true;

  void set(bool next) => setState(() => open = next);

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: <Widget>[
        Align(
          alignment: Alignment.topLeft,
          child: MPButton(onPressed: widget.onPage ?? () {}, child: const Text('On the page')),
        ),
        MPOverlay(
          open: open,
          dismissible: widget.dismissible,
          modal: widget.modal,
          onOpenChange: set,
          child: const Text('Saving your work…'),
        ),
      ],
    );
  }
}

Future<_HarnessState> _pump(WidgetTester tester, _Harness harness) async {
  await tester.pumpWidget(host(harness, width: 800, height: 600, overlay: true));
  await tester.pumpAndSettle();

  return tester.state<_HarnessState>(find.byType(_Harness));
}

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('rendering', () {
    testWidgets('names itself even when it holds nothing readable', (WidgetTester tester) async {
      // The one default label in the library, and this is why: a bare spinner
      // on a scrim would otherwise be a modal region announced as nothing.
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(host(const MPOverlay(open: true), overlay: true));
      await tester.pumpAndSettle();

      final SemanticsNode layer = semanticsNodeLabelled(tester, 'Overlay')!;

      expect(layer.getSemanticsData().role, SemanticsRole.dialog);
      expect(layer.getSemanticsData().flagsCollection.scopesRoute, isTrue);

      handle.dispose();
    });

    testWidgets('takes a name of its own', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(
        host(const MPOverlay(open: true, label: 'Saving your work'), overlay: true),
      );
      await tester.pumpAndSettle();

      expect(
        semanticsNodeLabelled(tester, 'Saving your work')!.getSemanticsData().role,
        SemanticsRole.dialog,
      );
      expect(semanticsLabels(tester), isNot(contains('Overlay')));

      handle.dispose();
    });

    testWidgets('is not on the screen until it is opened', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(const MPOverlay(label: 'Saving', child: Text('Saving…')), overlay: true),
      );
      await tester.pumpAndSettle();

      expect(find.text('Saving…'), findsNothing);
      expect(find.byType(ColoredBox), findsNothing);
    });

    testWidgets('renders what it was handed on top of the scrim', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(const MPOverlay(open: true, child: Text('Saving…')), overlay: true),
      );
      await tester.pumpAndSettle();

      expect(find.text('Saving…'), findsOneWidget);
      expect(styleOf(tester, 'Saving…').color, light.onSurface);
    });

    testWidgets('takes itself down again', (WidgetTester tester) async {
      final _HarnessState state = await _pump(tester, const _Harness());

      state.set(false);
      await tester.pumpAndSettle();

      expect(find.text('Saving your work…'), findsNothing);
    });
  });

  group('tone', () {
    testWidgets('draws MD3’s scrim by default, with a 2px blur', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPOverlay(open: true), overlay: true));
      await tester.pumpAndSettle();

      expect(_washes(tester), contains(mpScrimColor(light)));
      expect(find.byType(BackdropFilter), findsOneWidget);
    });

    testWidgets('frosts for blur: a lighter dim over a real blur', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(const MPOverlay(open: true, tone: MPOverlayTone.blur), overlay: true),
      );
      await tester.pumpAndSettle();

      expect(_washes(tester), contains(light.scrim.withValues(alpha: 0.2)));
      expect(find.byType(BackdropFilter), findsOneWidget);
    });

    testWidgets('paints the page’s own surface for solid', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(const MPOverlay(open: true, tone: MPOverlayTone.solid), overlay: true),
      );
      await tester.pumpAndSettle();

      expect(_washes(tester), contains(light.surface));
      expect(find.byType(BackdropFilter), findsNothing);
    });

    testWidgets('draws nothing at all for clear, and still catches the pointer', (
      WidgetTester tester,
    ) async {
      // The whole reason to reach for it: an invisible sheet that catches a
      // press.
      int pressed = 0;

      await tester.pumpWidget(
        host(
          width: 800,
          height: 600,
          overlay: true,
          Stack(
            children: <Widget>[
              Align(
                alignment: Alignment.topLeft,
                child: MPButton(onPressed: () => pressed += 1, child: const Text('On the page')),
              ),
              const MPOverlay(open: true, tone: MPOverlayTone.clear),
            ],
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.byType(ColoredBox), findsNothing);

      await tester.tap(find.text('On the page'), warnIfMissed: false);
      await tester.pump();

      expect(pressed, 0);
    });
  });

  group('dismissing', () {
    testWidgets('refuses Escape by default, because an overlay is not asking anything', (
      WidgetTester tester,
    ) async {
      final _HarnessState state = await _pump(tester, const _Harness());

      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.pumpAndSettle();

      expect(state.open, isTrue);
    });

    testWidgets('refuses a press outside by default too', (WidgetTester tester) async {
      final _HarnessState state = await _pump(tester, const _Harness());

      await tester.tapAt(const Offset(780, 580));
      await tester.pumpAndSettle();

      expect(state.open, isTrue);
    });

    testWidgets('answers Escape once it is dismissible', (WidgetTester tester) async {
      final _HarnessState state = await _pump(tester, const _Harness(dismissible: true));

      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.pumpAndSettle();

      expect(state.open, isFalse);
      expect(find.text('Saving your work…'), findsNothing);
    });

    testWidgets('and a press outside', (WidgetTester tester) async {
      final _HarnessState state = await _pump(tester, const _Harness(dismissible: true));

      await tester.tapAt(const Offset(780, 580));
      await tester.pumpAndSettle();

      expect(state.open, isFalse);
    });

    testWidgets('does not count a press on the content as one outside it', (
      WidgetTester tester,
    ) async {
      final _HarnessState state = await _pump(tester, const _Harness(dismissible: true));

      await tester.tap(find.text('Saving your work…'));
      await tester.pumpAndSettle();

      expect(state.open, isTrue);
    });

    testWidgets('closes itself when nobody is driving it', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const MPOverlay(initialOpen: true, dismissible: true, child: Text('Saving…')),
          overlay: true,
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Saving…'), findsOneWidget);

      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.pumpAndSettle();

      expect(find.text('Saving…'), findsNothing);
    });

    testWidgets('offers a screen reader no tap on the content or the backdrop', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(
        host(const MPOverlay(open: true, dismissible: true, child: Text('Saving…')), overlay: true),
      );
      await tester.pumpAndSettle();

      expect(semanticsLabelsWithAction(tester, SemanticsAction.tap), isEmpty);
      expect(semanticsLabels(tester), contains('Saving…'));

      handle.dispose();
    });
  });

  group('modal', () {
    testWidgets('takes the page away from the pointer', (WidgetTester tester) async {
      int pressed = 0;

      await _pump(tester, _Harness(onPage: () => pressed += 1));

      await tester.tap(find.text('On the page'), warnIfMissed: false);
      await tester.pump();

      expect(pressed, 0);
    });

    testWidgets('leaves the page in use when it is not modal', (WidgetTester tester) async {
      int pressed = 0;

      await _pump(tester, _Harness(modal: false, onPage: () => pressed += 1));

      await tester.tap(find.text('On the page'));
      await tester.pump();

      expect(pressed, 1);
    });

    testWidgets('holds the focus while it is up, and gives it back', (WidgetTester tester) async {
      final FocusNode page = FocusNode();
      addTearDown(page.dispose);

      await tester.pumpWidget(
        host(
          overlay: true,
          Column(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              MPButton(focusNode: page, onPressed: () {}, child: const Text('On the page')),
              const _Toggle(),
            ],
          ),
        ),
      );

      page.requestFocus();
      await tester.pump();

      tester.state<_ToggleState>(find.byType(_Toggle)).set(true);
      await tester.pumpAndSettle();

      expect(page.hasFocus, isFalse);

      tester.state<_ToggleState>(find.byType(_Toggle)).set(false);
      await tester.pumpAndSettle();

      expect(page.hasFocus, isTrue);
    });
  });

  group('align and size', () {
    Future<Rect> contentRect(
      WidgetTester tester, {
      MPAlign align = MPAlign.center,
      MPSize? size,
    }) async {
      await tester.pumpWidget(
        host(
          overlay: true,
          MPOverlay(
            open: true,
            align: align,
            size: size,
            child: const SizedBox(key: Key('content'), width: 40, height: 40),
          ),
        ),
      );
      await tester.pumpAndSettle();

      return tester.getRect(find.byKey(const Key('content')));
    }

    testWidgets('puts the content in the middle by default', (WidgetTester tester) async {
      expect((await contentRect(tester)).center, const Offset(400, 300));
    });

    testWidgets('puts it at the top for start and the bottom for end', (WidgetTester tester) async {
      final Rect start = await contentRect(tester, align: MPAlign.start);
      final Rect end = await contentRect(tester, align: MPAlign.end);

      expect(start.top, 16);
      expect(start.center.dx, 400);
      expect(end.bottom, 600 - 16);
    });

    testWidgets('keeps the room the size ladder gives from the edge', (WidgetTester tester) async {
      final List<double> tops = <double>[];

      for (final MPSize size in MPSize.values) {
        tops.add((await contentRect(tester, align: MPAlign.start, size: size)).top);
      }

      expect(tops, <double>[10, 12, 16, 20, 24]);
    });

    testWidgets('takes its size from an MPConfigProvider', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          overlay: true,
          const MPConfigProvider(
            size: MPSize.xl,
            child: MPOverlay(
              open: true,
              align: MPAlign.start,
              child: SizedBox(key: Key('content'), width: 40, height: 40),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(tester.getRect(find.byKey(const Key('content'))).top, 24);
    });
  });

  testWidgets('appears at once for a reader who asked for less motion', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      host(
        disableAnimations: true,
        overlay: true,
        const MPOverlay(open: true, child: Text('Saving…')),
      ),
    );
    await tester.pump();
    await tester.pump();

    final FadeTransition fade = tester.widget<FadeTransition>(
      find.ancestor(of: find.text('Saving…'), matching: find.byType(FadeTransition)).first,
    );

    expect(fade.opacity.value, 1);
  });
}

/// An overlay opened and closed from outside, with something on the page to
/// hold the focus before it.
class _Toggle extends StatefulWidget {
  const _Toggle();

  @override
  State<_Toggle> createState() => _ToggleState();
}

class _ToggleState extends State<_Toggle> {
  bool _open = false;

  void set(bool next) => setState(() => _open = next);

  @override
  Widget build(BuildContext context) {
    return MPOverlay(open: _open, child: const Text('Saving…'));
  }
}
