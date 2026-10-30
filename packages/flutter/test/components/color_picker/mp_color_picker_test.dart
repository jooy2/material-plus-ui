import 'dart:ui' show Tristate;

import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/color_picker/mp_color_picker.dart';
import 'package:material_plus_ui/src/components/form/mp_form.dart';
// Reached directly: these are the library talking to itself, and the tests
// are the one caller allowed to listen in.
import 'package:material_plus_ui/src/internal/field.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The React suite's questions about `MPColorPicker`, asked of the render tree.

/// A parent that keeps the colour and shows it, as the React suite's
/// `Controlled` does.
class _Controlled extends StatefulWidget {
  const _Controlled({
    this.initial = '#ff0000',
    this.inline = false,
    this.swatches,
    this.format = MPColorFormat.hex,
    this.alpha = false,
    this.clearable = false,
    this.readOnly = false,
    this.floatingLabel = true,
    this.onChanged,
  });

  final String initial;
  final bool inline;
  final List<String>? swatches;
  final MPColorFormat format;
  final bool alpha;
  final bool clearable;
  final bool readOnly;
  final bool floatingLabel;
  final ValueChanged<String>? onChanged;

  @override
  State<_Controlled> createState() => _ControlledState();
}

class _ControlledState extends State<_Controlled> {
  late String value = widget.initial;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[
        MPColorPicker(
          label: const Text('Colour'),
          value: value,
          onChanged: (String next) {
            setState(() => value = next);
            widget.onChanged?.call(next);
          },
          inline: widget.inline,
          swatches: widget.swatches,
          format: widget.format,
          alpha: widget.alpha,
          clearable: widget.clearable,
          readOnly: widget.readOnly,
          floatingLabel: widget.floatingLabel,
        ),
        Text('model: $value'),
      ],
    );
  }
}

SemanticsNode? _slider(WidgetTester tester, String label) => semanticsNodeLabelled(tester, label);

String? _sliderValue(WidgetTester tester, String label) => _slider(tester, label)?.value;

Future<void> _open(WidgetTester tester) async {
  await tester.tap(find.byType(MPFieldShell));
  await tester.pumpAndSettle();
}

Finder _swatch(String name) {
  return find.byWidgetPredicate(
    (Widget widget) => widget is Semantics && widget.properties.label == name,
  );
}

/// The label where it is drawn, rather than where the trigger's width sizer
/// lays the same words out unseen.
double _labelSize(WidgetTester tester) {
  final Finder drawn = find.byElementPredicate((Element element) {
    if (element.widget is! Text || (element.widget as Text).data != 'Colour') {
      return false;
    }

    bool sizing = false;

    element.visitAncestorElements((Element ancestor) {
      sizing = ancestor.widget is MPWidthSizer;

      return !sizing;
    });

    return !sizing;
  });

  return tester.renderObject<RenderParagraph>(drawn).text.style!.fontSize!;
}

void main() {
  group('the trigger', () {
    testWidgets('is a button named by the label in the notch', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(host(const _Controlled(), overlay: true));

      expect(
        semanticsOf(tester, find.byType(MPColorPicker)),
        isSemantics(
          isButton: true,
          label: 'Colour',
          value: '#ff0000',
          isEnabled: true,
          hasEnabledState: true,
          hasExpandedState: true,
          isFocusable: true,
          hasTapAction: true,
          hasFocusAction: true,
        ),
      );

      handle.dispose();
    });

    testWidgets('draws the notched outline the text field wears', (WidgetTester tester) async {
      await tester.pumpWidget(host(const _Controlled(), overlay: true));

      expect(find.byType(MPFieldShell), findsOneWidget);
    });

    testWidgets('shows the value written in the format it was asked for', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(const _Controlled(format: MPColorFormat.rgb), overlay: true));

      expect(find.text('rgb(255, 0, 0)'), findsOneWidget);
    });

    testWidgets('says so when there is no colour at all', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(const _Controlled(initial: '', floatingLabel: false), overlay: true),
      );

      final Visibility placeholder = tester.widget<Visibility>(
        find.ancestor(of: find.text('No colour'), matching: find.byType(Visibility)).first,
      );

      expect(placeholder.visible, isTrue);
    });
  });

  group('the floating label', () {
    testWidgets('rests on the trigger’s line while there is no colour', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(const _Controlled(initial: ''), overlay: true));

      expect(_labelSize(tester), 16);
    });

    testWidgets('takes the swatch down with the resting label', (WidgetTester tester) async {
      await tester.pumpWidget(host(const _Controlled(initial: ''), overlay: true));

      expect(find.byType(MPFieldAdornment), findsNothing);
    });

    testWidgets('brings both back once there is a colour', (WidgetTester tester) async {
      await tester.pumpWidget(host(const _Controlled(), overlay: true));

      expect(_labelSize(tester), 12);
      expect(find.byType(MPFieldAdornment), findsOneWidget);
    });

    testWidgets('is pinned in the notch by floatingLabel: false, swatch and all', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(const _Controlled(initial: '', floatingLabel: false), overlay: true),
      );

      expect(_labelSize(tester), 12);
      expect(find.byType(MPFieldAdornment), findsOneWidget);
    });
  });

  group('the panel', () {
    testWidgets('is not there until the trigger is pressed', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(host(const _Controlled(), overlay: true));

      expect(_slider(tester, 'Hue'), isNull);

      await _open(tester);

      expect(_slider(tester, 'Saturation and brightness'), isNotNull);
      expect(_slider(tester, 'Hue'), isNotNull);

      handle.dispose();
    });

    testWidgets('takes the focus into its square as it opens', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(host(const _Controlled(), overlay: true));
      await _open(tester);

      expect(
        _slider(tester, 'Saturation and brightness')!.getSemanticsData().flagsCollection.isFocused,
        Tristate.isTrue,
      );

      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.pumpAndSettle();

      expect(_slider(tester, 'Hue'), isNull);

      handle.dispose();
    });

    testWidgets('draws no opacity rail unless alpha is on', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(host(const _Controlled(inline: true), overlay: true));

      expect(_slider(tester, 'Opacity'), isNull);

      await tester.pumpWidget(host(const _Controlled(inline: true, alpha: true), overlay: true));

      expect(_slider(tester, 'Opacity'), isNotNull);

      handle.dispose();
    });

    testWidgets('is drawn in the page with no trigger at all when inline', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(const _Controlled(inline: true), overlay: true));

      expect(find.byType(MPFieldShell), findsNothing);
      expect(find.text('Colour'), findsOneWidget);
    });

    testWidgets('takes names of the caller’s own, and the rest in its language', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(
        host(
          const MPColorPicker(inline: true, alpha: true, labels: <String, String>{'hue': 'Tint'}),
          overlay: true,
        ),
      );

      expect(_slider(tester, 'Tint'), isNotNull);
      expect(_slider(tester, 'Opacity'), isNotNull);

      handle.dispose();
    });
  });

  group('changing the colour', () {
    testWidgets('moves the hue with the arrow keys and hands back a new value', (
      WidgetTester tester,
    ) async {
      final List<String> reported = <String>[];
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(
        host(_Controlled(inline: true, onChanged: reported.add), overlay: true),
      );

      _slider(
        tester,
        'Hue',
      )!.owner!.performAction(_slider(tester, 'Hue')!.id, SemanticsAction.focus);
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      await tester.pump();

      expect(reported, hasLength(1));
      expect(reported.single, isNot('#ff0000'));

      handle.dispose();
    });

    testWidgets('keeps the hue when the colour is taken to black', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(
        host(const _Controlled(initial: '#0000ff', inline: true), overlay: true),
      );

      final String? before = _sliderValue(tester, 'Hue');
      final SemanticsNode area = _slider(tester, 'Saturation and brightness')!;

      area.owner!.performAction(area.id, SemanticsAction.focus);
      await tester.pump();

      for (int step = 0; step < 11; step += 1) {
        await tester.sendKeyDownEvent(LogicalKeyboardKey.shiftLeft);
        await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
        await tester.sendKeyUpEvent(LogicalKeyboardKey.shiftLeft);
        await tester.pump();
      }

      expect(find.text('model: #000000'), findsOneWidget);
      expect(_sliderValue(tester, 'Hue'), before);

      handle.dispose();
    });

    testWidgets('takes a colour from a swatch', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const _Controlled(inline: true, swatches: <String>['#ff0000', '#00ff00']),
          overlay: true,
        ),
      );

      await tester.tap(_swatch('#00ff00'));
      await tester.pump();

      expect(find.text('model: #00ff00'), findsOneWidget);
    });

    testWidgets('marks the swatch that is currently chosen, and fades the tick', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(
        host(
          const _Controlled(
            initial: '#00ff00',
            inline: true,
            swatches: <String>['#ff0000', '#00ff00'],
          ),
          overlay: true,
        ),
      );

      expect(
        semanticsNodeLabelled(tester, '#00ff00')!.getSemanticsData().flagsCollection.isSelected,
        Tristate.isTrue,
      );
      expect(
        semanticsNodeLabelled(tester, '#ff0000')!.getSemanticsData().flagsCollection.isSelected,
        Tristate.isFalse,
      );

      final List<double> ticks = tester
          .widgetList<AnimatedOpacity>(
            find.descendant(of: find.byType(Wrap), matching: find.byType(AnimatedOpacity)),
          )
          .map((AnimatedOpacity tick) => tick.opacity)
          .toList();

      expect(ticks, <double>[0, 1]);

      handle.dispose();
    });

    testWidgets('accepts a value typed into the field', (WidgetTester tester) async {
      await tester.pumpWidget(host(const _Controlled(inline: true), overlay: true));
      await tester.enterText(find.byType(EditableText), '#00ff00');
      await tester.pump();

      expect(find.text('model: #00ff00'), findsOneWidget);
    });

    testWidgets('leaves the panel where it was for text that is not a colour', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(host(const _Controlled(inline: true), overlay: true));

      final String? before = _sliderValue(tester, 'Hue');

      await tester.enterText(find.byType(EditableText), 'not a colour');
      await tester.pump();

      expect(_sliderValue(tester, 'Hue'), before);
      expect(find.text('model: #ff0000'), findsOneWidget);

      handle.dispose();
    });
  });

  group('the value that comes back out', () {
    testWidgets('is hex by default', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(const _Controlled(inline: true, swatches: <String>['#336699']), overlay: true),
      );
      await tester.tap(_swatch('#336699'));
      await tester.pump();

      expect(find.text('model: #336699'), findsOneWidget);
    });

    testWidgets('is written in whichever notation was asked for', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const _Controlled(inline: true, format: MPColorFormat.hsl, swatches: <String>['#00ff00']),
          overlay: true,
        ),
      );
      await tester.tap(_swatch('#00ff00'));
      await tester.pump();

      expect(find.text('model: hsl(120, 100%, 50%)'), findsOneWidget);
    });

    testWidgets('drops the fourth channel for a caller who never turned alpha on', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          const _Controlled(
            inline: true,
            format: MPColorFormat.rgb,
            swatches: <String>['rgba(0, 0, 255, 0.5)'],
          ),
          overlay: true,
        ),
      );
      await tester.tap(_swatch('rgba(0, 0, 255, 0.5)'));
      await tester.pump();

      expect(find.text('model: rgb(0, 0, 255)'), findsOneWidget);
    });
  });

  group('states', () {
    testWidgets('shows an error message and marks the picker invalid', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(
        host(
          const MPColorPicker(label: Text('Colour'), errorMessage: Text('Pick a colour.')),
          overlay: true,
        ),
      );

      expect(find.text('Pick a colour.'), findsOneWidget);
      expect(
        semanticsOf(tester, find.byType(MPColorPicker)).getSemanticsData().validationResult,
        SemanticsValidationResult.invalid,
      );

      handle.dispose();
    });

    testWidgets('keeps a form from submitting while it is required and empty', (
      WidgetTester tester,
    ) async {
      final GlobalKey<MPFormState> form = GlobalKey<MPFormState>();
      Map<String, Object?>? submitted;

      await tester.pumpWidget(
        host(
          width: 300,
          overlay: true,
          MPForm(
            key: form,
            onSubmit: (Map<String, Object?> values) => submitted = values,
            children: const <Widget>[
              MPColorPicker(name: 'tint', label: Text('Colour'), initialValue: '', required: true),
            ],
          ),
        ),
      );

      expect(form.currentState!.submit(), isFalse);
      await tester.pump();

      expect(submitted, isNull);
      expect(find.text('Required'), findsOneWidget);
    });

    testWidgets('submits under the name it was given', (WidgetTester tester) async {
      final GlobalKey<MPFormState> form = GlobalKey<MPFormState>();
      Map<String, Object?>? submitted;

      await tester.pumpWidget(
        host(
          width: 300,
          overlay: true,
          MPForm(
            key: form,
            onSubmit: (Map<String, Object?> values) => submitted = values,
            children: const <Widget>[
              MPColorPicker(name: 'tint', label: Text('Colour'), initialValue: '#00FF00'),
            ],
          ),
        ),
      );

      expect(form.currentState!.submit(), isTrue);
      expect(submitted, <String, Object?>{'tint': '#00ff00'});
    });

    testWidgets('disables the trigger', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(
        host(const MPColorPicker(label: Text('Colour'), disabled: true), overlay: true),
      );

      expect(
        semanticsOf(
          tester,
          find.byType(MPColorPicker),
        ).getSemanticsData().flagsCollection.isEnabled,
        Tristate.isFalse,
      );

      await _open(tester);

      expect(_slider(tester, 'Hue'), isNull);

      handle.dispose();
    });

    testWidgets('takes no input at all while it is read-only', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(
        host(
          const _Controlled(inline: true, readOnly: true, swatches: <String>['#00ff00']),
          overlay: true,
        ),
      );

      await tester.tap(_swatch('#00ff00'));
      await tester.pump();

      expect(find.text('model: #ff0000'), findsOneWidget);
      expect(
        _slider(tester, 'Hue')!.getSemanticsData().flagsCollection.isEnabled,
        Tristate.isFalse,
      );

      handle.dispose();
    });

    testWidgets('empties the control from its clear button', (WidgetTester tester) async {
      await tester.pumpWidget(host(const _Controlled(clearable: true), overlay: true));

      await tester.tap(find.bySemanticsLabel('Clear'));
      await tester.pump();

      expect(find.text('model: '), findsOneWidget);
    });
  });

  group('the size ladder', () {
    testWidgets('draws the trigger on the rungs a text field uses', (WidgetTester tester) async {
      for (final MPSize size in MPSize.values) {
        await tester.pumpWidget(
          host(MPColorPicker(label: const Text('Colour'), size: size), overlay: true),
        );

        expect(
          tester.getSize(find.byType(MPFieldShell)).height,
          MPFieldMetrics.of(size).height,
          reason: '$size',
        );
      }
    });
  });
}
