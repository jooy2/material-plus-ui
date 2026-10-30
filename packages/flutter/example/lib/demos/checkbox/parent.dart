import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// What the third state is actually for.
///
/// `indeterminate` is a *display* state, not a value: it says "some of my
/// children are ticked" and nothing else. Pressing a half-ticked box ticks it,
/// which is what the parent below does: it never hands the reader a press that
/// lands back where it started.
class CheckboxParent extends StatefulWidget {
  const CheckboxParent({super.key});

  @override
  State<CheckboxParent> createState() => _CheckboxParentState();
}

class _CheckboxParentState extends State<CheckboxParent> {
  static const List<String> _scopes = <String>['Read', 'Write', 'Delete'];

  List<String> _chosen = <String>['Read'];

  @override
  Widget build(BuildContext context) {
    final bool all = _chosen.length == _scopes.length;
    final bool some = _chosen.isNotEmpty && !all;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      spacing: 12,
      children: <Widget>[
        MPCheckbox(
          label: const Text('All permissions'),
          checked: all,
          indeterminate: some,
          onChanged: (bool checked) {
            setState(() => _chosen = checked ? List<String>.of(_scopes) : <String>[]);
          },
        ),
        Padding(
          padding: const EdgeInsetsDirectional.only(start: 30),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            spacing: 12,
            children: <Widget>[
              for (final String scope in _scopes)
                MPCheckbox(
                  label: Text(scope),
                  checked: _chosen.contains(scope),
                  onChanged: (bool checked) {
                    setState(() {
                      _chosen = checked
                          ? <String>[..._chosen, scope]
                          : _chosen.where((String name) => name != scope).toList();
                    });
                  },
                ),
            ],
          ),
        ),
      ],
    );
  }
}
