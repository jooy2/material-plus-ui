import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// The same list twice: once in a plain scroll view with the platform's own
/// scrollbar, and once in an MPScrollArea.
///
/// The difference is the point: one is a different width and colour on every
/// platform, the other is the same everywhere and made of the library's tokens.
class ScrollAreaHero extends StatelessWidget {
  const ScrollAreaHero({super.key});

  static const List<String> _rows = <String>[
    'Inbox',
    'Starred',
    'Snoozed',
    'Important',
    'Sent',
    'Drafts',
    'Scheduled',
    'All mail',
    'Spam',
    'Bin',
    'Categories',
    'Manage labels',
  ];

  static Widget _list() {
    return MPList(
      dividers: true,
      children: <Widget>[for (final String row in _rows) MPListItem(child: Text(row))],
    );
  }

  @override
  Widget build(BuildContext context) {
    final MPWindowClass windowClass = MPConfigProvider.of(
      context,
    ).windowClassOf(MediaQuery.sizeOf(context).width);

    final List<Widget> halves = <Widget>[
      Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: 8,
        children: <Widget>[
          const MPTypography('The platform’s', level: MPTypographyLevel.caption),
          ConstrainedBox(
            constraints: const BoxConstraints(maxHeight: 220),
            child: SingleChildScrollView(child: _list()),
          ),
        ],
      ),
      Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: 8,
        children: <Widget>[
          const MPTypography('MPScrollArea', level: MPTypographyLevel.caption),
          MPScrollArea(maxHeight: 220, persistent: true, child: _list()),
        ],
      ),
    ];

    // A column on a phone and a row from a medium window up, read off the
    // window size class the same way the library's own layouts read it.
    return SizedBox(
      width: double.infinity,
      child: windowClass == MPWindowClass.compact
          ? Column(crossAxisAlignment: CrossAxisAlignment.stretch, spacing: 16, children: halves)
          : Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              spacing: 16,
              children: <Widget>[for (final Widget half in halves) Expanded(child: half)],
            ),
    );
  }
}
