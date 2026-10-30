import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

import 'package:material_plus_ui_example/demos/file_picker/stand_in.dart';

class FilePickerHero extends StatefulWidget {
  const FilePickerHero({super.key});

  @override
  State<FilePickerHero> createState() => _FilePickerHeroState();
}

class _FilePickerHeroState extends State<FilePickerHero> {
  List<MPFile> _files = const <MPFile>[];

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 420),
      child: MPFilePicker(
        label: const Text('Attachments'),
        hint: const Text('Anything up to 10 MB'),
        multiple: true,
        maxSize: 10000000,
        value: _files,
        // Where a real app runs its own file picking plugin.
        onBrowse: () => pickStandInFiles(),
        onFilesChanged: (List<MPFile> next) => setState(() => _files = next),
      ),
    );
  }
}
