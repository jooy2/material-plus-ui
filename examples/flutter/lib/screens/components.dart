import 'package:flutter/widgets.dart';
import 'package:material_plus_showcase/app/page.dart';
import 'package:material_plus_ui/material_plus_ui.dart';
import 'package:material_plus_ui_example/canvas.dart';
import 'package:material_plus_ui_example/demos/glyphs.dart';
import 'package:material_plus_ui_example/demos/registry.dart';

/// Every demo, grouped by the component it belongs to.
final Map<String, List<String>> _byComponent = () {
  final Map<String, List<String>> groups = <String, List<String>>{};

  for (final String name in demos.keys) {
    groups.putIfAbsent(name.split('/').first, () => <String>[]).add(name);
  }

  return Map<String, List<String>>.fromEntries(
    groups.entries.toList()
      ..sort((MapEntry<String, List<String>> a, MapEntry<String, List<String>> b) {
        return a.key.compareTo(b.key);
      }),
  );
}();

/// The list of components, and the way to each one's demos.
class ComponentsScreen extends StatefulWidget {
  /// Creates the screen.
  const ComponentsScreen({super.key});

  @override
  State<ComponentsScreen> createState() => _ComponentsScreenState();
}

class _ComponentsScreenState extends State<ComponentsScreen> {
  String _query = '';

  @override
  Widget build(BuildContext context) {
    final String query = _query.trim().toLowerCase();
    final List<MapEntry<String, List<String>>> found = _byComponent.entries
        .where((MapEntry<String, List<String>> one) => one.key.contains(query))
        .toList();

    return PushedScreen(
      title: 'Components',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
            child: MPTextField(
              type: MPTextFieldType.search,
              fullWidth: true,
              value: _query,
              onChanged: (String next) => setState(() => _query = next),
              startIcon: const MPIcon(icon: SearchGlyph()),
              placeholder: 'Search ${_byComponent.length} components',
              semanticLabel: 'Search components',
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: EdgeInsets.fromLTRB(16, 0, 16, MediaQuery.paddingOf(context).bottom + 24),
              itemCount: found.length,
              itemBuilder: (BuildContext context, int index) {
                final MapEntry<String, List<String>>(key: String name, value: List<String> names) =
                    found[index];

                return MPListItem(
                  description: Text(names.length == 1 ? '1 demo' : '${names.length} demos'),
                  onPressed: () => pushScreen(context, ComponentScreen(name: name, demos: names)),
                  child: Text(name),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

/// One component's demos, one at a time.
class ComponentScreen extends StatefulWidget {
  /// Creates the screen.
  const ComponentScreen({required this.name, required this.demos, super.key});

  /// The folder name of the component.
  final String name;

  /// The registry keys of its demos.
  final List<String> demos;

  @override
  State<ComponentScreen> createState() => _ComponentScreenState();
}

class _ComponentScreenState extends State<ComponentScreen> {
  late String _demo = widget.demos.first;

  @override
  Widget build(BuildContext context) {
    return PushedScreen(
      title: widget.name,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 4, 16, 8),
            child: MPScrollZone(
              label: 'Demos',
              children: <Widget>[
                for (final String name in widget.demos)
                  MPChip(
                    selected: _demo == name,
                    onPressed: () => setState(() => _demo = name),
                    child: Text(name.split('/').last),
                  ),
              ],
            ),
          ),
          Expanded(
            child: Overlay.wrap(
              child: MPCanvas(
                key: ValueKey<String>(_demo),
                child: Builder(builder: demos[_demo]!),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
