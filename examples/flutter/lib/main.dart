import 'package:flutter/widgets.dart';
import 'package:material_plus_showcase/app/app.dart';
import 'package:material_plus_ui/locales.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

void main() {
  // The language setting switches the library's own words between these.
  registerMPMessages(mpLocales);
  runApp(const ShowcaseApp());
}
