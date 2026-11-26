import 'dart:ui' show Tristate;

import 'package:flutter/foundation.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
// Reached directly rather than through the barrel while other components are
// still being written beside this one.
import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/components/fieldset/mp_fieldset.dart';
import 'package:material_plus_ui/src/components/text_field/mp_text_field.dart';
import 'package:material_plus_ui/src/internal/field.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The same questions the React suite asks, asked the way Flutter asks them.
///
/// A browser test reads the `<input>`'s value and a class name; a widget test
/// reads the editor's controller and the render tree. Composition is driven the
/// way the engine drives it: an editing state with a composing range.

/// A parent that owns the text and does what [transform] says with each
/// change, as a React parent's `onChange` does.
class _Parent extends StatefulWidget {
  const _Parent({this.transform, this.onChanged, this.build});

  final String Function(String next)? transform;
  final ValueChanged<String>? onChanged;
  final Widget Function(String value, ValueChanged<String> onChanged)? build;

  @override
  State<_Parent> createState() => _ParentState();
}

class _ParentState extends State<_Parent> {
  String value = '';

  void reset(String next) => setState(() => value = next);

  void _changed(String next) {
    widget.onChanged?.call(next);
    setState(() => value = widget.transform?.call(next) ?? next);
  }

  @override
  Widget build(BuildContext context) {
    return widget.build?.call(value, _changed) ??
        MPTextField(label: const Text('Name'), value: value, onChanged: _changed, fullWidth: true);
  }
}

TextEditingController _controllerOf(WidgetTester tester) {
  return tester.widget<EditableText>(find.byType(EditableText)).controller;
}

String _shown(WidgetTester tester) => _controllerOf(tester).text;

/// Sends the editing state the engine sends while an input method composes
/// [text], the whole of it still provisional.
void _compose(WidgetTester tester, String text) {
  tester.testTextInput.updateEditingValue(
    TextEditingValue(
      text: text,
      selection: TextSelection.collapsed(offset: text.length),
      composing: TextRange(start: 0, end: text.length),
    ),
  );
}

/// Sends the editing state that commits [text]: the same characters with no
/// composing range left.
void _commit(WidgetTester tester, String text) {
  tester.testTextInput.updateEditingValue(
    TextEditingValue(
      text: text,
      selection: TextSelection.collapsed(offset: text.length),
    ),
  );
}

/// What an input method has written while a composition is open: the whole
/// text, with the caret at the end of the part still being composed.
TextEditingValue _composing(String text, int start, int end) {
  return TextEditingValue(
    text: text,
    selection: TextSelection.collapsed(offset: end),
    composing: TextRange(start: start, end: end),
  );
}

/// What it has written once nothing is being composed.
TextEditingValue _committed(String text) {
  return TextEditingValue(
    text: text,
    selection: TextSelection.collapsed(offset: text.length),
  );
}

/// What the Windows engine sends as a composition starts, before the input
/// method has written anything into it: the text as it was, with an empty
/// composition at the caret.
TextEditingValue _compositionStarts(String text) {
  return TextEditingValue(
    text: text,
    selection: TextSelection.collapsed(offset: text.length),
    composing: TextRange.collapsed(text.length),
  );
}

/// The label's laid-out text style, by the words it shows.
TextStyle _labelStyle(WidgetTester tester, String label) => styleOf(tester, label);

/// Where the label's middle is, measured from the top of the shell.
double _labelMiddle(WidgetTester tester, String label) {
  final Rect shell = tester.getRect(find.byType(MPFieldShell));

  return tester.getCenter(find.text(label)).dy - shell.top;
}

Future<void> _focus(WidgetTester tester) async {
  await tester.tap(find.byType(EditableText));
  await tester.pumpAndSettle();
}

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('rendering', () {
    testWidgets('shows the value it is given', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(const MPTextField(label: Text('Email'), value: 'ada@example.com')),
      );

      expect(_shown(tester), 'ada@example.com');
    });

    testWidgets('shows a value changed on rebuild', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPTextField(label: Text('Email'), value: 'a')));
      await tester.pumpWidget(host(const MPTextField(label: Text('Email'), value: 'b')));

      expect(_shown(tester), 'b');
    });

    testWidgets('renders without a label', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPTextField(value: '', semanticLabel: 'Filter')));

      expect(find.byType(EditableText), findsOneWidget);
    });

    testWidgets('renders a leading adornment before the text', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 300,
          const MPTextField(
            label: Text('Search'),
            value: 'x',
            fullWidth: true,
            startIcon: SizedBox(key: Key('icon'), width: 20, height: 20),
          ),
        ),
      );

      expect(
        tester.getCenter(find.byKey(const Key('icon'))).dx,
        lessThan(tester.getTopLeft(find.byType(EditableText)).dx),
      );
    });

    testWidgets('draws at Material’s own size by default', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPTextField(label: Text('Email'), value: '')));

      expect(tester.getSize(find.byType(MPFieldShell)).height, 56);
    });

    testWidgets('grows monotonically across the size ladder', (WidgetTester tester) async {
      final List<double> heights = <double>[];

      for (final MPSize size in MPSize.values) {
        await tester.pumpWidget(
          host(MPTextField(label: const Text('Email'), value: '', size: size)),
        );
        heights.add(tester.getSize(find.byType(MPFieldShell)).height);
      }

      expect(heights, <double>[32, 40, 56, 64, 72]);
    });

    testWidgets('takes its size from an MPConfigProvider', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const MPConfigProvider(
            size: MPSize.sm,
            child: MPTextField(label: Text('Email'), value: ''),
          ),
        ),
      );

      expect(tester.getSize(find.byType(MPFieldShell)).height, 40);
    });

    testWidgets('stretches to the container when fullWidth', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(width: 320, const MPTextField(label: Text('Email'), value: '', fullWidth: true)),
      );

      expect(tester.getSize(find.byType(MPFieldShell)).width, 320);
    });

    testWidgets('keeps one width as it is typed into', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPTextField(label: Text('Email'), value: '')));
      final double empty = tester.getSize(find.byType(MPFieldShell)).width;

      await tester.pumpWidget(
        host(const MPTextField(label: Text('Email'), value: 'a long address')),
      );

      expect(tester.getSize(find.byType(MPFieldShell)).width, empty);
    });

    testWidgets('draws the corner-extra-small outline in `outline`', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPTextField(label: Text('Email'), value: '')));

      expect(
        find.byType(MPFieldShell),
        paints..rrect(color: light.outline, strokeWidth: 1, style: PaintingStyle.stroke),
      );
    });
  });

  group('the floating label', () {
    testWidgets('rests on the field’s line while it is empty and unfocused', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(const MPTextField(label: Text('Email'), value: '')));

      expect(_labelStyle(tester, 'Email').fontSize, 16);
      expect(_labelMiddle(tester, 'Email'), moreOrLessEquals(28, epsilon: 0.5));
    });

    testWidgets('lifts on focus and comes back down on blur', (WidgetTester tester) async {
      final FocusNode focus = FocusNode();
      addTearDown(focus.dispose);

      await tester.pumpWidget(
        host(MPTextField(label: const Text('Email'), value: '', focusNode: focus)),
      );

      focus.requestFocus();
      await tester.pumpAndSettle();

      expect(_labelStyle(tester, 'Email').fontSize, 12);
      expect(_labelMiddle(tester, 'Email'), moreOrLessEquals(0, epsilon: 0.5));

      focus.unfocus();
      await tester.pumpAndSettle();

      expect(_labelStyle(tester, 'Email').fontSize, 16);
    });

    testWidgets('keeps it up once there is text, focused or not', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPTextField(label: Text('Email'), value: 'a')));

      expect(_labelStyle(tester, 'Email').fontSize, 12);
    });

    testWidgets('cuts the notch only while the label is up', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPTextField(label: Text('Email'), value: '')));

      expect(find.byType(MPFieldShell), isNot(paints..clipRect()));

      await tester.pumpWidget(host(const MPTextField(label: Text('Email'), value: 'a')));
      await tester.pumpAndSettle();

      expect(find.byType(MPFieldShell), paints..clipRect());
    });

    testWidgets('stays up while the password toggle has the focus', (WidgetTester tester) async {
      final FocusNode before = FocusNode();
      addTearDown(before.dispose);

      await tester.pumpWidget(
        host(
          afterFocusStop(
            before,
            const MPTextField(label: Text('Password'), value: '', type: MPTextFieldType.password),
          ),
        ),
      );

      before.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pumpAndSettle();

      expect(holdsFocus(tester, find.byType(MPFieldIconButton)), isTrue);
      expect(_labelStyle(tester, 'Password').fontSize, 12);
    });

    testWidgets('withholds the placeholder until the label is out of its way', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(const MPTextField(label: Text('Email'), value: '', placeholder: 'you@example.com')),
      );

      Visibility placeholder() => tester.widget<Visibility>(
        find.ancestor(of: find.text('you@example.com'), matching: find.byType(Visibility)),
      );

      expect(placeholder().visible, isFalse);

      await _focus(tester);

      expect(placeholder().visible, isTrue);
    });

    testWidgets('waits for the rising label to clear the line before it shows the placeholder', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(const MPTextField(label: Text('Email'), value: '', placeholder: 'you@example.com')),
      );

      Visibility placeholder() => tester.widget<Visibility>(
        find.ancestor(of: find.text('you@example.com'), matching: find.byType(Visibility)),
      );

      await tester.tap(find.byType(EditableText));
      await tester.pump();

      // The label has been told to rise and is still on the line: for the
      // first part of its way up the two were drawn over each other.
      expect(placeholder().visible, isFalse);

      await tester.pump(const Duration(milliseconds: 40));

      expect(placeholder().visible, isFalse);

      await tester.pump(const Duration(milliseconds: 80));

      expect(placeholder().visible, isTrue);

      await tester.pumpAndSettle();

      expect(placeholder().visible, isTrue);
    });

    testWidgets('takes the placeholder away while the label is on its way down', (
      WidgetTester tester,
    ) async {
      final FocusNode focus = FocusNode();
      addTearDown(focus.dispose);

      await tester.pumpWidget(
        host(
          MPTextField(
            label: const Text('Email'),
            value: '',
            placeholder: 'you@example.com',
            focusNode: focus,
          ),
        ),
      );

      Visibility placeholder() => tester.widget<Visibility>(
        find.ancestor(of: find.text('you@example.com'), matching: find.byType(Visibility)),
      );

      focus.requestFocus();
      await tester.pumpAndSettle();

      expect(placeholder().visible, isTrue);

      focus.unfocus();
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 16));

      // Gone before the label is back on the line, rather than once it is.
      expect(_labelStyle(tester, 'Email').fontSize, lessThan(16));
      expect(placeholder().visible, isFalse);
    });

    testWidgets('shows the placeholder at once with no label to rest', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(const MPTextField(value: '', semanticLabel: 'Email', placeholder: 'you@example.com')),
      );

      expect(
        tester
            .widget<Visibility>(
              find.ancestor(of: find.text('you@example.com'), matching: find.byType(Visibility)),
            )
            .visible,
        isTrue,
      );
    });

    testWidgets('is pinned in the notch by a start adornment', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const MPTextField(
            label: Text('Search'),
            value: '',
            startIcon: SizedBox(width: 20, height: 20),
          ),
        ),
      );

      expect(_labelStyle(tester, 'Search').fontSize, 12);
    });

    testWidgets('is pinned in the notch by floatingLabel: false', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(const MPTextField(label: Text('Email'), value: '', floatingLabel: false)),
      );

      expect(_labelStyle(tester, 'Email').fontSize, 12);
    });

    testWidgets('lets a press on the resting label reach the field', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPTextField(label: Text('Email'), value: '')));

      await tester.tap(find.text('Email'));
      await tester.pumpAndSettle();

      expect(holdsFocus(tester, find.byType(EditableText)), isTrue);
    });

    testWidgets('rests on the first line of a multiline field', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPTextField(label: Text('Bio'), value: '', rows: 4)));

      expect(_labelMiddle(tester, 'Bio'), moreOrLessEquals(20, epsilon: 0.5));
    });

    testWidgets('arrives at once under reduced motion', (WidgetTester tester) async {
      final FocusNode focus = FocusNode();
      addTearDown(focus.dispose);

      await tester.pumpWidget(
        host(
          disableAnimations: true,
          MPTextField(label: const Text('Email'), value: '', focusNode: focus),
        ),
      );

      focus.requestFocus();
      await tester.pump();
      await tester.pump();

      expect(_labelStyle(tester, 'Email').fontSize, 12);
    });

    testWidgets('starts from the end under RTL', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 300,
          textDirection: TextDirection.rtl,
          const MPTextField(label: Text('Email'), value: 'a', fullWidth: true),
        ),
      );

      final Rect shell = tester.getRect(find.byType(MPFieldShell));
      final Rect label = tester.getRect(find.text('Email'));

      // The inset is the padding less the label's own four pixels of air.
      expect(shell.right - label.right, moreOrLessEquals(16, epsilon: 0.5));
    });
  });

  group('changing', () {
    testWidgets('hands the parent the text rather than an event', (WidgetTester tester) async {
      String? received;

      await tester.pumpWidget(host(_Parent(onChanged: (String next) => received = next)));
      await tester.enterText(find.byType(EditableText), 'ada');

      expect(received, 'ada');
    });

    testWidgets('calls onFormReset before every change', (WidgetTester tester) async {
      final List<String> calls = <String>[];

      await tester.pumpWidget(
        host(
          _Parent(
            build: (String value, ValueChanged<String> onChanged) => MPTextField(
              value: value,
              semanticLabel: 'Name',
              onFormReset: () => calls.add('reset'),
              onChanged: (String next) {
                calls.add('change');
                onChanged(next);
              },
            ),
          ),
        ),
      );

      await tester.enterText(find.byType(EditableText), 'a');
      await tester.pump();

      expect(calls, <String>['reset', 'change']);
    });

    testWidgets('types end to end through a controlled parent', (WidgetTester tester) async {
      await tester.pumpWidget(host(const _Parent()));
      await tester.enterText(find.byType(EditableText), 'hello');
      await tester.pump();

      expect(_shown(tester), 'hello');
      expect(tester.state<_ParentState>(find.byType(_Parent)).value, 'hello');
    });

    testWidgets('shows what the parent kept, not what was typed', (WidgetTester tester) async {
      await tester.pumpWidget(host(_Parent(transform: (String next) => next.toUpperCase())));

      await tester.enterText(find.byType(EditableText), 'abc');
      await tester.pump();

      expect(_shown(tester), 'ABC');
    });

    testWidgets('puts back a change the parent turned down', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(MPTextField(label: const Text('Name'), value: 'fixed', onChanged: (String next) {})),
      );

      await tester.enterText(find.byType(EditableText), 'other');
      await tester.pump();

      expect(_shown(tester), 'fixed');
    });
  });

  group('composition', () {
    testWidgets('shows what is being composed, not what the parent kept', (
      WidgetTester tester,
    ) async {
      // The parent keeps nothing at all, which a plainly controlled field would
      // write straight back over the syllable being built.
      await tester.pumpWidget(host(_Parent(transform: (String next) => '')));
      await _focus(tester);

      _compose(tester, 'ㅎ');
      await tester.pump();
      _compose(tester, '하');
      await tester.pump();
      _compose(tester, '한');
      await tester.pump();

      expect(_shown(tester), '한');
      expect(_controllerOf(tester).value.composing, const TextRange(start: 0, end: 1));
    });

    testWidgets('reports every keystroke of a composition', (WidgetTester tester) async {
      final List<String> received = <String>[];

      await tester.pumpWidget(host(_Parent(onChanged: received.add)));
      await _focus(tester);

      for (final String step in <String>['ㅎ', '하', '한']) {
        _compose(tester, step);
        await tester.pump();
      }

      expect(received, <String>['ㅎ', '하', '한']);
    });

    testWidgets('hands the parent the committed text when the composition ends', (
      WidgetTester tester,
    ) async {
      final List<String> received = <String>[];

      await tester.pumpWidget(host(_Parent(onChanged: received.add)));
      await _focus(tester);

      _compose(tester, 'か');
      await tester.pump();
      _commit(tester, '火');
      await tester.pump();

      expect(received.last, '火');
    });

    testWidgets('reports a commit that changes nothing but the composing range', (
      WidgetTester tester,
    ) async {
      final List<String> calls = <String>[];

      await tester.pumpWidget(
        host(
          _Parent(
            build: (String value, ValueChanged<String> onChanged) => MPTextField(
              value: value,
              semanticLabel: 'Name',
              onFormReset: () => calls.add('reset'),
              onChanged: (String next) {
                calls.add(next);
                onChanged(next);
              },
            ),
          ),
        ),
      );
      await _focus(tester);

      // The parent turned the composing text down, so the commit is news to it.
      _compose(tester, '한');
      await tester.pump();
      tester.state<_ParentState>(find.byType(_Parent)).reset('');
      await tester.pump();
      calls.clear();

      _commit(tester, '한');
      await tester.pump();

      expect(calls, <String>['reset', '한']);
    });

    testWidgets('is controlled again once the composition ends', (WidgetTester tester) async {
      await tester.pumpWidget(host(_Parent(transform: (String next) => next.toUpperCase())));
      await _focus(tester);

      _compose(tester, 'k');
      await tester.pump();

      expect(_shown(tester), 'k');

      _commit(tester, 'ka');
      await tester.pumpAndSettle();

      expect(_shown(tester), 'KA');
    });

    testWidgets('takes a value the parent changed during a composition once it ends', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(const _Parent()));
      await _focus(tester);

      _compose(tester, '하');
      await tester.pump();

      tester.state<_ParentState>(find.byType(_Parent)).reset('from the server');
      await tester.pump();

      expect(_shown(tester), '하');

      // The commit is reported, and the parent takes it over its own reset.
      _commit(tester, '한');
      await tester.pumpAndSettle();

      expect(_shown(tester), '한');
    });

    testWidgets('sends the platform nothing while it composes', (WidgetTester tester) async {
      await tester.pumpWidget(host(_Parent(transform: (String next) => next.toUpperCase())));
      await _focus(tester);
      tester.testTextInput.log.clear();

      _compose(tester, 'k');
      await tester.pumpAndSettle();

      expect(
        tester.testTextInput.log.where(
          (MethodCall call) => call.method == 'TextInput.setEditingState',
        ),
        isEmpty,
      );
    });
  });

  // The values are sent in the order the engines send them, as their sources
  // have it. The Windows engine sends an empty composition as one starts, and a
  // syllable the Korean input method finishes arrives with the one it starts
  // next. The macOS engine sends a finished syllable on its own, as text that is
  // no longer being composed.
  group('maxLength while an input method composes', () {
    /// A parent that keeps every change, around a field capped at [maxLength].
    Widget capped(
      int maxLength, {
      MaxLengthEnforcement? enforcement,
      ValueChanged<String>? onChanged,
    }) {
      return _Parent(
        onChanged: onChanged,
        build: (String value, ValueChanged<String> changed) {
          // Left out rather than passed, so the default is what is tested.
          if (enforcement == null) {
            return MPTextField(
              label: const Text('Name'),
              value: value,
              onChanged: changed,
              maxLength: maxLength,
              fullWidth: true,
            );
          }

          return MPTextField(
            label: const Text('Name'),
            value: value,
            onChanged: changed,
            maxLength: maxLength,
            maxLengthEnforcement: enforcement,
            fullWidth: true,
          );
        },
      );
    }

    Future<void> pumpFocused(WidgetTester tester, Widget field, {String initial = ''}) async {
      await tester.pumpWidget(host(field, width: 300));

      if (initial.isNotEmpty) {
        tester.state<_ParentState>(find.byType(_Parent)).reset(initial);
        await tester.pump();
      }

      await tester.showKeyboard(find.byType(EditableText));
      await tester.pump();
    }

    /// Sends [values] in turn, and checks that the field holds each one just
    /// as the input method sent it.
    Future<void> compose(WidgetTester tester, List<TextEditingValue> values) async {
      for (final TextEditingValue value in values) {
        tester.testTextInput.updateEditingValue(value);
        await tester.pump();

        expect(
          _controllerOf(tester).value,
          value,
          reason: 'the input method holds "${value.text}"',
        );
      }
    }

    /// Ends the composition with [text], and lets the parent answer.
    Future<void> endComposition(WidgetTester tester, String text) async {
      tester.testTextInput.updateEditingValue(_committed(text));
      await tester.pumpAndSettle();
    }

    String parentValue(WidgetTester tester) =>
        tester.state<_ParentState>(find.byType(_Parent)).value;

    testWidgets('on Windows, takes in a syllable typed past a full field until it is finished', (
      WidgetTester tester,
    ) async {
      debugDefaultTargetPlatformOverride = TargetPlatform.windows;

      try {
        final List<String> changes = <String>[];

        await pumpFocused(tester, capped(2, onChanged: changes.add));

        // 한글 and then 마. ㄱ and ㅁ cannot join the syllable before them, so
        // each finishes that syllable and starts the next.
        await compose(tester, <TextEditingValue>[
          _compositionStarts(''),
          _composing('ㅎ', 0, 1),
          _composing('하', 0, 1),
          _composing('한', 0, 1),
          _composing('한ㄱ', 1, 2),
          _composing('한그', 1, 2),
          _composing('한글', 1, 2),
          _composing('한글ㅁ', 2, 3),
          _composing('한글마', 2, 3),
        ]);
        await endComposition(tester, '한글마');

        expect(_controllerOf(tester).value, _committed('한글'));
        expect(parentValue(tester), '한글');
        expect(changes, <String>['ㅎ', '하', '한', '한ㄱ', '한그', '한글', '한글ㅁ', '한글마', '한글']);
      } finally {
        debugDefaultTargetPlatformOverride = null;
      }
    });

    testWidgets(
      'on Windows, shows a syllable that splits at the limit whole until it is finished',
      (WidgetTester tester) async {
        debugDefaultTargetPlatformOverride = TargetPlatform.windows;

        try {
          await pumpFocused(tester, capped(2));

          // ㅏ after 글한 takes the ㄴ off 한 for a syllable of its own, so the
          // input method finishes 하 and starts 나.
          await compose(tester, <TextEditingValue>[
            _compositionStarts(''),
            _composing('ㄱ', 0, 1),
            _composing('그', 0, 1),
            _composing('글', 0, 1),
            _composing('글ㅎ', 1, 2),
            _composing('글하', 1, 2),
            _composing('글한', 1, 2),
            _composing('글하나', 2, 3),
          ]);
          await endComposition(tester, '글하나');

          expect(_controllerOf(tester).value, _committed('글하'));
          expect(parentValue(tester), '글하');
        } finally {
          debugDefaultTargetPlatformOverride = null;
        }
      },
    );

    testWidgets('on Windows, takes in a syllable started in a field already full', (
      WidgetTester tester,
    ) async {
      debugDefaultTargetPlatformOverride = TargetPlatform.windows;

      try {
        await pumpFocused(tester, capped(2), initial: '한글');

        await compose(tester, <TextEditingValue>[
          _compositionStarts('한글'),
          _composing('한글ㅁ', 2, 3),
          _composing('한글마', 2, 3),
        ]);
        await endComposition(tester, '한글마');

        expect(_controllerOf(tester).value, _committed('한글'));
        expect(parentValue(tester), '한글');
      } finally {
        debugDefaultTargetPlatformOverride = null;
      }
    });

    testWidgets('on Windows, held to the limit, turns away a syllable the input method keeps', (
      WidgetTester tester,
    ) async {
      // The field goes back to 글 being composed while the input method composes
      // ㅁ, and Windows is never told: what the input method sends next is
      // written over 글.
      debugDefaultTargetPlatformOverride = TargetPlatform.windows;

      try {
        await pumpFocused(tester, capped(2, enforcement: MaxLengthEnforcement.enforced));

        await compose(tester, <TextEditingValue>[
          _compositionStarts(''),
          _composing('한', 0, 1),
          _composing('한글', 1, 2),
        ]);

        tester.testTextInput.updateEditingValue(_composing('한글ㅁ', 2, 3));
        await tester.pump();

        expect(_controllerOf(tester).value, _composing('한글', 1, 2));
      } finally {
        debugDefaultTargetPlatformOverride = null;
      }
    });

    testWidgets('on macOS, turns away a syllable typed past a full field, and says so', (
      WidgetTester tester,
    ) async {
      // A composition the field turns away is sent back as text with nothing
      // being composed, and the macOS engine then discards what the input method
      // has marked, so the two keep the same text.
      debugDefaultTargetPlatformOverride = TargetPlatform.macOS;

      try {
        await pumpFocused(tester, capped(2));

        await compose(tester, <TextEditingValue>[
          _composing('ㅎ', 0, 1),
          _composing('하', 0, 1),
          _composing('한', 0, 1),
          _committed('한'),
          _composing('한ㄱ', 1, 2),
          _composing('한그', 1, 2),
          _composing('한글', 1, 2),
          _committed('한글'),
        ]);

        tester.testTextInput.log.clear();
        tester.testTextInput.updateEditingValue(_composing('한글ㅁ', 2, 3));
        await tester.pump();

        expect(_controllerOf(tester).value, _committed('한글'));

        final MethodCall sent = tester.testTextInput.log.lastWhere(
          (MethodCall call) => call.method == 'TextInput.setEditingState',
        );

        expect(
          sent.arguments,
          allOf(
            containsPair('text', '한글'),
            containsPair('composingBase', -1),
            containsPair('composingExtent', -1),
          ),
        );
      } finally {
        debugDefaultTargetPlatformOverride = null;
      }
    });

    for (final (TargetPlatform platform, String name) in <(TargetPlatform, String)>[
      (TargetPlatform.windows, 'Windows'),
      (TargetPlatform.macOS, 'macOS'),
    ]) {
      for (final (String reading, String written) in <(String, String)>[
        ('zhongguo', '中国'),
        ('にほんご', '日本語'),
      ]) {
        testWidgets('on $name, takes $reading for $written in a field of ${written.length}', (
          WidgetTester tester,
        ) async {
          // The reading is longer than the field, and what it is turned into
          // fits.
          debugDefaultTargetPlatformOverride = platform;

          try {
            await pumpFocused(tester, capped(written.length));

            final bool windows = platform == TargetPlatform.windows;

            await compose(tester, <TextEditingValue>[
              if (windows) _compositionStarts(''),
              for (int typed = 1; typed <= reading.length; typed++)
                _composing(reading.substring(0, typed), 0, typed),
              // Windows sends the chosen characters while they are still the
              // composition, and then ends it.
              if (windows) _composing(written, 0, written.length),
            ]);
            await endComposition(tester, written);

            expect(_controllerOf(tester).value, _committed(written));
            expect(parentValue(tester), written);
          } finally {
            debugDefaultTargetPlatformOverride = null;
          }
        });
      }
    }

    testWidgets('held to the limit, cannot take a reading longer than the field', (
      WidgetTester tester,
    ) async {
      debugDefaultTargetPlatformOverride = TargetPlatform.windows;

      try {
        await pumpFocused(tester, capped(2, enforcement: MaxLengthEnforcement.enforced));

        await compose(tester, <TextEditingValue>[
          _compositionStarts(''),
          _composing('z', 0, 1),
          _composing('zh', 0, 2),
        ]);

        tester.testTextInput.updateEditingValue(_composing('zho', 0, 3));
        await tester.pump();

        expect(_controllerOf(tester).value, _composing('zh', 0, 2));
      } finally {
        debugDefaultTargetPlatformOverride = null;
      }
    });

    testWidgets('on Android, lets a word the keyboard composes run past the limit until it ends', (
      WidgetTester tester,
    ) async {
      // The price of the default where a keyboard composes Latin words, as
      // Gboard does: the word is cut once it is finished.
      debugDefaultTargetPlatformOverride = TargetPlatform.android;

      try {
        await pumpFocused(tester, capped(4));

        await compose(tester, <TextEditingValue>[
          _composing('hell', 0, 4),
          _composing('hello', 0, 5),
        ]);
        await endComposition(tester, 'hello ');

        expect(_controllerOf(tester).value, _committed('hell'));
        expect(parentValue(tester), 'hell');
      } finally {
        debugDefaultTargetPlatformOverride = null;
      }
    });
  });

  group('password', () {
    testWidgets('masks the value and offers a reveal toggle', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const MPTextField(
            label: Text('Password'),
            value: 'secret',
            type: MPTextFieldType.password,
          ),
        ),
      );

      expect(tester.widget<EditableText>(find.byType(EditableText)).obscureText, isTrue);
      expect(find.bySemanticsLabel('Show the password'), findsOneWidget);
    });

    testWidgets('reveals and masks the value again', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const MPTextField(
            label: Text('Password'),
            value: 'secret',
            type: MPTextFieldType.password,
          ),
        ),
      );

      await tester.tap(find.byType(MPFieldIconButton));
      await tester.pump();

      expect(tester.widget<EditableText>(find.byType(EditableText)).obscureText, isFalse);
      expect(find.bySemanticsLabel('Hide the password'), findsOneWidget);

      await tester.tap(find.byType(MPFieldIconButton));
      await tester.pump();

      expect(tester.widget<EditableText>(find.byType(EditableText)).obscureText, isTrue);
    });

    testWidgets('leaves the focus and the caret where they were', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const MPTextField(
            label: Text('Password'),
            value: 'secret',
            type: MPTextFieldType.password,
          ),
        ),
      );
      await _focus(tester);

      _controllerOf(tester).selection = const TextSelection.collapsed(offset: 2);
      await tester.pump();

      final TestGesture mouse = await tester.startGesture(
        tester.getCenter(find.byType(MPFieldIconButton)),
        kind: PointerDeviceKind.mouse,
      );
      await mouse.up();
      await tester.pumpAndSettle();

      expect(holdsFocus(tester, find.byType(EditableText)), isTrue);
      expect(_controllerOf(tester).selection, const TextSelection.collapsed(offset: 2));
    });

    testWidgets('has no toggle on a field that is not a password', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPTextField(label: Text('Email'), value: '')));

      expect(find.byType(MPFieldIconButton), findsNothing);
    });

    testWidgets('disables the toggle along with the field', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const MPTextField(
            label: Text('Password'),
            value: 'secret',
            type: MPTextFieldType.password,
            disabled: true,
          ),
        ),
      );

      await tester.tap(find.byType(MPFieldIconButton));
      await tester.pump();

      expect(tester.widget<EditableText>(find.byType(EditableText)).obscureText, isTrue);
    });

    testWidgets('names the toggle in the reader’s words', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const MPTextField(
            label: Text('Password'),
            value: '',
            type: MPTextFieldType.password,
            passwordLabels: <String, String>{'showPassword': 'Reveal'},
          ),
        ),
      );

      expect(find.bySemanticsLabel('Reveal'), findsOneWidget);
    });
  });

  group('multiline', () {
    testWidgets('draws as many rows as it is asked for', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPTextField(label: Text('Bio'), value: '', rows: 3)));

      final EditableText editor = tester.widget<EditableText>(find.byType(EditableText));

      expect(editor.maxLines, 3);
      expect(editor.minLines, 3);
      // Three lines of `bodyLarge` and the row's 8px above and below.
      expect(tester.getSize(find.byType(MPFieldShell)).height, 3 * 24 + 16);
    });
  });

  group('the Enter key', () {
    Future<void> pumpFocused(WidgetTester tester, Widget field) async {
      await tester.pumpWidget(host(field));
      await _focus(tester);
    }

    testWidgets('calls onSubmit and takes the key on a single-line field', (
      WidgetTester tester,
    ) async {
      int submits = 0;

      await pumpFocused(
        tester,
        MPTextField(label: const Text('Search'), value: '', onSubmit: () => submits++),
      );

      expect(await tester.sendKeyEvent(LogicalKeyboardKey.enter), isTrue);
      expect(submits, 1);
    });

    testWidgets('leaves the key alone with no onSubmit', (WidgetTester tester) async {
      await pumpFocused(tester, const MPTextField(label: Text('Search'), value: ''));

      expect(await tester.sendKeyEvent(LogicalKeyboardKey.enter), isFalse);
    });

    testWidgets('takes the key when disableEnterKey is set', (WidgetTester tester) async {
      await pumpFocused(
        tester,
        const MPTextField(label: Text('Search'), value: '', disableEnterKey: true),
      );

      expect(await tester.sendKeyEvent(LogicalKeyboardKey.enter), isTrue);
    });

    testWidgets('lets Enter through on a multiline field, and still reports it', (
      WidgetTester tester,
    ) async {
      int submits = 0;

      await pumpFocused(
        tester,
        MPTextField(label: const Text('Note'), value: '', rows: 3, onSubmit: () => submits++),
      );

      expect(await tester.sendKeyEvent(LogicalKeyboardKey.enter), isFalse);
      expect(submits, 1);
    });

    testWidgets('takes Enter on a multiline field when disableEnterKey is set', (
      WidgetTester tester,
    ) async {
      int submits = 0;

      await pumpFocused(
        tester,
        MPTextField(
          label: const Text('Note'),
          value: '',
          rows: 3,
          disableEnterKey: true,
          onSubmit: () => submits++,
        ),
      );

      expect(await tester.sendKeyEvent(LogicalKeyboardKey.enter), isTrue);
      expect(submits, 1);
      expect(
        tester.widget<EditableText>(find.byType(EditableText)).textInputAction,
        TextInputAction.done,
      );
    });

    testWidgets('ignores the Enter that commits a composition', (WidgetTester tester) async {
      int submits = 0;

      await pumpFocused(
        tester,
        MPTextField(label: const Text('Name'), value: '', onSubmit: () => submits++),
      );

      _compose(tester, '한');
      await tester.pump();

      expect(await tester.sendKeyEvent(LogicalKeyboardKey.enter), isFalse);
      expect(submits, 0);
    });

    testWidgets('submits on the Enter after a committed composition', (WidgetTester tester) async {
      int submits = 0;

      await pumpFocused(
        tester,
        MPTextField(label: const Text('Name'), value: '', onSubmit: () => submits++),
      );

      _compose(tester, '한');
      await tester.pump();
      _commit(tester, '한');
      await tester.pump();

      expect(await tester.sendKeyEvent(LogicalKeyboardKey.enter), isTrue);
      expect(submits, 1);
    });

    testWidgets('answers the keyboard’s action key and keeps the focus', (
      WidgetTester tester,
    ) async {
      int submits = 0;

      await pumpFocused(
        tester,
        MPTextField(label: const Text('Search'), value: '', onSubmit: () => submits++),
      );

      await tester.testTextInput.receiveAction(TextInputAction.done);
      await tester.pump();

      expect(submits, 1);
      expect(holdsFocus(tester, find.byType(EditableText)), isTrue);
    });

    testWidgets('lets a caller take the key first', (WidgetTester tester) async {
      int submits = 0;
      final List<LogicalKeyboardKey> heard = <LogicalKeyboardKey>[];

      await pumpFocused(
        tester,
        MPTextField(
          label: const Text('Note'),
          value: '',
          onSubmit: () => submits++,
          onKeyEvent: (FocusNode node, KeyEvent event) {
            heard.add(event.logicalKey);

            return event.logicalKey == LogicalKeyboardKey.enter
                ? KeyEventResult.handled
                : KeyEventResult.ignored;
          },
        ),
      );

      await tester.sendKeyEvent(LogicalKeyboardKey.keyA);
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);

      expect(heard, contains(LogicalKeyboardKey.keyA));
      expect(submits, 0);
    });
  });

  group('focus', () {
    testWidgets('reports the focus the control takes and the one it loses', (
      WidgetTester tester,
    ) async {
      final List<bool> changes = <bool>[];
      final FocusNode focus = FocusNode();
      addTearDown(focus.dispose);

      await tester.pumpWidget(
        host(
          MPTextField(
            label: const Text('Name'),
            value: '',
            focusNode: focus,
            onFocusChange: changes.add,
          ),
        ),
      );

      focus.requestFocus();
      await tester.pump();
      focus.unfocus();
      await tester.pump();

      expect(changes, <bool>[true, false]);
    });

    testWidgets('does not report the focus the reveal toggle takes', (WidgetTester tester) async {
      final List<bool> changes = <bool>[];
      final FocusNode before = FocusNode();
      addTearDown(before.dispose);

      await tester.pumpWidget(
        host(
          afterFocusStop(
            before,
            MPTextField(
              label: const Text('Password'),
              value: '',
              type: MPTextFieldType.password,
              onFocusChange: changes.add,
            ),
          ),
        ),
      );

      before.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();

      expect(changes, <bool>[true, false]);
      expect(holdsFocus(tester, find.byType(MPFieldIconButton)), isTrue);
    });

    testWidgets('takes the focus as it arrives when asked', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(const MPTextField(label: Text('Name'), value: '', autofocus: true)),
      );
      await tester.pump();

      expect(holdsFocus(tester, find.byType(EditableText)), isTrue);
    });

    testWidgets('does not take it in a compact window', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const MediaQuery(
            data: MediaQueryData(size: Size(400, 800)),
            child: MPTextField(label: Text('Name'), value: '', autofocus: true),
          ),
        ),
      );
      await tester.pump();

      expect(holdsFocus(tester, find.byType(EditableText)), isFalse);
    });
  });

  group('states', () {
    testWidgets('shows an error message and turns the field over', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const MPTextField(label: Text('Email'), value: 'x', errorMessage: 'Enter a valid email.'),
        ),
      );

      expect(find.text('Enter a valid email.'), findsOneWidget);
      expect(styleOf(tester, 'Enter a valid email.').color, light.error);
      expect(_labelStyle(tester, 'Email').color, light.error);
      expect(
        find.byType(MPFieldShell),
        paints..rrect(color: light.error, style: PaintingStyle.stroke),
      );
    });

    testWidgets('draws no supporting line without an error', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPTextField(label: Text('Email'), value: '')));

      expect(find.byType(Text), findsOneWidget);
    });

    testWidgets('rings the field in primary at two pixels on focus', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPTextField(label: Text('Email'), value: '')));
      await _focus(tester);

      expect(
        find.byType(MPFieldShell),
        paints..rrect(color: light.primary, strokeWidth: 2, style: PaintingStyle.stroke),
      );
      expect(_labelStyle(tester, 'Email').color, light.primary);
    });

    testWidgets('raises the outline to onSurface under the pointer', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPTextField(label: Text('Email'), value: '')));

      final TestGesture mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);
      addTearDown(mouse.removePointer);
      await mouse.addPointer(location: Offset.zero);
      await mouse.moveTo(tester.getCenter(find.byType(MPFieldShell)));
      await tester.pumpAndSettle();

      expect(
        find.byType(MPFieldShell),
        paints..rrect(color: light.onSurface, strokeWidth: 1, style: PaintingStyle.stroke),
      );
    });

    testWidgets('is passed over by Tab and drained while disabled', (WidgetTester tester) async {
      final FocusNode before = FocusNode();
      addTearDown(before.dispose);

      await tester.pumpWidget(
        host(
          afterFocusStop(
            before,
            const MPTextField(label: Text('Plan'), value: 'Pro', disabled: true),
          ),
        ),
      );

      before.requestFocus();
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();

      expect(holdsFocus(tester, find.byType(EditableText)), isFalse);
      expect(
        find.byType(MPFieldShell),
        paints..rrect(
          color: light.onSurface.withValues(alpha: MPStateOpacity.disabledContainer),
          style: PaintingStyle.stroke,
        ),
      );
    });

    testWidgets('is disabled by a disabled MPFieldset round it', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const MPFieldset(
            disabled: true,
            children: <Widget>[MPTextField(label: Text('Plan'), value: 'Pro')],
          ),
        ),
      );

      await tester.tap(find.byType(EditableText), warnIfMissed: false);
      await tester.pump();

      expect(holdsFocus(tester, find.byType(EditableText)), isFalse);
    });

    testWidgets('stays focusable and readable when read-only', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(const MPTextField(label: Text('Account'), value: 'acc_8f21c4', readOnly: true)),
      );
      await _focus(tester);

      expect(holdsFocus(tester, find.byType(EditableText)), isTrue);
      expect(tester.widget<EditableText>(find.byType(EditableText)).readOnly, isTrue);
    });

    testWidgets('adds the asterisk to a required field’s label', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(const MPTextField(label: Text('Name'), value: '', required: true)),
      );

      expect(find.text(' *'), findsOneWidget);
    });

    testWidgets('keeps the line open under reserveSupportingText', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const MPConfigProvider(
            reserveSupportingText: true,
            child: MPTextField(label: Text('Email'), value: ''),
          ),
        ),
      );

      final double reserved = tester.getSize(find.byType(MPSupportingText)).height;

      await tester.pumpWidget(
        host(
          const MPConfigProvider(
            reserveSupportingText: true,
            child: MPTextField(label: Text('Email'), value: '', errorMessage: 'Required'),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(reserved, 4 + 16);
      expect(tester.getSize(find.byType(MPSupportingText)).height, reserved);
    });

    testWidgets('opens the line rather than stepping into it', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPTextField(label: Text('Email'), value: '')));
      await tester.pumpWidget(
        host(const MPTextField(label: Text('Email'), value: '', errorMessage: 'Required')),
      );
      await tester.pump(const Duration(milliseconds: 40));

      final double opening = tester.getSize(find.byType(MPSupportingText)).height;

      await tester.pumpAndSettle();

      expect(opening, lessThan(tester.getSize(find.byType(MPSupportingText)).height));
    });
  });

  group('semantics', () {
    testWidgets('is one text field node named by its label', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(
        host(const MPTextField(label: Text('Email'), value: 'ada@example.com')),
      );

      expect(semanticsTextFields(tester), hasLength(1));
      expect(
        semanticsOf(tester, find.byType(MPTextField)),
        isSemantics(isTextField: true, label: 'Email', value: 'ada@example.com'),
      );

      handle.dispose();
    });

    testWidgets('is named by semanticLabel when there is no visible label', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(host(const MPTextField(value: '', semanticLabel: 'Filter')));

      expect(
        semanticsOf(tester, find.byType(MPTextField)),
        isSemantics(isTextField: true, label: 'Filter'),
      );

      handle.dispose();
    });

    testWidgets('is named by the words of a label that is not a plain Text', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(
        host(
          const MPTextField(
            label: Text.rich(
              TextSpan(
                text: 'Email',
                children: <InlineSpan>[TextSpan(text: ' (work)')],
              ),
            ),
            value: '',
          ),
        ),
      );

      expect(
        semanticsOf(tester, find.byType(MPTextField)),
        isSemantics(isTextField: true, label: 'Email (work)'),
      );

      handle.dispose();
    });

    testWidgets('reads semanticLabel in place of the drawn label', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(
        host(const MPTextField(label: Text('Email'), semanticLabel: 'Work email', value: '')),
      );

      expect(find.text('Email'), findsOneWidget);
      expect(
        semanticsOf(tester, find.byType(MPTextField)),
        isSemantics(isTextField: true, label: 'Work email'),
      );

      handle.dispose();
    });

    testWidgets('says it is required without reading out the asterisk', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(
        host(const MPTextField(label: Text('Name'), value: '', required: true)),
      );

      final SemanticsData data = semanticsOf(tester, find.byType(MPTextField)).getSemanticsData();

      expect(data.label, 'Name');
      expect(data.flagsCollection.isRequired, Tristate.isTrue);

      handle.dispose();
    });

    testWidgets('says it is invalid and reads the message with its name', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(
        host(
          const MPTextField(label: Text('Email'), value: 'x', errorMessage: 'Enter a valid email.'),
        ),
      );

      final SemanticsData data = semanticsOf(tester, find.byType(MPTextField)).getSemanticsData();

      expect(data.label, 'Email\nEnter a valid email.');
      expect(data.validationResult, SemanticsValidationResult.invalid);

      handle.dispose();
    });
  });
}
