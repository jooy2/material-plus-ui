import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class DividerHero extends StatelessWidget {
  const DividerHero({super.key});

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);

    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 420),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        spacing: 24,
        children: <Widget>[
          const MPDivider(),
          const MPDivider(child: Text('OR')),
          DefaultTextStyle.merge(
            style: theme.typescale.bodyMedium.style(theme.colors.onSurface),
            child: const SizedBox(
              height: 32,
              child: Row(
                spacing: 16,
                children: <Widget>[
                  Text('Draft'),
                  MPDivider(orientation: MPOrientation.vertical),
                  Text('Edited 2h ago'),
                  MPDivider(orientation: MPOrientation.vertical),
                  Text('3 comments'),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
