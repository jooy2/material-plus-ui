import 'dart:async';

import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// `loading` is not `disabled`, and the difference is the point.
///
/// Press Save: the button stops firing and grows a spinner, but it keeps the
/// focus. A button that leaves the focus order the moment it is pressed takes
/// the keyboard focus with it.
class ButtonStates extends StatefulWidget {
  const ButtonStates({super.key});

  @override
  State<ButtonStates> createState() => _ButtonStatesState();
}

class _ButtonStatesState extends State<ButtonStates> {
  bool _saving = false;
  Timer? _timer;

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _save() {
    setState(() => _saving = true);
    _timer = Timer(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() => _saving = false);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 12,
      runSpacing: 12,
      crossAxisAlignment: WrapCrossAlignment.center,
      children: <Widget>[
        MPButton(
          loading: _saving,
          loadingLabel: 'Saving',
          onPressed: _save,
          child: const Text('Save'),
        ),
        const MPButton(variant: MPVariant.tonal, onPressed: null, child: Text('Disabled')),
        const MPButton(variant: MPVariant.outlined, onPressed: null, child: Text('Disabled')),
        MPButton(color: MPColor.error, onPressed: () {}, child: const Text('Delete')),
      ],
    );
  }
}
