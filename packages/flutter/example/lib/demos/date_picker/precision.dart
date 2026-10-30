import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// The same control asking for three different units.
///
/// `precision` does not hide the finer views so much as leave them out: the
/// month picker opens on the twelve months and has no day grid to reach
/// through, and the year picker opens on the years. What follows it is
/// everything downstream: how the trigger writes the value, what a form is
/// handed, and whether the footer's shortcut says *Today*, *This month* or
/// *This year*.
class DatePickerPrecision extends StatefulWidget {
  const DatePickerPrecision({super.key});

  @override
  State<DatePickerPrecision> createState() => _DatePickerPrecisionState();
}

class _DatePickerPrecisionState extends State<DatePickerPrecision> {
  DateTime? _day;
  DateTime? _month;
  DateTime? _year;

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 300),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: 20,
        children: <Widget>[
          MPDatePicker(
            label: const Text('Due date'),
            description: const Text('precision: MPDatePrecision.day — the default.'),
            value: _day,
            onChanged: (DateTime? next) => setState(() => _day = next),
            fullWidth: true,
          ),
          MPDatePicker(
            label: const Text('Billing month'),
            description: const Text('precision: MPDatePrecision.month — answers with the 1st.'),
            precision: MPDatePrecision.month,
            value: _month,
            onChanged: (DateTime? next) => setState(() => _month = next),
            fullWidth: true,
          ),
          MPDatePicker(
            label: const Text('Fiscal year'),
            description: const Text('precision: MPDatePrecision.year — answers with 1 January.'),
            precision: MPDatePrecision.year,
            value: _year,
            onChanged: (DateTime? next) => setState(() => _year = next),
            fullWidth: true,
          ),
        ],
      ),
    );
  }
}
