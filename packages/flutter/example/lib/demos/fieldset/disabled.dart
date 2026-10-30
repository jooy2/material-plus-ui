import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// The one thing a fieldset is for beyond a heading.
///
/// `disabled` reaches every control inside it, including ones a widget three
/// levels down drew and never heard of.
class FieldsetDisabled extends StatefulWidget {
  const FieldsetDisabled({super.key});

  @override
  State<FieldsetDisabled> createState() => _FieldsetDisabledState();
}

class _FieldsetDisabledState extends State<FieldsetDisabled> {
  bool _inherit = true;
  String _street = '221B Baker Street';

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 360),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: 16,
        children: <Widget>[
          MPSwitch(
            label: const Text('Same as delivery address'),
            checked: _inherit,
            onChanged: (bool next) => setState(() => _inherit = next),
          ),
          MPFieldset(
            legend: const Text('Billing address'),
            disabled: _inherit,
            children: <Widget>[
              MPTextField(
                name: 'street',
                label: const Text('Street'),
                value: _street,
                onChanged: (String next) => setState(() => _street = next),
                fullWidth: true,
              ),
              const MPCheckbox(label: Text('This is a business address')),
            ],
          ),
        ],
      ),
    );
  }
}
