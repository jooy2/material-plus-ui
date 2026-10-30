import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// One decision at the root, and every component under it follows.
///
/// Two tables move together here, and they degrade differently. The library's
/// date table names the months and orders the date, for the eighteen languages
/// it ships. Its message table supplies the words a date has nothing to do with,
/// such as "Today" or "Close", once the language is registered (the gallery
/// registers all of them at startup). The last option is Swedish, which neither
/// table has: the calendar and the words both fall back to English.
class LocaleProviderDemo extends StatefulWidget {
  const LocaleProviderDemo({super.key});

  @override
  State<LocaleProviderDemo> createState() => _LocaleProviderDemoState();
}

class _LocaleProviderDemoState extends State<LocaleProviderDemo> {
  static const List<(String, String)> _locales = <(String, String)>[
    ('en-US', 'English'),
    ('ko', '한국어'),
    ('fr', 'Français'),
    ('sv', 'Svenska'),
  ];

  String _locale = 'ko';

  @override
  Widget build(BuildContext context) {
    final DateTime now = DateTime.now();

    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 340),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          MPSegmentedButton(
            items: <MPSegment>[
              for (final (String value, String label) in _locales)
                MPSegment(value: value, label: Text(label)),
            ],
            value: <String>[_locale],
            onChanged: (List<String> next) {
              if (next.isNotEmpty) {
                setState(() => _locale = next.first);
              }
            },
            semanticLabel: 'Locale',
            showCheck: false,
            fullWidth: true,
          ),
          const SizedBox(height: 20),
          MPLocaleProvider(
            locale: _locale,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: <Widget>[
                MPDatePicker(
                  key: ValueKey<String>('d-$_locale'),
                  label: const Text('Date'),
                  initialValue: now,
                  fullWidth: true,
                ),
                const SizedBox(height: 16),
                MPTimePicker(
                  key: ValueKey<String>('t-$_locale'),
                  label: const Text('Time'),
                  initialValue: now,
                  fullWidth: true,
                ),
                const SizedBox(height: 16),
                MPAlert(
                  onClose: () {},
                  child: const Text('The × below has a name in this language.'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
