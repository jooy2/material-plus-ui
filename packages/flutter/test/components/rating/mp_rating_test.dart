import 'dart:ui' show CheckedState, SemanticsRole;

import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/locales.dart';
import 'package:material_plus_ui/src/components/rating/mp_rating.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/icons.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// A rating whose parent holds the score.
class _Controlled extends StatefulWidget {
  const _Controlled({this.initial = 0, this.precision = 1, this.clearable = true, this.focusNode});

  final double initial;
  final double precision;
  final bool clearable;
  final FocusNode? focusNode;

  @override
  State<_Controlled> createState() => _ControlledState();
}

class _ControlledState extends State<_Controlled> {
  late double value = widget.initial;

  @override
  Widget build(BuildContext context) {
    return MPRating(
      value: value,
      precision: widget.precision,
      clearable: widget.clearable,
      focusNode: widget.focusNode,
      onChanged: (double next) => setState(() => value = next),
    );
  }
}

double _scoreOf(WidgetTester tester) =>
    tester.state<_ControlledState>(find.byType(_Controlled)).value;

/// The `n`th star, from the start.
Finder _star(int index) {
  return find
      .descendant(
        of: find.byType(MPRating),
        matching: find.byWidgetPredicate(
          (Widget widget) =>
              widget is SizedBox &&
              widget.width != null &&
              widget.width == widget.height &&
              widget.width!.isFinite &&
              widget.width! > 10,
        ),
      )
      .at(index);
}

/// How much of each star is filled, as the clips say.
List<double> _fills(WidgetTester tester) {
  return tester
      .widgetList<ClipRect>(
        find.descendant(of: find.byType(MPRating), matching: find.byType(ClipRect)),
      )
      .map((ClipRect clip) => clip.clipper!.getClip(const Size(100, 100)).width / 100)
      .toList();
}

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  testWidgets('is a radio group with one named radio per score', (WidgetTester tester) async {
    final SemanticsHandle semantics = tester.ensureSemantics();

    await tester.pumpWidget(host(const MPRating(initialValue: 3)));

    final SemanticsNode group = semanticsNodeLabelled(tester, 'Rating')!;
    expect(group.getSemanticsData().role, SemanticsRole.radioGroup);

    for (int score = 1; score <= 5; score += 1) {
      final SemanticsData radio = semanticsNodeLabelled(
        tester,
        '$score out of 5',
      )!.getSemanticsData();
      expect(radio.flagsCollection.isInMutuallyExclusiveGroup, isTrue);
      expect(
        radio.flagsCollection.isChecked,
        score == 3 ? CheckedState.isTrue : CheckedState.isFalse,
      );
    }
    semantics.dispose();
  });

  testWidgets('takes a score when a star is pressed', (WidgetTester tester) async {
    await tester.pumpWidget(host(const _Controlled()));
    await tester.tap(_star(3));
    await tester.pump();

    expect(_scoreOf(tester), 4);
  });

  testWidgets('leaves a controlled rating where the caller put it', (WidgetTester tester) async {
    final List<double> changes = <double>[];

    await tester.pumpWidget(host(MPRating(value: 2, onChanged: changes.add)));
    await tester.tap(_star(4));
    await tester.pumpAndSettle();

    expect(changes, <double>[5]);
    expect(_fills(tester), <double>[1, 1, 0, 0, 0]);
  });

  testWidgets('clears back to nothing when the chosen score is chosen again', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(host(const _Controlled(initial: 3)));
    await tester.tap(_star(2));
    await tester.pump();

    expect(_scoreOf(tester), 0);
  });

  testWidgets('keeps the score when clearing is turned off', (WidgetTester tester) async {
    await tester.pumpWidget(host(const _Controlled(initial: 3, clearable: false)));
    await tester.tap(_star(2));
    await tester.pump();

    expect(_scoreOf(tester), 3);
  });

  testWidgets('offers half a star at a time when asked', (WidgetTester tester) async {
    await tester.pumpWidget(host(const _Controlled(precision: 0.5)));

    final Rect star = tester.getRect(_star(2));
    await tester.tapAt(Offset(star.left + star.width / 4, star.center.dy));
    await tester.pump();

    expect(_scoreOf(tester), 2.5);
  });

  testWidgets('draws a fraction it was handed at every precision', (WidgetTester tester) async {
    await tester.pumpWidget(host(const MPRating(value: 4.3, readOnly: true)));
    await tester.pumpAndSettle();

    final List<double> fills = _fills(tester);
    expect(fills.take(4), <double>[1, 1, 1, 1]);
    expect(fills[4], moreOrLessEquals(0.3));
  });

  testWidgets('falls back to whole stars for a precision outside one', (WidgetTester tester) async {
    await tester.pumpWidget(host(const _Controlled(precision: 2)));

    final Rect star = tester.getRect(_star(1));
    await tester.tapAt(Offset(star.left + 2, star.center.dy));
    await tester.pump();

    expect(_scoreOf(tester), 2);
  });

  testWidgets('takes as many stars as it was asked for', (WidgetTester tester) async {
    await tester.pumpWidget(host(const MPRating(count: 10)));

    expect(find.byType(ClipRect), findsNWidgets(10));
  });

  testWidgets('moves the score with the arrow keys', (WidgetTester tester) async {
    final FocusNode focus = FocusNode();
    addTearDown(focus.dispose);

    await tester.pumpWidget(host(_Controlled(initial: 2, focusNode: focus)));
    focus.requestFocus();
    await tester.pump();

    await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
    await tester.pump();
    expect(_scoreOf(tester), 3);

    await tester.sendKeyEvent(LogicalKeyboardKey.end);
    await tester.pump();
    expect(_scoreOf(tester), 5);

    await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
    await tester.pump();
    expect(_scoreOf(tester), 4);
  });

  testWidgets('is one image with a sentence for a name once read only', (
    WidgetTester tester,
  ) async {
    final SemanticsHandle semantics = tester.ensureSemantics();

    await tester.pumpWidget(host(const MPRating(value: 4.3, readOnly: true)));

    final SemanticsData data = semanticsNodeLabelled(tester, '4.3 out of 5')!.getSemanticsData();
    expect(data.flagsCollection.isImage, isTrue);
    expect(semanticsLabels(tester).where((String label) => label.contains('out of')), hasLength(1));
    semantics.dispose();
  });

  testWidgets('says so when nothing has been chosen', (WidgetTester tester) async {
    final SemanticsHandle semantics = tester.ensureSemantics();

    await tester.pumpWidget(host(const MPRating(readOnly: true)));

    expect(semanticsNodeLabelled(tester, 'Not rated'), isNotNull);
    semantics.dispose();
  });

  testWidgets('keeps its colour while read only, and drops it while disabled', (
    WidgetTester tester,
  ) async {
    Color? fullInk() {
      return tester
          .widgetList<MPGlyph>(find.byType(MPGlyph))
          .where((MPGlyph glyph) => glyph.shape == MPGlyphShape.star)
          .map((MPGlyph glyph) {
            return IconTheme.of(tester.element(find.byWidget(glyph))).color;
          })
          .first;
    }

    await tester.pumpWidget(host(const MPRating(value: 4, readOnly: true)));
    await tester.pumpAndSettle();
    expect(fullInk(), light.primary);

    await tester.pumpWidget(host(const MPRating(value: 4, disabled: true)));
    await tester.pumpAndSettle();
    expect(fullInk(), light.onSurface.withValues(alpha: 0.38));
  });

  testWidgets('says it in the language it was given', (WidgetTester tester) async {
    registerMPMessages(<MPLocale>[ko]);
    addTearDown(resetMPMessages);
    final SemanticsHandle semantics = tester.ensureSemantics();

    await tester.pumpWidget(host(const MPRating(locale: 'ko', initialValue: 3)));

    expect(semanticsLabels(tester), isNot(contains('Rating')));
    semantics.dispose();
  });

  testWidgets('takes a caller’s word over the translation', (WidgetTester tester) async {
    final SemanticsHandle semantics = tester.ensureSemantics();

    await tester.pumpWidget(
      host(const MPRating(labels: <String, String>{'label': 'Score'}, initialValue: 1)),
    );

    expect(semanticsNodeLabelled(tester, 'Score'), isNotNull);
    semantics.dispose();
  });

  testWidgets('draws one star at the size the rung asks for', (WidgetTester tester) async {
    final List<double> stars = <double>[];

    for (final MPSize size in MPSize.values) {
      await tester.pumpWidget(host(MPRating(size: size)));
      stars.add(tester.getSize(_star(0)).width);
    }

    expect(stars, <double>[16, 20, 24, 30, 36]);
  });

  testWidgets('fills from the right under right-to-left', (WidgetTester tester) async {
    await tester.pumpWidget(
      host(textDirection: TextDirection.rtl, const MPRating(value: 0.5, readOnly: true)),
    );
    await tester.pumpAndSettle();

    final ClipRect clip = tester.widgetList<ClipRect>(find.byType(ClipRect)).first;
    expect(clip.clipper!.getClip(const Size(100, 100)).left, 50);
  });

  testWidgets('travels to the score rather than jumping to it', (WidgetTester tester) async {
    await tester.pumpWidget(host(const MPRating(value: 0)));
    await tester.pumpWidget(host(const MPRating(value: 1)));
    await tester.pump(const Duration(milliseconds: 50));

    expect(_fills(tester).first, inExclusiveRange(0, 1));

    await tester.pumpAndSettle();
    expect(_fills(tester).first, 1);
  });
}
