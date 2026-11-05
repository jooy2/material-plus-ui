import 'package:flutter/widgets.dart';
import 'package:material_plus_showcase/app/page.dart';
import 'package:material_plus_showcase/data/sample.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

const List<(String, String)> _photos = <(String, String)>[
  ('alpine-lake-dawn.webp', 'A lake under mountains at dawn'),
  ('forest-trail-sunbeams.webp', 'Sunbeams over a forest trail'),
  ('rowboat-misty-pond-sunrise.webp', 'A rowboat on a misty pond'),
  ('misty-tea-terraces-sunrise.webp', 'Tea terraces in the mist'),
];

AssetImage _asset(String file) => AssetImage('assets/images/$file');

/// The components that show pictures, in three tabs.
class MediaScreen extends StatefulWidget {
  /// Creates the screen.
  const MediaScreen({super.key});

  @override
  State<MediaScreen> createState() => _MediaScreenState();
}

class _MediaScreenState extends State<MediaScreen> {
  String _tab = 'photos';

  @override
  Widget build(BuildContext context) {
    final EdgeInsets safe = MediaQuery.paddingOf(context);

    return PushedScreen(
      title: 'Media',
      child: ListView(
        padding: EdgeInsets.fromLTRB(16, 8, 16, safe.bottom + 24),
        children: <Widget>[
          MPTabs<String>(
            semanticLabel: 'Media',
            value: _tab,
            onChanged: (String next) => setState(() => _tab = next),
            fullWidth: true,
            children: <Widget>[
              const MPTab<String>(value: 'photos', child: Text('Photos')),
              const MPTab<String>(value: 'people', child: Text('People')),
              const MPTab<String>(value: 'devices', child: Text('Devices')),
              MPTabPanel<String>(value: 'photos', child: _photosPanel()),
              MPTabPanel<String>(value: 'people', child: _peoplePanel()),
              MPTabPanel<String>(value: 'devices', child: _devicesPanel()),
            ],
          ),
        ],
      ),
    );
  }

  Widget _photosPanel() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      spacing: 16,
      children: <Widget>[
        const SizedBox(height: 4),
        MPCarousel(
          label: 'Places',
          children: <Widget>[
            for (final (String file, String alt) in _photos)
              MPAspectRatio(
                ratio: 16 / 9,
                child: MPImage(image: _asset(file), semanticLabel: alt),
              ),
          ],
        ),
        const MPTypography('Gallery', level: MPTypographyLevel.h6),
        MPGrid(
          children: <Widget>[
            for (final (String file, String alt) in _photos)
              MPGridItem(
                span: const MPResponsive<MPGridSpan>(MPGridSpan(6), expanded: MPGridSpan(3)),
                child: MPImage(
                  image: _asset(file),
                  semanticLabel: alt,
                  ratio: 1,
                  preview: true,
                  previewImage: _asset(file),
                ),
              ),
          ],
        ),
        const MPTypography('While a picture loads', level: MPTypographyLevel.h6),
        const Row(
          spacing: 12,
          children: <Widget>[
            MPSkeleton(shape: MPSkeletonShape.circle, width: 48, height: 48),
            Expanded(child: MPSkeleton(lines: 2)),
          ],
        ),
      ],
    );
  }

  Widget _peoplePanel() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      spacing: 16,
      children: <Widget>[
        const SizedBox(height: 4),
        MPList(
          dividers: true,
          children: <Widget>[
            for (final Person person in people)
              MPListItem(
                startIcon: MPAvatar(name: person.name, image: person.image),
                description: Text(person.role),
                child: Text(person.name),
              ),
          ],
        ),
        const Wrap(
          spacing: 16,
          runSpacing: 16,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: <Widget>[
            MPAppLogo(name: 'Compass', image: AssetImage('assets/images/compass-navigation.webp')),
            MPAppLogo(name: 'Compass', shape: MPAppLogoShape.app, showName: true),
            MPAppLogo(
              name: 'Compass',
              shape: MPAppLogoShape.circle,
              variant: MPVariant.tonal,
              color: MPColor.tertiary,
            ),
          ],
        ),
      ],
    );
  }

  Widget _devicesPanel() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      spacing: 16,
      children: <Widget>[
        const SizedBox(height: 4),
        MPMockup(
          device: MPMockupDevice.mobile,
          width: 200,
          child: MPImage(
            image: _asset('snowy-cabin-frozen-stream.webp'),
            semanticLabel: 'A cabin by a frozen stream',
            height: double.infinity,
          ),
        ),
      ],
    );
  }
}
