import 'dart:ui' show ImageFilter, Tristate;

import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/locales.dart';
import 'package:material_plus_ui/src/components/button/mp_button.dart';
import 'package:material_plus_ui/src/components/locale/mp_locale_provider.dart';
import 'package:material_plus_ui/src/components/spoiler/mp_spoiler.dart';
// Reached directly: the tests are the one caller allowed to listen in.
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The React suite reads `inert` and the `filter` off the content element;
/// this reads the [ImageFiltered] the content is drawn through, and asks the
/// semantics tree, the focus system and the pointer what they can reach.

final Finder _spoiler = find.byType(MPSpoiler);

ImageFiltered _filter(WidgetTester tester) {
  return tester.widget<ImageFiltered>(
    find.descendant(of: _spoiler, matching: find.byType(ImageFiltered)),
  );
}

/// Whether the content is out of reach: off the semantics tree, out of the
/// focus order and deaf to the pointer.
bool _inert(WidgetTester tester) {
  final ExcludeSemantics semantics = tester.widget<ExcludeSemantics>(
    find.descendant(of: _spoiler, matching: find.byType(ExcludeSemantics)).first,
  );
  final ExcludeFocus focus = tester.widget<ExcludeFocus>(
    find.descendant(of: _spoiler, matching: find.byType(ExcludeFocus)).first,
  );
  final IgnorePointer pointer = tester.widget<IgnorePointer>(
    find.descendant(of: _spoiler, matching: find.byType(IgnorePointer)).first,
  );

  return semantics.excluding && focus.excluding && pointer.ignoring;
}

Finder _button(String label) => find.widgetWithText(MPButton, label);

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('covered', () {
    testWidgets('blurs the content rather than removing it', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(width: 400, const MPSpoiler(child: Text('She was his sister.'))),
      );

      expect(find.text('She was his sister.'), findsOneWidget);
      expect(_filter(tester).enabled, isTrue);
      expect(_filter(tester).imageFilter, ImageFilter.blur(sigmaX: 10, sigmaY: 10));
    });

    testWidgets('takes the content out of reach entirely', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(width: 400, const MPSpoiler(child: Text('A secret'))));

      expect(_inert(tester), isTrue);
      expect(semanticsLabels(tester), isNot(contains('A secret')));
      semantics.dispose();
    });

    testWidgets('keeps a focusable thing inside out of the focus order', (
      WidgetTester tester,
    ) async {
      final FocusNode before = FocusNode();
      final FocusNode inside = FocusNode();
      addTearDown(before.dispose);
      addTearDown(inside.dispose);

      await tester.pumpWidget(
        host(
          width: 400,
          afterFocusStop(
            before,
            MPSpoiler(
              child: Focus(focusNode: inside, child: const Text('A link nobody should reach')),
            ),
          ),
        ),
      );

      before.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();

      expect(inside.hasFocus, isFalse);
    });

    testWidgets('keeps covered words out of a selection, and lets them back in', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(width: 400, const MPSpoiler(child: Text('Hidden'))));

      expect(
        find.descendant(of: _spoiler, matching: find.byType(SelectionContainer)),
        findsOneWidget,
      );

      await tester.tap(_button('Reveal'));
      await tester.pumpAndSettle();

      expect(
        find.descendant(of: _spoiler, matching: find.byType(SelectionContainer)),
        findsNothing,
      );
    });

    testWidgets('keeps what the content holds across a reveal', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 400, const MPSpoiler(child: _Counter())));

      final _CounterState before = tester.state<_CounterState>(find.byType(_Counter));
      before.count = 3;

      await tester.tap(_button('Reveal'));
      await tester.pumpAndSettle();

      expect(identical(tester.state<_CounterState>(find.byType(_Counter)), before), isTrue);
      expect(tester.state<_CounterState>(find.byType(_Counter)).count, 3);
    });

    testWidgets('writes the notice and the button on the cover', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 400, const MPSpoiler(child: Text('Hidden'))));

      expect(find.text('Hidden so it is not read by accident'), findsOneWidget);
      expect(_button('Reveal'), findsOneWidget);
    });

    testWidgets('lays a wash of the page’s surface over the blur', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 400, const MPSpoiler(child: Text('Hidden'))));

      final ColoredBox scrim = tester.widget<ColoredBox>(
        find.descendant(of: _spoiler, matching: find.byType(ColoredBox)).first,
      );

      expect(scrim.color, light.surface.withValues(alpha: 0.55));
    });

    testWidgets('takes a cover with nothing written on it', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(width: 400, const MPSpoiler(showDescription: false, child: Text('Hidden'))),
      );

      expect(find.text('Hidden so it is not read by accident'), findsNothing);
      expect(_button('Reveal'), findsOneWidget);
    });

    testWidgets('clamps a long spoiler when told a height', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 400,
          const MPSpoiler(
            maxHeight: 80,
            showDescription: false,
            child: SizedBox(height: 400, child: Text('Long')),
          ),
        ),
      );

      final ConstrainedBox clamp = tester.widget<ConstrainedBox>(
        find
            .descendant(
              of: _spoiler,
              matching: find.byWidgetPredicate(
                (Widget widget) => widget is ConstrainedBox && widget.constraints.maxHeight == 80,
              ),
            )
            .first,
      );

      expect(clamp.constraints.maxHeight, 80);
      expect(tester.getSize(_spoiler).height, lessThan(400));
    });

    testWidgets('is an outlined sheet by default', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 400, const MPSpoiler(child: Text('Hidden'))));

      final DecoratedBox sheet = tester.widget<DecoratedBox>(
        find.descendant(of: _spoiler, matching: find.byType(DecoratedBox)).first,
      );
      final BoxDecoration decoration = sheet.decoration as BoxDecoration;

      expect((decoration.border! as Border).top.color, light.outlineVariant);
      expect(decoration.borderRadius, BorderRadius.circular(12));
    });
  });

  group('revealing', () {
    testWidgets('uncovers the content when the button is pressed', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(width: 400, const MPSpoiler(child: Text('She was his sister.'))),
      );

      await tester.tap(_button('Reveal'));
      await tester.pumpAndSettle();

      expect(_inert(tester), isFalse);
      expect(_filter(tester).enabled, isFalse);
      expect(_button('Reveal'), findsNothing);
      expect(semanticsLabels(tester), contains('She was his sister.'));
      semantics.dispose();
    });

    testWidgets('eases the blur away rather than dropping it', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 400, const MPSpoiler(child: Text('Hidden'))));

      await tester.tap(_button('Reveal'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      expect(_filter(tester).enabled, isTrue);
      expect(_filter(tester).imageFilter, isNot(ImageFilter.blur(sigmaX: 10, sigmaY: 10)));
    });

    testWidgets('reports the change', (WidgetTester tester) async {
      final List<bool> changes = <bool>[];

      await tester.pumpWidget(
        host(width: 400, MPSpoiler(onRevealedChange: changes.add, child: const Text('Hidden'))),
      );

      await tester.tap(_button('Reveal'));

      expect(changes, <bool>[true]);
    });

    testWidgets('stays where a controlled caller put it', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(width: 400, const MPSpoiler(revealed: false, child: Text('Hidden'))),
      );

      await tester.tap(_button('Reveal'));
      await tester.pumpAndSettle();

      expect(_inert(tester), isTrue);
    });

    testWidgets('releases the clamp once it is open', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 400,
          const MPSpoiler(
            initialRevealed: true,
            maxHeight: 80,
            child: SizedBox(height: 400, child: Text('Long')),
          ),
        ),
      );

      expect(tester.getSize(_spoiler).height, greaterThan(400));
    });

    testWidgets('holds its height across a reveal and a hide', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(width: 600, const MPSpoiler(reversible: true, child: Text('One short line.'))),
      );

      final double covered = tester.getSize(_spoiler).height;

      await tester.tap(_button('Reveal'));
      await tester.pumpAndSettle();
      expect(tester.getSize(_spoiler).height, covered);

      await tester.tap(_button('Hide'));
      await tester.pumpAndSettle();
      expect(tester.getSize(_spoiler).height, covered);
    });

    testWidgets('keeps the reserved row out of reach while the sheet is covered', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(width: 400, const MPSpoiler(reversible: true, child: Text('Covered'))),
      );

      final Visibility row = tester.widget<Visibility>(
        find.descendant(of: _spoiler, matching: find.byType(Visibility)),
      );

      expect(row.visible, isFalse);
      expect(tester.getSize(find.byType(Visibility)).height, greaterThan(0));
      expect(semanticsLabels(tester), isNot(contains('Hide')));
      semantics.dispose();
    });

    testWidgets('grows to hold a cover that is taller than what it covers', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          width: 300,
          const MPSpoiler(
            description: Text(
              'A notice long enough to take two lines in a narrow sheet, which is what makes '
              'the cover the taller of the two.',
            ),
            child: SizedBox(height: 14, child: Text('One line.')),
          ),
        ),
      );

      final Rect sheet = tester.getRect(_spoiler);
      final Rect button = tester.getRect(_button('Reveal'));

      expect(button.bottom, lessThanOrEqualTo(sheet.bottom));
      expect(button.top, greaterThanOrEqualTo(sheet.top));
    });

    testWidgets('offers no way back until it is reversible', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(width: 400, const MPSpoiler(initialRevealed: true, child: Text('Revealed'))),
      );

      expect(find.byType(MPButton), findsNothing);
    });

    testWidgets('covers it again when it is', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 400,
          const MPSpoiler(initialRevealed: true, reversible: true, child: Text('Revealed')),
        ),
      );

      await tester.tap(_button('Hide'));
      await tester.pumpAndSettle();

      expect(_inert(tester), isTrue);
      expect(_button('Reveal'), findsOneWidget);
    });
  });

  group('the words on the cover', () {
    setUp(() => registerMPMessages(<MPLocale>[ko, ja]));
    tearDown(resetMPMessages);

    testWidgets('says them in the locale it was given', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(width: 400, const MPSpoiler(locale: 'ko', child: Text('가려진 내용'))),
      );

      expect(_button('보기'), findsOneWidget);
      expect(find.text('실수로 읽지 않도록 가려 두었습니다'), findsOneWidget);
    });

    testWidgets('follows a provider when it has no locale of its own', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 400,
          const MPLocaleProvider(
            locale: 'ja',
            child: MPSpoiler(child: Text('隠された内容')),
          ),
        ),
      );

      expect(_button('表示する'), findsOneWidget);
    });

    testWidgets('takes words of its own', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 400,
          const MPSpoiler(
            label: Text('Show the ending'),
            description: Text('Spoilers for chapter 12'),
            child: Text('Hidden'),
          ),
        ),
      );

      expect(_button('Show the ending'), findsOneWidget);
      expect(find.text('Spoilers for chapter 12'), findsOneWidget);
    });

    testWidgets('takes a control of its own instead', (WidgetTester tester) async {
      int unlocked = 0;

      await tester.pumpWidget(
        host(
          width: 400,
          MPSpoiler(
            action: MPButton(onPressed: () => unlocked++, child: const Text('Unlock')),
            child: const Text('Hidden'),
          ),
        ),
      );

      await tester.tap(_button('Unlock'));
      await tester.pumpAndSettle();

      expect(unlocked, 1);
      // The replacement is the caller's to wire up, so the content is untouched.
      expect(_inert(tester), isTrue);
    });
  });

  group('the buttons', () {
    testWidgets('say whether what they control is showing', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(width: 400, const MPSpoiler(reversible: true, child: Text('Hidden'))),
      );

      expect(
        tester.getSemantics(find.text('Reveal')).getSemanticsData().flagsCollection.isExpanded,
        Tristate.isFalse,
      );

      await tester.tap(_button('Reveal'));
      await tester.pumpAndSettle();

      expect(
        tester.getSemantics(find.text('Hide')).getSemanticsData().flagsCollection.isExpanded,
        Tristate.isTrue,
      );
      semantics.dispose();
    });

    testWidgets('read the spoiler’s family and size', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 400,
          const MPSpoiler(color: MPColor.tertiary, size: MPSize.sm, child: Text('Hidden')),
        ),
      );

      final MPButton reveal = tester.widget<MPButton>(find.byType(MPButton));

      expect(reveal.variant, MPVariant.tonal);
      expect(reveal.color, MPColor.tertiary);
      expect(reveal.size, MPSize.sm);
    });
  });
}

/// Holds a number of its own, so a test can ask whether it was built again.
class _Counter extends StatefulWidget {
  const _Counter();

  @override
  State<_Counter> createState() => _CounterState();
}

class _CounterState extends State<_Counter> {
  int count = 0;

  @override
  Widget build(BuildContext context) => Text('$count');
}
