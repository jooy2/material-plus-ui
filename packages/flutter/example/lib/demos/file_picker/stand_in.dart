import 'package:material_plus_ui/material_plus_ui.dart';

/// A stand-in for the app's own file picking.
///
/// The library opens no file dialog: that is a plugin's job in every Flutter
/// app that does it, and this package has no dependencies. `onBrowse` is where
/// a real app calls whichever plugin it chose and turns what it hands back into
/// `MPFile`s; the gallery hands back invented files so the previews have
/// something to list.
Future<List<MPFile>> pickStandInFiles({int count = 2}) async {
  const List<MPFile> invented = <MPFile>[
    MPFile(name: 'aurora.png', size: 420000, mimeType: 'image/png'),
    MPFile(name: 'notes.pdf', size: 82000, mimeType: 'application/pdf'),
    MPFile(name: 'harbour.jpg', size: 2600000, mimeType: 'image/jpeg'),
    MPFile(name: 'skyline.jpg', size: 310000, mimeType: 'image/jpeg'),
  ];

  return invented.take(count).toList();
}
