import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// The detail that separates a working time picker from a frustrating one.
///
/// With a minimum of 09:30, the hour `9` stays available, because the hour
/// *contains* allowed minutes, and it is the minute column that greys out `00`
/// through `25`. The naive check compares the whole candidate instant, hides
/// the 9 entirely, and makes half past nine unreachable.
///
/// Open it and look at the two columns together.
class TimePickerBounds extends StatefulWidget {
  const TimePickerBounds({super.key});

  @override
  State<TimePickerBounds> createState() => _TimePickerBoundsState();
}

class _TimePickerBoundsState extends State<TimePickerBounds> {
  static DateTime _at(int hours, int minutes) {
    final DateTime now = DateTime.now();

    return DateTime(now.year, now.month, now.day, hours, minutes);
  }

  DateTime? _value = _at(9, 0);

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 280),
      child: MPTimePicker(
        label: const Text('Appointment'),
        description: const Text('Between 09:30 and 17:00.'),
        minTime: _at(9, 30),
        maxTime: _at(17, 0),
        value: _value,
        onChanged: (DateTime? next) => setState(() => _value = next),
        initialOpen: true,
        fullWidth: true,
      ),
    );
  }
}
