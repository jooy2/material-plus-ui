import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// A sidebar and a body: the split every application eventually needs.
///
/// The sidebar's `defaultSize` is written as a length rather than a percentage
/// because that is what a minimum actually needs: "at least 160 pixels" does not
/// survive being written down as a fraction of a width nobody knows yet. The
/// split turns it into one as it lays out.
///
/// Drag the handle, or focus it and use the arrow keys.
class PanesHero extends StatefulWidget {
  const PanesHero({super.key});

  @override
  State<PanesHero> createState() => _PanesHeroState();
}

class _PanesHeroState extends State<PanesHero> {
  List<double> _sizes = const <double>[];

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final BorderRadius corner = BorderRadius.circular(theme.shapes.medium);
    final String status = _sizes.isEmpty
        ? 'Drag the handle between the two, or focus it and press ← →.'
        : 'Now at ${_sizes.map((double size) => '${size.round()}%').join(' / ')}.';

    return DecoratedBox(
      position: DecorationPosition.foreground,
      decoration: BoxDecoration(
        border: Border.all(color: theme.colors.outlineVariant),
        borderRadius: corner,
      ),
      child: ClipRRect(
        borderRadius: corner,
        child: SizedBox(
          width: double.infinity,
          height: 220,
          child: MPPanes(
            onResizeEnd: (List<double> sizes) => setState(() => _sizes = sizes),
            children: <MPPane>[
              const MPPane(
                defaultSize: MPPaneSize.pixels(200),
                minSize: MPPaneSize.pixels(120),
                maxSize: MPPaneSize.percent(60),
                child: _Region(
                  title: 'Sidebar',
                  body: 'Between 120px and 60% of the split, whatever the window does.',
                ),
              ),
              MPPane(
                minSize: const MPPaneSize.percent(30),
                child: _Region(title: 'Body', body: status),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// A pane's content: a title and a line under it.
class _Region extends StatelessWidget {
  const _Region({required this.title, required this.body});

  final String title;
  final String body;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);

    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        spacing: 8,
        children: <Widget>[
          Text(
            title,
            style: theme.typescale.bodySmall
                .style(theme.colors.onSurface)
                .copyWith(fontWeight: FontWeight.w600),
          ),
          Text(body, style: theme.typescale.bodySmall.style(theme.colors.onSurfaceVariant)),
        ],
      ),
    );
  }
}
