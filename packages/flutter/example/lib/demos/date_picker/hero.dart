import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// The trigger is a text field's shell wearing a calendar glyph, so a date
/// field in a form is the same object as the fields around it.
///
/// Open it and press the month name, then the year: any month of the year on
/// screen is two presses and any year at all is three. A picker that only
/// stepped a month at a time would put a birthday thirty years back a hundred
/// and eighty presses away.
class DatePickerHero extends StatefulWidget {
  const DatePickerHero({super.key});

  @override
  State<DatePickerHero> createState() => _DatePickerHeroState();
}

class _DatePickerHeroState extends State<DatePickerHero> {
  DateTime? _due;

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 280),
      child: MPDatePicker(
        label: const Text('Due date'),
        placeholder: 'Pick a day',
        value: _due,
        onChanged: (DateTime? next) => setState(() => _due = next),
        clearable: true,
        fullWidth: true,
      ),
    );
  }
}
