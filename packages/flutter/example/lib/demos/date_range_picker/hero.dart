import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// Two months side by side, because a range that crosses a month boundary is
/// the ordinary case rather than the exception.
///
/// Press once and move the pointer: the band is drawn before the second press
/// lands. Without that preview the first press has no visible consequence,
/// and the control looks broken for the second or so between the two.
class DateRangePickerHero extends StatefulWidget {
  const DateRangePickerHero({super.key});

  @override
  State<DateRangePickerHero> createState() => _DateRangePickerHeroState();
}

class _DateRangePickerHeroState extends State<DateRangePickerHero> {
  MPDateRange _stay = MPDateRange.empty;

  static DateTime _day(int offset) {
    final DateTime now = DateTime.now();

    return DateTime(now.year, now.month, now.day + offset);
  }

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 340),
      child: MPDateRangePicker(
        label: const Text('Stay'),
        startPlaceholder: 'Check in',
        endPlaceholder: 'Check out',
        value: _stay,
        onChanged: (MPDateRange next) => setState(() => _stay = next),
        presets: <MPDateRangePreset>[
          MPDateRangePreset.computed(
            label: const Text('This week'),
            resolve: () => MPDateRange(start: _day(0), end: _day(6)),
          ),
          MPDateRangePreset.computed(
            label: const Text('Next 14 days'),
            resolve: () => MPDateRange(start: _day(0), end: _day(13)),
          ),
          MPDateRangePreset.computed(
            label: const Text('Next 30 days'),
            resolve: () => MPDateRange(start: _day(0), end: _day(29)),
          ),
        ],
        clearable: true,
        fullWidth: true,
      ),
    );
  }
}
