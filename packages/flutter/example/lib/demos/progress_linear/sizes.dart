import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// `size` is the thickness of the groove and nothing else: `md` is MD3's own
/// 4dp. A bar has no label inside it to scale.
class ProgressLinearSizes extends StatelessWidget {
  const ProgressLinearSizes({super.key});

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 420),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: 20,
        children: <Widget>[
          for (final MPSize size in MPSize.values)
            MPProgressLinear(size: size, value: 62, label: Text(size.name)),
        ],
      ),
    );
  }
}
