import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// The same picker in four languages, with nothing translated by hand.
///
/// Everything that moves here follows `locale`: the month names, the weekday
/// initials, which day the week starts on (Sunday in the US and Korea, Monday
/// in Germany), the order of the header's two buttons (`July 2026` against
/// `2026년 7월`) and how the trigger writes the date.
///
/// The only strings this library supplies on top are the ones a calendar says
/// about itself: "Previous month", "Today", "Clear". Those are translated for
/// eighteen languages and overridable with `labels`.
class DatePickerLocale extends StatefulWidget {
  const DatePickerLocale({super.key});

  @override
  State<DatePickerLocale> createState() => _DatePickerLocaleState();
}

class _DatePickerLocaleState extends State<DatePickerLocale> {
  static const List<(String, String)> _locales = <(String, String)>[
    ('en-US', 'English'),
    ('ko', '한국어'),
    ('de-DE', 'Deutsch'),
    ('ar', 'العربية'),
  ];

  String _locale = 'ko';
  DateTime? _value = DateTime(2026, 7, 15);

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 340),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: 20,
        children: <Widget>[
          MPSegmentedButton(
            items: <MPSegment>[
              for (final (String value, String label) in _locales)
                MPSegment(value: value, label: Text(label)),
            ],
            value: <String>[_locale],
            onChanged: (List<String> next) {
              setState(() => _locale = next.isEmpty ? _locale : next.first);
            },
            semanticLabel: 'Locale',
            showCheck: false,
            fullWidth: true,
          ),
          MPDatePicker(
            key: ValueKey<String>(_locale),
            locale: _locale,
            label: const Text('Date'),
            value: _value,
            onChanged: (DateTime? next) => setState(() => _value = next),
            initialOpen: true,
            fullWidth: true,
          ),
        ],
      ),
    );
  }
}
