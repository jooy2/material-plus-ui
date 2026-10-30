import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// Columns you scroll rather than a dial you drag.
///
/// "Half past nine" is two glances, and every row is a real option the arrow
/// keys already reach, which is what a clock face cannot offer without a
/// second, hidden implementation beside it.
///
/// The popup does not close on the first column, because a time is two
/// answers.
class TimePickerHero extends StatefulWidget {
  const TimePickerHero({super.key});

  @override
  State<TimePickerHero> createState() => _TimePickerHeroState();
}

class _TimePickerHeroState extends State<TimePickerHero> {
  DateTime? _startsAt;

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 260),
      child: MPTimePicker(
        label: const Text('Starts at'),
        placeholder: 'Pick a time',
        minuteStep: 5,
        value: _startsAt,
        onChanged: (DateTime? next) => setState(() => _startsAt = next),
        clearable: true,
        fullWidth: true,
      ),
    );
  }
}
