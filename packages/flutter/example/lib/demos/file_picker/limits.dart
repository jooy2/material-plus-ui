import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

import 'package:material_plus_ui_example/demos/file_picker/stand_in.dart';

const int _maxSize = 500000;
const int _maxFiles = 2;

/// What each reason means, said the way a person would say it.
String _explain(MPFileRejection rejection) {
  final MPFile file = rejection.file;

  switch (rejection.reason) {
    case MPFileRejectionReason.type:
      return '${file.name} is not an image.';
    case MPFileRejectionReason.size:
      return '${file.name} is ${formatFileSize(file.size)} — the limit is ${formatFileSize(_maxSize)}.';
    case MPFileRejectionReason.count:
      return '${file.name} did not fit: $_maxFiles files at most.';
  }
}

/// `onReject` is the parameter worth wiring first.
///
/// Without it a file that is turned away disappears in silence, which is the
/// single worst thing a drop target does: the reader watches their file vanish
/// and has no way to tell whether it was rejected or lost. Browse twice to see
/// a PDF, an image over 500 kB and a third image turned away.
///
/// `accept` is checked against whatever arrives, whichever way it came.
class FilePickerLimits extends StatefulWidget {
  const FilePickerLimits({super.key});

  @override
  State<FilePickerLimits> createState() => _FilePickerLimitsState();
}

class _FilePickerLimitsState extends State<FilePickerLimits> {
  List<MPFile> _files = const <MPFile>[];
  List<String> _refused = const <String>[];

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 420),
      child: MPFilePicker(
        label: const Text('Photos'),
        title: const Text('Drop up to two images'),
        hint: Text('PNG or JPEG, ${formatFileSize(_maxSize)} each'),
        accept: 'image/png,image/jpeg',
        multiple: true,
        maxFiles: _maxFiles,
        maxSize: _maxSize,
        value: _files,
        // Where a real app runs its own file picking plugin.
        onBrowse: () => pickStandInFiles(count: 4),
        onFilesChanged: (List<MPFile> next) => setState(() {
          _files = next;
          _refused = const <String>[];
        }),
        onReject: (List<MPFileRejection> rejections) =>
            setState(() => _refused = rejections.map(_explain).toList()),
        errorMessage: _refused.isEmpty ? null : Text(_refused.join(' ')),
      ),
    );
  }
}
