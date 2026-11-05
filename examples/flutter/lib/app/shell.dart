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

/// The screens, ending where the keyboard begins, as a `Scaffold`'s body does.
///
/// [bar] is room held at the bottom for a bar over them, given to the screens
/// as padding, so a list scrolls clear of it and a snackbar shown from them
/// sits above it, as MD3 has it. Behind the keyboard the bar is out of sight,
/// and so is the room.
class _Screens extends StatelessWidget {
  const _Screens({required this.bar, required this.child});

  final double bar;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final MediaQueryData media = MediaQuery.of(context);
    final double keyboard = media.viewInsets.bottom;

    return Padding(
      padding: EdgeInsets.only(bottom: keyboard),
      child: MediaQuery(
        data: media
            .removeViewInsets(removeBottom: true)
            .copyWith(
              padding: media.padding.copyWith(
                bottom: media.padding.bottom + (keyboard > 0 ? 0 : bar),
              ),
            ),
        child: bar == 0
            ? child
            : MPSnackbarProvider(position: MPSnackbarPosition.bottomCenter, child: child),
      ),
    );
  }
}

/// The five destinations: a bottom bar on a phone and a sidebar on a tablet.
class Shell extends StatefulWidget {
  /// Creates the shell.
  const Shell({super.key});

  @override
  State<Shell> createState() => _ShellState();
}

class _ShellState extends State<Shell> {
  String _where = 'home';

  Widget _screen() {
    return IndexedStack(
      sizing: StackFit.expand,
      index: _destinations.keys.toList().indexOf(_where),
      children: const <Widget>[
        HomeScreen(),
        InboxScreen(),
        OrdersScreen(),
        RequestScreen(),
        MoreScreen(),
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
              Expanded(child: _Screens(bar: 0, child: _screen())),
            ],
          ),
        ),
      );
    }

    return Ground(
      child: Stack(
        children: <Widget>[
          Positioned.fill(
            child: _Screens(bar: _barHeight, child: _screen()),
          ),
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
