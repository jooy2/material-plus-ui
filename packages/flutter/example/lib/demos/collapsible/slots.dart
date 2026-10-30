import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

import 'package:material_plus_ui_example/demos/glyphs_data.dart';

class CollapsibleSlots extends StatefulWidget {
  const CollapsibleSlots({super.key});

  @override
  State<CollapsibleSlots> createState() => _CollapsibleSlotsState();
}

class _CollapsibleSlotsState extends State<CollapsibleSlots> {
  bool _enabled = true;

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 520),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        spacing: 12,
        children: <Widget>[
          MPCollapsible(
            title: const Text('Notifications'),
            subtitle: const Text('Four kinds, three of them off'),
            startIcon: const MPIcon(icon: InfoCircleGlyph(), size: 20),
            action: MPSwitch(
              checked: _enabled,
              onChanged: (bool value) => setState(() => _enabled = value),
              label: const Text('Enabled'),
              size: MPSize.sm,
            ),
            child: const Text(
              'Choose which of these are worth interrupting you for. Everything else waits for '
              'the daily summary.',
            ),
          ),
          MPCollapsible(
            variant: MPVariant.text,
            triggerBuilder: (BuildContext context, bool open, VoidCallback toggle) {
              return Align(
                alignment: AlignmentDirectional.centerStart,
                child: Semantics(
                  expanded: open,
                  child: MPButton(
                    variant: MPVariant.text,
                    onPressed: toggle,
                    child: const Text('Show the details'),
                  ),
                ),
              );
            },
            child: const Text(
              'A trigger of your own, handed the state and the toggle. Nothing here had to be '
              'told what it controls.',
            ),
          ),
        ],
      ),
    );
  }
}
