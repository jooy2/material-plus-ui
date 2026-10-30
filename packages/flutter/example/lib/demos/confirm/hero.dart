import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

import 'package:material_plus_ui_example/demos/glyphs_confirm.dart';

/// A callback, a question, and a boolean.
///
/// What a caller has at the moment a confirmation is warranted is a callback,
/// not a place in the tree, so the dialog lives in the provider and the call
/// site gets a future. Everything that is not the confirm button completes
/// with `false`: cancel, Escape, a press outside.
class ConfirmHero extends StatelessWidget {
  const ConfirmHero({super.key});

  @override
  Widget build(BuildContext context) {
    return const MPConfirmProvider(child: _Row());
  }
}

class _Row extends StatefulWidget {
  const _Row();

  @override
  State<_Row> createState() => _RowState();
}

class _RowState extends State<_Row> {
  final List<String> _log = <String>[];

  void _say(String line) {
    setState(() {
      _log.insert(0, line);

      if (_log.length > 4) {
        _log.removeLast();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      spacing: 16,
      children: <Widget>[
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: <Widget>[
            MPButton(
              color: MPColor.error,
              startIcon: const MPIcon(icon: CloseGlyph()),
              onPressed: () async {
                final bool sure = await MPConfirmProvider.of(context).confirm(
                  const MPConfirmOptions(
                    title: Text('Delete this project?'),
                    description: Text('Everything in it goes too, and it cannot be undone.'),
                    confirmLabel: Text('Delete'),
                    color: MPColor.error,
                  ),
                );

                _say(sure ? 'Deleted.' : 'Kept.');
              },
              child: const Text('Delete project'),
            ),
            MPButton(
              variant: MPVariant.outlined,
              onPressed: () async {
                await MPConfirmProvider.of(context).alert(
                  const MPConfirmOptions(
                    title: Text('Saved'),
                    description: Text('Your changes are on the server.'),
                  ),
                );

                _say('Acknowledged.');
              },
              child: const Text('Save'),
            ),
          ],
        ),
        MPTypography(
          _log.isEmpty ? 'Nothing yet.' : _log.join(' · '),
          level: MPTypographyLevel.caption,
        ),
      ],
    );
  }
}
