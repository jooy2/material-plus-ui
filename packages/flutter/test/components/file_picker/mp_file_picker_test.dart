import 'dart:ui' show Tristate;

import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/components/file_picker/mp_file_picker.dart';
import 'package:material_plus_ui/src/components/form/mp_form.dart';
// Reached directly: these are the library talking to itself, and the tests
// are the one caller allowed to listen in.
import 'package:material_plus_ui/src/internal/field.dart';
import 'package:material_plus_ui/src/internal/icons.dart';
import 'package:material_plus_ui/src/internal/select_list.dart';
import 'package:material_plus_ui/src/types.dart';

import '../../support/host.dart';

/// The React suite's questions about `MPFilePicker`, asked of the render tree.
///
/// A browser test hands the hidden `<input type="file">` a `FileList`; a widget
/// test hands `onBrowse` a list to return, or a drop to `MPFilePickerState.add`.

const MPFile _png = MPFile(name: 'photo.png', size: 1200, mimeType: 'image/png');
const MPFile _jpeg = MPFile(name: 'portrait.jpg', size: 2400, mimeType: 'image/jpeg');
const MPFile _pdf = MPFile(name: 'report.pdf', size: 3600, mimeType: 'application/pdf');
const MPFile _huge = MPFile(name: 'huge.png', size: 5000000, mimeType: 'image/png');

/// A parent that keeps the files and shows them, browsing to [found].
class _Parent extends StatefulWidget {
  const _Parent({
    this.found = const <MPFile>[],
    this.initial = const <MPFile>[],
    this.multiple = false,
    this.accept,
    this.maxSize,
    this.maxFiles,
    this.onReject,
    this.showList = true,
    this.removeLabel,
    this.readOnly = false,
    this.disabled = false,
    this.errorMessage,
    this.description,
    this.pickerKey,
  });

  final List<MPFile> found;
  final List<MPFile> initial;
  final bool multiple;
  final String? accept;
  final int? maxSize;
  final int? maxFiles;
  final ValueChanged<List<MPFileRejection>>? onReject;
  final bool showList;
  final String Function(String name)? removeLabel;
  final bool readOnly;
  final bool disabled;
  final Widget? errorMessage;
  final Widget? description;
  final GlobalKey<MPFilePickerState>? pickerKey;

  @override
  State<_Parent> createState() => _ParentState();
}

class _ParentState extends State<_Parent> {
  late List<MPFile> files = widget.initial;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 400,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          MPFilePicker(
            key: widget.pickerKey,
            label: const Text('Attachments'),
            value: files,
            onFilesChanged: (List<MPFile> next) => setState(() => files = next),
            onBrowse: () async => widget.found,
            multiple: widget.multiple,
            accept: widget.accept,
            maxSize: widget.maxSize,
            maxFiles: widget.maxFiles,
            onReject: widget.onReject,
            showList: widget.showList,
            removeLabel: widget.removeLabel,
            readOnly: widget.readOnly,
            disabled: widget.disabled,
            errorMessage: widget.errorMessage,
            description: widget.description,
          ),
          Text('model: ${files.map((MPFile file) => file.name).join(',')}'),
        ],
      ),
    );
  }
}

/// The box's own node, named by the label and the sentence inside it.
SemanticsNode _zone(WidgetTester tester) {
  return semanticsNodeLabelled(tester, 'Attachments\nDrop files here, or click to browse')!;
}

Future<void> _browse(WidgetTester tester) async {
  await tester.tap(find.text('Drop files here, or click to browse'));
  await tester.pumpAndSettle();
}

void main() {
  group('formatFileSize', () {
    test('speaks the units a file browser speaks', () {
      expect(formatFileSize(0), '0 B');
      expect(formatFileSize(999), '999 B');
      expect(formatFileSize(1000), '1.0 kB');
      expect(formatFileSize(1400000), '1.4 MB');
      expect(formatFileSize(25000000), '25 MB');
      expect(formatFileSize(3000000000), '3.0 GB');
    });
  });

  group('rendering', () {
    testWidgets('is a pressable box with a default sentence in it', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(host(const _Parent()));

      expect(find.text('Drop files here, or click to browse'), findsOneWidget);
      expect(
        semanticsNodeLabelled(tester, 'Attachments\nDrop files here, or click to browse'),
        isNotNull,
      );

      handle.dispose();
    });

    testWidgets('takes its own title, hint and icon', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const MPFilePicker(
            title: Text('Drop a CSV'),
            hint: Text('Up to 2 MB'),
            icon: Text('ICON'),
          ),
        ),
      );

      expect(find.text('Drop a CSV'), findsOneWidget);
      expect(find.text('Up to 2 MB'), findsOneWidget);
      expect(find.text('ICON'), findsOneWidget);
      expect(find.byType(MPGlyph), findsNothing);
    });

    testWidgets('draws no picture at all when the icon is turned off', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPFilePicker(showIcon: false)));

      expect(find.byType(MPGlyph), findsNothing);
    });
  });

  group('choosing', () {
    testWidgets('reports what was chosen', (WidgetTester tester) async {
      await tester.pumpWidget(host(const _Parent(found: <MPFile>[_png])));
      await _browse(tester);

      expect(find.text('model: photo.png'), findsOneWidget);
    });

    testWidgets('replaces rather than appends unless multiple is set', (WidgetTester tester) async {
      await tester.pumpWidget(host(const _Parent(found: <MPFile>[_jpeg], initial: <MPFile>[_png])));
      await _browse(tester);

      expect(find.text('model: portrait.jpg'), findsOneWidget);
    });

    testWidgets('appends when multiple is set', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(const _Parent(found: <MPFile>[_jpeg], initial: <MPFile>[_png], multiple: true)),
      );
      await _browse(tester);

      expect(find.text('model: photo.png,portrait.jpg'), findsOneWidget);
    });

    testWidgets('keeps what was chosen without being controlled', (WidgetTester tester) async {
      await tester.pumpWidget(host(MPFilePicker(onBrowse: () async => const <MPFile>[_png])));
      await _browse(tester);

      expect(find.text('photo.png'), findsOneWidget);
    });

    testWidgets('takes a drop the app found through its state', (WidgetTester tester) async {
      final GlobalKey<MPFilePickerState> picker = GlobalKey<MPFilePickerState>();

      await tester.pumpWidget(host(_Parent(pickerKey: picker, accept: 'image/*', multiple: true)));

      picker.currentState!.add(const <MPFile>[_png, _pdf]);
      await tester.pumpAndSettle();

      expect(find.text('model: photo.png'), findsOneWidget);
    });

    testWidgets('lights the box while the app says a file is over it', (WidgetTester tester) async {
      await tester.pumpWidget(host(const MPFilePicker(dragging: true)));
      await tester.pumpAndSettle();

      final List<BoxDecoration> boxes = decorationsOf(tester, find.byType(MPFilePicker));

      expect(boxes.any((BoxDecoration box) => box.color?.a != null && box.color!.a > 0), isTrue);
    });
  });

  group('turning files away', () {
    testWidgets('checks accept against what arrived, whatever offered it', (
      WidgetTester tester,
    ) async {
      final List<MPFileRejection> rejected = <MPFileRejection>[];

      await tester.pumpWidget(
        host(_Parent(found: const <MPFile>[_pdf], accept: 'image/*', onReject: rejected.addAll)),
      );
      await _browse(tester);

      expect(find.text('model: '), findsOneWidget);
      expect(rejected.single.reason, MPFileRejectionReason.type);
      expect(rejected.single.file, _pdf);
    });

    testWidgets('matches an extension as well as a media type', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(
          const _Parent(
            found: <MPFile>[MPFile(name: 'notes.MD', size: 10)],
            accept: '.md',
          ),
        ),
      );
      await _browse(tester);

      expect(find.text('model: notes.MD'), findsOneWidget);
    });

    testWidgets('turns away anything over maxSize, and says why', (WidgetTester tester) async {
      final List<MPFileRejection> rejected = <MPFileRejection>[];

      await tester.pumpWidget(
        host(_Parent(found: const <MPFile>[_huge], maxSize: 1000000, onReject: rejected.addAll)),
      );
      await _browse(tester);

      expect(rejected.single.reason, MPFileRejectionReason.size);
    });

    testWidgets('counts maxFiles against what is already held', (WidgetTester tester) async {
      final List<MPFileRejection> rejected = <MPFileRejection>[];

      await tester.pumpWidget(
        host(
          _Parent(
            initial: const <MPFile>[_png],
            found: const <MPFile>[_jpeg, _pdf],
            multiple: true,
            maxFiles: 2,
            onReject: rejected.addAll,
          ),
        ),
      );
      await _browse(tester);

      expect(find.text('model: photo.png,portrait.jpg'), findsOneWidget);
      expect(rejected.single.file, _pdf);
      expect(rejected.single.reason, MPFileRejectionReason.count);
    });

    testWidgets('keeps the good half of a mixed batch', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(const _Parent(found: <MPFile>[_png, _pdf, _jpeg], accept: 'image/*', multiple: true)),
      );
      await _browse(tester);

      expect(find.text('model: photo.png,portrait.jpg'), findsOneWidget);
    });
  });

  group('the list', () {
    testWidgets('lists each file with its size', (WidgetTester tester) async {
      await tester.pumpWidget(host(const _Parent(initial: <MPFile>[_png, _pdf], multiple: true)));

      expect(find.text('photo.png'), findsOneWidget);
      expect(find.text('1.2 kB'), findsOneWidget);
      expect(find.text('report.pdf'), findsOneWidget);
      expect(find.text('3.6 kB'), findsOneWidget);
    });

    testWidgets('removes one file without touching the others', (WidgetTester tester) async {
      await tester.pumpWidget(host(const _Parent(initial: <MPFile>[_png, _pdf], multiple: true)));

      await tester.tap(find.bySemanticsLabel('Remove photo.png'));
      await tester.pumpAndSettle();

      expect(find.text('model: report.pdf'), findsOneWidget);
    });

    testWidgets('takes its own wording for the remove button', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(_Parent(initial: const <MPFile>[_png], removeLabel: (String name) => 'Discard $name')),
      );

      expect(find.bySemanticsLabel('Discard photo.png'), findsOneWidget);
    });

    testWidgets('settles a file that has just arrived, and leaves the rest alone', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(const _Parent(initial: <MPFile>[_png], found: <MPFile>[_pdf], multiple: true)),
      );
      await tester.tap(find.text('Drop files here, or click to browse'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 50));

      final List<double> opacities = tester
          .widgetList<Opacity>(
            find.descendant(of: find.byType(MPArrivingRow), matching: find.byType(Opacity)),
          )
          .map((Opacity opacity) => opacity.opacity)
          .toList();

      expect(opacities.first, 1);
      expect(opacities.last, lessThan(1));

      await tester.pumpAndSettle();
    });

    testWidgets('hides the list when asked, without forgetting the file', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(host(const _Parent(initial: <MPFile>[_png], showList: false)));

      expect(find.text('photo.png'), findsNothing);
      expect(find.text('model: photo.png'), findsOneWidget);
    });
  });

  group('states', () {
    testWidgets('shows an error message and marks the picker invalid', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(host(const _Parent(errorMessage: Text('Too many files.'))));

      expect(find.text('Too many files.'), findsOneWidget);
      expect(_zone(tester).getSemanticsData().validationResult, SemanticsValidationResult.invalid);

      handle.dispose();
    });

    testWidgets('lets the error replace the description', (WidgetTester tester) async {
      await tester.pumpWidget(
        host(const _Parent(description: Text('PDF only.'), errorMessage: Text('Too big.'))),
      );

      expect(find.text('Too big.'), findsOneWidget);
      expect(find.text('PDF only.'), findsNothing);
    });

    testWidgets('disables the box', (WidgetTester tester) async {
      final SemanticsHandle handle = tester.ensureSemantics();

      await tester.pumpWidget(host(const _Parent(disabled: true, found: <MPFile>[_png])));

      expect(_zone(tester).getSemanticsData().flagsCollection.isEnabled, Tristate.isFalse);

      await _browse(tester);

      expect(find.text('model: '), findsOneWidget);

      handle.dispose();
    });

    testWidgets('shows what was chosen without letting it change when read-only', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        host(const _Parent(readOnly: true, initial: <MPFile>[_png], found: <MPFile>[_pdf])),
      );

      expect(find.text('photo.png'), findsOneWidget);
      expect(find.bySemanticsLabel('Remove photo.png'), findsNothing);

      await _browse(tester);

      expect(find.text('model: photo.png'), findsOneWidget);
    });
  });

  group('in a form', () {
    testWidgets('refuses to submit while a required picker is empty, then submits its files', (
      WidgetTester tester,
    ) async {
      final GlobalKey<MPFormState> form = GlobalKey<MPFormState>();
      Map<String, Object?>? submitted;

      await tester.pumpWidget(
        host(
          width: 400,
          MPForm(
            key: form,
            onSubmit: (Map<String, Object?> values) => submitted = values,
            children: <Widget>[
              MPFilePicker(
                name: 'attachments',
                required: true,
                onBrowse: () async => const <MPFile>[_png],
              ),
            ],
          ),
        ),
      );

      expect(form.currentState!.submit(), isFalse);
      await tester.pump();

      expect(find.text('Required'), findsOneWidget);

      await _browse(tester);

      expect(form.currentState!.submit(), isTrue);
      expect(submitted, <String, Object?>{
        'attachments': <MPFile>[_png],
      });
    });
  });

  group('the size ladder', () {
    testWidgets('pads the box more on each rung', (WidgetTester tester) async {
      double? previous;

      for (final MPSize size in MPSize.values) {
        await tester.pumpWidget(host(MPFilePicker(size: size)));

        final double height = tester.getSize(find.byType(MPFilePicker)).height;

        if (previous != null) {
          expect(height, greaterThan(previous), reason: size.name);
        }

        previous = height;
      }
    });
  });

  testWidgets('keeps the remove button a field button', (WidgetTester tester) async {
    await tester.pumpWidget(host(const _Parent(initial: <MPFile>[_png])));

    expect(find.byType(MPFieldIconButton), findsOneWidget);
  });
}
