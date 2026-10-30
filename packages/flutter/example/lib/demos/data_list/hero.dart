import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class DataListHero extends StatelessWidget {
  const DataListHero({super.key});

  List<MPDataListItem> _record() {
    return <MPDataListItem>[
      const MPDataListItem(
        label: Text('Status'),
        child: Align(
          alignment: AlignmentDirectional.centerStart,
          child: MPChip(color: MPColor.tertiary, child: Text('Active')),
        ),
      ),
      const MPDataListItem(label: Text('Owner'), child: Text('Priya Raman')),
      MPDataListItem(
        label: const Text('Repository'),
        child: MPTextLink(onPressed: () {}, child: const Text('acme/voltage')),
      ),
      const MPDataListItem(label: Text('Last deployed'), child: Text('4 March 2026, 09:12')),
    ];
  }

  @override
  Widget build(BuildContext context) {
    final List<Widget> cards = <Widget>[
      MPCard(
        title: const Text('Beside'),
        child: MPDataList(dividers: true, children: _record()),
      ),
      MPCard(
        title: const Text('Under'),
        child: MPDataList(orientation: MPOrientation.vertical, children: _record()),
      ),
    ];

    // A column on a compact window and a row from medium up, as the React
    // demo's `direction={{ compact: 'column', medium: 'row' }}`.
    return LayoutBuilder(
      builder: (BuildContext context, BoxConstraints constraints) {
        if (constraints.maxWidth < 600) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            mainAxisSize: MainAxisSize.min,
            spacing: 24,
            children: cards,
          );
        }

        return Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          spacing: 24,
          children: <Widget>[for (final Widget card in cards) Expanded(child: card)],
        );
      },
    );
  }
}
