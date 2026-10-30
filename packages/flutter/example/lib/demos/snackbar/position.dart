import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

const Map<String, MPSnackbarPosition> _positions = <String, MPSnackbarPosition>{
  'bottom-start': MPSnackbarPosition.bottomStart,
  'bottom-center': MPSnackbarPosition.bottomCenter,
  'top-end': MPSnackbarPosition.topEnd,
};

/// `bottomStart` is MD3's own placement. The stack is built again here as the
/// position changes, which is what a real app never does: it picks one.
class SnackbarPosition extends StatefulWidget {
  const SnackbarPosition({super.key});

  @override
  State<SnackbarPosition> createState() => _SnackbarPositionState();
}

class _SnackbarPositionState extends State<SnackbarPosition> {
  List<String> _position = <String>['bottom-start'];

  @override
  Widget build(BuildContext context) {
    final String current = _position.isEmpty ? 'bottom-start' : _position.first;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      spacing: 16,
      children: <Widget>[
        MPSegmentedButton(
          semanticLabel: 'Position',
          value: _position,
          onChanged: (List<String> next) => setState(() => _position = next),
          items: <MPSegment>[
            for (final String name in _positions.keys) MPSegment(value: name, label: Text(name)),
          ],
        ),
        SizedBox(
          width: double.infinity,
          height: 200,
          child: MPSnackbarProvider(
            key: ValueKey<String>(current),
            position: _positions[current]!,
            timeout: const Duration(milliseconds: 2500),
            child: const Align(alignment: AlignmentDirectional.topStart, child: _Raise()),
          ),
        ),
      ],
    );
  }
}

class _Raise extends StatelessWidget {
  const _Raise();

  @override
  Widget build(BuildContext context) {
    return MPButton(
      size: MPSize.sm,
      onPressed: () =>
          MPSnackbarProvider.of(context).add(const MPSnackbarOptions(message: Text('Draft saved'))),
      child: const Text('Raise one'),
    );
  }
}
