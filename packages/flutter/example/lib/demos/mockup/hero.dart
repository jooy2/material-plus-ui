import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// A real screen inside each frame, laid out against the device's own
/// resolution.
class MockupHero extends StatelessWidget {
  const MockupHero({super.key});

  @override
  Widget build(BuildContext context) {
    return const Wrap(
      spacing: 24,
      runSpacing: 24,
      crossAxisAlignment: WrapCrossAlignment.end,
      children: <Widget>[
        MPMockup(device: MPMockupDevice.mobile, width: 200, child: _Screen()),
        MPMockup(
          device: MPMockupDevice.tablet,
          width: 260,
          finish: MPMockupFinish.silver,
          child: _Screen(),
        ),
        MPMockup(
          device: MPMockupDevice.desktop,
          hardware: MPMockupHardware.laptop,
          width: 380,
          finish: MPMockupFinish.white,
          child: _Screen(),
        ),
      ],
    );
  }
}

/// The page on each screen.
class _Screen extends StatelessWidget {
  const _Screen();

  static const List<String> _rows = <String>[
    'Inbox',
    'Starred',
    'Snoozed',
    'Sent',
    'Drafts',
    'Spam',
  ];

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      physics: const NeverScrollableScrollPhysics(),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: 16,
        children: <Widget>[
          const MPTypography('Today', level: MPTypographyLevel.h4),
          MPCard(
            title: const Text('Deploy'),
            media: const SizedBox(
              height: 72,
              child: Image(
                image: NetworkImage('/samples/photos/thumbs/lakeside-observatory-blue-hour.webp'),
                semanticLabel: 'A small observatory beside a lake at dusk',
                fit: BoxFit.cover,
                width: double.infinity,
              ),
            ),
            footer: MPButton(onPressed: () {}, child: const Text('Run')),
            child: const MPTypography(
              'Six commits since the last release.',
              level: MPTypographyLevel.caption,
            ),
          ),
          MPList(
            dividers: true,
            children: <Widget>[for (final String row in _rows) MPListItem(child: Text(row))],
          ),
        ],
      ),
    );
  }
}
