import 'dart:ui' show Tristate;

import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/switch/mp_switch.dart';
import 'package:material_plus_ui/src/internal/selection_field.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The track: the box the groove is drawn in, the one wider than it is tall.
Finder _track() {
  return find.descendant(
    of: find.byType(MPSwitch),
    matching: find.byWidgetPredicate(
      (Widget widget) =>
          widget is SizedBox &&
          widget.width != null &&
          widget.height != null &&
          widget.width! > widget.height!,
    ),
  );
}

BoxDecoration _grooveOf(WidgetTester tester) {
  return tester
      .widgetList<AnimatedContainer>(
        find.descendant(of: find.byType(MPSwitch), matching: find.byType(AnimatedContainer)),
      )
      .map((AnimatedContainer box) => box.decoration! as BoxDecoration)
      .firstWhere((BoxDecoration decoration) => decoration.shape == BoxShape.rectangle);
}

Rect _thumbOf(WidgetTester tester) {
  return tester.getRect(
    find.descendant(
      of: find.byType(MPSwitch),
      matching: find.byType(AnimatedPositionedDirectional),
    ),
  );
}

List<MPSelectionMarkPainter> _glyphsOf(WidgetTester tester) {
  return tester
      .widgetList<CustomPaint>(
        find.descendant(of: find.byType(MPSwitch), matching: find.byType(CustomPaint)),
      )
      .map((CustomPaint paint) => paint.painter)
      .whereType<MPSelectionMarkPainter>()
      .toList();
}

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('rendering', () {
    testWidgets('is announced as a switch named by its label', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(const MPSwitch(label: Text('Wi-Fi'))));

      expect(
        tester.getSemantics(find.text('Wi-Fi')),
        matchesSemantics(
          label: 'Wi-Fi',
          hasToggledState: true,
          isToggled: false,
          hasEnabledState: true,
          isEnabled: true,
          isFocusable: true,
          hasTapAction: true,
          hasFocusAction: true,
        ),
      );
      semantics.dispose();
    });

    testWidgets('puts the label after the track, or before it on request', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(const MPSwitch(label: Text('Wi-Fi'))));
      expect(tester.getCenter(find.text('Wi-Fi')).dx, greaterThan(tester.getCenter(_track()).dx));

      await tester.pumpWidget(
        host(const MPSwitch(label: Text('Wi-Fi'), labelPlacement: MPSwitchLabelPlacement.start)),
      );
      expect(tester.getCenter(find.text('Wi-Fi')).dx, lessThan(tester.getCenter(_track()).dx));
    });

    testWidgets('draws the glyphs only when asked', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPSwitch()));
      expect(_glyphsOf(tester), isEmpty);

      await tester.pumpWidget(host(const MPSwitch(icons: true)));
      expect(_glyphsOf(tester), hasLength(2));
    });

    testWidgets('shows exactly one glyph, in either state', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPSwitch(icons: true, checked: false)));
      await tester.pumpAndSettle();

      Map<MPSelectionMarkShape, double> shown() => <MPSelectionMarkShape, double>{
        for (final MPSelectionMarkPainter glyph in _glyphsOf(tester)) glyph.shape: glyph.shown,
      };

      expect(shown(), <MPSelectionMarkShape, double>{
        MPSelectionMarkShape.check: 0,
        MPSelectionMarkShape.cross: 1,
      });

      await tester.pumpWidget(host(const MPSwitch(icons: true, checked: true)));
      await tester.pumpAndSettle();

      expect(shown(), <MPSelectionMarkShape, double>{
        MPSelectionMarkShape.check: 1,
        MPSelectionMarkShape.cross: 0,
      });
    });

    testWidgets('fills the groove with the accent once on', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPSwitch(checked: false)));
      expect(_grooveOf(tester).color, light.surfaceContainerHighest);
      expect((_grooveOf(tester).border! as Border).top.color, light.outline);

      await tester.pumpWidget(host(const MPSwitch(checked: true)));
      await tester.pumpAndSettle();
      expect(_grooveOf(tester).color, light.primary);
    });
  });

  group('flipping', () {
    testWidgets('hands the parent a boolean', (WidgetTester tester) async {
      final List<bool> changes = <bool>[];

      await tester.pumpWidget(host(MPSwitch(onChanged: changes.add)));
      await tester.tap(find.byType(MPSwitch));

      expect(changes, <bool>[true]);
    });

    testWidgets('flips through a controlled parent', (WidgetTester tester) async {
      bool on = false;

      await tester.pumpWidget(
        host(
          StatefulBuilder(
            builder: (BuildContext context, StateSetter setState) =>
                MPSwitch(checked: on, onChanged: (bool next) => setState(() => on = next)),
          ),
        ),
      );

      await tester.tap(find.byType(MPSwitch));
      await tester.pump();
      expect(on, isTrue);
    });

    testWidgets('flips from the label and from the keyboard', (WidgetTester tester) async {
      final List<bool> changes = <bool>[];
      final FocusNode focus = FocusNode();
      addTearDown(focus.dispose);

      await tester.pumpWidget(
        host(MPSwitch(label: const Text('Wi-Fi'), focusNode: focus, onChanged: changes.add)),
      );
      await tester.tap(find.text('Wi-Fi'));
      await tester.pump();
      focus.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.space);

      expect(changes, <bool>[true, false]);
    });

    testWidgets('moves the thumb across the track and grows it', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPSwitch(checked: false)));
      final Rect off = _thumbOf(tester);

      await tester.pumpWidget(host(const MPSwitch(checked: true)));
      await tester.pumpAndSettle();
      final Rect on = _thumbOf(tester);
      final Rect track = tester.getRect(_track());

      expect(off.size, const Size(16, 16));
      expect(on.size, const Size(24, 24));
      expect(off.left - track.left, 8);
      expect(on.left - track.left, 24);
    });

    testWidgets('travels the other way under right-to-left', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(textDirection: TextDirection.rtl, const MPSwitch(checked: true)),
      );
      final Rect on = _thumbOf(tester);
      final Rect track = tester.getRect(_track());

      expect(track.right - on.right, 24);
    });
  });

  group('states', () {
    testWidgets('shows an error and turns over into the error family', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const MPSwitch(
            label: Text('Sync'),
            description: Text('Keeps devices in step.'),
            errorMessage: Text('Sign in to sync.'),
          ),
        ),
      );

      expect((_grooveOf(tester).border! as Border).top.color, light.error);
      expect(find.text('Sign in to sync.'), findsOneWidget);
      expect(find.text('Keeps devices in step.'), findsNothing);
    });

    testWidgets('disables the control', (WidgetTester tester) async {
      final List<bool> changes = <bool>[];

      await tester.pumpWidget(host(MPSwitch(disabled: true, onChanged: changes.add)));
      await tester.tap(find.byType(MPSwitch));

      expect(changes, isEmpty);
    });

    testWidgets('stays focusable and unchangeable when read-only', (WidgetTester tester) async {
      final List<bool> changes = <bool>[];
      final FocusNode focus = FocusNode();
      addTearDown(focus.dispose);

      await tester.pumpWidget(
        host(MPSwitch(readOnly: true, focusNode: focus, onChanged: changes.add)),
      );
      await tester.tap(find.byType(MPSwitch));
      focus.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.space);

      expect(changes, isEmpty);
      expect(focus.hasFocus, isTrue);
    });

    testWidgets('says it is required', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(const MPSwitch(required: true, label: Text('Terms'))));

      expect(
        semanticsNodeLabelled(tester, 'Terms')!.getSemanticsData().flagsCollection.isRequired,
        Tristate.isTrue,
      );
      semantics.dispose();
    });
  });

  group('the size ladder', () {
    testWidgets('grows the track monotonically', (WidgetTester tester) async {
      final List<Size> tracks = <Size>[];

      for (final MPSize size in MPSize.values) {
        await tester.pumpWidget(host(MPSwitch(size: size)));
        tracks.add(tester.getSize(_track()));
      }

      expect(tracks, const <Size>[
        Size(32, 20),
        Size(40, 24),
        Size(52, 32),
        Size(60, 36),
        Size(68, 40),
      ]);
    });

    testWidgets('keeps the track the same size once it is on', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPSwitch(checked: false)));
      final Size off = tester.getSize(_track());

      await tester.pumpWidget(host(const MPSwitch(checked: true)));
      await tester.pumpAndSettle();

      expect(tester.getSize(_track()), off);
    });

    testWidgets('lines a full-width start label up against the far edge', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          width: 300,
          const MPSwitch(
            label: Text('Bluetooth'),
            labelPlacement: MPSwitchLabelPlacement.start,
            fullWidth: true,
          ),
        ),
      );

      expect(tester.getRect(_track()).right, tester.getRect(find.byType(MPSwitch)).right);
    });
  });
}
