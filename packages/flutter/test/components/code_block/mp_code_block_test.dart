import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/code_block/mp_code_block.dart';
import 'package:material_plus_ui/src/internal/icons.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';

import '../../support/host.dart';

/// Every line's text, in order, read off the rich text each line draws.
List<String> _lines(WidgetTester tester) {
  return tester
      .widgetList<RichText>(
        find.descendant(of: find.byType(MPCodeBlock), matching: find.byType(RichText)),
      )
      .map((RichText text) => text.text)
      .whereType<TextSpan>()
      .where((TextSpan span) => span.children != null)
      .map((TextSpan span) => span.toPlainText())
      .toList();
}

/// A highlighter that calls every word `const` a keyword.
List<MPCodeLine>? _keywords(String code, String language) {
  if (language != 'dart') {
    return null;
  }

  return <MPCodeLine>[
    for (final String line in code.split('\n'))
      <MPCodeToken>[
        for (final String word in line.split(RegExp('(?= )|(?<= )')))
          MPCodeToken(word, word == 'const' ? MPCodeTokenKind.keyword : null),
      ],
  ];
}

/// The colour the run reading [text] is drawn in.
Color? _inkOf(WidgetTester tester, String text) {
  Color? found;

  for (final RichText rich in tester.widgetList<RichText>(find.byType(RichText))) {
    rich.text.visitChildren((InlineSpan span) {
      if (span is TextSpan && span.text == text) {
        found = span.style?.color;
      }

      return found == null;
    });
  }

  return found;
}

void main() {
  final MPColorScheme light = MPColorScheme.fromSource();

  group('the code', () {
    testWidgets('draws the code as lines, always', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 480, const MPCodeBlock(code: 'one\ntwo\nthree')));

      expect(_lines(tester), <String>['one', 'two', 'three']);
    });

    testWidgets('keeps a blank line a line high', (WidgetTester tester) async {
      await tester.pumpWidget(host(width: 480, const MPCodeBlock(code: 'one\n\nthree')));

      final List<double> heights = tester
          .widgetList<RichText>(
            find.descendant(of: find.byType(MPCodeBlock), matching: find.byType(RichText)),
          )
          .where((RichText text) => (text.text as TextSpan).children != null)
          .map((RichText text) => tester.getSize(find.byWidget(text)).height)
          .toList();

      expect(heights.toSet(), hasLength(1));
    });

    testWidgets('trims the trailing newline and no indentation, and normalises line endings', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(width: 480, const MPCodeBlock(code: '  indented\r\nnext\r\n\n')),
      );

      expect(_lines(tester), <String>['  indented', 'next']);
    });

    testWidgets('draws plain without a highlighter, and colours with one', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          width: 480,
          const MPCodeBlock(code: 'const a = 1;', language: 'dart', theme: MPCodeBlockTheme.light),
        ),
      );
      expect(_inkOf(tester, 'const a = 1;'), MPCodeTheme.light.foreground);

      await tester.pumpWidget(
        host(
          width: 480,
          const MPCodeBlock(
            code: 'const a = 1;',
            language: 'dart',
            theme: MPCodeBlockTheme.light,
            highlighter: _keywords,
          ),
        ),
      );
      expect(_inkOf(tester, 'const'), MPCodeTheme.light.keyword);
    });

    testWidgets('draws a language the highlighter does not know plain', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          width: 480,
          const MPCodeBlock(code: 'const a', language: 'cobol', highlighter: _keywords),
        ),
      );

      expect(_lines(tester), <String>['const a']);
      expect(_inkOf(tester, 'const'), isNull);
    });

    testWidgets('drops the colouring when the raw toggle is pressed', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(
          width: 480,
          const MPCodeBlock(
            code: 'const a',
            language: 'dart',
            highlighter: _keywords,
            rawToggle: true,
          ),
        ),
      );

      await tester.tap(find.bySemanticsLabel('Plain text'));
      await tester.pump();

      expect(_inkOf(tester, 'const'), isNull);
      semantics.dispose();
    });

    testWidgets('offers no raw toggle when there is no colouring to drop', (
      WidgetTester tester,
    ) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(
        host(width: 480, const MPCodeBlock(code: 'a', highlight: false, rawToggle: true)),
      );

      expect(find.bySemanticsLabel('Plain text'), findsNothing);
      semantics.dispose();
    });
  });

  group('the gutter', () {
    testWidgets('numbers the lines from wherever it is told to start', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(width: 480, const MPCodeBlock(code: 'a\nb', lineNumbers: true, startLine: 286)),
      );

      expect(find.text('286'), findsOneWidget);
      expect(find.text('287'), findsOneWidget);
    });

    testWidgets(
      'keeps the numbers and the prompt out of the text, and the prompt off blank lines',
      (WidgetTester tester) async {
        final SemanticsHandle semantics = tester.ensureSemantics();

        await tester.pumpWidget(
          host(
            width: 480,
            const MPCodeBlock(code: 'npm i\n\nnpm run dev', prompt: r'$', lineNumbers: true),
          ),
        );

        expect(find.text(r'$'), findsNWidgets(2));
        expect(find.bySemanticsLabel(r'$'), findsNothing);
        expect(_lines(tester), <String>['npm i', '', 'npm run dev']);
        semantics.dispose();
      },
    );
  });

  group('marks', () {
    int markedCount(WidgetTester tester, MPCodeTheme palette) {
      return tester
          .widgetList<DecoratedBox>(find.byType(DecoratedBox))
          .map((DecoratedBox box) => box.decoration)
          .whereType<BoxDecoration>()
          .where((BoxDecoration decoration) => decoration.color == palette.mark)
          .length;
    }

    testWidgets('marks a line, a range, and a list of both, counted as the gutter counts', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          width: 480,
          const MPCodeBlock(
            code: '1\n2\n3\n4\n5\n6',
            theme: MPCodeBlockTheme.light,
            startLine: 10,
            markLines: '10, 12-13',
          ),
        ),
      );

      expect(markedCount(tester, MPCodeTheme.light), 3);
    });

    testWidgets('reads a range written backwards and drops what it cannot read', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          width: 480,
          const MPCodeBlock(
            code: '1\n2\n3\n4',
            theme: MPCodeBlockTheme.light,
            markLines: '3-2, x, 9',
          ),
        ),
      );

      expect(markedCount(tester, MPCodeTheme.light), 2);
    });
  });

  group('the bar', () {
    testWidgets('draws no bar when the toolbar is off, whatever the rest say', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(
          width: 480,
          const MPCodeBlock(code: 'a', language: 'ts', toolbar: false, title: Text('a.ts')),
        ),
      );

      expect(find.text('a.ts'), findsNothing);
      expect(find.text('Copy'), findsNothing);
    });

    testWidgets('draws no bar when there is nothing to put in it', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(width: 480, const MPCodeBlock(code: 'a', showLanguage: false, copyable: false)),
      );

      expect(find.byType(MPGlyph), findsNothing);
    });

    testWidgets('names the file and the language, read through its aliases', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(width: 480, const MPCodeBlock(code: 'a', language: 'yml', title: Text('ci.yml'))),
      );

      expect(find.text('ci.yml'), findsOneWidget);
      expect(find.text('YAML'), findsOneWidget);
    });

    testWidgets('copies the code and says so', (WidgetTester tester) async {
      final List<MethodCall> calls = <MethodCall>[];
      final List<String> copied = <String>[];

      tester.binding.defaultBinaryMessenger.setMockMethodCallHandler(SystemChannels.platform, (
        MethodCall call,
      ) async {
        calls.add(call);

        return null;
      });
      addTearDown(
        () => tester.binding.defaultBinaryMessenger.setMockMethodCallHandler(
          SystemChannels.platform,
          null,
        ),
      );

      await tester.pumpWidget(host(width: 480, MPCodeBlock(code: 'npm i\n', onCopy: copied.add)));

      await tester.tap(find.text('Copy'));
      await tester.pump();

      expect(
        calls.where((MethodCall call) => call.method == 'Clipboard.setData').single.arguments,
        <String, dynamic>{'text': 'npm i'},
      );
      expect(copied, <String>['npm i']);
      expect(find.text('Copied'), findsOneWidget);

      await tester.pump(const Duration(seconds: 2));
      expect(find.text('Copy'), findsOneWidget);
    });
  });

  group('the surface', () {
    testWidgets('wears the theme it was given, and follows the screen on auto', (
      WidgetTester tester,
    ) async {
      BoxDecoration sheet() {
        return tester
                .widgetList<DecoratedBox>(
                  find.descendant(
                    of: find.byType(MPCodeBlock),
                    matching: find.byType(DecoratedBox),
                  ),
                )
                .first
                .decoration
            as BoxDecoration;
      }

      await tester.pumpWidget(
        host(width: 480, const MPCodeBlock(code: 'a', theme: MPCodeBlockTheme.dark)),
      );
      expect(sheet().color, MPCodeTheme.dark.background);

      await tester.pumpWidget(host(width: 480, const MPCodeBlock(code: 'a')));
      expect(sheet().color, MPCodeTheme.light.background);

      await tester.pumpWidget(
        host(width: 480, brightness: Brightness.dark, const MPCodeBlock(code: 'a')),
      );
      expect(sheet().color, MPCodeTheme.dark.background);

      await tester.pumpWidget(
        host(width: 480, const MPCodeBlock(code: 'a', theme: MPCodeBlockTheme.mono)),
      );
      expect(sheet().color, light.surfaceContainer);
    });

    testWidgets('scrolls sideways, or wraps when it is told to', (WidgetTester tester) async {
      final String long = 'x' * 200;

      await tester.pumpWidget(host(width: 300, MPCodeBlock(code: long)));
      expect(tester.getSize(find.byType(MPCodeBlock)).width, 300);
      expect(_lines(tester).single, long);

      await tester.pumpWidget(host(width: 300, MPCodeBlock(code: long, wrap: true)));
      expect(tester.getSize(find.byType(MPCodeBlock)).width, 300);
      final RenderParagraph paragraph = tester.renderObject<RenderParagraph>(
        find.descendant(of: find.byType(MPCodeBlock), matching: find.byType(RichText)).last,
      );
      expect(paragraph.size.width, lessThan(300));
    });

    testWidgets('bounds the block with maxHeight', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          width: 480,
          MPCodeBlock(code: List<String>.filled(40, 'line').join('\n'), maxHeight: 120),
        ),
      );

      expect(tester.getSize(find.byType(MPCodeBlock)).height, lessThan(200));
    });

    testWidgets('is a named region a keyboard can scroll', (WidgetTester tester) async {
      final SemanticsHandle semantics = tester.ensureSemantics();

      await tester.pumpWidget(host(width: 480, const MPCodeBlock(code: 'a', language: 'ts')));
      expect(find.bySemanticsLabel('typescript'), findsOneWidget);

      await tester.pumpWidget(
        host(width: 480, const MPCodeBlock(code: 'a', title: Text('src/index.ts'))),
      );
      expect(find.bySemanticsLabel(RegExp('src/index.ts')), findsWidgets);
      semantics.dispose();
    });
  });
}
