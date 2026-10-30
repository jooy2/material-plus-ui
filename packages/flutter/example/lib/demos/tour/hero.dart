import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// A small page for the tour to stand over.
class TourHero extends StatefulWidget {
  const TourHero({super.key});

  @override
  State<TourHero> createState() => _TourHeroState();
}

class _TourHeroState extends State<TourHero> {
  final GlobalKey _search = GlobalKey(debugLabel: 'search');
  final GlobalKey _save = GlobalKey(debugLabel: 'save');
  final GlobalKey _panel = GlobalKey(debugLabel: 'panel');

  bool _running = false;
  String _query = '';

  @override
  Widget build(BuildContext context) {
    final List<MPTourStep> steps = <MPTourStep>[
      const MPTourStep(
        title: Text('Welcome'),
        content: Text('Three things worth knowing about this page. It takes about ten seconds.'),
      ),
      MPTourStep(
        target: _search,
        title: const Text('Search'),
        content: const Text('Everything is findable from here — type a name, a tag or a date.'),
        align: MPAlign.start,
      ),
      MPTourStep(
        target: _save,
        title: const Text('Save'),
        content: const Text(
          'Changes are kept as you go. This is for the moment you want a version back.',
        ),
        align: MPAlign.end,
      ),
      MPTourStep(
        target: _panel,
        title: const Text('Your work'),
        content: const Text(
          'Anything you open lands here. Try the search — the page still works while this is up.',
        ),
        side: MPSide.top,
        padding: 2,
      ),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      spacing: 16,
      children: <Widget>[
        MPBox(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            spacing: 12,
            children: <Widget>[
              Row(
                spacing: 8,
                children: <Widget>[
                  Expanded(
                    child: MPTextField(
                      key: _search,
                      label: const Text('Search'),
                      size: MPSize.sm,
                      value: _query,
                      onChanged: (String next) => setState(() => _query = next),
                      fullWidth: true,
                    ),
                  ),
                  MPButton(
                    key: _save,
                    size: MPSize.sm,
                    variant: MPVariant.tonal,
                    onPressed: () {},
                    child: const Text('Save a version'),
                  ),
                ],
              ),
              MPBox(
                key: _panel,
                variant: MPVariant.tonal,
                child: MPTypography(
                  _query.isEmpty ? 'Nothing open yet.' : 'Looking for “$_query”…',
                  level: MPTypographyLevel.caption,
                ),
              ),
            ],
          ),
        ),
        Row(
          spacing: 8,
          children: <Widget>[
            MPButton(
              onPressed: _running ? null : () => setState(() => _running = true),
              child: const Text('Start the tour'),
            ),
            const Flexible(
              child: MPTypography(
                'The page keeps working while it runs — the dimming never takes the pointer.',
                level: MPTypographyLevel.caption,
              ),
            ),
          ],
        ),
        MPTour(
          steps: steps,
          open: _running,
          onOpenChange: (bool next) => setState(() => _running = next),
        ),
      ],
    );
  }
}
