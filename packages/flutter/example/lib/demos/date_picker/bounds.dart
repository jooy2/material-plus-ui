import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// The three ways a day can be unavailable, and one thing they have in common:
/// every blocked day is still *drawn*.
///
/// A grid with holes in it is a grid a reader arrowing across a month falls
/// into, and "this day does not exist" and "this day is not for you" are
/// different claims. So a blocked cell keeps its place, keeps its name, and
/// loses only the ability to be chosen.
class DatePickerBounds extends StatefulWidget {
  const DatePickerBounds({super.key});

  @override
  State<DatePickerBounds> createState() => _DatePickerBoundsState();
}

class _DatePickerBoundsState extends State<DatePickerBounds> {
  DateTime? _soon;
  DateTime? _weekday;

  @override
  Widget build(BuildContext context) {
    final DateTime now = DateTime.now();
    final DateTime today = DateTime(now.year, now.month, now.day);

    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 300),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: 20,
        children: <Widget>[
          MPDatePicker(
            label: const Text('Within the next fortnight'),
            description: const Text('minDate and maxDate, day-granular.'),
            minDate: today,
            maxDate: DateTime(today.year, today.month, today.day + 14),
            value: _soon,
            onChanged: (DateTime? next) => setState(() => _soon = next),
            fullWidth: true,
          ),
          MPDatePicker(
            label: const Text('A working day'),
            errorMessage: _weekday == null ? const Text('Pick a weekday to continue.') : null,
            shouldDisableDate: (DateTime date) => date.weekday >= DateTime.saturday,
            value: _weekday,
            onChanged: (DateTime? next) => setState(() => _weekday = next),
            required: true,
            fullWidth: true,
          ),
        ],
      ),
    );
  }
}
