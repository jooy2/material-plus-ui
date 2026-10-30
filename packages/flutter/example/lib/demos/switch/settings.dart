import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// What `labelPlacement: MPSwitchLabelPlacement.start` is for.
///
/// With the label first and `fullWidth` on the row, the labels form a column
/// and every track lines up at the far edge, which is what a settings page
/// looks like on every platform that has one.
///
/// `icons` is on here too. Without it the state is carried by the thumb's
/// position and the track's colour, and one of those is a hue.
class SwitchSettings extends StatefulWidget {
  const SwitchSettings({super.key});

  @override
  State<SwitchSettings> createState() => _SwitchSettingsState();
}

class _SwitchSettingsState extends State<SwitchSettings> {
  static const List<(String, String, String)> _settings = <(String, String, String)>[
    ('wifi', 'Wi-Fi', 'Connect to known networks.'),
    ('bluetooth', 'Bluetooth', 'Discoverable while this is open.'),
    ('hotspot', 'Personal hotspot', 'Shares this connection.'),
  ];

  final Map<String, bool> _on = <String, bool>{'wifi': true};

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 340),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        spacing: 20,
        children: <Widget>[
          for (final (String key, String label, String description) in _settings)
            MPSwitch(
              label: Text(label),
              description: Text(description),
              labelPlacement: MPSwitchLabelPlacement.start,
              icons: true,
              fullWidth: true,
              checked: _on[key] ?? false,
              onChanged: (bool next) => setState(() => _on[key] = next),
            ),
        ],
      ),
    );
  }
}
