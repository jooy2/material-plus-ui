import 'package:flutter/widgets.dart';
import 'package:material_plus_showcase/app/page.dart';
import 'package:material_plus_showcase/app/settings.dart';
import 'package:material_plus_showcase/screens/components.dart';
import 'package:material_plus_showcase/screens/media.dart';
import 'package:material_plus_showcase/screens/overlays.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

const String _snippet = '''MPTheme(
  sourceColor: const Color(0xFF7C3AED),
  child: MPButton(onPressed: save, child: const Text('Save')),
)''';

const List<MPSegment> _themes = <MPSegment>[
  MPSegment(value: 'device', label: Text('Device')),
  MPSegment(value: 'light', label: Text('Light')),
  MPSegment(value: 'dark', label: Text('Dark')),
];

/// The settings, and the way to the other screens.
class MoreScreen extends StatelessWidget {
  /// Creates the screen.
  const MoreScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final ShowcaseSettings settings = SettingsScope.of(context);
    final MPThemeData theme = MPTheme.of(context);
    final double scale = settings.textScale ?? 1;

    return ScreenScroll(
      title: 'More',
      children: <Widget>[
        MPList(
          dividers: true,
          children: <Widget>[
            MPListItem(
              description: const Text('Every demo, one component at a time'),
              onPressed: () => pushScreen(context, const ComponentsScreen()),
              child: const Text('Components'),
            ),
            MPListItem(
              description: const Text('Dialog, drawer, menu, snackbar and the rest'),
              onPressed: () => pushScreen(context, const OverlaysScreen()),
              child: const Text('Overlays'),
            ),
            MPListItem(
              description: const Text('Carousel, images and devices'),
              onPressed: () => pushScreen(context, const MediaScreen()),
              child: const Text('Media'),
            ),
          ],
        ),
        MPCard(
          title: const Text('Appearance'),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            mainAxisSize: MainAxisSize.min,
            spacing: 16,
            children: <Widget>[
              MPSegmentedButton(
                items: _themes,
                semanticLabel: 'Theme',
                fullWidth: true,
                value: <String>[
                  switch (settings.brightness) {
                    null => 'device',
                    Brightness.light => 'light',
                    Brightness.dark => 'dark',
                  },
                ],
                onChanged: (List<String> next) {
                  settings.brightness = switch (next.first) {
                    'light' => Brightness.light,
                    'dark' => Brightness.dark,
                    _ => null,
                  };
                },
              ),
              MPSwitch(
                checked: theme.colors.brightness == Brightness.dark,
                onChanged: (bool next) {
                  settings.brightness = next ? Brightness.dark : Brightness.light;
                },
                label: const Text('Dark mode'),
                fullWidth: true,
              ),
              MPSwitch(
                checked: settings.direction == TextDirection.rtl,
                onChanged: (bool next) {
                  settings.direction = next ? TextDirection.rtl : TextDirection.ltr;
                },
                label: const Text('Right to left'),
                description: const Text('Lays every screen out from the other side.'),
                fullWidth: true,
              ),
              MPSwitch(
                checked: settings.density < 0,
                onChanged: (bool next) => settings.density = next ? -2 : 0,
                label: const Text('Compact'),
                fullWidth: true,
              ),
              MPSelect(
                fullWidth: true,
                label: const Text('Language of the built-in labels'),
                value: settings.language,
                onChanged: (MPSelectValue? next) => settings.language = '${next ?? 'en'}',
                items: <MPSelectOption>[
                  for (final MapEntry<String, String>(key: String code, value: String name)
                      in ShowcaseSettings.languages.entries)
                    MPSelectOption(value: code, label: Text(name)),
                ],
              ),
              MPSelect(
                fullWidth: true,
                label: const Text('Source colour'),
                value: ShowcaseSettings.sourceColors.entries
                    .firstWhere(
                      (MapEntry<String, Color> one) => one.value == settings.sourceColor,
                      orElse: () => ShowcaseSettings.sourceColors.entries.first,
                    )
                    .key,
                onChanged: (MPSelectValue? next) {
                  settings.sourceColor =
                      ShowcaseSettings.sourceColors[next] ?? mpDefaultSourceColor;
                },
                items: <MPSelectOption>[
                  for (final String name in ShowcaseSettings.sourceColors.keys)
                    MPSelectOption(value: name, label: Text(name)),
                ],
              ),
              MPSlider(
                label: const Text('Text size'),
                value: <double>[scale],
                min: 0.8,
                max: 2,
                step: 0.1,
                showValue: true,
                format: (double value) => '${(value * 100).round()}%',
                onChanged: (List<double> next) => settings.textScale = next.first,
              ),
            ],
          ),
        ),
        MPCard(
          title: const Text('About this app'),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            mainAxisSize: MainAxisSize.min,
            spacing: 12,
            children: <Widget>[
              const MPBlockquote(
                author: Text('The library README'),
                child: Text('A component works with no setup: the theme is an override.'),
              ),
              const MPCodeBlock(code: _snippet, language: 'dart', title: Text('Theming')),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                crossAxisAlignment: WrapCrossAlignment.center,
                children: <Widget>[
                  const Text('On a keyboard, search with'),
                  const MPShortcut(keys: 'Mod+K', size: MPSize.xs),
                  MPTextLink(
                    onPressed: () => pushScreen(context, const ComponentsScreen()),
                    child: const Text('or browse the components'),
                  ),
                ],
              ),
            ],
          ),
        ),
        const _Questions(),
      ],
    );
  }
}

class _Questions extends StatelessWidget {
  const _Questions();

  @override
  Widget build(BuildContext context) {
    return const MPAccordion(
      children: <Widget>[
        MPAccordionItem(
          value: 'what',
          title: Text('What is this app?'),
          child: Text('A small app built with Material Plus, to try the library on a device.'),
        ),
        MPAccordionItem(
          value: 'where',
          title: Text('Where do the pictures come from?'),
          child: Text('They are the sample pictures from the documentation site.'),
        ),
        MPAccordionItem(
          value: 'material',
          title: Text('Does it need MaterialApp?'),
          child: Text('No. This app is a WidgetsApp, and nothing in it imports Material.'),
        ),
      ],
    );
  }
}
