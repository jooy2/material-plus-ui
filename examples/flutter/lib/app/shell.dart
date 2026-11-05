import 'package:flutter/widgets.dart';
import 'package:material_plus_showcase/app/page.dart';
import 'package:material_plus_showcase/screens/home.dart';
import 'package:material_plus_showcase/screens/inbox.dart';
import 'package:material_plus_showcase/screens/more.dart';
import 'package:material_plus_showcase/screens/orders.dart';
import 'package:material_plus_showcase/screens/request.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

const Map<String, String> _destinations = <String, String>{
  'home': 'Home',
  'inbox': 'Inbox',
  'orders': 'Orders',
  'request': 'Request',
  'more': 'More',
};

/// How tall the bottom bar is over the content, above the system's own inset.
const double _barHeight = 80;

/// The five destinations: a bottom bar on a phone and a sidebar on a tablet.
class Shell extends StatefulWidget {
  /// Creates the shell.
  const Shell({super.key});

  @override
  State<Shell> createState() => _ShellState();
}

class _ShellState extends State<Shell> {
  String _where = 'home';

  Widget _screen(double bottomInset) {
    return IndexedStack(
      sizing: StackFit.expand,
      index: _destinations.keys.toList().indexOf(_where),
      children: <Widget>[
        HomeScreen(bottomInset: bottomInset),
        InboxScreen(bottomInset: bottomInset),
        OrdersScreen(bottomInset: bottomInset),
        RequestScreen(bottomInset: bottomInset),
        MoreScreen(bottomInset: bottomInset),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final bool wide = MediaQuery.sizeOf(context).width >= railBreakpoint;

    if (wide) {
      return Ground(
        child: SafeArea(
          right: false,
          child: Row(
            children: <Widget>[
              Padding(
                padding: const EdgeInsets.all(12),
                child: MPSidebar(
                  width: 224,
                  label: 'Main',
                  title: const Text('Material Plus'),
                  child: MPList(
                    variant: MPVariant.text,
                    children: <Widget>[
                      for (final MapEntry<String, String>(key: String value, value: String label)
                          in _destinations.entries)
                        MPListItem(
                          selected: _where == value,
                          startIcon: destinationGlyphs[value],
                          onPressed: () => setState(() => _where = value),
                          child: Text(label),
                        ),
                    ],
                  ),
                ),
              ),
              Expanded(child: _screen(0)),
            ],
          ),
        ),
      );
    }

    return Ground(
      child: Stack(
        children: <Widget>[
          Positioned.fill(child: _screen(_barHeight)),
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: MPBottomNavigation(
              label: 'Main',
              value: _where,
              onChanged: (Object next) => setState(() => _where = next as String),
              children: <Widget>[
                for (final MapEntry<String, String>(key: String value, value: String label)
                    in _destinations.entries)
                  MPBottomNavigationItem(
                    value: value,
                    label: label,
                    icon: destinationGlyphs[value],
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
