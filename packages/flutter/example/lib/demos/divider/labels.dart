import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class DividerLabels extends StatelessWidget {
  const DividerLabels({super.key});

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 420),
      child: const Column(
        mainAxisSize: MainAxisSize.min,
        spacing: 24,
        children: <Widget>[
          MPDivider(textAlign: MPAlign.start, child: Text('Recent')),
          MPDivider(child: Text('OR')),
          MPDivider(textAlign: MPAlign.end, child: Text('Archived')),
        ],
      ),
    );
  }
}
