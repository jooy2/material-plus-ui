import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// A calendar and a clock in one popup, at exactly the same height.
///
/// The clock's columns are seven cells tall, as the calendar's grid is, so the
/// popup is one rectangle rather than two of different sizes pushed together.
///
/// `minDate` is read at full precision here, unlike on `MPDatePicker`: nothing
/// before this moment can be chosen, which leaves today selectable in the
/// calendar and greys out the hours that have already gone.
class DateTimePickerHero extends StatefulWidget {
  const DateTimePickerHero({super.key});

  @override
  State<DateTimePickerHero> createState() => _DateTimePickerHeroState();
}

class _DateTimePickerHeroState extends State<DateTimePickerHero> {
  DateTime? _starts;
  final DateTime _now = DateTime.now();

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 320),
      child: MPDateTimePicker(
        label: const Text('Starts'),
        placeholder: 'Pick a moment',
        minDate: _now,
        minuteStep: 15,
        value: _starts,
        onChanged: (DateTime? next) => setState(() => _starts = next),
        clearable: true,
        fullWidth: true,
      ),
    );
  }
}
